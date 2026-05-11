<template>
  <div class="page-stack">
    <PageHeader
      :eyebrow="t('dayLog.eyebrow')"
      :title="formatDateLabel(dateKey, dateLocale)"
      description=""
    >
      <template #meta>
        <div class="meta-stack">
          <n-tag round type="info">{{ logEntries.length }} {{ t('dayLog.logCount') }}</n-tag>
          <n-tag round>{{ record.tasks.length }} {{ t('dayLog.tasksCount') }}</n-tag>
        </div>
      </template>
    </PageHeader>

    <section class="content-grid">
      <div class="main-column">
        <SectionCard :title="t('dayLog.sections.journalTitle')" description="">
          <div
            v-if="!journalEditing"
            class="journal-preview-surface"
            role="button"
            tabindex="0"
            @click="journalEditing = true"
          >
            <MarkdownPreview :content="record.journalEntry.content || t('dayLog.placeholders.journalContent')" />
          </div>

          <div v-else class="editor-stack">
            <n-input
              v-model:value="journalDraft.content"
              type="textarea"
              :placeholder="t('dayLog.placeholders.journalContent')"
              :autosize="{ minRows: 18, maxRows: 28 }"
            />
            <div class="editor-actions">
              <n-button @click="cancelJournalEdit">取消</n-button>
              <n-button type="primary" secondary @click="saveJournal">{{ t('dayLog.saveJournal') }}</n-button>
            </div>
          </div>
        </SectionCard>
      </div>

      <aside class="side-column">
        <SectionCard :title="t('dayLog.sections.entriesTitle')" description="">
          <template #header>
            <n-button type="primary" @click="openCreateEntry">
              <template #icon>
                <n-icon><PlusIcon /></n-icon>
              </template>
              {{ t('dayLog.addEntry') }}
            </n-button>
          </template>

          <div v-if="logEntries.length" class="entry-list">
            <article
              v-for="entry in logEntries"
              :key="entry.id"
              class="entry-card"
              :class="[
                `is-${entry.sourceType}`,
                { 'is-highlight': entry.isHighlight },
              ]"
              role="button"
              tabindex="0"
              @click="openEditEntry(entry)"
            >
              <div class="entry-card__topline">
                <div class="entry-card__primary">
                  <h3>{{ entry.title }}</h3>
                  <span class="entry-time">{{ entry.time }}</span>
                </div>
                <div class="entry-card__actions">
                  <n-popconfirm @positive-click="store.deleteLogEntry(entry.id)">
                    <template #trigger>
                      <n-button quaternary circle type="error" class="delete-action" @click.stop>
                        <template #icon>
                          <n-icon><DeleteIcon /></n-icon>
                        </template>
                      </n-button>
                    </template>
                    {{ t('dayLog.modal.confirmDelete') }}
                  </n-popconfirm>
                </div>
              </div>
              <p v-if="entry.notes" class="entry-notes">{{ entry.notes }}</p>
            </article>
          </div>

          <n-empty v-else :description="t('dayLog.noEntries')" />
        </SectionCard>
      </aside>
    </section>

    <n-modal
      v-model:show="entryModalOpen"
      preset="card"
      :title="editingEntryId ? t('dayLog.modal.editTitle') : t('dayLog.modal.createTitle')"
      class="editor-modal"
      style="width: min(520px, calc(100vw - 32px))"
    >
      <n-form label-placement="top" class="modal-form">
        <div class="form-row">
          <n-form-item :label="t('dayLog.labels.time')">
            <input v-model="entryForm.time" class="native-time-input" type="time" />
          </n-form-item>
          <n-form-item :label="t('dayLog.labels.kind')">
            <n-select
              v-model:value="entryForm.sourceType"
              :options="kindOptions"
              :disabled="Boolean(selectedSourceId)"
            />
          </n-form-item>
          <n-form-item :label="t('dayLog.labels.source')">
            <n-select
              v-model:value="selectedSourceId"
              :options="sourceOptions"
              clearable
              @update:value="handleSourceChange"
            />
          </n-form-item>
        </div>

        <div class="switch-row">
          <span class="switch-row__label">{{ t('dayLog.labels.showUsed') }}</span>
          <n-switch v-model:value="showUsedSources" />
        </div>

        <n-form-item :label="t('dayLog.labels.title')">
          <n-input v-model:value="entryForm.title" :placeholder="t('dayLog.placeholders.entryTitle')" />
        </n-form-item>

        <n-form-item :label="t('dayLog.labels.notes')">
          <n-input
            v-model:value="entryForm.notes"
            type="textarea"
            :placeholder="t('dayLog.placeholders.notes')"
            :autosize="{ minRows: 4, maxRows: 7 }"
          />
        </n-form-item>

        <div class="switch-row">
          <span class="switch-row__label">{{ t('dayLog.labels.highlight') }}</span>
          <n-switch v-model:value="entryForm.isHighlight" />
        </div>
      </n-form>

      <template #footer>
        <div class="modal-footer">
          <n-button @click="entryModalOpen = false">{{ t('dayLog.modal.cancel') }}</n-button>
          <n-button type="primary" @click="submitEntry">{{ t('dayLog.modal.save') }}</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import {
  NButton,
  NEmpty,
  NForm,
  NFormItem,
  NIcon,
  NInput,
  NModal,
  NPopconfirm,
  NSelect,
  NSwitch,
  NTag,
} from 'naive-ui';
import { useRoute } from 'vue-router';

