<template>
  <div class="page-stack">
    <PageHeader eyebrow="Tasks" title="今天的执行台" description="">
      <template #meta>
        <div class="meta-stack">
          <span class="meta-stack__label">{{ dayLabel }}</span>
        </div>
      </template>
    </PageHeader>

    <section class="planner-grid">
      <SectionCard title="日程">
        <template #header>
          <n-tooltip trigger="hover">
            <template #trigger>
              <n-button circle size="small" type="primary" ghost @click="openCreateEvent">
                <template #icon>
                  <n-icon><PlusIcon /></n-icon>
                </template>
              </n-button>
            </template>
            新增日程
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
                  <span>{{ formatTimeRange(event.startAt, event.endAt) }}</span>
                </div>
                <span class="status-chip" :class="{ 'is-complete': event.completed }">
                  {{ event.completed ? '已完成' : '未完成' }}
                </span>
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
                      {{ event.completed ? '已完成' : '未完成' }}
                    </span>
                  </button>
                </template>
                {{ event.completed ? '标记为未完成' : '标记为已完成' }}
              </n-tooltip>
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
                    删除日程
                  </n-tooltip>
                </template>
                删除这条日程？
              </n-popconfirm>
            </div>
          </article>
        </div>
        <n-empty v-else description="暂无日程" />
      </SectionCard>

      <SectionCard title="任务">
        <template #header>
          <n-tooltip trigger="hover">
            <template #trigger>
              <n-button circle size="small" type="primary" ghost @click="openCreateTask">
                <template #icon>
                  <n-icon><PlusIcon /></n-icon>
                </template>
              </n-button>
            </template>
            新增任务
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
                  <span>{{ task.priority }} · {{ taskTimeLabel(task) }}</span>
                </div>
                <span class="status-chip" :class="{ 'is-complete': task.status === 'done' }">
                  {{ taskStatusLabel(task.status) }}
                </span>
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
                      {{ task.status === 'done' ? '已完成' : '未完成' }}
                    </span>
                  </button>
                </template>
                {{ task.status === 'done' ? '标记为未完成' : '标记为已完成' }}
              </n-tooltip>
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
                    删除任务
                  </n-tooltip>
                </template>
                删除这项任务？
              </n-popconfirm>
            </div>
          </article>
        </div>
        <n-empty v-else description="暂无任务" size="small" />
      </SectionCard>
    </section>

    <n-modal
      v-model:show="eventModalOpen"
      preset="card"
      title="日程"
      class="editor-modal"
      style="width: min(440px, calc(100vw - 32px))"
    >
      <n-form label-placement="top" class="modal-form">
        <div class="modal-group">
          <n-form-item label="标题">
            <n-input v-model:value="eventForm.title" placeholder="例如：产品评审 / 晚间运动" />
          </n-form-item>
          <div class="form-row">
            <n-form-item label="开始时间">
              <input v-model="eventForm.startTime" class="native-time-input" type="time" />
            </n-form-item>
            <n-form-item label="结束时间">
              <input v-model="eventForm.endTime" class="native-time-input" type="time" />
            </n-form-item>
          </div>
        </div>

        <div class="modal-group">
          <n-form-item label="备注">
            <n-input v-model:value="eventForm.notes" type="textarea" :autosize="{ minRows: 4, maxRows: 6 }" />
          </n-form-item>
          <div class="switch-row">
            <span class="switch-row__label">完成</span>
            <n-switch v-model:value="eventForm.completed" />
          </div>
        </div>
      </n-form>
      <template #footer>
        <div class="modal-footer">
          <n-button @click="eventModalOpen = false">取消</n-button>
          <n-button type="primary" @click="submitEvent">{{ eventEditingId ? '保存修改' : '新增日程' }}</n-button>
        </div>
      </template>
    </n-modal>

    <n-modal
      v-model:show="taskModalOpen"
      preset="card"
      title="任务"
      class="editor-modal"
      style="width: min(440px, calc(100vw - 32px))"
    >
      <n-form label-placement="top" class="modal-form">
        <div class="modal-group">
          <n-form-item label="标题">
            <n-input v-model:value="taskForm.title" placeholder="例如：完成日报 / 处理账单" />
          </n-form-item>
          <div class="form-row">
            <n-form-item label="优先级">
              <n-select v-model:value="taskForm.priority" :options="priorityOptions" />
            </n-form-item>
            <n-form-item label="状态">
              <n-select v-model:value="taskForm.status" :options="statusOptions" />
            </n-form-item>
          </div>
          <div class="form-row form-row--compact">
            <n-form-item label="截止时间">
              <input
                v-model="taskForm.dueTime"
                class="native-time-input"
                type="time"
              />
            </n-form-item>
            <div class="switch-field">
              <span class="switch-row__label">当天事项</span>
              <n-switch v-model:value="taskForm.isAnytime" />
            </div>
          </div>
        </div>

        <div class="modal-group">
          <n-form-item label="备注">
            <n-input v-model:value="taskForm.notes" type="textarea" :autosize="{ minRows: 4, maxRows: 6 }" />
          </n-form-item>
        </div>
      </n-form>
      <template #footer>
        <div class="modal-footer">
          <n-button @click="taskModalOpen = false">取消</n-button>
          <n-button type="primary" @click="submitTask">{{ taskEditingId ? '保存修改' : '新增任务' }}</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
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
  NTooltip,
} from 'naive-ui';

import PageHeader from '@/components/PageHeader.vue';
import SectionCard from '@/components/SectionCard.vue';
import { CheckIcon, DeleteIcon, PlusIcon } from '@/components/task-icons';
import { useDailyHubStore } from '@/store/dailyHub';
import type { Event, Task, TaskPriority, TaskStatus } from '@/types/daily-hub';
import { formatDateLabel, formatTimeLabel, formatTimeRange } from '@/utils/date';

