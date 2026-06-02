<template>
  <div class="timeline-container">
    <div class="timeline-header flex-between">
      <div class="title flex-center">
        <SvgIcon name="icon-clock" size="20px" color="var(--primary)" />
        <h2>时间轴</h2>
      </div>
      <button class="add-icon-btn" @click="showAddModal = true" title="添加日程">
        <SvgIcon name="icon-add" size="18px" />
      </button>
    </div>
    
    <div class="timeline-list">
      <div 
        v-for="(item, index) in schedules" 
        :key="item.id" 
        class="timeline-node"
      >
        <div class="node-line" v-if="index !== schedules.length - 1"></div>
        <div class="node-indicator" :class="getStatusClass(item)">
          <SvgIcon v-if="item.completed" name="icon-check" size="10px" color="#fff" />
          <SvgIcon v-else-if="isOverdue(item)" name="lucide:circle-alert" size="10px" color="#fff" />
        </div>
        
        <div class="node-content">
          <TimelineCard :schedule="item" :status="getStatus(item)" @toggle="$emit('toggle', item)" @delete="$emit('delete', item.id)" />
        </div>
      </div>
    </div>
    

    <AddScheduleModal v-model="showAddModal" @save="handleAddSchedule" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SvgIcon from '../SvgIcon.vue'
import AddScheduleModal from './AddScheduleModal.vue'
import TimelineCard from './TimelineCard.vue'
import type { Schedule } from '../../types'

const props = defineProps<{
  schedules: Schedule[]
}>()

const emit = defineEmits(['toggle', 'add', 'delete'])

const showAddModal = ref(false)

const handleAddSchedule = (data: any) => {
  emit('add', data)
}

const currentTime = new Date()
const currentHour = currentTime.getHours()
const currentMinute = currentTime.getMinutes()

const isOverdue = (item: Schedule) => {
  if (item.completed) return false
  const [endH, endM] = item.endTime.split(':').map(Number)
  if (currentHour > endH) return true
  if (currentHour === endH && currentMinute > endM) return true
  return false
}

const isNotStarted = (item: Schedule) => {
  if (item.completed) return false
  if (item.startTime === 'Today') return false
  const [startH, startM] = item.startTime.split(':').map(Number)
  if (currentHour < startH) return true
  if (currentHour === startH && currentMinute < startM) return true
  return false
}

const getStatus = (item: Schedule) => {
  if (item.completed) return 'completed'
  if (isOverdue(item)) return 'overdue'
  if (isNotStarted(item)) return 'not-started'
  return 'pending'
}

const getStatusClass = (item: Schedule) => {
  return `status-${getStatus(item)}`
}
</script>

<style scoped>
.timeline-container {
  width: 100%;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title h2 {
  font-size: 18px;
  font-weight: 600;
  text-shadow: 0 1px 4px rgba(255, 255, 255, 0.8);
}

.add-icon-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-card);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.add-icon-btn:hover {
  background: var(--primary);
  color: #fff;
}

.timeline-list {
  display: flex;
  flex-direction: column;
  position: relative;
  padding-left: 14px;
}

.timeline-node {
  position: relative;
  padding-bottom: 24px;
}

.node-indicator {
  position: absolute;
  left: -14px;
  top: 24px; /* Center with the card's middle roughly or top? Layout shows top aligned */
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  box-shadow: 0 0 0 4px var(--bg-main);
}

.node-line {
  position: absolute;
  left: -4px;
  top: 44px;
  bottom: -24px;
  width: 2px;
  background-color: var(--border-color);
  z-index: 1;
}

.status-completed {
  background-color: var(--success);
}

.status-overdue {
  background-color: var(--warning);
}

.status-pending {
  background-color: var(--primary);
}

.status-not-started {
  background-color: var(--info);
}

.node-content {
  padding-left: 20px;
}


</style>
