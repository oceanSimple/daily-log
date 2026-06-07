<template>
  <article class="password-item">
    <div class="item-main">
      <div class="item-icon">{{ entry.title.slice(0, 1).toUpperCase() }}</div>
      <div class="item-content">
        <h3>{{ entry.title }}</h3>
        <a v-if="entry.url" :href="entry.url" target="_blank" rel="noreferrer">{{ entry.url }}</a>
      </div>
    </div>

    <div class="secret-fields">
      <div class="secret-field">
        <span class="field-label">账号</span>
        <code>{{ entry.username || '未填写用户名' }}</code>
        <button class="text-btn" :disabled="!entry.username" @click="copyValue(entry.username, 'username')">
          {{ copiedField === 'username' ? '已复制' : '复制' }}
        </button>
      </div>

      <div class="secret-field">
        <span class="field-label">密码</span>
        <code>{{ revealed ? entry.password : maskedPassword }}</code>
        <button class="text-btn" @click="revealed = !revealed">{{ revealed ? '隐藏' : '显示' }}</button>
        <button class="text-btn" @click="copyValue(entry.password, 'password')">
          {{ copiedField === 'password' ? '已复制' : '复制' }}
        </button>
      </div>
    </div>

    <p v-if="entry.notes" class="notes">{{ entry.notes }}</p>

    <div class="item-actions">
      <button class="btn btn-outline" @click="$emit('edit', entry)">编辑</button>
      <button class="btn btn-danger" @click="$emit('delete', entry.id)">删除</button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { PasswordEntry } from '../../types'

const props = defineProps<{
  entry: PasswordEntry
}>()

defineEmits<{
  edit: [entry: PasswordEntry]
  delete: [id: string]
}>()

const revealed = ref(false)
const copiedField = ref<'username' | 'password' | ''>('')
const maskedPassword = computed(() => '•'.repeat(Math.min(Math.max(props.entry.password.length, 8), 18)))

const writeClipboard = async (value: string) => {
  try {
    await navigator.clipboard.writeText(value)
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = value
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }
}

const copyValue = async (value: string, field: 'username' | 'password') => {
  if (!value) return
  await writeClipboard(value)
  copiedField.value = field
  window.setTimeout(() => {
    if (copiedField.value === field) copiedField.value = ''
  }, 1200)
}
</script>

<style scoped>
@import '../../assets/styles/form.css';

.password-item {
  background: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: 18px;
  box-shadow: var(--shadow-sm);
  padding: 22px;
  text-align: left;
}

.item-main {
  align-items: center;
  display: flex;
  gap: 16px;
}

.item-icon {
  align-items: center;
  background: rgba(108, 92, 231, 0.12);
  border-radius: 14px;
  color: var(--primary);
  display: flex;
  flex: 0 0 48px;
  font-size: 20px;
  font-weight: 700;
  height: 48px;
  justify-content: center;
}

.item-content {
  min-width: 0;
}

.item-content h3 {
  color: var(--text-primary);
  font-size: 18px;
  margin: 0 0 6px;
}

.item-content p,
.item-content a,
.notes {
  color: var(--text-regular);
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
  overflow-wrap: anywhere;
}

.item-content a {
  color: var(--primary);
  text-decoration: none;
}

.secret-fields {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 18px;
}

.secret-field {
  align-items: center;
  background: var(--bg-main);
  border-radius: 12px;
  display: flex;
  gap: 12px;
  padding: 12px;
}

.field-label {
  color: var(--text-secondary);
  flex: 0 0 36px;
  font-size: 13px;
  font-weight: 600;
}

.secret-field code {
  color: var(--text-primary);
  flex: 1;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  overflow: hidden;
  text-overflow: ellipsis;
}

.text-btn {
  background: transparent;
  border: none;
  color: var(--primary);
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.text-btn:disabled {
  color: var(--text-secondary);
  cursor: not-allowed;
}

.notes {
  margin-top: 14px;
}

.item-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 18px;
}

.btn-danger {
  background: var(--warning);
  border: 1px solid var(--warning);
  color: #ffffff;
}
</style>
