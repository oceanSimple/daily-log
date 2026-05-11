<template>
  <div class="page-stack">
    <PageHeader
      :eyebrow="t('journal.eyebrow')"
      :title="t('journal.title')"
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
              <n-popover trigger="hover" placement="bottom-start" :show-arrow="false" :width="420">
                <template #trigger>
                  <section class="content-pane content-pane--journal">
                    <p class="overview-heading">{{ t('journal.headings.journalTitle') }}</p>
                    <div class="journal-preview-body">
                      <MarkdownPreview :content="record.journalEntry.content || '...'" />
                    </div>
                  </section>
                </template>

                <div class="hover-panel hover-panel--journal">
                  <MarkdownPreview :content="record.journalEntry.content || '...'" />
                </div>
              </n-popover>

              <section class="content-pane">
                <p class="overview-heading">{{ t('journal.headings.logEntries') }}</p>
                <div v-if="record.logEntries.length" class="entry-preview-list">
                  <n-popover
                    v-for="entry in record.logEntries"
                    :key="entry.id"
                    trigger="hover"
                    placement="left-start"
                    :show-arrow="false"
                    :width="380"
                  >
                    <template #trigger>
                      <div class="entry-preview" :class="[`is-${entry.sourceType}`, { 'is-highlight': entry.isHighlight }]">
                        <span class="entry-preview__time">{{ entry.time }}</span>
                        <p class="entry-preview__title">{{ entry.title }}</p>
                      </div>
                    </template>

                    <div class="hover-panel hover-panel--entries">
                      <article
                        class="hover-entry-card"
                        :class="[`is-${entry.sourceType}`, { 'is-highlight': entry.isHighlight }]"
                      >
                        <div class="hover-entry-card__topline">
                          <h3>{{ entry.title }}</h3>
                          <span class="hover-entry-card__time">{{ entry.time }}</span>
                        </div>
                        <p v-if="entry.notes" class="hover-entry-card__notes">{{ entry.notes }}</p>
                      </article>
                    </div>
                  </n-popover>
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
import { NEmpty, NPopover } from 'naive-ui';
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
.entry-preview,
.hover-entry-list,
.hover-entry-card {
  display: grid;
}

.page-stack {
  gap: 24px;
}

.overview-list {
  gap: 16px;
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
  gap: 24px;
}

.content-pane {
  min-height: 148px;
  height: 100%;
  padding: 4px 0;
}

.content-pane--journal {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
}

.overview-heading,
.overview-copy,
.entry-preview__title,
.hover-entry-card__notes,
.hover-entry-card__time,
h3 {
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
  grid-template-columns: 56px minmax(0, 1fr);
  gap: 12px;
  align-items: start;
  padding: 10px 12px;
  border: 1px solid rgba(255, 255, 255, 0.42);
  border-radius: 14px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.52), rgba(255, 255, 255, 0.18)),
    rgba(243, 247, 252, 0.24);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.66),
    0 8px 20px rgba(103, 122, 148, 0.06);
  backdrop-filter: blur(18px) saturate(145%);
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

.entry-preview__time,
.hover-entry-card__time {
  color: var(--muted-text-color);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.entry-preview__title {
  min-width: 0;
  font-weight: 600;
  line-height: 1.55;
}

.hover-panel {
  max-height: min(70vh, 560px);
  overflow: auto;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.58), rgba(255, 255, 255, 0.18)),
    rgba(243, 247, 252, 0.28);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.72),
    0 18px 40px rgba(97, 117, 144, 0.14);
  backdrop-filter: blur(24px) saturate(155%);
}

.hover-panel--journal :deep(.markdown-preview) {
  font-size: 14px;
  line-height: 1.9;
}

.hover-entry-card {
  gap: 8px;
  padding: 14px 16px;
  border: 1px solid rgba(255, 255, 255, 0.48);
  border-radius: 16px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.7),
    0 10px 26px rgba(103, 122, 148, 0.08);
  backdrop-filter: blur(18px) saturate(150%);
}

.hover-entry-card.is-task {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.58), rgba(232, 241, 255, 0.22)),
    rgba(236, 244, 255, 0.26);
  border-color: rgba(116, 165, 255, 0.28);
}

.hover-entry-card.is-event {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.58), rgba(232, 248, 242, 0.22)),
    rgba(234, 247, 242, 0.26);
  border-color: rgba(108, 195, 163, 0.28);
}

.hover-entry-card.is-highlight {
  background:
    linear-gradient(180deg, rgba(255, 252, 245, 0.68), rgba(255, 241, 214, 0.2)),
    rgba(255, 246, 229, 0.28);
  border-color: rgba(243, 186, 74, 0.38);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.72),
    0 12px 30px rgba(243, 186, 74, 0.1);
}

.hover-entry-card__topline {
  display: flex;
  gap: 12px;
  justify-content: space-between;
  align-items: start;
}

h3 {
  min-width: 0;
  font-size: 15px;
  font-weight: 650;
  line-height: 1.5;
}

.hover-entry-card__notes {
  color: var(--muted-text-color);
  line-height: 1.7;
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
