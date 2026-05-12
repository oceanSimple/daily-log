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
              :class="[`is-${entry.sourceType}`, { 'is-highlight': entry.isHighlight }]"
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
      style="width: min(720px, calc(100vw - 32px))"
    >
      <n-form label-placement="top" class="modal-form">
        <div class="inline-field">
          <label class="inline-field__label">{{ t('dayLog.labels.title') }}</label>
          <div class="inline-field__control">
            <n-input v-model:value="entryForm.title" />
          </div>
        </div>

        <div class="form-row form-row--compact">
          <n-form-item class="form-item--time" :label="t('dayLog.labels.time')">
            <input v-model="entryForm.time" class="native-time-input" type="time" />
          </n-form-item>

          <n-form-item class="form-item--kind" :label="t('dayLog.labels.kind')">
            <n-select
              v-model:value="entryForm.sourceType"
              :options="kindOptions"
              :disabled="Boolean(selectedSourceId)"
            />
          </n-form-item>
        </div>

        <n-form-item :label="t('dayLog.labels.source')">
          <n-select
            v-model:value="selectedSourceId"
            :options="sourceOptions"
            clearable
            :render-label="renderSourceOption"
            @update:value="handleSourceChange"
          />
        </n-form-item>

        <n-form-item :label="t('dayLog.labels.notes')">
          <n-input
            v-model:value="entryForm.notes"
            type="textarea"
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
import { computed, h, reactive, ref, watch } from 'vue';
import type { SelectRenderLabel } from 'naive-ui';
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
import type { LogEntry, LogEntrySourceType, LogSourceOption } from '@/types/daily-hub';
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
  allSources.value.map((source) => ({
    label: `${source.timeLabel} · ${source.title}`,
    value: source.id,
    raw: source,
  })),
);

const kindOptions = computed(() => [
  { label: t('dayLog.cards.task'), value: 'task' },
  { label: t('dayLog.cards.event'), value: 'event' },
]);

const renderSourceOption: SelectRenderLabel = (option) => {
  const source = option.raw as LogSourceOption | undefined;
  if (!source) return option.label as string;

  return h(
    'div',
    {
      class: ['source-option', source.isUsed ? 'is-used' : ''],
    },
    [
      h('span', { class: 'source-option__time' }, source.timeLabel),
      h('span', { class: 'source-option__title' }, source.title),
    ],
  );
};

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
.editor-stack {
  display: grid;
}

.page-stack {
  gap: 26px;
}

.content-grid {
  grid-template-columns: minmax(0, 1.2fr) minmax(340px, 0.9fr);
  gap: 20px;
  align-items: start;
}

.main-column,
.side-column,
.entry-list,
.editor-stack {
  gap: 16px;
}

.entry-card {
  gap: 10px;
  padding: 16px 18px;
  border: 1px solid rgba(255, 255, 255, 0.76);
  border-radius: 20px;
  background:
    var(--glass-panel),
    rgba(255, 255, 255, 0.36);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.88),
    0 16px 30px rgba(116, 99, 83, 0.08);
  backdrop-filter: blur(22px) saturate(135%);
  cursor: pointer;
}

.entry-card.is-task {
  border-color: rgba(116, 165, 255, 0.28);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(235, 244, 255, 0.54)),
    rgba(236, 244, 255, 0.38);
}

.entry-card.is-event {
  border-color: rgba(108, 195, 163, 0.28);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(234, 248, 242, 0.54)),
    rgba(234, 247, 242, 0.38);
}

.entry-card.is-highlight {
  border-color: rgba(243, 186, 74, 0.38);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    0 18px 34px rgba(208, 160, 79, 0.12);
  background:
    linear-gradient(180deg, rgba(255, 252, 245, 0.88), rgba(255, 241, 214, 0.34)),
    rgba(255, 246, 229, 0.38);
}

.entry-card__topline,
.entry-card__primary,
.entry-card__actions,
.editor-actions,
.modal-footer,
.meta-stack,
.switch-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.entry-card__topline,
.entry-card__primary {
  justify-content: space-between;
}

