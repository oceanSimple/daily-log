<template>
  <div v-if="record" class="page-stack">
    <PageHeader
      eyebrow="Day Log"
      :title="formatDateLabel(record.date)"
      description="把这一天当成一个完整的容器：安排、任务、日记和总结都在这里对齐。"
    >
      <template #meta>
        <n-tag round type="info">{{ record.tasks.length }} tasks</n-tag>
      </template>
    </PageHeader>

    <section class="grid-two">
      <SectionCard title="当天安排" description="用时间看这一天，而不是只看任务堆积。">
        <div class="list">
          <div v-for="event in record.events" :key="event.id" class="row">
            <div>
              <p class="row-title">{{ event.title }}</p>
              <p class="row-meta">{{ formatTimeRange(event.startAt, event.endAt) }}</p>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="任务完成情况" description="同一天里的任务要和这一天的文字记录放在一起看。">
        <div class="list">
          <div v-for="task in record.tasks" :key="task.id" class="row row--task">
            <div>
              <p class="row-title">{{ task.title }}</p>
              <p class="row-meta">{{ task.priority }} · {{ task.status }} · {{ formatDateTimeLabel(task.dueAt) }}</p>
            </div>
            <n-tag :type="taskTagType(task.status)" size="small" round>{{ task.status }}</n-tag>
          </div>
        </div>
      </SectionCard>
    </section>

    <section class="grid-two">
      <SectionCard title="日记 Markdown" description="第一版保留纯文本输入，把内容结构交给 Markdown。">
        <n-input
          type="textarea"
          :value="record.journalEntry.content"
          readonly
          :autosize="{ minRows: 16, maxRows: 22 }"
        />
      </SectionCard>

      <SectionCard title="日记预览" description="用轻量预览确认结构，而不是追求重编辑器。">
        <MarkdownPreview :content="record.journalEntry.content" />
      </SectionCard>
    </section>

    <section class="grid-two">
      <SectionCard title="每日总结 Markdown" description="总结也沿用 Markdown 字符串，未来可直接接到后端。">
        <n-input
          type="textarea"
          :value="record.dailySummary.content"
          readonly
          :autosize="{ minRows: 14, maxRows: 20 }"
        />
      </SectionCard>

      <SectionCard title="总结回顾" description="除了正文，也保留结构化摘要，方便首页与归档复用。">
        <div class="summary-grid">
          <div>
            <p class="summary-heading">Mood</p>
            <p class="summary-value">{{ moodLabel }}</p>
          </div>
          <div>
            <p class="summary-heading">Wins</p>
            <ul>
              <li v-for="item in record.dailySummary.wins" :key="item">{{ item }}</li>
            </ul>
          </div>
          <div>
            <p class="summary-heading">Blockers</p>
            <ul>
              <li v-for="item in record.dailySummary.blockers" :key="item">{{ item }}</li>
            </ul>
          </div>
          <div>
            <p class="summary-heading">Next Focus</p>
            <ul>
              <li v-for="item in record.dailySummary.nextFocus" :key="item">{{ item }}</li>
            </ul>
          </div>
        </div>
      </SectionCard>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { NInput, NTag } from 'naive-ui';

import MarkdownPreview from '@/components/MarkdownPreview.vue';
import PageHeader from '@/components/PageHeader.vue';
import SectionCard from '@/components/SectionCard.vue';
import { useDailyHubStore } from '@/store/dailyHub';
import { formatDateLabel, formatDateTimeLabel, formatTimeRange } from '@/utils/date';

const route = useRoute();
const store = useDailyHubStore();

const record = computed(() => store.recordMap[route.params.date as string]);
const moodLabel = computed(() =>
  record.value ? store.moodLabel(record.value.dailySummary.mood) : '',
);

function taskTagType(status: 'todo' | 'in_progress' | 'done') {
  if (status === 'done') return 'success';
  if (status === 'in_progress') return 'warning';
  return 'default';
}
</script>

<style scoped>
.page-stack,
.grid-two,
.list,
.summary-grid {
  display: grid;
}

.page-stack {
  gap: 24px;
}

.grid-two {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.list {
  gap: 12px;
}

.row {
  padding: 14px 16px;
  border: 1px solid rgba(255, 255, 255, 0.34);
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.34), rgba(255, 255, 255, 0.1)),
    rgba(244, 248, 252, 0.22);
}

.row--task {
  display: flex;
  gap: 12px;
  justify-content: space-between;
  align-items: flex-start;
}

.row-title,
.summary-heading,
.summary-value {
  margin: 0;
}

.row-title {
  margin-bottom: 6px;
  font-weight: 600;
}

.row-meta,
.summary-heading {
  margin: 0;
  color: var(--muted-text-color);
  font-size: 13px;
}

.summary-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.summary-grid > div {
  padding: 14px 16px;
  border: 1px solid rgba(255, 255, 255, 0.34);
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.34), rgba(255, 255, 255, 0.1)),
    rgba(244, 248, 252, 0.22);
}

.summary-value {
  margin-top: 6px;
  font-size: 18px;
  font-weight: 700;
}

:deep(.n-input) {
  --n-color: rgba(255, 255, 255, 0.3) !important;
  --n-color-focus: rgba(255, 255, 255, 0.42) !important;
  --n-border: 1px solid rgba(255, 255, 255, 0.4) !important;
  --n-border-hover: 1px solid rgba(255, 255, 255, 0.52) !important;
  --n-border-focus: 1px solid rgba(140, 205, 255, 0.52) !important;
  --n-box-shadow-focus: 0 0 0 3px rgba(137, 196, 255, 0.12) !important;
  --n-text-color: var(--body-text-color) !important;
}

:deep(.n-input .n-input__textarea-el),
:deep(.n-input .n-input__input-el) {
  backdrop-filter: blur(18px);
}

ul {
  margin: 10px 0 0;
  padding-left: 20px;
}

@media (max-width: 900px) {
  .grid-two,
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
