<template>
  <section class="password-panel">
    <div class="panel-header">
      <div>
        <span class="eyebrow">Password Vault</span>
        <h1>密码库</h1>
        <p>用根密码解锁本次会话，保存的数据会在落盘前加密。</p>
      </div>
      <div class="header-actions">
        <button v-if="unlocked" class="btn btn-outline" @click="lockVault">锁定</button>
        <button v-if="unlocked" class="btn btn-primary" @click="openAddModal">添加密码</button>
      </div>
    </div>

    <div v-if="loadingMeta" class="state-card">正在加载密码库...</div>

    <div v-else-if="!meta.initialized" class="state-card">
      <h2>还没有密码库</h2>
      <p>先设置一个根密码，用它来派生加密密钥。</p>
      <button class="btn btn-primary" @click="showSetupModal = true">设置根密码</button>
    </div>

    <div v-else-if="!unlocked" class="state-card">
      <h2>密码库已锁定</h2>
      <p>输入根密码后才能解密并查看保存的密码。</p>
      <button class="btn btn-primary" @click="showUnlockModal = true">解锁密码库</button>
    </div>

    <div v-else-if="entries.length === 0" class="state-card">
      <h2>还没有保存密码</h2>
      <p>添加第一条账号密码，它会在保存前加密。</p>
      <button class="btn btn-primary" @click="openAddModal">添加密码</button>
    </div>

    <div v-else class="password-grid">
      <PasswordItem
        v-for="entry in entries"
        :key="entry.id"
        :entry="entry"
        @edit="openEditModal"
        @delete="confirmDelete"
      />
    </div>

    <SetupVaultModal
      v-if="!meta.initialized"
      v-model="showSetupModal"
      :loading="busy"
      @setup="setupVault"
    />
    <UnlockVaultModal
      v-if="meta.initialized && !unlocked"
      v-model="showUnlockModal"
      :loading="busy"
      :error="unlockError"
      @unlock="unlockVault"
    />
    <AddPasswordModal
      v-if="unlocked"
      v-model="showPasswordModal"
      :entry="editingEntry"
      @save="savePassword"
    />
    <ConfirmModal
      v-model="showConfirmModal"
      title="删除密码"
      message="确定要删除这条密码记录吗？此操作不可恢复。"
      @confirm="deletePasswordEntry"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import ConfirmModal from '../common/ConfirmModal.vue'
import AddPasswordModal from './AddPasswordModal.vue'
import PasswordItem from './PasswordItem.vue'
import SetupVaultModal from './SetupVaultModal.vue'
import UnlockVaultModal from './UnlockVaultModal.vue'
import {
  addEncryptedPassword,
  deleteEncryptedPassword,
  getEncryptedPasswords,
  getPasswordVaultMeta,
  initializePasswordVault,
  updateEncryptedPassword
} from '../../api/password'
import type { CreatePasswordInput, EncryptedPasswordEntry, PasswordEntry, PasswordVaultMeta } from '../../types'
import {
  VAULT_CIPHER,
  VAULT_ITERATIONS,
  VAULT_KDF,
  VAULT_VERIFIER,
  decryptJson,
  decryptText,
  deriveVaultKey,
  encryptJson,
  encryptText,
  generateSalt
} from '../../utils/crypto'

const meta = ref<PasswordVaultMeta>({ initialized: false })
const encryptedEntries = ref<EncryptedPasswordEntry[]>([])
const entries = ref<PasswordEntry[]>([])
const vaultKey = ref<CryptoKey | null>(null)
const loadingMeta = ref(true)
const busy = ref(false)
const showSetupModal = ref(false)
const showUnlockModal = ref(false)
const showPasswordModal = ref(false)
const showConfirmModal = ref(false)
const unlockError = ref('')
const editingEntry = ref<PasswordEntry | null>(null)
const deletingId = ref('')

const unlocked = computed(() => vaultKey.value !== null)

const loadMeta = async () => {
  loadingMeta.value = true
  try {
    meta.value = await getPasswordVaultMeta()
  } finally {
    loadingMeta.value = false
  }
}

const decryptEntries = async (key: CryptoKey, records: EncryptedPasswordEntry[]) => {
  const decrypted = await Promise.all(
    records.map(async record => decryptJson<PasswordEntry>(key, record.ciphertext, record.iv))
  )
  entries.value = decrypted
}

