<template>
  <div class="todo-panel">
    <div class="panel-header flex-between">
      <div class="title flex-center">
        <SvgIcon name="icon-todo" size="20px" color="var(--primary)" />
        <h2>待办事项</h2>
      </div>
        <button class="add-icon-btn" @click="showAddModal = true">
          <SvgIcon name="icon-add" size="18px" />
        </button>
    </div>
    
    <div class="todo-list">
      <TodoItem 
        v-for="todo in activeTodos" 
        :key="todo.id" 
        :todo="todo" 
        @toggle="handleToggle" 
        @delete="$emit('delete', todo.id)"
      />
      <div v-if="activeTodos.length === 0" class="empty-state">
        暂无待办事项
      </div>
    </div>

    <AddTodoModal v-model="showAddModal" @save="handleAddTodo" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import SvgIcon from '../SvgIcon.vue'
import TodoItem from './TodoItem.vue'
import AddTodoModal from './AddTodoModal.vue'
import type { Todo } from '../../types'

const props = defineProps<{
  todos: Todo[]
}>()

const emit = defineEmits<{
  (e: 'toggle', id: string, completed: boolean): void
  (e: 'add', data: any): void
  (e: 'delete', id: string): void
}>()

const currentHour = new Date().getHours()
const currentMinute = new Date().getMinutes()

// 只显示未完成、未超时的待办事项
const completedCount = computed(() => {
  return props.todos.filter(t => t.completed).length
})

const showAddModal = ref(false)

const handleAddTodo = (data: any) => {
  emit('add', data)
  showAddModal.value = false
}

const activeTodos = computed(() => {
  return props.todos.filter(todo => {
    if (todo.completed) return false
    
    const [endH, endM] = todo.deadline.split(':').map(Number)
    if (currentHour > endH) return false
    if (currentHour === endH && currentMinute > endM) return false
    
    return true
  })
})

const handleToggle = (id: string, completed: boolean) => {
  emit('toggle', id, completed)
}
</script>

<style scoped>
.todo-panel {
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.04);
}

.panel-header {
  margin-bottom: 20px;
}

.title {
  gap: 10px;
}

.title h2 {
  font-size: 18px;
  font-weight: 600;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--primary);
  background: rgba(108, 92, 231, 0.08);
  padding: 6px 12px;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 500;
  transition: background var(--transition-fast);
}

.add-btn:hover {
  background: rgba(108, 92, 231, 0.15);
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-state {
  text-align: center;
  color: var(--text-secondary);
  padding: 30px 0;
  font-size: 14px;
}
</style>
