<template>
  <Modal v-model="visible" :title="entry ? '编辑密码' : '添加密码'" width="520px">
    <div class="form-group">
      <label>标题</label>
      <input type="text" class="form-control" placeholder="例如：GitHub" v-model="form.title" />
    </div>

    <div class="form-row">
      <div class="form-group form-col">
        <label>用户名</label>
        <input type="text" class="form-control" placeholder="账号或邮箱" v-model="form.username" />
      </div>
      <div class="form-group form-col">
        <label>密码</label>
        <input type="password" class="form-control" placeholder="登录密码" v-model="form.password" />
      </div>
    </div>

    <div class="form-group">
      <label>网址</label>
      <input type="text" class="form-control" placeholder="https://example.com" v-model="form.url" />
    </div>

    <div class="form-group">
      <label>备注</label>
      <textarea class="form-control" rows="4" placeholder="安全问题、恢复码位置等" v-model="form.notes"></textarea>
    </div>

    <p v-if="error" class="error-text">{{ error }}</p>

    <template #footer>
      <button class="btn btn-outline" @click="visible = false">取消</button>
      <button class="btn btn-primary" @click="save">{{ entry ? '保存修改' : '添加密码' }}</button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Modal from '../common/Modal.vue'
import type { CreatePasswordInput, PasswordEntry } from '../../types'

const props = defineProps<{
  modelValue: boolean
  entry?: PasswordEntry | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [value: CreatePasswordInput]
}>()

const emptyForm = (): CreatePasswordInput => ({
  title: '',
  username: '',
  password: '',
  url: '',
  notes: ''
})

const visible = ref(props.modelValue)
const form = ref<CreatePasswordInput>(emptyForm())
const error = ref('')

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    form.value = props.entry
      ? {
          title: props.entry.title,
          username: props.entry.username,
          password: props.entry.password,
          url: props.entry.url,
          notes: props.entry.notes
        }
      : emptyForm()
    error.value = ''
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const save = () => {
  error.value = ''
  if (!form.value.title.trim()) {
    error.value = '请填写标题。'
    return
  }
  if (!form.value.password) {
    error.value = '请填写密码。'
    return
  }
  emit('save', { ...form.value, title: form.value.title.trim() })
  visible.value = false
  form.value = emptyForm()
}
</script>

<style scoped>
@import '../../assets/styles/form.css';

.error-text {
  color: var(--warning);
  font-size: 13px;
  margin: 0;
}
</style>
