<template>
  <Modal v-model="visible" title="新增灵感笔记" width="520px">
    <div class="form-group">
      <label>标题</label>
      <input type="text" class="form-control" placeholder="输入笔记标题..." v-model="form.title" />
    </div>
    
    <div class="form-group">
      <label>分类</label>
      <div class="category-selector">
        <button 
          v-for="cat in categories" 
          :key="cat"
          class="cat-btn"
          :class="{ active: form.category === cat }"
          @click="form.category = cat"
        >
          {{ cat }}
        </button>
        <button class="cat-btn-add">
          <SvgIcon name="icon-add" size="16px" />
        </button>
      </div>
    </div>
    
    <div class="form-group">
      <label>详细内容</label>
      <textarea class="form-control" rows="6" placeholder="记录您的想法..." v-model="form.content"></textarea>
    </div>
    
    <template #footer>
      <button class="btn btn-outline" @click="visible = false">取消</button>
      <button class="btn btn-primary" @click="save">保存笔记</button>
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

const categories = ['Thoughts', 'Summary']
const form = ref({
  title: '',
  category: 'Thoughts',
  content: ''
})

const save = () => {
  emit('save', { ...form.value })
  visible.value = false
  form.value = { title: '', category: 'Thoughts', content: '' }
}
</script>

<style scoped>
@import '../../assets/styles/form.css';

.category-selector {
  display: flex;
  gap: 12px;
  align-items: center;
}

.cat-btn {
  padding: 6px 18px;
  border-radius: 20px;
  border: none;
  background: var(--bg-main);
  color: var(--text-regular);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cat-btn.active {
  background: var(--primary);
  color: white;
}

.cat-btn-add {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px dashed var(--primary-light);
  background: transparent;
  color: var(--primary);
  cursor: pointer;
  transition: all 0.2s;
}

.cat-btn-add:hover {
  background: rgba(108, 92, 231, 0.05);
  border-color: var(--primary);
}
</style>
