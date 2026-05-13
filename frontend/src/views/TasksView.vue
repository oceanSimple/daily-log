<template>
  <div class="page-stack">
    <PageHeader :eyebrow="t('tasks.eyebrow')" description="">
      <template #meta>
        <div class="meta-stack">
          <span class="meta-stack__label">{{ dayLabel }}</span>
        </div>
      </template>
    </PageHeader>

    <section class="planner-grid">
      <SectionCard :title="t('tasks.eventTitle')">
        <template #header>
          <n-tooltip trigger="hover">
            <template #trigger>
              <n-button circle size="small" type="primary" ghost @click="openCreateEvent">
                <template #icon>
                  <n-icon><PlusIcon /></n-icon>
                </template>
              </n-button>
            </template>
            {{ t('tasks.createEvent') }}
          </n-tooltip>
        </template>

        <div v-if="sortedEvents.length" class="card-grid">
          <article
            v-for="event in sortedEvents"
            :key="event.id"
            class="planner-card"
            :class="{ 'is-complete': event.completed }"
            role="button"
            tabindex="0"
            @click="openEditEvent(event)"
          >
            <div class="planner-item__main">
              <div class="planner-card__topline">
                <div class="planner-item__eyebrow">
                  <span class="planner-dot is-schedule" />
                  <span>{{ formatTimeRange(event.startAt, event.endAt, dateLocale) }}</span>
                </div>
                <div class="planner-card__actions">
                  <span v-if="event.isFocus" class="focus-chip">{{ t('tasks.labels.focus') }}</span>
                  <n-popconfirm @positive-click="store.deleteEvent(event.id)">
                    <template #trigger>
                      <n-tooltip trigger="hover">
                        <template #trigger>
                          <n-button circle quaternary type="error" class="delete-action" @click.stop>
                            <template #icon>
                              <n-icon><DeleteIcon /></n-icon>
                            </template>
                          </n-button>
                        </template>
                        {{ t('tasks.deleteEvent') }}
                      </n-tooltip>
                    </template>
                    {{ t('tasks.confirmDeleteEvent') }}
                  </n-popconfirm>
                </div>
              </div>
              <h3>{{ event.title }}</h3>
              <p v-if="event.notes" class="planner-item__notes">{{ event.notes }}</p>
            </div>
            <div class="planner-card__footer">
              <n-tooltip trigger="hover">
                <template #trigger>
                  <button class="complete-toggle" type="button" @click.stop="store.toggleEventCompleted(event.id)">
                    <span class="complete-toggle__icon" :class="{ 'is-complete': event.completed }">
                      <n-icon v-if="event.completed" size="14"><CheckIcon /></n-icon>
                    </span>
                    <span class="complete-toggle__label">
                      {{ event.completed ? t('tasks.completed') : t('tasks.incomplete') }}
                    </span>
                  </button>
                </template>
                {{ event.completed ? t('tasks.markIncomplete') : t('tasks.markComplete') }}
              </n-tooltip>
            </div>
          </article>
        </div>
        <n-empty v-else :description="t('tasks.noEvents')" />
      </SectionCard>

      <SectionCard :title="t('tasks.taskTitle')">
        <template #header>
          <n-tooltip trigger="hover">
            <template #trigger>
              <n-button circle size="small" type="primary" ghost @click="openCreateTask">
                <template #icon>
                  <n-icon><PlusIcon /></n-icon>
                </template>
              </n-button>
            </template>
            {{ t('tasks.createTask') }}
          </n-tooltip>
        </template>

        <div v-if="sortedTasks.length" class="card-grid">
          <article
            v-for="task in sortedTasks"
            :key="task.id"
            class="planner-card"
            :class="{ 'is-complete': task.status === 'done' }"
            role="button"
            tabindex="0"
            @click="openEditTask(task)"
          >
            <div class="planner-item__main">
              <div class="planner-card__topline">
                <div class="planner-item__eyebrow">
                  <span class="planner-dot" :class="`is-${task.status}`" />
                  <span>{{ taskTimeLabel(task) }}</span>
                </div>
                <div class="planner-card__actions">
                  <span v-if="task.isFocus" class="focus-chip">{{ t('tasks.labels.focus') }}</span>
                  <n-popconfirm @positive-click="store.deleteTask(task.id)">
                    <template #trigger>
                      <n-tooltip trigger="hover">
                        <template #trigger>
                          <n-button circle quaternary type="error" class="delete-action" @click.stop>
                            <template #icon>
                              <n-icon><DeleteIcon /></n-icon>
                            </template>
                          </n-button>
                        </template>
                        {{ t('tasks.deleteTask') }}
                      </n-tooltip>
                    </template>
                    {{ t('tasks.confirmDeleteTask') }}
                  </n-popconfirm>
                </div>
              </div>
              <h3>{{ task.title }}</h3>
              <p v-if="task.notes" class="planner-item__notes">{{ task.notes }}</p>
            </div>
            <div class="planner-card__footer">
              <n-tooltip trigger="hover">
                <template #trigger>
                  <button class="complete-toggle" type="button" @click.stop="store.toggleTaskCompleted(task.id)">
                    <span class="complete-toggle__icon" :class="{ 'is-complete': task.status === 'done' }">
                      <n-icon v-if="task.status === 'done'" size="14"><CheckIcon /></n-icon>
                    </span>
                    <span class="complete-toggle__label">
                      {{ task.status === 'done' ? t('tasks.completed') : t('tasks.incomplete') }}
                    </span>
                  </button>
                </template>
                {{ task.status === 'done' ? t('tasks.markIncomplete') : t('tasks.markComplete') }}
              </n-tooltip>
            </div>
          </article>
        </div>
        <n-empty v-else :description="t('tasks.noTasks')" size="small" />
      </SectionCard>
    </section>

    <n-modal
      v-model:show="eventModalOpen"
      preset="card"
      :title="t('tasks.eventModalTitle')"
      class="editor-modal"
      style="width: min(440px, calc(100vw - 32px))"
    >
      <n-form label-placement="top" class="modal-form">
        <div class="modal-group">
          <n-form-item :label="t('tasks.labels.title')">
            <n-input v-model:value="eventForm.title" :placeholder="t('tasks.placeholders.event')" />
          </n-form-item>
          <div class="form-row">
            <n-form-item :label="t('tasks.labels.startTime')">
              <input v-model="eventForm.startTime" class="native-time-input" type="time" />
            </n-form-item>
            <n-form-item :label="t('tasks.labels.endTime')">
              <input v-model="eventForm.endTime" class="native-time-input" type="time" />
            </n-form-item>
          </div>
        </div>

        <div class="modal-group">
          <n-form-item :label="t('tasks.labels.notes')">
            <n-input v-model:value="eventForm.notes" type="textarea" :autosize="{ minRows: 4, maxRows: 6 }" />
          </n-form-item>
          <div class="switch-row">
            <span class="switch-row__label">{{ t('tasks.labels.done') }}</span>
            <n-switch v-model:value="eventForm.completed" />
          </div>
          <div class="switch-row">
            <span class="switch-row__label">{{ t('tasks.labels.focus') }}</span>
            <n-switch v-model:value="eventForm.isFocus" />
          </div>
        </div>
      </n-form>
      <template #footer>
        <div class="modal-footer">
          <n-button @click="eventModalOpen = false">{{ t('tasks.cancel') }}</n-button>
          <n-button type="primary" @click="submitEvent">{{ eventEditingId ? t('tasks.saveChanges') : t('tasks.addEventAction') }}</n-button>
        </div>
      </template>
    </n-modal>

    <n-modal
      v-model:show="taskModalOpen"
      preset="card"
      :title="t('tasks.taskModalTitle')"
      class="editor-modal"
      style="width: min(440px, calc(100vw - 32px))"
    >
      <n-form label-placement="top" class="modal-form">
        <div class="modal-group">
          <n-form-item :label="t('tasks.labels.title')">
            <n-input v-model:value="taskForm.title" :placeholder="t('tasks.placeholders.task')" />
          </n-form-item>
          <div class="form-row">
            <n-form-item :label="t('tasks.labels.dueTime')">
              <input
                v-model="taskForm.dueTime"
                class="native-time-input"
                type="time"
              />
            </n-form-item>
          </div>
        </div>

        <div class="modal-group">
          <n-form-item :label="t('tasks.labels.notes')">
            <n-input v-model:value="taskForm.notes" type="textarea" :autosize="{ minRows: 4, maxRows: 6 }" />
          </n-form-item>
          <div class="switch-row">
            <span class="switch-row__label">{{ t('tasks.labels.focus') }}</span>
            <n-switch v-model:value="taskForm.isFocus" />
          </div>
        </div>
      </n-form>
      <template #footer>
        <div class="modal-footer">
          <n-button @click="taskModalOpen = false">{{ t('tasks.cancel') }}</n-button>
          <n-button type="primary" @click="submitTask">{{ taskEditingId ? t('tasks.saveChanges') : t('tasks.addTaskAction') }}</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import {
  NButton,
  NEmpty,
  NForm,
  NFormItem,
  NIcon,
  NInput,
  NModal,
  NPopconfirm,
  NSwitch,
  NTooltip,
} from 'naive-ui';

