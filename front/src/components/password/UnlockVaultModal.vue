<template>
  <Modal v-model="visible" title="解锁密码库" width="420px">
    <div class="vault-help">输入根密码以解锁本次会话。刷新页面或锁定后需要重新输入。</div>

    <div class="form-group">
      <label>根密码</label>
      <input
        type="password"
        class="form-control"
        placeholder="输入根密码"
        v-model="rootPassword"
        @keyup.enter="unlock"
      />
    </div>

    <p v-if="error" class="error-text">{{ error }}</p>

    <template #footer>
      <button class="btn btn-primary" :disabled="loading" @click="unlock">
        {{ loading ? '解锁中...' : '解锁' }}
      </button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Modal from '../common/Modal.vue'

const props = defineProps<{
  modelValue: boolean
  loading?: boolean
  error?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  unlock: [rootPassword: string]
}>()

const visible = ref(props.modelValue)
const rootPassword = ref('')

watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const unlock = () => {
  if (!rootPassword.value) return
  emit('unlock', rootPassword.value)
  visible.value = false
  rootPassword.value = ''
}
</script>

<style scoped>
@import '../../assets/styles/form.css';

.vault-help {
  background: rgba(108, 92, 231, 0.08);
  border-radius: 12px;
  color: var(--text-regular);
  font-size: 13px;
  line-height: 1.6;
  margin-bottom: 20px;
  padding: 14px 16px;
}

.error-text {
  color: var(--warning);
  font-size: 13px;
  margin: 0;
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