const store = useDailyHubStore();
const todayRecord = computed(() => store.todayRecord);
const dayLabel = computed(() => formatDateLabel(todayRecord.value.date));

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
  [...todayRecord.value.events].sort((a, b) =>
    compareDoneLast(a.completed, b.completed, a.startAt, b.startAt),
  ),
);

const sortedTasks = computed(() =>
  [...todayRecord.value.tasks].sort((a, b) =>
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
  notes: '',
});

const taskForm = reactive<{
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueTime: string;
  isAnytime: boolean;
  notes: string;
}>({
  title: '',
  priority: 'medium',
  status: 'todo',
  dueTime: '18:00',
  isAnytime: false,
  notes: '',
});
const priorityOptions = [
  { label: '高', value: 'high' },
  { label: '中', value: 'medium' },
  { label: '低', value: 'low' },
];
const statusOptions = [
  { label: '待开始', value: 'todo' },
  { label: '进行中', value: 'in_progress' },
  { label: '已完成', value: 'done' },
];

function isTodoTask(task: Task) {
  return task.dueAt.endsWith('23:59:00');
}

function taskDone(task: Task) {
  return task.status === 'done';
}

function taskTimeLabel(task: Task) {
  return isTodoTask(task) ? '23:59' : formatTimeLabel(task.dueAt);
}

function taskStatusLabel(status: TaskStatus) {
  if (status === 'done') return '已完成';
  if (status === 'in_progress') return '进行中';
  return '未完成';
}

function resetEventForm() {
  eventForm.title = '';
  eventForm.startTime = '09:00';
  eventForm.endTime = '10:00';
  eventForm.completed = false;
  eventForm.notes = '';
}

function resetTaskForm() {
  taskForm.title = '';
  taskForm.priority = 'medium';
  taskForm.status = 'todo';
  taskForm.dueTime = '18:00';
  taskForm.isAnytime = false;
  taskForm.notes = '';
}

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
  eventForm.notes = event.notes ?? '';
  eventModalOpen.value = true;
}

function submitEvent() {
  if (!eventForm.title.trim()) return;
  const date = todayRecord.value.date;
  const payload = {
    title: eventForm.title.trim(),
    startAt: `${date}T${eventForm.startTime}:00`,
    endAt: `${date}T${eventForm.endTime}:00`,
    date,
    completed: eventForm.completed,
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
  taskForm.priority = task.priority;
  taskForm.status = task.status;
  taskForm.dueTime = isTodoTask(task) ? '23:59' : task.dueAt.slice(11, 16);
  taskForm.isAnytime = isTodoTask(task);
  taskForm.notes = task.notes ?? '';
  taskModalOpen.value = true;
}

function submitTask() {
  if (!taskForm.title.trim()) return;
  const date = todayRecord.value.date;
  const dueTime = taskForm.isAnytime ? '23:59' : taskForm.dueTime;
  const payload = {
    title: taskForm.title.trim(),
    priority: taskForm.priority,
    status: taskForm.status,
    dueAt: `${date}T${dueTime}:00`,
    date,
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
  gap: 24px;
}

.planner-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
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
  gap: 14px;
}
.planner-item__main h3 {
  margin: 0;
  font-size: 18px;
  line-height: 1.35;
}

.planner-card {
  display: grid;
  gap: 16px;
  padding: 18px 18px 16px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 22px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.46), rgba(255, 255, 255, 0.16)),
    rgba(244, 248, 252, 0.24);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.52),
    0 18px 34px rgba(85, 112, 145, 0.08);
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
}

.planner-card.is-complete {
  background:
    linear-gradient(180deg, rgba(245, 247, 250, 0.64), rgba(255, 255, 255, 0.18)),
    rgba(236, 239, 244, 0.52);
}

.planner-card:hover {
  transform: translateY(-1px);
  border-color: rgba(255, 255, 255, 0.56);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.6),
    0 22px 40px rgba(85, 112, 145, 0.12);
}

.planner-card__topline,
.planner-card__footer {
  display: flex;
  gap: 12px;
  justify-content: space-between;
  align-items: center;
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

.status-chip {
  padding: 5px 10px;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 999px;
  color: var(--muted-text-color);
  font-size: 12px;
  font-weight: 700;
}

.status-chip.is-complete {
  color: #66707c;
  background: rgba(228, 232, 238, 0.88);
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
  border: 2px solid #3f4954;
  border-radius: 999px;
  color: transparent;
  background: transparent;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease;
}

.complete-toggle__icon.is-complete {
  border-color: #9aa3ad;
  background: #9aa3ad;
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
  padding: 14px 14px 12px;
  border: 1px solid rgba(255, 255, 255, 0.26);
  border-radius: 20px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.46), rgba(255, 255, 255, 0.18)),
    rgba(244, 248, 252, 0.24);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.56);
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
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.2);
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
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 12px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.16)),
    rgba(244, 248, 252, 0.28);
  color: var(--body-text-color);
  outline: none;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.58);
}

.native-time-input:focus {
  border-color: rgba(140, 205, 255, 0.58);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.58),
    0 0 0 3px rgba(137, 196, 255, 0.14);
}

.native-time-input:disabled {
  opacity: 0.68;
  cursor: not-allowed;
}

:deep(.editor-modal) {
  max-width: calc(100vw - 32px);
}

:deep(.editor-modal .n-card) {
  border: 1px solid rgba(255, 255, 255, 0.42);
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.76), rgba(255, 255, 255, 0.28)),
    rgba(238, 244, 251, 0.74);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.68),
    0 32px 80px rgba(75, 99, 128, 0.24);
  backdrop-filter: blur(30px) saturate(165%);
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