import { useAppLocale } from '@/composables/useAppLocale';
import PageHeader from '@/components/PageHeader.vue';
import SectionCard from '@/components/SectionCard.vue';
import { CheckIcon, DeleteIcon, PlusIcon } from '@/components/task-icons';
import { useDailyHubStore } from '@/store/dailyHub';
import type { Event, Task } from '@/types/daily-hub';
import { formatDateLabel, formatTimeLabel, formatTimeRange } from '@/utils/date';

const route = useRoute();
const store = useDailyHubStore();
const { dateLocale, t } = useAppLocale();
const activeDate = computed(() => (route.params.date as string) || store.todayRecord.date);
const activeRecord = computed(() => store.recordMap[activeDate.value] ?? store.ensureRecord(activeDate.value));
const dayLabel = computed(() => formatDateLabel(activeRecord.value.date, dateLocale.value));

function compareDoneLast(
  leftDone: boolean,
  rightDone: boolean,
  leftTime: string,
  rightTime: string,
) {
  if (leftDone !== rightDone) {
    return leftDone ? 1 : -1;
  }

  return leftTime.localeCompare(rightTime);
}

const sortedEvents = computed(() =>
  [...activeRecord.value.events].sort((a, b) =>
    compareDoneLast(a.completed, b.completed, a.startAt, b.startAt),
  ),
);

