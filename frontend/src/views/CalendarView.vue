<template>
  <div class="page-stack">
    <PageHeader
      eyebrow="Calendar"
      title="本周时间视图"
      description="第一版先用日程清单和按周分组把节奏看清，不急着做复杂拖拽日历。"
    />

    <section class="week-grid">
      <SectionCard
        v-for="day in weekSchedule"
        :key="day.date"
        :title="formatDateLabel(day.date)"
        :description="`${day.events.length} events`"
      >
        <div class="day-events">
          <RouterLink
            v-for="event in day.events"
            :key="event.id"
            class="event-link"
            :to="`/day/${day.date}`"
          >
            <span class="event-link__title">{{ event.title }}</span>
            <span class="event-link__meta">{{ formatTimeRange(event.startAt, event.endAt) }}</span>
          </RouterLink>
          <p v-if="day.events.length === 0" class="empty-note">这一天当前没有事件安排。</p>
        </div>
      </SectionCard>
    </section>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';

import PageHeader from '@/components/PageHeader.vue';
import SectionCard from '@/components/SectionCard.vue';
import { useDailyHubStore } from '@/store/dailyHub';
import { formatDateLabel, formatTimeRange } from '@/utils/date';

const store = useDailyHubStore();
const weekSchedule = store.currentWeekSchedule;
</script>

<style scoped>
.page-stack,
.week-grid,
.day-events {
  display: grid;
}

.page-stack {
  gap: 24px;
}

.week-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.day-events {
  gap: 10px;
}

.event-link {
  display: grid;
  gap: 4px;
  padding: 12px;
  border: 1px solid var(--border-color-soft);
  border-radius: 8px;
  background: #fafafa;
}

.event-link__title {
  font-weight: 600;
}

.event-link__meta,
.empty-note {
  color: var(--muted-text-color);
  font-size: 13px;
}

.empty-note {
  margin: 0;
}

@media (max-width: 900px) {
  .week-grid {
    grid-template-columns: 1fr;
  }
}
</style>
