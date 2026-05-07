<template>
  <div class="page-stack">
    <PageHeader
      eyebrow="Archive"
      title="历史日记与总结"
      description="归档页负责把过去保留下来，既能按天回看，也能快速判断哪一天值得重新打开。"
    />

    <div class="archive-list">
      <SectionCard
        v-for="record in archiveRecords"
        :key="record.date"
        :title="formatDateLabel(record.date)"
        :description="record.journalEntry.title"
      >
        <div class="archive-card">
          <div>
            <p class="archive-heading">日记标题</p>
            <p class="archive-copy">{{ record.journalEntry.title }}</p>
          </div>
          <div>
            <p class="archive-heading">总结状态</p>
            <p class="archive-copy">{{ moodLabel(record.dailySummary.mood) }}</p>
          </div>
          <div>
            <p class="archive-heading">明日重点</p>
            <ul>
              <li v-for="item in record.dailySummary.nextFocus" :key="item">{{ item }}</li>
            </ul>
          </div>
          <RouterLink class="archive-link" :to="`/day/${record.date}`">进入当日日志</RouterLink>
        </div>
      </SectionCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';

import PageHeader from '@/components/PageHeader.vue';
import SectionCard from '@/components/SectionCard.vue';
import { useDailyHubStore } from '@/store/dailyHub';
import { formatDateLabel } from '@/utils/date';

const store = useDailyHubStore();
const archiveRecords = store.archiveRecords;

function moodLabel(mood: 'steady' | 'focused' | 'energized' | 'tired') {
  return store.moodLabel(mood);
}
</script>

<style scoped>
.page-stack,
.archive-list,
.archive-card {
  display: grid;
}

.page-stack {
  gap: 24px;
}

.archive-list,
.archive-card {
  gap: 16px;
}

.archive-heading,
.archive-copy,
ul {
  margin: 0;
}

.archive-heading {
  color: var(--muted-text-color);
  font-size: 13px;
  font-weight: 600;
}

.archive-copy {
  margin-top: 6px;
  line-height: 1.6;
}

ul {
  margin-top: 8px;
  padding-left: 20px;
}

.archive-link {
  color: var(--accent-text-color);
  font-size: 14px;
  font-weight: 600;
}
</style>
