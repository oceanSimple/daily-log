<template>
  <Modal v-model="visible" title="添加任务" width="480px">
    <div class="form-group">
      <label>任务标题</label>
      <input type="text" class="form-control" placeholder="输入任务名称..." v-model="form.title" />
    </div>
    
    <div class="form-group">
      <label>详细信息</label>
      <textarea class="form-control" rows="4" placeholder="添加更多上下文..." v-model="form.content"></textarea>
    </div>
    
    <div class="form-group">
      <label>截止时间</label>
      <div class="input-with-icon has-right">
        <SvgIcon name="icon-clock" size="18px" class="icon-left" />
        <input type="time" class="form-control" v-model="form.endTime" />
        <SvgIcon name="icon-clock-end" size="16px" class="icon-right" />
      </div>
    </div>
    
    <template #footer>
      <button class="btn btn-outline" @click="visible = false">取消</button>
      <button class="btn btn-primary" @click="save">添加任务</button>
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
  content: '',
  endTime: '23:59'
})

const save = () => {
  emit('save', { ...form.value })
  visible.value = false
  form.value = { title: '', content: '', endTime: '23:59' }
}
</script>

<style scoped>
@import '../../assets/styles/form.css';

/* time input specific tweaks to remove default clock icon on some browsers */
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