import { DeleteIcon, PlusIcon } from '@/components/task-icons';
import { useAppLocale } from '@/composables/useAppLocale';
import MarkdownPreview from '@/components/MarkdownPreview.vue';
import PageHeader from '@/components/PageHeader.vue';
import SectionCard from '@/components/SectionCard.vue';
import { useDailyHubStore } from '@/store/dailyHub';
import type { LogEntry, LogEntrySourceType } from '@/types/daily-hub';
import { formatDateLabel } from '@/utils/date';

const route = useRoute();
const store = useDailyHubStore();
const { dateLocale, t } = useAppLocale();

const dateKey = computed(() => route.params.date as string);
const record = computed(() => store.recordMap[dateKey.value] ?? store.ensureRecord(dateKey.value));
const logEntries = computed(() => store.dayLogEntries(dateKey.value));
const allSources = computed(() => store.availableLogSources(dateKey.value, true));

const entryModalOpen = ref(false);
const editingEntryId = ref<string | null>(null);
const selectedSourceId = ref<string | null>(null);
const showUsedSources = ref(false);
const journalEditing = ref(false);

const entryForm = reactive({
  time: '09:00',
  title: '',
  notes: '',
  isHighlight: false,
  sourceType: 'task' as LogEntrySourceType,
  sourceId: undefined as string | undefined,
});

const journalDraft = reactive({
  content: '',
});

const sourceOptions = computed(() =>
  store.availableLogSources(dateKey.value, showUsedSources.value).map((source) => ({
    label: `${source.timeLabel} · ${source.title}${source.isUsed ? ` · ${t('dayLog.sourceUsed')}` : ''}`,
    value: source.id,
  })),
);

const kindOptions = computed(() => [
  { label: t('dayLog.cards.task'), value: 'task' },
  { label: t('dayLog.cards.event'), value: 'event' },
]);

watch(
  record,
  (value) => {
    journalDraft.content = value.journalEntry.content;
  },
  { immediate: true },
);

function resetEntryForm() {
  editingEntryId.value = null;
  selectedSourceId.value = null;
  showUsedSources.value = false;
  entryForm.time = '09:00';
  entryForm.title = '';
  entryForm.notes = '';
  entryForm.isHighlight = false;
  entryForm.sourceType = 'task';
  entryForm.sourceId = undefined;
}

function openCreateEntry() {
  resetEntryForm();
  entryModalOpen.value = true;
}

function openEditEntry(entry: LogEntry) {
  editingEntryId.value = entry.id;
  entryForm.time = entry.time;
  entryForm.title = entry.title;
  entryForm.notes = entry.notes ?? '';
  entryForm.isHighlight = entry.isHighlight;
  entryForm.sourceType = entry.sourceType;
  entryForm.sourceId = entry.sourceId;
  selectedSourceId.value = entry.sourceType && entry.sourceId ? `${entry.sourceType}:${entry.sourceId}` : null;
  showUsedSources.value = true;
  entryModalOpen.value = true;
}

function handleSourceChange(value: string | null) {
  selectedSourceId.value = value;
  if (!value) {
    entryForm.sourceId = undefined;
    return;
  }

  const source = allSources.value.find((item) => item.id === value);
  if (!source) return;

  entryForm.sourceId = source.sourceId;
  entryForm.sourceType = source.sourceType;
  entryForm.time = source.time;
  entryForm.title = source.title;
  entryForm.notes = source.notes ?? '';
}

function submitEntry() {
  const title = entryForm.title.trim();
  if (!title || !entryForm.sourceType) return;

  const payload = {
    date: dateKey.value,
    time: entryForm.time,
    title,
    notes: entryForm.notes.trim(),
    isHighlight: entryForm.isHighlight,
    sourceType: entryForm.sourceType,
    sourceId: entryForm.sourceId,
  };

  if (editingEntryId.value) {
    store.updateLogEntry(editingEntryId.value, payload);
  } else {
    store.addLogEntry(payload);
  }

  entryModalOpen.value = false;
  resetEntryForm();
}

