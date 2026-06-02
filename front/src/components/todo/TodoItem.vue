<template>
  <div class="todo-item" :class="{ completed: todo.completed }">
    <div class="checkbox-wrapper" @click="toggle">
      <div class="checkbox" :class="{ checked: todo.completed }">
        <SvgIcon v-if="todo.completed" name="icon-check" size="12px" color="#fff" />
      </div>
    </div>
    
    <div class="icon-wrapper">
      <SvgIcon :name="todo.icon" size="20px" color="var(--primary)" />
    </div>
    
    <div class="content">
      <h4 :class="{ 'line-through': todo.completed }">{{ todo.title }}</h4>
      <p v-if="todo.detail">{{ todo.detail }}</p>
    </div>
    
    <div class="time">
      <SvgIcon name="icon-clock" size="14px" />
      <span>{{ todo.deadline === '23:59' ? 'Today' : todo.deadline }}</span>
    </div>

    <button class="delete-btn" @click.stop="$emit('delete', todo.id)" title="删除">
      <SvgIcon name="lucide:trash-2" size="16px" />
    </button>
  </div>
</template>

<script setup lang="ts">
import SvgIcon from '../SvgIcon.vue'
import type { Todo } from '../../types'

const props = defineProps<{
  todo: Todo
}>()

const emit = defineEmits<{
  (e: 'toggle', id: string, completed: boolean): void
  (e: 'delete', id: string): void
}>()

const toggle = () => {
  emit('toggle', props.todo.id, !props.todo.completed)
}
</script>

<style scoped>
.todo-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: var(--radius-md);
  background-image: linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0.75) 100%), url('@/assets/images/bg-todo-item.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all var(--transition-fast);
}

.todo-item:hover {
  background-image: linear-gradient(135deg, rgba(255, 255, 255, 0.88) 0%, rgba(255, 255, 255, 0.7) 100%), url('@/assets/images/bg-todo-item.png');
  border-color: var(--primary-light);
  box-shadow: 0 8px 24px rgba(108, 92, 231, 0.1);
  transform: translateY(-2px);
}

.checkbox-wrapper {
  padding-right: 16px;
  cursor: pointer;
}

.checkbox {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 2px solid var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.checkbox.checked {
  background-color: var(--primary);
  border-color: var(--primary);
}

.icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(108, 92, 231, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.content h4 {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
}

.content p {
  font-size: 13px;
  color: var(--text-regular);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-through {
  text-decoration: line-through;
  color: var(--text-regular) !important;
}

.time {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--primary);
  font-size: 13px;
  font-weight: 500;
  margin-left: 16px;
}

.time.overdue {
  color: var(--warning);
}

.delete-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  opacity: 0;
  margin-left: 12px;
}

.todo-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  color: var(--warning);
  background: rgba(225, 112, 85, 0.1);
}
</style>