const sortedTasks = computed(() =>
  [...activeRecord.value.tasks].sort((a, b) =>
    compareDoneLast(taskDone(a), taskDone(b), a.dueAt, b.dueAt),
  ),
);
const eventModalOpen = ref(false);
const taskModalOpen = ref(false);
const eventEditingId = ref<string | null>(null);
const taskEditingId = ref<string | null>(null);

const eventForm = reactive({
  title: '',
  startTime: '09:00',
  endTime: '10:00',
  completed: false,
  isFocus: false,
  notes: '',
});

const taskForm = reactive({
  title: '',
  dueTime: '23:59',
  isFocus: false,
  notes: '',
});

function isTodoTask(task: Task) {
  return task.dueAt.endsWith('23:59:00');
}

function taskDone(task: Task) {
  return task.status === 'done';
}

function taskTimeLabel(task: Task) {
  return isTodoTask(task) ? '23:59' : formatTimeLabel(task.dueAt, dateLocale.value);
}

function resetEventForm() {
  eventForm.title = '';
  eventForm.startTime = '09:00';
  eventForm.endTime = '10:00';
  eventForm.completed = false;
  eventForm.isFocus = false;
  eventForm.notes = '';
}

function resetTaskForm() {
  taskForm.title = '';
  taskForm.dueTime = '23:59';
  taskForm.isFocus = false;
  taskForm.notes = '';
}

watch(
  () => eventForm.startTime,
  (startTime) => {
    if (eventForm.endTime < startTime) {
      eventForm.endTime = startTime;
    }
  },
);

function openCreateEvent() {
  eventEditingId.value = null;
  resetEventForm();
  eventModalOpen.value = true;
}

function openEditEvent(event: Event) {
  eventEditingId.value = event.id;
  eventForm.title = event.title;
  eventForm.startTime = event.startAt.slice(11, 16);
  eventForm.endTime = event.endAt.slice(11, 16);
  eventForm.completed = event.completed;
  eventForm.isFocus = Boolean(event.isFocus);
  eventForm.notes = event.notes ?? '';
  eventModalOpen.value = true;
}

