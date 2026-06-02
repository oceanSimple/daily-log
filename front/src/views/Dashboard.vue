<template>
  <div class="dashboard">
    <Sidebar />
    <main class="main-content">
      <Header />
      
      <div class="dashboard-grid">
        <section class="timeline-section">
          <Timeline 
            :schedules="combinedTimelineData" 
            @toggle="handleTimelineToggle" 
            @add="handleAddSchedule" 
            @delete="(id) => confirmDelete('schedule', id)"
          />
        </section>
        
        <section class="content-section">
          <TodoPanel 
            :todos="todos" 
            @toggle="toggleTodoStatus" 
            @add="handleAddTodo" 
            @delete="(id) => confirmDelete('todo', id)"
          />
          <EssayPanel 
            :essays="essays" 
            @add="handleAddEssay" 
            @delete="(id) => confirmDelete('essay', id)"
          />
        </section>
      </div>
    </main>

    <ConfirmModal
      v-model="showConfirmModal"
      :title="confirmConfig.title"
      :message="confirmConfig.message"
      @confirm="handleConfirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import Header from '@/components/layout/Header.vue'
import Timeline from '@/components/timeline/Timeline.vue'
import TodoPanel from '@/components/todo/TodoPanel.vue'
import EssayPanel from '@/components/essay/EssayPanel.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'

import { getSchedules, addSchedule, toggleSchedule, deleteSchedule } from '@/api/schedule'
import { getTodos, toggleTodo, addTodo, deleteTodo } from '@/api/todo'
import { getEssays, addEssay, deleteEssay } from '@/api/essay'

import type { Schedule, Todo, Essay } from '@/types'

const schedules = ref<Schedule[]>([])
const todos = ref<Todo[]>([])
const essays = ref<Essay[]>([])

// 只有已完成和超时的待办会插入到时间轴
const combinedTimelineData = computed(() => {
  const currentHour = new Date().getHours()
  const currentMinute = new Date().getMinutes()
  
  const isTodoOverdue = (todo: Todo) => {
    if (todo.completed) return false
    const [endH, endM] = todo.deadline.split(':').map(Number)
    if (currentHour > endH) return true
    if (currentHour === endH && currentMinute > endM) return true
    return false
  }

  const timelineTodos = todos.value
    .filter(todo => todo.completed || isTodoOverdue(todo))
    .map(todo => ({
      id: todo.id,
      title: todo.title,
      detail: todo.detail,
      startTime: todo.deadline === '23:59' ? 'Today' : todo.deadline,
      endTime: todo.deadline === '23:59' ? 'Today' : todo.deadline,
      completed: todo.completed,
      isTodo: true
    } as Schedule))

  // 根据 startTime 排序
  const combined = [...schedules.value, ...timelineTodos]
  combined.sort((a, b) => {
    if (a.startTime === 'Today') return 1;
    if (b.startTime === 'Today') return -1;
    return a.startTime.localeCompare(b.startTime)
  })
  
  return combined
})

const fetchData = async () => {
  try {
    const [sData, tData, eData] = await Promise.all([
      getSchedules(),
      getTodos(),
      getEssays()
    ])
    schedules.value = sData
    todos.value = tData
    essays.value = eData
  } catch (error) {
    console.error("Failed to fetch data:", error)
  }
}

const toggleTodoStatus = async (id: string, completed: boolean) => {
  try {
    const updatedTodo = await toggleTodo(id, completed)
    const index = todos.value.findIndex(t => t.id === id)
    if (index !== -1) {
      todos.value[index] = updatedTodo
    }
  } catch (error) {
    console.error("Failed to toggle todo:", error)
  }
}

const toggleScheduleStatus = async (id: string, completed: boolean) => {
  try {
    const updatedSchedule = await toggleSchedule(id, completed)
    const index = schedules.value.findIndex(s => s.id === id)
    if (index !== -1) {
      schedules.value[index] = updatedSchedule
    }
  } catch (error) {
    console.error("Failed to toggle schedule:", error)
  }
}

const handleTimelineToggle = async (schedule: Schedule) => {
  if (schedule.isTodo) {
    await toggleTodoStatus(schedule.id, !schedule.completed)
  } else {
    await toggleScheduleStatus(schedule.id, !schedule.completed)
  }
}

const handleAddSchedule = async (data: any) => {
  try {
    const newSchedule = await addSchedule({
      title: data.title,
      detail: data.detail || '',
      startTime: data.startTime,
      endTime: data.endTime,
      completed: false
    })
    schedules.value.push(newSchedule)
  } catch (error) {
    console.error("Failed to add schedule:", error)
  }
}

const handleAddTodo = async (data: any) => {
  try {
    const newTodo = await addTodo({
      title: data.title,
      detail: data.content || '',
      deadline: data.endTime,
      completed: false,
      icon: 'lucide:circle'
    })
    todos.value.push(newTodo)
  } catch (error) {
    console.error("Failed to add todo:", error)
  }
}

const handleAddEssay = async (data: any) => {
  try {
    const newEssay = await addEssay({
      title: data.title,
      content: data.content,
      category: data.category,
      createdAt: new Date().toISOString()
    })
    essays.value.unshift(newEssay)
  } catch (error) {
    console.error("Failed to add essay:", error)
  }
}

// 删除确认逻辑
const showConfirmModal = ref(false)
const confirmConfig = ref({ title: '', message: '', targetId: '', type: '' })

const confirmDelete = (type: string, id: string) => {
  let title = '确认删除'
  let message = '确定要删除这项内容吗？'
  
  if (type === 'schedule') {
    title = '删除日程'
    message = '确定要删除这条日程吗？此操作不可恢复。'
  } else if (type === 'todo') {
    title = '删除待办'
    message = '确定要删除这条待办事项吗？此操作不可恢复。'
  } else if (type === 'essay') {
    title = '删除随笔'
    message = '确定要删除这篇随笔吗？此操作不可恢复。'
  }
  
  confirmConfig.value = { title, message, targetId: id, type }
  showConfirmModal.value = true
}

const handleConfirmDelete = async () => {
  const { targetId, type } = confirmConfig.value
  try {
    if (type === 'schedule') {
      await deleteSchedule(targetId)
      schedules.value = schedules.value.filter(s => s.id !== targetId)
    } else if (type === 'todo') {
      await deleteTodo(targetId)
      todos.value = todos.value.filter(t => t.id !== targetId)
    } else if (type === 'essay') {
      await deleteEssay(targetId)
      essays.value = essays.value.filter(e => e.id !== targetId)
    }
  } catch (err) {
    console.error('Failed to delete', err)
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.dashboard {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  height: 100vh;
}

.dashboard-grid {
  display: flex;
  gap: 40px;
  padding: 0 60px 40px 40px;
  flex: 1;
}

.timeline-section {
  flex: 0 0 420px;
  min-width: 420px;
}

.content-section {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
</style>