const setupVault = async (rootPassword: string) => {
  busy.value = true
  try {
    const salt = generateSalt()
    const key = await deriveVaultKey(rootPassword, salt, VAULT_ITERATIONS)
    const verifier = await encryptText(key, VAULT_VERIFIER)
    const nextMeta: PasswordVaultMeta = {
      initialized: true,
      salt,
      iterations: VAULT_ITERATIONS,
      verifierCiphertext: verifier.ciphertext,
      verifierIv: verifier.iv,
      kdf: VAULT_KDF,
      cipher: VAULT_CIPHER
    }
    meta.value = await initializePasswordVault(nextMeta)
    vaultKey.value = key
    encryptedEntries.value = []
    entries.value = []
    showSetupModal.value = false
  } finally {
    busy.value = false
  }
}

const unlockVault = async (rootPassword: string) => {
  if (!meta.value.salt || !meta.value.iterations || !meta.value.verifierCiphertext || !meta.value.verifierIv) return
  busy.value = true
  unlockError.value = ''
  try {
    const key = await deriveVaultKey(rootPassword, meta.value.salt, meta.value.iterations)
    const verifier = await decryptText(key, meta.value.verifierCiphertext, meta.value.verifierIv)
    if (verifier !== VAULT_VERIFIER) throw new Error('Invalid verifier')
    vaultKey.value = key
    encryptedEntries.value = await getEncryptedPasswords()
    await decryptEntries(key, encryptedEntries.value)
    showUnlockModal.value = false
  } catch {
    vaultKey.value = null
    entries.value = []
    unlockError.value = '根密码不正确，或密码库数据已损坏。'
    showUnlockModal.value = true
  } finally {
    busy.value = false
  }
}

const lockVault = () => {
  vaultKey.value = null
  encryptedEntries.value = []
  entries.value = []
  unlockError.value = ''
}

const openAddModal = () => {
  editingEntry.value = null
  showPasswordModal.value = true
}

const openEditModal = (entry: PasswordEntry) => {
  editingEntry.value = entry
  showPasswordModal.value = true
}

const buildEntry = (data: CreatePasswordInput, existing?: PasswordEntry): PasswordEntry => {
  const now = new Date().toISOString()
  return {
    id: existing?.id || '',
    title: data.title,
    username: data.username,
    password: data.password,
    url: data.url,
    notes: data.notes,
    createdAt: existing?.createdAt || now,
    updatedAt: now
  }
}

const savePassword = async (data: CreatePasswordInput) => {
  if (!vaultKey.value) return
  const entry = buildEntry(data, editingEntry.value || undefined)
  const encrypted = await encryptJson(vaultKey.value, entry)
  const payload = {
    ciphertext: encrypted.ciphertext,
    iv: encrypted.iv,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt
  }

  if (editingEntry.value) {
    const saved = await updateEncryptedPassword(editingEntry.value.id, payload)
    encryptedEntries.value = encryptedEntries.value.map(item => item.id === saved.id ? saved : item)
    entries.value = entries.value.map(item => item.id === saved.id ? { ...entry, id: saved.id } : item)
  } else {
    const saved = await addEncryptedPassword(payload)
    encryptedEntries.value.unshift(saved)
    entries.value.unshift({ ...entry, id: saved.id })
  }
}

const confirmDelete = (id: string) => {
  deletingId.value = id
  showConfirmModal.value = true
}

const deletePasswordEntry = async () => {
  if (!deletingId.value) return
  await deleteEncryptedPassword(deletingId.value)
  encryptedEntries.value = encryptedEntries.value.filter(entry => entry.id !== deletingId.value)
  entries.value = entries.value.filter(entry => entry.id !== deletingId.value)
  deletingId.value = ''
}

onMounted(() => {
  loadMeta()
})
</script>

<style scoped>
@import '../../assets/styles/form.css';

.password-panel {
  padding: 40px 60px 60px 40px;
  text-align: left;
}

.panel-header {
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 30px;
}

.eyebrow {
  color: var(--primary);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.panel-header h1 {
  color: var(--text-primary);
  font-size: 32px;
  margin: 8px 0 10px;
}

.panel-header p,
.state-card p {
  color: var(--text-regular);
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.state-card {
  align-items: center;
  background: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: 22px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 16px;
  justify-content: center;
  min-height: 320px;
  padding: 40px;
  text-align: center;
}

.state-card h2 {
  color: var(--text-primary);
  font-size: 22px;
  margin: 0;
}

.password-grid {
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
}
</style>