function submitEvent() {
  if (!eventForm.title.trim()) return;
  if (eventForm.endTime < eventForm.startTime) {
    eventForm.endTime = eventForm.startTime;
  }

  const date = activeRecord.value.date;
  const payload = {
    title: eventForm.title.trim(),
    startAt: `${date}T${eventForm.startTime}:00`,
    endAt: `${date}T${eventForm.endTime}:00`,
    date,
    completed: eventForm.completed,
    isFocus: eventForm.isFocus,
    notes: eventForm.notes.trim() || undefined,
  };

  if (eventEditingId.value) {
    store.updateEvent(eventEditingId.value, payload);
  } else {
    store.addEvent(payload);
  }

  eventModalOpen.value = false;
  resetEventForm();
}

function openCreateTask() {
  taskEditingId.value = null;
  resetTaskForm();
  taskModalOpen.value = true;
}

function openEditTask(task: Task) {
  taskEditingId.value = task.id;
  taskForm.title = task.title;
  taskForm.dueTime = isTodoTask(task) ? '23:59' : task.dueAt.slice(11, 16);
  taskForm.isFocus = Boolean(task.isFocus);
  taskForm.notes = task.notes ?? '';
  taskModalOpen.value = true;
}

function submitTask() {
  if (!taskForm.title.trim()) return;
  const date = activeRecord.value.date;
  const payload = {
    title: taskForm.title.trim(),
    priority: 'medium' as const,
    status: 'todo' as const,
    dueAt: `${date}T${taskForm.dueTime}:00`,
    date,
    isFocus: taskForm.isFocus,
    notes: taskForm.notes.trim() || undefined,
  };

  if (taskEditingId.value) {
    store.updateTask(taskEditingId.value, payload);
  } else {
    store.addTask(payload);
  }

  taskModalOpen.value = false;
  resetTaskForm();
}
</script>

<style scoped>
.page-stack,
.planner-grid,
.card-grid {
  display: grid;
}

.page-stack {
  gap: 26px;
}

.planner-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  align-items: start;
}

.meta-stack {
  display: flex;
  gap: 10px;
  align-items: center;
}

.meta-stack__label {
  color: var(--muted-text-color);
  font-size: 13px;
  font-weight: 600;
}

.planner-item__eyebrow,
.planner-item__eyebrow,
.planner-item__notes {
  color: var(--muted-text-color);
}

.card-grid {
  gap: 16px;
}
.planner-item__main h3 {
  margin: 0;
  font-size: 18px;
  line-height: 1.38;
  font-weight: 700;
}

.planner-card {
  display: grid;
  gap: 16px;
  padding: 20px 20px 18px;
  border: 1px solid rgba(255, 255, 255, 0.78);
  border-radius: 24px;
  background:
    var(--glass-panel-warm),
    rgba(255, 255, 255, 0.38);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    0 18px 38px rgba(116, 99, 83, 0.08);
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
}

.planner-card.is-complete {
  background:
    linear-gradient(180deg, rgba(250, 249, 247, 0.92), rgba(244, 241, 237, 0.58)),
    rgba(243, 239, 234, 0.54);
}

.planner-card:hover {
  transform: translateY(-1px);
  border-color: rgba(255, 255, 255, 0.92);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.94),
    0 24px 44px rgba(116, 99, 83, 0.12);
}

.planner-card__topline,
.planner-card__footer {
  display: flex;
  gap: 12px;
  justify-content: space-between;
  align-items: center;
}

.planner-card__actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.planner-card__topline {
  align-items: flex-start;
}

.planner-item__main {
  min-width: 0;
}

.planner-item__eyebrow {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 10px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.planner-item__notes {
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 1.6;
}

.planner-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #a4b2c5;
}

.planner-dot.is-schedule {
  background: #4b8ef0;
}

.planner-dot.is-todo {
  background: #8a7bff;
}

.planner-dot.is-in_progress {
  background: #d97342;
}

.planner-dot.is-done {
  background: #25a56a;
}

.focus-chip {
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(243, 167, 27, 0.16);
  color: #996100;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.status-chip {
  padding: 6px 10px;
  border: 1px solid rgba(219, 209, 199, 0.54);
  border-radius: 999px;
  color: var(--muted-text-color);
  font-size: 12px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.58);
}

.status-chip.is-complete {
  color: #66707c;
  background: rgba(240, 239, 237, 0.88);
}

