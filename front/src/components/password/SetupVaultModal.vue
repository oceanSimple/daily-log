<template>
  <Modal v-model="visible" title="设置根密码" width="460px">
    <div class="vault-help">
      根密码只用于本机解锁密码库，不会保存或发送。请牢记它，遗失后无法解密已保存的密码。
    </div>

    <div class="form-group">
      <label>根密码</label>
      <input type="password" class="form-control" placeholder="输入根密码" v-model="rootPassword" />
    </div>

    <div class="form-group">
      <label>确认根密码</label>
      <input type="password" class="form-control" placeholder="再次输入根密码" v-model="confirmPassword" />
    </div>

    <p v-if="error" class="error-text">{{ error }}</p>

    <template #footer>
      <button class="btn btn-primary" :disabled="loading" @click="setup">
        {{ loading ? '设置中...' : '创建密码库' }}
      </button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Modal from '../common/Modal.vue'

const props = defineProps({
  modelValue: Boolean,
  loading: Boolean
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  setup: [rootPassword: string]
}>()

const visible = ref(props.modelValue)
const rootPassword = ref('')
const confirmPassword = ref('')
const error = ref('')

watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const setup = () => {
  error.value = ''
  if (rootPassword.value.length < 8) {
    error.value = '根密码至少需要 8 位。'
    return
  }
  if (rootPassword.value !== confirmPassword.value) {
    error.value = '两次输入的根密码不一致。'
    return
  }
  emit('setup', rootPassword.value)
  visible.value = false
  rootPassword.value = ''
  confirmPassword.value = ''
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
