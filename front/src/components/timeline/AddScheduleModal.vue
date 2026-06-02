<template>
  <Modal v-model="visible" width="480px">
    <template #header>
      <div class="custom-header">
        <div class="icon-box">
          <SvgIcon name="icon-calendar-add" size="24px" color="var(--primary)" />
        </div>
        <h2>添加日程</h2>
      </div>
    </template>
    
    <div class="form-group">
      <label>标题</label>
      <div class="input-with-icon">
        <SvgIcon name="icon-type" size="18px" class="icon-left" />
        <input type="text" class="form-control" placeholder="例如：深度工作会议" v-model="form.title" />
      </div>
    </div>
    
    <div class="form-row">
      <div class="form-col form-group">
        <label>开始时间</label>
        <div class="input-with-icon">
          <SvgIcon name="icon-clock" size="18px" class="icon-left" />
          <input type="time" class="form-control" v-model="form.startTime" />
        </div>
      </div>
      <div class="form-col form-group">
        <label>结束时间</label>
        <div class="input-with-icon">
          <SvgIcon name="icon-clock-end" size="18px" class="icon-left" />
          <input type="time" class="form-control" v-model="form.endTime" />
        </div>
      </div>
    </div>
    
    <div class="form-group">
      <div class="label-row">
        <label>描述</label>
        <span class="optional-text">选填</span>
      </div>
      <textarea class="form-control" rows="4" placeholder="添加关于此日程的详细信息或待办事项..." v-model="form.detail"></textarea>
    </div>
    
    <template #footer>
      <button class="btn btn-outline" @click="visible = false">取消</button>
      <button class="btn btn-primary" @click="save">
        保存日程 
        <SvgIcon name="icon-arrow-right" size="16px" />
      </button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Modal from '../common/Modal.vue'
import SvgIcon from '../SvgIcon.vue'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'save'])

const visible = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  visible.value = val
})
watch(visible, (val) => {
  emit('update:modelValue', val)
})

const form = ref({
  title: '',
  startTime: '09:00',
  endTime: '10:30',
  detail: ''
})

const save = () => {
  emit('save', { ...form.value })
  visible.value = false
  form.value = { title: '', startTime: '09:00', endTime: '10:30', detail: '' }
}
</script>

<style scoped>
@import '../../assets/styles/form.css';

.custom-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.custom-header .icon-box {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background-color: rgba(108, 92, 231, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}

input[type="time"]::-webkit-calendar-picker-indicator {
  opacity: 0;
  position: absolute;
  right: 0;
  top: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
</style>