.meta-stack {
  flex-wrap: wrap;
}

.entry-time {
  color: var(--muted-text-color);
  font-size: 12px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
}

h3,
.entry-notes {
  margin: 0;
}

h3 {
  min-width: 0;
  font-size: 16px;
  font-weight: 650;
  line-height: 1.5;
}

.journal-preview-surface {
  min-height: 520px;
  padding: 10px 8px;
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.34), rgba(255, 255, 255, 0.12));
  cursor: text;
}

.entry-notes {
  color: var(--muted-text-color);
  line-height: 1.6;
}

.delete-action {
  color: #d84d63;
}

.switch-row {
  justify-content: space-between;
}

.switch-row__label {
  color: var(--body-text-color);
  font-size: 14px;
  font-weight: 600;
}

.modal-form {
  display: grid;
  gap: 18px;
}

.inline-field {
  display: grid;
  grid-template-columns: 84px minmax(0, 1fr);
  gap: 14px;
  align-items: center;
}

.inline-field__label {
  color: var(--body-text-color);
  font-size: 15px;
  font-weight: 600;
}

.inline-field__control {
  min-width: 0;
}

.form-row {
  display: grid;
  gap: 16px;
}

.form-row {
  align-items: flex-start;
}

.form-row--compact {
  grid-template-columns: 156px minmax(0, 1fr);
}

.form-item--time,
.form-item--kind {
  min-width: 0;
}

.native-time-input {
  width: 100%;
  min-height: 42px;
  padding: 0 14px;
  border: 1px solid rgba(215, 204, 193, 0.58);
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(248, 245, 241, 0.56)),
    rgba(248, 245, 241, 0.46);
  color: var(--body-text-color);
  font: inherit;
  font-variant-numeric: tabular-nums;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.92),
    0 2px 8px rgba(116, 99, 83, 0.06);
}

:deep(.n-form-item) {
  margin-bottom: 0;
}

:deep(.editor-modal .n-card) {
  border: 1px solid rgba(255, 255, 255, 0.82) !important;
  border-radius: 28px !important;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(248, 245, 241, 0.72)),
    rgba(248, 244, 239, 0.56) !important;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.96),
    0 30px 70px rgba(116, 99, 83, 0.18) !important;
  backdrop-filter: blur(30px) saturate(138%);
}

:deep(.editor-modal .n-card-header) {
  padding: 24px 28px 10px !important;
}

:deep(.editor-modal .n-card__content) {
  padding: 12px 28px 20px !important;
}

:deep(.editor-modal .n-card__footer) {
  padding: 8px 28px 24px !important;
}

:deep(.n-input),
:deep(.n-base-selection) {
  --n-color: rgba(246, 249, 253, 0.76) !important;
  --n-color-active: rgba(250, 252, 255, 0.86) !important;
  --n-color-focus: rgba(250, 252, 255, 0.9) !important;
  --n-border: 1px solid rgba(145, 163, 190, 0.38) !important;
  --n-border-hover: 1px solid rgba(125, 148, 182, 0.5) !important;
  --n-border-focus: 1px solid rgba(118, 170, 255, 0.58) !important;
  --n-box-shadow-focus: 0 0 0 3px rgba(129, 181, 255, 0.14) !important;
  --n-text-color: var(--body-text-color) !important;
  --n-border-radius: 14px !important;
}

:deep(.n-base-selection-placeholder),
:deep(.n-input__placeholder) {
  color: transparent !important;
}

:deep(.source-option) {
  display: grid;
  grid-template-columns: 84px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
}

:deep(.source-option.is-used) {
  opacity: 0.52;
}

:deep(.source-option__time) {
  color: var(--muted-text-color);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

:deep(.source-option__title) {
  min-width: 0;
}

@media (max-width: 980px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .inline-field,
  .form-row--compact {
    grid-template-columns: 1fr;
  }

  .inline-field {
    gap: 8px;
  }
}
</style>
