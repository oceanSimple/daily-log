<template>
  <Modal v-model="visible" width="400px">
    <div class="confirm-content">
      <div class="confirm-icon">
        <SvgIcon name="lucide:alert-triangle" size="32px" color="var(--warning)" />
      </div>
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
    </div>
    
    <template #footer>
      <button class="btn btn-outline" @click="visible = false">取消</button>
      <button class="btn btn-danger" @click="confirm">
        确定删除
      </button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Modal from './Modal.vue'
import SvgIcon from '../SvgIcon.vue'

const props = defineProps({
  modelValue: Boolean,
  title: { type: String, default: '确认删除' },
  message: { type: String, default: '确定要删除这项内容吗？此操作不可恢复。' }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  visible.value = val
})
watch(visible, (val) => {
  emit('update:modelValue', val)
})

const confirm = () => {
  emit('confirm')
  visible.value = false
}
</script>

<style scoped>
.confirm-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px 0 10px;
}

.confirm-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(225, 112, 85, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

h3 {
  margin: 0 0 12px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

p {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.btn-danger {
  background: var(--warning);
  color: #fff;
  border: none;
  padding: 10px 24px;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-danger:hover {
  background: #d63031;
}

.btn-outline {
  background: transparent;
  color: var(--text-regular);
  border: 1px solid var(--border-color);
  padding: 10px 24px;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-outline:hover {
  background: var(--bg-main);
  color: var(--text-primary);
}
</style>
