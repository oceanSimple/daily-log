<template>
  <div class="essay-card">
    <div class="card-bg" :class="`bg-${essay.category}`"></div>
    <div class="card-content">
      <div class="card-header flex-between">
        <h3>{{ essay.category }}</h3>
        <SvgIcon :name="iconName" size="20px" :color="iconColor" />
      </div>
      
      <p class="content-text">{{ essay.content }}</p>
      
      <div class="essay-footer">
        <span class="date">{{ timeString }}</span>
        <button class="delete-btn" @click.stop="$emit('delete', essay.id)" title="删除">
          <SvgIcon name="lucide:trash-2" size="16px" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SvgIcon from '../SvgIcon.vue'
import type { Essay } from '../../types'

const props = defineProps<{
  essay: Essay
}>()

const emit = defineEmits(['delete'])


const iconName = computed(() => {
  return props.essay.category === 'Thoughts' ? 'icon-sun' : 'icon-document'
})

const iconColor = computed(() => {
  return props.essay.category === 'Thoughts' ? '#E17055' : 'var(--primary)'
})

const timeString = computed(() => {
  const d = new Date(props.essay.createdAt)
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
})
</script>

<style scoped>
.essay-card {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background-color: #fff;
  box-shadow: var(--shadow-sm);
  min-height: 160px;
  display: flex;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.essay-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.card-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  z-index: 0;
  transition: all var(--transition-fast);
}

.bg-Thoughts {
  background-image: linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(250, 240, 230, 0.7) 100%), url('@/assets/images/bg-essay-thoughts.png');
  transform: scale(1.15);
}

.essay-card:hover .bg-Thoughts {
  background-image: linear-gradient(135deg, rgba(255, 255, 255, 0.88) 0%, rgba(250, 240, 230, 0.65) 100%), url('@/assets/images/bg-essay-thoughts.png');
}

.bg-Summary {
  background-image: linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(245, 240, 235, 0.7) 100%), url('@/assets/images/bg-essay-summary.png');
  transform: scale(1.3);
}

.essay-card:hover .bg-Summary {
  background-image: linear-gradient(135deg, rgba(255, 255, 255, 0.88) 0%, rgba(245, 240, 235, 0.65) 100%), url('@/assets/images/bg-essay-summary.png');
}

.card-content {
  position: relative;
  z-index: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.card-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.content-text {
  margin-top: 12px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-regular);
  flex: 1;
}

.essay-footer {
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.date {
  font-size: 12px;
  color: var(--text-secondary);
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
}

.essay-card:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  color: var(--warning);
  background: rgba(225, 112, 85, 0.1);
}
</style>