function saveJournal() {
  store.updateJournalEntry(dateKey.value, {
    title: '',
    content: journalDraft.content,
  });
  journalEditing.value = false;
}

function cancelJournalEdit() {
  journalDraft.content = record.value.journalEntry.content;
  journalEditing.value = false;
}
</script>

<style scoped>
.page-stack,
.content-grid,
.main-column,
.side-column,
.entry-list,
.entry-card,
.editor-stack,
.source-list,
.source-card,
.summary-grid {
  display: grid;
}

.page-stack {
  gap: 24px;
}

.content-grid {
  grid-template-columns: minmax(0, 1.2fr) minmax(340px, 0.9fr);
  gap: 18px;
  align-items: start;
}

.main-column,
.side-column,
.entry-list,
.editor-stack,
.source-list {
  gap: 16px;
}

.entry-card {
  gap: 10px;
  padding: 14px 16px;
  border: 1px solid rgba(255, 255, 255, 0.46);
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.56), rgba(255, 255, 255, 0.18)),
    rgba(246, 249, 252, 0.24);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.7),
    0 10px 30px rgba(103, 122, 148, 0.08);
  backdrop-filter: blur(20px) saturate(150%);
  cursor: pointer;
}

.entry-card.is-task {
  border-color: rgba(116, 165, 255, 0.28);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.58), rgba(232, 241, 255, 0.22)),
    rgba(236, 244, 255, 0.26);
}

.entry-card.is-event {
  border-color: rgba(108, 195, 163, 0.28);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.58), rgba(232, 248, 242, 0.22)),
    rgba(234, 247, 242, 0.26);
}

.entry-card.is-highlight {
  border-color: rgba(243, 186, 74, 0.38);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.72),
    0 12px 32px rgba(243, 186, 74, 0.1);
  background:
    linear-gradient(180deg, rgba(255, 252, 245, 0.68), rgba(255, 241, 214, 0.2)),
    rgba(255, 246, 229, 0.28);
}

.entry-card__topline,
.entry-card__primary,
.entry-card__actions,
.editor-actions,
.modal-footer,
.source-card__topline,
.source-tags,
.meta-stack,
.switch-row,
.form-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.entry-card__topline,
.source-card__topline,
.entry-card__primary {
  justify-content: space-between;
}

.source-tags,
.meta-stack {
  flex-wrap: wrap;
}

.entry-time,
.source-time {
  color: var(--muted-text-color);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

h3,
.entry-notes,
.source-title,
.source-notes,
.summary-heading {
  margin: 0;
}

h3,
.source-title {
  line-height: 1.5;
}

h3 {
  min-width: 0;
  font-size: 16px;
  font-weight: 650;
}

.journal-preview-surface {
  min-height: 520px;
  padding: 8px 4px;
  cursor: text;
}

.entry-notes,
.source-notes {
  color: var(--muted-text-color);
  line-height: 1.6;
}

.delete-action {
  color: #d84d63;
}

.source-card {
  gap: 8px;
  padding: 14px 16px;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.16);
}

.source-card.is-used {
  opacity: 0.78;
}

.summary-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.summary-heading {
  color: var(--muted-text-color);
  font-size: 13px;
  font-weight: 600;
}

ul {
  margin: 8px 0 0;
  padding-left: 18px;
}

.switch-row {
  justify-content: space-between;
}

.switch-row__label {
  color: var(--body-text-color);
  font-size: 14px;
  font-weight: 600;
}

.form-row {
  align-items: flex-start;
}

.form-row :deep(.n-form-item) {
  flex: 1;
}

.native-time-input {
  width: 100%;
  min-height: 40px;
  padding: 0 12px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.26);
  color: var(--body-text-color);
  font: inherit;
}

:deep(.n-input),
:deep(.n-base-selection) {
  --n-color: rgba(255, 255, 255, 0.3) !important;
  --n-color-active: rgba(255, 255, 255, 0.4) !important;
  --n-color-focus: rgba(255, 255, 255, 0.42) !important;
  --n-border: 1px solid rgba(255, 255, 255, 0.4) !important;
  --n-border-hover: 1px solid rgba(255, 255, 255, 0.52) !important;
  --n-border-focus: 1px solid rgba(140, 205, 255, 0.52) !important;
  --n-box-shadow-focus: 0 0 0 3px rgba(137, 196, 255, 0.12) !important;
  --n-text-color: var(--body-text-color) !important;
}

@media (max-width: 980px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .summary-grid,
  .form-row {
    grid-template-columns: 1fr;
  }

  .form-row {
    display: grid;
  }
}
</style>
