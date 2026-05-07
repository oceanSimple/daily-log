<template>
  <div class="page-stack">
    <PageHeader
      eyebrow="Today"
      title="今天的生活面板"
      description="把日程、任务、日记和每日总结放在同一个工作台里，先看清今天，再决定往哪里发力。"
    >
      <template #meta>
        <n-tag type="success" round>{{ todayLabel }}</n-tag>
      </template>
    </PageHeader>

    <section class="stats-grid">
      <SectionCard>
        <div class="stat">
          <span class="stat__label">今日任务</span>
          <strong>{{ todayRecord.tasks.length }}</strong>
          <span class="stat__note">{{ completedTasks }} 已完成</span>
        </div>
      </SectionCard>
      <SectionCard>
        <div class="stat">
          <span class="stat__label">今日安排</span>
          <strong>{{ todayRecord.events.length }}</strong>
          <span class="stat__note">最晚到 {{ lastEventTime }}</span>
        </div>
      </SectionCard>
      <SectionCard>
        <div class="stat">
          <span class="stat__label">临近截止</span>
          <strong>{{ upcomingTasks.length }}</strong>
          <span class="stat__note">48 小时内需要关注</span>
        </div>
      </SectionCard>
      <SectionCard>
        <div class="stat">
          <span class="stat__label">今日状态</span>
          <strong>{{ moodLabel }}</strong>
          <span class="stat__note">来自每日总结</span>
        </div>
      </SectionCard>
    </section>

    <section class="two-column">
      <SectionCard title="今日任务" description="先抓高优先级，再决定其他事情值不值得做。">
        <div class="task-list">
          <div v-for="task in todayRecord.tasks" :key="task.id" class="task-item">
            <div>
              <p class="item-title">{{ task.title }}</p>
              <p class="item-meta">{{ task.status }} · {{ task.priority }} · {{ formatDateTimeLabel(task.dueAt) }}</p>
            </div>
            <n-tag :type="taskTagType(task.status)" size="small" round>{{ task.status }}</n-tag>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="今日日程" description="今天排了什么，以及时间被什么占住了。">
        <div class="event-list">
          <div v-for="event in todayRecord.events" :key="event.id" class="event-item">
            <p class="item-title">{{ event.title }}</p>
            <p class="item-meta">{{ formatTimeRange(event.startAt, event.endAt) }}</p>
          </div>
        </div>
      </SectionCard>
    </section>

    <section class="two-column">
      <SectionCard title="日记摘录" description="今日日记先给你一个入口，不用满世界找上下文。">
        <MarkdownPreview :content="todayRecord.journalEntry.content" />
        <RouterLink class="inline-link" :to="`/day/${todayRecord.date}`">进入今日页面继续写</RouterLink>
      </SectionCard>

      <SectionCard title="每日总结" description="让今天收束，而不是只是结束。">
        <div class="summary-list">
          <div>
            <p class="summary-title">今天做得好的</p>
            <ul>
              <li v-for="item in todayRecord.dailySummary.wins" :key="item">{{ item }}</li>
            </ul>
          </div>
          <div>
            <p class="summary-title">明日重点</p>
            <ul>
              <li v-for="item in todayRecord.dailySummary.nextFocus" :key="item">{{ item }}</li>
            </ul>
          </div>
        </div>
      </SectionCard>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { NTag } from 'naive-ui';

import MarkdownPreview from '@/components/MarkdownPreview.vue';
import PageHeader from '@/components/PageHeader.vue';
import SectionCard from '@/components/SectionCard.vue';
import { useDailyHubStore } from '@/store/dailyHub';
import { formatDateLabel, formatDateTimeLabel, formatTimeRange } from '@/utils/date';

const store = useDailyHubStore();

const todayRecord = computed(() => store.todayRecord);
const upcomingTasks = computed(() => store.upcomingTasks);
const completedTasks = computed(
  () => todayRecord.value.tasks.filter((task) => task.status === 'done').length,
);
const moodLabel = computed(() => store.moodLabel(todayRecord.value.dailySummary.mood));
const todayLabel = computed(() => formatDateLabel(todayRecord.value.date));
const lastEventTime = computed(() => {
  const last = todayRecord.value.events[todayRecord.value.events.length - 1];
  return last ? formatDateTimeLabel(last.endAt).split(' ')[1] : '无安排';
});

function taskTagType(status: 'todo' | 'in_progress' | 'done') {
  if (status === 'done') return 'success';
  if (status === 'in_progress') return 'warning';
  return 'default';
}
</script>

<style scoped>
.page-stack {
  display: grid;
  gap: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.stat {
  display: grid;
  gap: 8px;
  padding: 18px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.36), rgba(255, 255, 255, 0.12)),
    rgba(244, 248, 252, 0.28);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.56);
}

.stat strong {
  font-size: 30px;
  line-height: 1;
}

.stat__label,
.stat__note,
.item-meta,
.summary-title {
  color: var(--muted-text-color);
}

.stat__label {
  font-size: 13px;
  font-weight: 600;
}

.stat__note,
.item-meta {
  font-size: 13px;
}

.two-column {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.task-list,
.event-list,
.summary-list {
  display: grid;
  gap: 12px;
}

.task-item,
.event-item {
  display: flex;
  gap: 12px;
  justify-content: space-between;
  align-items: flex-start;
  padding: 14px 16px;
  border: 1px solid rgba(255, 255, 255, 0.34);
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.34), rgba(255, 255, 255, 0.1)),
    rgba(244, 248, 252, 0.22);
}

.item-title,
.summary-title {
  margin: 0 0 6px;
  font-weight: 600;
}

.inline-link {
  color: var(--accent-text-color);
  font-size: 14px;
  font-weight: 600;
}

ul {
  margin: 0;
  padding-left: 20px;
}

@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 780px) {
  .stats-grid,
  .two-column {
    grid-template-columns: 1fr;
  }
}
</style>
