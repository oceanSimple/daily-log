<template>
  <div class="page-stack">
    <PageHeader
      :eyebrow="t('journal.eyebrow')"
      title=""
      description=""
    />

    <div v-if="overviewDays.length" class="overview-list">
      <RouterLink
        v-for="record in overviewDays"
        :key="record.date"
        class="overview-link"
        :to="`/day/${record.date}`"
      >
        <SectionCard :title="formatDateLabel(record.date)" description="">
          <div class="overview-card">
            <div class="overview-grid">
              <section class="content-pane content-pane--journal">
                <p class="overview-heading">{{ t('journal.headings.journalTitle') }}</p>
                <div class="journal-preview-body">
                  <MarkdownPreview :content="record.journalEntry.content || '...'" />
                </div>
              </section>

              <section class="content-pane">
                <p class="overview-heading">{{ t('journal.headings.logEntries') }}</p>
                <div v-if="record.logEntries.length" class="entry-preview-list">
                  <div
                    v-for="entry in record.logEntries"
                    :key="entry.id"
                    class="entry-preview"
                    :class="[`is-${entry.sourceType}`, { 'is-highlight': entry.isHighlight }]"
                  >
                    <span class="entry-preview__time">{{ entry.time }}</span>
                    <p class="entry-preview__title">{{ entry.title }}</p>
                  </div>
                </div>
                <p v-else class="overview-copy">{{ t('dayLog.noEntries') }}</p>
              </section>
            </div>
          </div>
        </SectionCard>
      </RouterLink>
    </div>

    <n-empty v-else :description="t('journal.empty')" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { NEmpty } from 'naive-ui';
import { RouterLink } from 'vue-router';

import MarkdownPreview from '@/components/MarkdownPreview.vue';
import { useAppLocale } from '@/composables/useAppLocale';
import PageHeader from '@/components/PageHeader.vue';
import SectionCard from '@/components/SectionCard.vue';
import { useDailyHubStore } from '@/store/dailyHub';
import { formatDateLabel } from '@/utils/date';

const store = useDailyHubStore();
const overviewDays = computed(() => store.journalOverviewDays);
const { t } = useAppLocale();
</script>

<style scoped>
.page-stack,
.overview-list,
.overview-card,
.overview-grid,
.entry-preview-list,
.entry-preview {
  display: grid;
}

.page-stack {
  gap: 26px;
}

.overview-list {
  gap: 18px;
}

.overview-link {
  color: inherit;
  text-decoration: none;
}

.overview-card {
  gap: 14px;
}

.overview-grid {
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
  gap: 26px;
}

.content-pane {
  min-height: 148px;
  height: 100%;
  padding: 6px 0;
}

.content-pane--journal {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
}

.overview-heading,
.overview-copy,
.entry-preview__title {
  margin: 0;
}

.overview-heading {
  color: var(--muted-text-color);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.overview-copy {
  margin-top: 10px;
  line-height: 1.8;
}

.journal-preview-body {
  min-height: 0;
  margin-top: 10px;
  overflow: hidden;
}

.journal-preview-body :deep(.markdown-preview) {
  font-size: 14px;
  line-height: 1.8;
}

.journal-preview-body :deep(h1) {
  font-size: 28px;
  line-height: 1.2;
}

.journal-preview-body :deep(h2) {
  font-size: 18px;
}

.entry-preview-list {
  gap: 10px;
  margin-top: 10px;
}

.entry-preview {
  grid-template-columns: 72px minmax(0, 1fr);
  gap: 14px;
  align-items: center;
  padding: 12px 14px;
  border: 1px solid rgba(255, 255, 255, 0.76);
  border-radius: 18px;
  background:
    var(--glass-panel),
    rgba(255, 255, 255, 0.34);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.88),
    0 12px 22px rgba(116, 99, 83, 0.06);
  backdrop-filter: blur(20px) saturate(135%);
}

.entry-preview.is-task {
  border-color: rgba(116, 165, 255, 0.24);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.58), rgba(232, 241, 255, 0.18)),
    rgba(236, 244, 255, 0.22);
}

.entry-preview.is-event {
  border-color: rgba(108, 195, 163, 0.24);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.58), rgba(232, 248, 242, 0.18)),
    rgba(234, 247, 242, 0.22);
}

.entry-preview.is-highlight {
  border-color: rgba(243, 186, 74, 0.34);
  background:
    linear-gradient(180deg, rgba(255, 252, 245, 0.68), rgba(255, 241, 214, 0.16)),
    rgba(255, 246, 229, 0.24);
}

.entry-preview__time {
  color: var(--muted-text-color);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 64px;
  min-height: 30px;
  padding: 0 10px;
  border: 1px solid rgba(255, 255, 255, 0.42);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.34);
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.entry-preview__title {
  min-width: 0;
  font-weight: 600;
  line-height: 1.55;
}

@media (max-width: 900px) {
  .overview-grid {
    grid-template-columns: 1fr;
  }

  .content-pane {
    min-height: auto;
  }
}
</style>
