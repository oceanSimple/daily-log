<template>
  <div class="timeline-card" :class="[`is-${status}`, schedule.isTodo ? 'type-todo' : 'type-schedule']">
    <div class="card-icon clickable" @click="emit('toggle')">
      <SvgIcon v-if="schedule.completed" name="lucide:check-circle" size="24px" :color="iconColor" />
      <SvgIcon v-else-if="schedule.isTodo" name="lucide:circle" size="24px" :color="iconColor" />
      <SvgIcon v-else name="lucide:calendar" size="24px" :color="iconColor" />
    </div>
    
    <div class="card-main">
      <h3 :class="{ 'line-through': status === 'completed' }">{{ schedule.title }}</h3>
      <div class="time-range">
        {{ schedule.startTime }} <span v-if="schedule.endTime !== schedule.startTime">- {{ schedule.endTime }}</span>
      </div>
    </div>
    
    <div class="card-status">
      <span class="status-tag" :class="`tag-${status}`">
        {{ statusText }}
      </span>
      <button class="delete-btn" @click.stop="emit('delete')" title="删除">
        <SvgIcon name="lucide:trash-2" size="16px" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SvgIcon from '../SvgIcon.vue'
import type { Schedule } from '../../types'

const props = defineProps<{
  schedule: Schedule
  status: 'completed' | 'overdue' | 'pending' | 'not-started'
}>()

const emit = defineEmits(['toggle', 'delete'])

const iconColor = computed(() => {
  if (props.status === 'completed') return 'var(--success)'
  if (props.status === 'overdue') return 'var(--warning)'
  if (props.status === 'not-started') return 'var(--info)'
  return 'var(--primary)'
})

const statusText = computed(() => {
  if (props.status === 'completed') return '已完成'
  if (props.status === 'overdue') return '已逾期'
  if (props.status === 'not-started') return '未开始'
  return '进行中'
})
</script>

<style scoped>
.timeline-card {
  border-radius: var(--radius-md);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.02);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast);
  border: 1px solid rgba(255, 255, 255, 0.8);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.timeline-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* 日程的边框与背景：竹青色水墨背景 */
.type-schedule {
  background-image: linear-gradient(145deg, rgba(255, 255, 255, 0.92) 0%, rgba(235, 248, 241, 0.75) 100%), url('@/assets/images/bg-timeline-schedule.png');
  border-color: rgba(190, 227, 208, 0.5);
}

.type-schedule:hover {
  background-image: linear-gradient(145deg, rgba(255, 255, 255, 0.88) 0%, rgba(220, 240, 230, 0.7) 100%), url('@/assets/images/bg-timeline-schedule.png');
  border-color: rgba(144, 205, 175, 0.8);
}

/* 待办的边框与背景：略偏蓝的水墨背景 */
.type-todo {
  background-image: linear-gradient(145deg, rgba(255, 255, 255, 0.92) 0%, rgba(235, 244, 255, 0.75) 100%), url('@/assets/images/bg-timeline-todo.png');
  border-color: rgba(190, 227, 248, 0.5);
}

.type-todo:hover {
  background-image: linear-gradient(145deg, rgba(255, 255, 255, 0.88) 0%, rgba(226, 232, 240, 0.7) 100%), url('@/assets/images/bg-timeline-todo.png');
  border-color: rgba(144, 205, 244, 0.8);
}

/* Optional: slight visual variation for the icon shape */
.type-todo .card-icon {
  border-radius: 50%;
}

.type-todo .card-main h3 {
  font-weight: 500;
}

/* Card specific borders based on status can be added here if needed to match design exactly */

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clickable {
  cursor: pointer;
  transition: transform 0.1s, opacity 0.2s;
}

.clickable:hover {
  opacity: 0.8;
  transform: scale(1.05);
}

.is-completed .card-icon { background: rgba(0, 184, 148, 0.1); }
.is-overdue .card-icon { background: rgba(225, 112, 85, 0.1); }
.is-pending .card-icon { background: rgba(108, 92, 231, 0.1); }
.is-not-started .card-icon { background: rgba(9, 132, 227, 0.1); }

.card-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-main h3 {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
}

.line-through {
  text-decoration: line-through;
  color: var(--text-regular) !important;
}

.time-range {
  font-size: 13px;
  color: var(--text-regular);
}

.card-status {
  display: flex;
  gap: 8px;
  align-items: center;
}

.status-tag {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 500;
}

.tag-completed {
  color: var(--success);
  background: rgba(0, 184, 148, 0.1);
}

.tag-overdue {
  color: var(--warning);
  background: rgba(225, 112, 85, 0.1);
}

.tag-pending {
  color: var(--primary);
  background: rgba(108, 92, 231, 0.1);
}

.tag-not-started {
  color: var(--info);
  background: rgba(9, 132, 227, 0.1);
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
  transform: translateX(5px);
}

.timeline-card:hover .delete-btn {
  opacity: 1;
  transform: translateX(0);
}

.delete-btn:hover {
  color: var(--warning);
  background: rgba(225, 112, 85, 0.1);
}
</style>