.complete-toggle {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--body-text-color);
  cursor: pointer;
}

.complete-toggle__icon {
  display: inline-flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  border: 1.5px solid rgba(72, 83, 96, 0.78);
  border-radius: 999px;
  color: transparent;
  background: rgba(255, 255, 255, 0.7);
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease;
}

.complete-toggle__icon.is-complete {
  border-color: #8faa99;
  background: #8faa99;
  color: #ffffff;
}

.complete-toggle__label {
  color: var(--muted-text-color);
  font-size: 13px;
  font-weight: 600;
}

.delete-action {
  opacity: 0.44;
  transition: opacity 0.18s ease;
}

.planner-card:hover .delete-action,
.delete-action:focus-within {
  opacity: 1;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.form-row--compact {
  align-items: end;
}

.modal-form {
  display: grid;
  gap: 16px;
}

.modal-group {
  display: grid;
  gap: 10px;
  padding: 16px 16px 14px;
  border: 1px solid rgba(255, 255, 255, 0.76);
  border-radius: 22px;
  background:
    var(--glass-panel),
    rgba(255, 255, 255, 0.34);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.88),
    0 12px 24px rgba(116, 99, 83, 0.05);
}

.switch-row,
.switch-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.switch-field {
  min-height: 48px;
  padding: 0 12px;
  border: 1px solid rgba(255, 255, 255, 0.76);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.42);
}

.switch-row__label {
  color: var(--body-text-color);
  font-size: 13px;
  font-weight: 600;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 6px;
}

.native-time-input {
  width: 100%;
  min-height: 40px;
  padding: 0 12px;
  border: 1px solid rgba(215, 204, 193, 0.58);
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(248, 245, 241, 0.56)),
    rgba(248, 245, 241, 0.46);
  color: var(--body-text-color);
  outline: none;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.92),
    0 2px 8px rgba(116, 99, 83, 0.06);
}

.native-time-input:focus {
  border-color: rgba(108, 150, 231, 0.64);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.92),
    0 0 0 3px rgba(110, 150, 225, 0.12);
}

.native-time-input:disabled {
  opacity: 0.68;
  cursor: not-allowed;
}

:deep(.editor-modal) {
  max-width: calc(100vw - 32px);
}

:deep(.editor-modal .n-card) {
  border: 1px solid rgba(255, 255, 255, 0.82);
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(248, 245, 241, 0.72)),
    rgba(248, 244, 239, 0.56);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.94),
    0 32px 80px rgba(116, 99, 83, 0.18);
  backdrop-filter: blur(30px) saturate(138%);
}

:deep(.editor-modal .n-card-header) {
  padding: 20px 20px 8px;
}

:deep(.editor-modal .n-card__content) {
  padding: 8px 20px 4px;
}

:deep(.editor-modal .n-card__footer) {
  padding: 6px 20px 18px;
}

:deep(.editor-modal .n-card-header__main) {
  font-size: 18px;
  font-weight: 700;
}

:deep(.modal-form .n-form-item) {
  margin-bottom: 0;
}

:deep(.modal-form .n-form-item-label) {
  padding-bottom: 8px;
  color: var(--muted-text-color);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

:deep(.editor-modal .n-input),
:deep(.editor-modal .n-base-selection) {
  --n-border-radius: 14px !important;
  --n-color: rgba(255, 255, 255, 0.28) !important;
  --n-color-active: rgba(255, 255, 255, 0.34) !important;
  --n-color-focus: rgba(255, 255, 255, 0.38) !important;
  --n-border: 1px solid rgba(255, 255, 255, 0.34) !important;
  --n-border-hover: 1px solid rgba(255, 255, 255, 0.48) !important;
  --n-border-focus: 1px solid rgba(140, 205, 255, 0.52) !important;
  --n-box-shadow-focus: 0 0 0 3px rgba(137, 196, 255, 0.14) !important;
}

:deep(.editor-modal .n-base-selection-label),
:deep(.editor-modal .n-input__input-el),
:deep(.editor-modal .n-input__textarea-el) {
  font-size: 14px;
}

@media (max-width: 980px) {
  .planner-grid,
  .form-row {
    grid-template-columns: 1fr;
  }

  .planner-card__topline,
  .planner-card__footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
