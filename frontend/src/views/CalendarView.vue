<template>
  <div class="page-stack page-stack--calendar">
    <PageHeader
      :eyebrow="t('calendar.eyebrow')"
      :title="viewMode === 'month' ? monthLabel : t('calendar.title')"
      :description="viewMode === 'month' ? t('calendar.monthDescription') : t('calendar.description')"
    >
      <template #meta>
        <div class="header-meta">
          <button
            type="button"
            class="view-toggle"
            :class="{ 'is-active': viewMode === 'month' }"
            @click="viewMode = 'month'"
          >
            {{ t('calendar.views.month') }}
          </button>
          <button
            type="button"
            class="view-toggle"
            :class="{ 'is-active': viewMode === 'week' }"
            @click="viewMode = 'week'"
          >
            {{ t('calendar.views.week') }}
          </button>
        </div>
      </template>
    </PageHeader>

    <SectionCard v-if="viewMode === 'month'">
      <div class="month-shell">
        <div class="month-weekdays">
          <span
            v-for="weekday in weekdayLabels"
            :key="weekday.day"
            class="month-weekdays__label"
            :class="{ 'month-weekdays__label--rest': weekday.isRestDay }"
          >
            {{ weekday.label }}
          </span>
        </div>

        <div class="month-grid">
          <RouterLink
            v-for="day in monthGrid"
            :key="day.date"
            class="month-day"
            :class="{
              'month-day--muted': !day.isCurrentMonth,
              'month-day--today': day.isToday,
              'month-day--rest': day.isRestDay,
              'month-day--makeup-workday': day.isMakeupWorkday,
            }"
            :to="`/tasks/${day.date}`"
          >
            <div class="month-day__top">
              <div class="month-day__headline">
                <span class="month-day__number">{{ day.dayNumber }}</span>
                <span
                  v-if="day.holidayMeta"
                  class="month-day__holiday"
                  :class="{ 'month-day__holiday--makeup': day.holidayMeta.isMakeupWorkday }"
                >
                  {{ day.holidayMeta.label }}
                </span>
              </div>
              <div class="month-day__badges">
                <span v-if="day.isToday" class="month-day__today-pill">{{ t('calendar.today') }}</span>
                <span
                  v-if="day.isMakeupWorkday"
                  class="month-day__type-pill"
                  :class="{ 'month-day__type-pill--makeup': day.isMakeupWorkday }"
                >
                  班
                </span>
              </div>
            </div>

            <div class="month-day__slots">
              <template v-for="slot in day.slots" :key="slot.key">
                <div v-if="slot.isPlaceholder" class="slot-card slot-card--placeholder"></div>
                <n-tooltip
                  v-else
                  trigger="hover"
                  placement="top"
                  :theme-overrides="tooltipThemeOverrides"
                >
                  <template #trigger>
                    <div class="slot-card" :class="slotClassName(slot)">
                      <span class="slot-card__title">{{ slot.title }}</span>
                    </div>
                  </template>
                  <div class="slot-tooltip">
                    <div class="slot-tooltip__header">
                      <span class="slot-tooltip__state" :class="`slot-tooltip__state--${slot.state}`">
                        {{ tooltipStateLabel(slot) }}
                      </span>
                      <p class="slot-tooltip__title">{{ slot.title }}</p>
                    </div>
                    <div class="slot-tooltip__section">
                      <span class="slot-tooltip__time-pill">{{ slot.tooltipTimeLabel }}</span>
                    </div>
                    <div v-if="slot.notes" class="slot-tooltip__section">
                      <p class="slot-tooltip__notes">{{ t('calendar.tooltip.notesPrefix') }}{{ slot.notes }}</p>
                    </div>
                  </div>
                </n-tooltip>
              </template>
            </div>
          </RouterLink>
        </div>
      </div>
    </SectionCard>

    <SectionCard v-else>
      <div class="calendar-toolbar">
        <div class="toolbar-copy">
          <p class="toolbar-copy__label">{{ t('calendar.controls.daySpan') }}</p>
          <p class="toolbar-copy__value">{{ daySpan }} {{ t('calendar.controls.days') }}</p>
        </div>

        <div class="toolbar-actions">
          <div class="stepper" aria-label="day span control">
            <n-button circle secondary :disabled="daySpan <= MIN_DAY_SPAN" @click="daySpan -= 1">
              <template #icon>
                <n-icon><MinusIcon /></n-icon>
              </template>
            </n-button>
            <span class="stepper__value">{{ daySpan }}</span>
            <n-button circle secondary :disabled="daySpan >= MAX_DAY_SPAN" @click="daySpan += 1">
              <template #icon>
                <n-icon><PlusIcon /></n-icon>
              </template>
            </n-button>
          </div>

          <button type="button" class="focus-toggle" :class="{ 'is-active': focusPanelOpen }" @click="focusPanelOpen = !focusPanelOpen">
            <n-icon size="14"><FocusIcon /></n-icon>
            <span>{{ focusPanelOpen ? t('calendar.controls.hideFocus') : t('calendar.controls.showFocus') }}</span>
            <span class="focus-toggle__count">{{ focusItems.length }}</span>
          </button>
        </div>
      </div>

      <div class="week-layout" :class="{ 'week-layout--focus-open': focusPanelOpen }">
        <div class="week-main">
          <div class="calendar-board" :style="weekBoardStyle">
            <section class="board-column board-column--history">
              <header class="board-column__header">
                <div>
                  <p class="board-column__eyebrow">{{ t('calendar.columns.history') }}</p>
                  <h2>{{ t('calendar.columns.history') }}</h2>
                </div>
                <p class="board-column__hint">{{ historyItems.length }} {{ t('calendar.controls.countSuffix') }}</p>
              </header>

              <div class="board-column__body">
                <button
                  v-for="item in historyItems"
                  :key="item.id"
                  class="board-card board-card--history"
                  :class="cardClassName(item)"
                  type="button"
                  @click="openItem(item)"
                >
                  <div class="board-card__topline">
                    <span class="board-card__kind">{{ itemKindLabel(item.kind) }}</span>
                    <span v-if="item.isFocus" class="board-card__focus-chip">
                      <n-icon size="12"><FocusIcon /></n-icon>
                      {{ t('calendar.card.focus') }}
                    </span>
                  </div>
                  <h3>{{ item.title }}</h3>
                  <div class="board-card__meta">
                    <p class="board-card__date">{{ itemDateLabel(item.date) }}</p>
                    <p class="board-card__time">{{ item.timeLabel }}</p>
                  </div>
                  <div class="board-card__status">
                    <span v-if="item.isOverdue">{{ t('calendar.legend.overdue') }}</span>
                    <span v-else-if="item.isCompleted">{{ t('calendar.legend.completed') }}</span>
                    <span v-else>{{ t('calendar.card.open') }}</span>
                  </div>
                </button>

                <n-empty v-if="!historyItems.length" size="small" :description="t('calendar.empty.history')" />
              </div>
            </section>

            <section
              v-for="column in windowColumns"
              :key="column.date"
              class="board-column board-column--day"
              :class="{ 'board-column--today': column.date === store.todayKey }"
            >
              <header class="board-column__header">
                <div>
                  <p class="board-column__eyebrow">
                    {{ column.date === store.todayKey ? t('calendar.columns.today') : columnWeekdayLabel(column.date) }}
                  </p>
                  <h2>{{ itemDateLabel(column.date) }}</h2>
                </div>
                <p class="board-column__hint">{{ column.items.length }} {{ t('calendar.controls.countSuffix') }}</p>
              </header>

              <div class="board-column__body">
                <button
                  v-for="item in column.items"
                  :key="item.id"
                  class="board-card"
                  :class="cardClassName(item)"
                  type="button"
                  @click="openItem(item)"
                >
                  <div class="board-card__topline">
                    <span class="board-card__kind">{{ itemKindLabel(item.kind) }}</span>
                    <span v-if="item.isFocus" class="board-card__focus-chip">
                      <n-icon size="12"><FocusIcon /></n-icon>
                      {{ t('calendar.card.focus') }}
                    </span>
                  </div>
                  <h3>{{ item.title }}</h3>
                  <div class="board-card__meta">
                    <p class="board-card__time">{{ item.timeLabel }}</p>
                  </div>
                  <div class="board-card__status">
                    <span v-if="item.isOverdue">{{ t('calendar.legend.overdue') }}</span>
                    <span v-else-if="item.isCompleted">{{ t('calendar.legend.completed') }}</span>
                    <span v-else>{{ t('calendar.card.open') }}</span>
                  </div>
                </button>

                <n-empty v-if="!column.items.length" size="small" :description="t('calendar.empty.day')" />
              </div>
            </section>
          </div>
        </div>

        <aside v-if="focusPanelOpen" class="focus-sidebar">
          <header class="focus-sidebar__header">
            <div>
              <p class="board-column__eyebrow">{{ t('calendar.columns.focus') }}</p>
              <h2>{{ t('calendar.columns.focus') }}</h2>
            </div>
            <p class="board-column__hint">{{ focusItems.length }} {{ t('calendar.controls.countSuffix') }}</p>
          </header>

          <div class="focus-sidebar__body">
            <button
              v-for="item in focusItems"
              :key="item.id"
              class="board-card board-card--focus-side"
              :class="cardClassName(item)"
              type="button"
              @click="openItem(item)"
            >
              <div class="board-card__topline">
                <span class="board-card__kind">{{ itemKindLabel(item.kind) }}</span>
                <span class="board-card__focus-chip">
                  <n-icon size="12"><FocusIcon /></n-icon>
                  {{ t('calendar.card.focus') }}
                </span>
              </div>
              <h3>{{ item.title }}</h3>
              <div class="board-card__meta">
                <p class="board-card__date">{{ itemDateLabel(item.date) }}</p>
                <p class="board-card__time">{{ item.timeLabel }}</p>
              </div>
              <div class="board-card__status">
                <span v-if="item.isOverdue">{{ t('calendar.legend.overdue') }}</span>
                <span v-else-if="item.isCompleted">{{ t('calendar.legend.completed') }}</span>
                <span v-else>{{ t('calendar.card.open') }}</span>
              </div>
            </button>

            <n-empty v-if="!focusItems.length" size="small" :description="t('calendar.empty.focus')" />
          </div>
        </aside>
      </div>
    </SectionCard>

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
          <n-button type="primary" @click="submitEvent">{{ t('tasks.saveChanges') }}</n-button>
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
            <n-form-item :label="t('tasks.labels.priority')">
              <n-select v-model:value="taskForm.priority" :options="priorityOptions" />
            </n-form-item>
            <n-form-item :label="t('tasks.labels.status')">
              <n-select v-model:value="taskForm.status" :options="statusOptions" />
            </n-form-item>
          </div>
          <div class="form-row form-row--compact">
            <n-form-item :label="t('tasks.labels.dueTime')">
              <input v-model="taskForm.dueTime" class="native-time-input" type="time" />
            </n-form-item>
            <div class="switch-field">
              <span class="switch-row__label">{{ t('tasks.labels.anytime') }}</span>
              <n-switch v-model:value="taskForm.isAnytime" />
            </div>
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
          <n-button type="primary" @click="submitTask">{{ t('tasks.saveChanges') }}</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import {
  NButton,
  NEmpty,
  NForm,
  NFormItem,
  NIcon,
  NInput,
  NModal,
  NSelect,
  NSwitch,
  NTooltip,
} from 'naive-ui';

import { FocusIcon, MinusIcon, PlusIcon } from '@/components/task-icons';
import PageHeader from '@/components/PageHeader.vue';
import SectionCard from '@/components/SectionCard.vue';
import { useAppLocale } from '@/composables/useAppLocale';
import { usePreferencesStore } from '@/store/preferences';
import { useDailyHubStore } from '@/store/dailyHub';
import type { CalendarBoardItem, Event, Task, TaskPriority, TaskStatus } from '@/types/daily-hub';
import { formatTimeLabel, formatTimeRange, toDateKey } from '@/utils/date';

const MIN_DAY_SPAN = 2;
const MAX_DAY_SPAN = 7;
const MAX_SLOTS = 3;
const tooltipThemeOverrides = {
  color: 'rgba(255, 255, 255, 0.96)',
  textColor: '#17212b',
  borderRadius: '18px',
  boxShadow: '0 18px 48px rgba(84, 105, 137, 0.16)',
  padding: '0',
};

type ViewMode = 'month' | 'week';
type SlotState = 'event' | 'task' | 'overdue' | 'completed';

interface CalendarSlot {
  key: string;
  kind?: 'event' | 'task';
  state?: SlotState;
  title?: string;
  tooltipTimeLabel?: string;
  notes?: string;
  sortAt?: string;
  isPlaceholder: boolean;
}

interface HolidayApiEntry {
  date: string;
  name: string;
  isOffDay: boolean;
}

interface HolidayDisplayMeta {
  label: string;
  shortLabel?: string;
  isOffDay: boolean;
  isMakeupWorkday: boolean;
}

type HolidayLookup = Record<string, HolidayApiEntry>;

const holidayYearCache = new Map<number, Promise<HolidayLookup>>();

const store = useDailyHubStore();
const preferences = usePreferencesStore();
const { dateLocale, t } = useAppLocale();

const weekdayLabels = computed(() =>
  Array.from({ length: 7 }, (_, index) => {
    const day = (preferences.weekStartDay + index) % 7;
    return {
      day,
      label: t(`settings.weekDays.${day}`),
      isRestDay: day === 0 || day === 6,
    };
  }),
);

const viewMode = ref<ViewMode>('month');
const daySpan = ref(3);
const focusPanelOpen = ref(false);
const holidayLookup = ref<HolidayLookup>({});
const nowMs = ref(Date.now());
let nowTimer: number | undefined;

onMounted(() => {
  nowTimer = window.setInterval(() => {
    nowMs.value = Date.now();
  }, 60_000);
});

onBeforeUnmount(() => {
  if (nowTimer !== undefined) window.clearInterval(nowTimer);
});

const nowDate = computed(() => new Date(nowMs.value));
const currentDateKey = computed(() => store.todayKey);
const currentMonthDate = computed(() => new Date(`${currentDateKey.value}T00:00:00`));
const currentDateTimeKey = computed(() => {
  const current = nowDate.value;
  const hours = String(current.getHours()).padStart(2, '0');
  const minutes = String(current.getMinutes()).padStart(2, '0');
  const seconds = String(current.getSeconds()).padStart(2, '0');
  return `${currentDateKey.value}T${hours}:${minutes}:${seconds}`;
});

const monthLabel = computed(() =>
  new Intl.DateTimeFormat(dateLocale.value, {
    year: 'numeric',
    month: 'long',
  }).format(currentMonthDate.value),
);

const monthGridYears = computed(() => {
  const monthStart = new Date(currentMonthDate.value);
  monthStart.setDate(1);
  const startOffset = (monthStart.getDay() - preferences.weekStartDay + 7) % 7;
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - startOffset);
  const gridEnd = new Date(gridStart);
  gridEnd.setDate(gridStart.getDate() + 41);

  return Array.from(new Set([gridStart.getFullYear(), currentMonthDate.value.getFullYear(), gridEnd.getFullYear()]));
});

watch(
  monthGridYears,
  async (years) => {
    const results = await Promise.all(years.map((year) => loadHolidayYear(year)));
    holidayLookup.value = Object.assign({}, ...results);
  },
  { immediate: true },
);

const historyItems = computed(() => store.pastOpenItems(dateLocale.value, currentDateTimeKey.value));
const windowColumns = computed(() => store.windowedCalendarItems(daySpan.value, dateLocale.value, currentDateTimeKey.value));
const focusItems = computed(() => store.futureFocusItems(dateLocale.value, currentDateTimeKey.value));
const weekBoardStyle = computed(() => ({
  gridTemplateColumns: `minmax(240px, 1.08fr) repeat(${daySpan.value}, minmax(220px, 1fr))`,
}));

const eventModalOpen = ref(false);
const taskModalOpen = ref(false);
const eventEditingId = ref<string | null>(null);
const taskEditingId = ref<string | null>(null);

const eventForm = reactive({
  title: '',
  date: '',
  startTime: '09:00',
  endTime: '10:00',
  completed: false,
  isFocus: false,
  notes: '',
});

const taskForm = reactive<{
  title: string;
  date: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueTime: string;
  isAnytime: boolean;
  isFocus: boolean;
  notes: string;
}>({
  title: '',
  date: '',
  priority: 'medium',
  status: 'todo',
  dueTime: '18:00',
  isAnytime: false,
  isFocus: false,
  notes: '',
});

const priorityOptions = computed(() => [
  { label: t('tasks.priorities.high'), value: 'high' },
  { label: t('tasks.priorities.medium'), value: 'medium' },
  { label: t('tasks.priorities.low'), value: 'low' },
]);

const statusOptions = computed(() => [
  { label: t('tasks.statuses.todo'), value: 'todo' },
  { label: t('tasks.statuses.in_progress'), value: 'in_progress' },
  { label: t('tasks.statuses.done'), value: 'done' },
]);

function buildEventSlot(event: Event, state: SlotState): CalendarSlot {
  return {
    key: `event-${event.id}`,
    kind: 'event',
    state,
    title: event.title,
    tooltipTimeLabel: formatTimeRange(event.startAt, event.endAt, dateLocale.value),
    notes: event.notes,
    sortAt: event.startAt,
    isPlaceholder: false,
  };
}

function buildTaskSlot(task: Task, state: SlotState): CalendarSlot {
  return {
    key: `task-${task.id}`,
    kind: 'task',
    state,
    title: task.title,
    tooltipTimeLabel: dateLocale.value === 'zh-CN'
      ? `截止 ${formatTimeLabel(task.dueAt, dateLocale.value)}`
      : `Due ${formatTimeLabel(task.dueAt, dateLocale.value)}`,
    notes: task.notes,
    sortAt: task.dueAt,
    isPlaceholder: false,
  };
}

function compareSlotsByTime(left: CalendarSlot, right: CalendarSlot) {
  return (left.sortAt ?? '').localeCompare(right.sortAt ?? '');
}

function padSlots(slots: CalendarSlot[]) {
  return Array.from({ length: MAX_SLOTS }, (_, index) =>
    slots[index] ?? {
      key: `placeholder-${index}`,
      isPlaceholder: true,
    },
  );
}

function buildDaySlots(date: string, record?: { events: Event[]; tasks: Task[] }) {
  if (!record) return padSlots([]);

  const isPastDay = date < currentDateKey.value;
  const isToday = date === currentDateKey.value;
  const nowIso = currentDateTimeKey.value;

  if (!isPastDay) {
    const upcoming = [
      ...record.events
        .filter((event) => !event.completed)
        .map((event) => buildEventSlot(event, isToday && event.endAt < nowIso ? 'overdue' : 'event')),
      ...record.tasks
        .filter((task) => task.status !== 'done')
        .map((task) => buildTaskSlot(task, isToday && task.dueAt < nowIso ? 'overdue' : 'task')),
    ].sort(compareSlotsByTime);

    return padSlots(upcoming.slice(0, MAX_SLOTS));
  }

  const overdueEvents = record.events
    .filter((event) => !event.completed)
    .map((event) => buildEventSlot(event, 'overdue'))
    .sort(compareSlotsByTime);
  const overdueTasks = record.tasks
    .filter((task) => task.status !== 'done')
    .map((task) => buildTaskSlot(task, 'overdue'))
    .sort(compareSlotsByTime);
  const completedEvents = record.events
    .filter((event) => event.completed)
    .map((event) => buildEventSlot(event, 'completed'))
    .sort(compareSlotsByTime);
  const completedTasks = record.tasks
    .filter((task) => task.status === 'done')
    .map((task) => buildTaskSlot(task, 'completed'))
    .sort(compareSlotsByTime);

  return padSlots([...overdueEvents, ...overdueTasks, ...completedEvents, ...completedTasks].slice(0, MAX_SLOTS));
}

function slotClassName(slot: CalendarSlot) {
  return `slot-card--${slot.state}`;
}

function tooltipStateLabel(slot: CalendarSlot) {
  if (slot.state === 'overdue') return t('calendar.tooltip.overdue');
  if (slot.state === 'completed') return t('calendar.tooltip.completed');
  if (slot.kind === 'event') return t('calendar.tooltip.event');
  return t('calendar.tooltip.task');
}

async function loadHolidayYear(year: number) {
  if (!holidayYearCache.has(year)) {
    holidayYearCache.set(
      year,
      fetch(`https://api.jiejiariapi.com/v1/holidays/${year}`)
        .then(async (response) => {
          if (!response.ok) throw new Error(`holiday api ${response.status}`);
          const payload = (await response.json()) as HolidayApiEntry[];
          return Object.fromEntries(payload.map((item) => [item.date, item]));
        })
        .catch(() => ({})),
    );
  }

  return holidayYearCache.get(year)!;
}

const monthGrid = computed(() => {
  const monthStart = new Date(currentMonthDate.value);
  monthStart.setDate(1);

  const startOffset = (monthStart.getDay() - preferences.weekStartDay + 7) % 7;
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const current = new Date(gridStart);
    current.setDate(gridStart.getDate() + index);

    const date = toDateKey(current);
    const record = store.recordMap[date];

    return {
      date,
      dayNumber: current.getDate(),
      holidayMeta: holidayMeta(date),
      isRestDay: isRestDay(date, current),
      isMakeupWorkday: isMakeupWorkday(date),
      isCurrentMonth: current.getMonth() === currentMonthDate.value.getMonth(),
      isToday: date === currentDateKey.value,
      slots: buildDaySlots(date, record),
    };
  });
});

function nthWeekdayOfMonth(year: number, monthIndex: number, weekday: number, nth: number) {
  const firstDay = new Date(year, monthIndex, 1);
  const offset = (weekday - firstDay.getDay() + 7) % 7;
  return 1 + offset + (nth - 1) * 7;
}

function holidayLabel(date: string) {
  const [yearText, monthText, dayText] = date.split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const key = `${monthText}-${dayText}`;

  const fixed: Record<string, string> = {
    '01-01': t('calendar.holidays.newYear'),
    '02-14': t('calendar.holidays.valentine'),
    '03-08': t('calendar.holidays.women'),
    '05-01': t('calendar.holidays.labor'),
    '06-01': t('calendar.holidays.children'),
    '10-01': t('calendar.holidays.national'),
    '12-25': t('calendar.holidays.christmas'),
  };

  if (fixed[key]) return fixed[key];

  if (month === 5 && day === nthWeekdayOfMonth(year, 4, 0, 2)) {
    return t('calendar.holidays.mothersDay');
  }

  if (month === 6 && day === nthWeekdayOfMonth(year, 5, 0, 3)) {
    return t('calendar.holidays.fathersDay');
  }

  if (month === 11 && day === nthWeekdayOfMonth(year, 10, 4, 4)) {
    return t('calendar.holidays.thanksgiving');
  }

  return '';
}

function holidayMeta(date: string) {
  const apiHoliday = holidayLookup.value[date];
  if (apiHoliday) {
    return {
      label: apiHoliday.isOffDay ? apiHoliday.name : `${apiHoliday.name}调休`,
      isOffDay: apiHoliday.isOffDay,
      isMakeupWorkday: !apiHoliday.isOffDay,
    };
  }

  const fallback = holidayLabel(date);
  if (!fallback) return null;

  return {
    label: fallback,
    isOffDay: true,
    isMakeupWorkday: false,
  };
}

function isMakeupWorkday(date: string) {
  return Boolean(holidayLookup.value[date] && !holidayLookup.value[date].isOffDay);
}

function isRestDay(date: string, current: Date) {
  const apiHoliday = holidayLookup.value[date];
  if (apiHoliday) return apiHoliday.isOffDay;
  return current.getDay() === 0 || current.getDay() === 6;
}

function itemKindLabel(kind: CalendarBoardItem['kind']) {
  return t(`calendar.card.${kind}`);
}

function itemDateLabel(date: string) {
  return new Intl.DateTimeFormat(dateLocale.value, {
    month: 'numeric',
    day: 'numeric',
  }).format(new Date(`${date}T00:00:00`));
}

function columnWeekdayLabel(date: string) {
  return new Intl.DateTimeFormat(dateLocale.value, {
    weekday: 'long',
  }).format(new Date(`${date}T00:00:00`));
}

function cardClassName(item: CalendarBoardItem) {
  return {
    'is-event': item.kind === 'event',
    'is-task': item.kind === 'task',
    'is-completed': item.isCompleted,
    'is-overdue': item.isOverdue,
  };
}

function resetEventForm() {
  eventForm.title = '';
  eventForm.date = '';
  eventForm.startTime = '09:00';
  eventForm.endTime = '10:00';
  eventForm.completed = false;
  eventForm.isFocus = false;
  eventForm.notes = '';
}

function resetTaskForm() {
  taskForm.title = '';
  taskForm.date = '';
  taskForm.priority = 'medium';
  taskForm.status = 'todo';
  taskForm.dueTime = '18:00';
  taskForm.isAnytime = false;
  taskForm.isFocus = false;
  taskForm.notes = '';
}

function isTodoTask(task: Task) {
  return task.dueAt.endsWith('23:59:00');
}

function openItem(item: CalendarBoardItem) {
  if (item.kind === 'event') {
    const event = store.records.flatMap((record) => record.events).find((entry) => entry.id === item.sourceId);
    if (!event) return;
    openEditEvent(event);
    return;
  }

  const task = store.records.flatMap((record) => record.tasks).find((entry) => entry.id === item.sourceId);
  if (!task) return;
  openEditTask(task);
}

function openEditEvent(event: Event) {
  eventEditingId.value = event.id;
  eventForm.title = event.title;
  eventForm.date = event.date;
  eventForm.startTime = event.startAt.slice(11, 16);
  eventForm.endTime = event.endAt.slice(11, 16);
  eventForm.completed = event.completed;
  eventForm.isFocus = Boolean(event.isFocus);
  eventForm.notes = event.notes ?? '';
  eventModalOpen.value = true;
}

function openEditTask(task: Task) {
  taskEditingId.value = task.id;
  taskForm.title = task.title;
  taskForm.date = task.date;
  taskForm.priority = task.priority;
  taskForm.status = task.status;
  taskForm.dueTime = isTodoTask(task) ? '23:59' : task.dueAt.slice(11, 16);
  taskForm.isAnytime = isTodoTask(task);
  taskForm.isFocus = Boolean(task.isFocus);
  taskForm.notes = task.notes ?? '';
  taskModalOpen.value = true;
}

function submitEvent() {
  if (!eventEditingId.value || !eventForm.title.trim() || !eventForm.date) return;

  store.updateEvent(eventEditingId.value, {
    title: eventForm.title.trim(),
    startAt: `${eventForm.date}T${eventForm.startTime}:00`,
    endAt: `${eventForm.date}T${eventForm.endTime}:00`,
    date: eventForm.date,
    completed: eventForm.completed,
    isFocus: eventForm.isFocus,
    notes: eventForm.notes.trim() || undefined,
  });

  eventModalOpen.value = false;
  resetEventForm();
}

function submitTask() {
  if (!taskEditingId.value || !taskForm.title.trim() || !taskForm.date) return;
  const dueTime = taskForm.isAnytime ? '23:59' : taskForm.dueTime;

  store.updateTask(taskEditingId.value, {
    title: taskForm.title.trim(),
    priority: taskForm.priority,
    status: taskForm.status,
    dueAt: `${taskForm.date}T${dueTime}:00`,
    date: taskForm.date,
    isFocus: taskForm.isFocus,
    notes: taskForm.notes.trim() || undefined,
  });

  taskModalOpen.value = false;
  resetTaskForm();
}
</script>

<style scoped>
.page-stack,
.header-meta,
.calendar-toolbar,
.toolbar-copy,
.board-column,
.board-column__body,
.board-card,
.modal-form,
.month-shell,
.month-grid,
.month-day__slots {
  display: grid;
}

.page-stack {
  gap: 24px;
}

.page-stack--calendar {
  gap: 16px;
}

.page-stack--calendar :deep(.page-header h1) {
  max-width: none;
  font-size: 28px;
}

.header-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.view-toggle {
  min-width: 72px;
  height: 34px;
  padding: 0 14px;
  border: 1px solid rgba(255, 255, 255, 0.48);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.4);
  color: var(--muted-text-color);
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.view-toggle.is-active {
  background: rgba(255, 255, 255, 0.82);
  color: var(--body-text-color);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.month-shell {
  gap: 14px;
}

.month-weekdays,
.month-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 12px;
}

.month-weekdays__label {
  padding: 0 6px;
  color: var(--muted-text-color);
  font-size: 12px;
  font-weight: 700;
}

.month-weekdays__label--rest {
  color: #b06b3c;
}

.month-day {
  min-height: 148px;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 12px;
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.84), rgba(255, 255, 255, 0.42)),
    rgba(248, 250, 253, 0.52);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.68),
    0 14px 28px rgba(84, 105, 137, 0.08);
}

.month-day--muted {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.48), rgba(255, 255, 255, 0.2)),
    rgba(240, 244, 249, 0.26);
  color: rgba(23, 33, 43, 0.58);
}

.month-day--today {
  border-color: rgba(59, 130, 246, 0.34);
}

.month-day--rest {
  border-color: rgba(230, 174, 124, 0.24);
}

.month-day--makeup-workday {
  border-color: rgba(112, 154, 224, 0.24);
}

.month-day__top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.month-day__badges {
  display: grid;
  justify-items: end;
  gap: 6px;
}

.month-day__headline {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.month-day__number {
  font-size: 18px;
  font-weight: 700;
}

.month-day--rest .month-day__number {
  color: #9d632f;
}

.month-day--makeup-workday .month-day__number {
  color: #4f73b7;
}

.month-day__holiday {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #c66a2c;
  font-size: 11px;
  font-weight: 700;
}

.month-day__holiday--makeup {
  color: #4c78c9;
}

.month-day__today-pill {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  background: rgba(79, 124, 255, 0.12);
  color: #4f7cff;
  font-size: 11px;
  font-weight: 700;
}

.month-day__type-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 7px;
  border-radius: 999px;
  background: rgba(211, 119, 44, 0.12);
  color: #bf6a28;
  font-size: 11px;
  font-weight: 800;
}

.month-day__type-pill--makeup {
  background: rgba(76, 120, 201, 0.12);
  color: #4c78c9;
}

.month-day__slots {
  align-content: start;
  gap: 8px;
  min-width: 0;
  overflow: hidden;
}

.slot-card {
  min-height: 24px;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  padding: 5px 8px;
  border-radius: 10px;
  border: 1px solid transparent;
}

.slot-card--placeholder {
  border: 1px dashed rgba(151, 166, 186, 0.22);
  background: rgba(255, 255, 255, 0.16);
}

.slot-card--event {
  background: rgba(79, 124, 255, 0.12);
  border-color: rgba(79, 124, 255, 0.18);
  color: #2d4a85;
}

.slot-card--task {
  background: rgba(18, 160, 127, 0.12);
  border-color: rgba(18, 160, 127, 0.18);
  color: #166958;
}

.slot-card--overdue {
  background: rgba(216, 75, 95, 0.12);
  border-color: rgba(216, 75, 95, 0.18);
  color: #8c3141;
}

.slot-card--completed {
  background: rgba(147, 161, 178, 0.14);
  border-color: rgba(147, 161, 178, 0.2);
  color: #62707f;
}

.slot-card__title {
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  font-weight: 600;
}

.slot-tooltip,
.slot-tooltip__header,
.slot-tooltip__section {
  display: grid;
  gap: 8px;
}

.slot-tooltip {
  width: min(220px, calc(100vw - 48px));
  padding: 12px;
  gap: 10px;
}

.slot-tooltip__title,
.slot-tooltip__notes {
  margin: 0;
}

.slot-tooltip__title {
  color: var(--body-text-color);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.4;
  word-break: break-word;
}

.slot-tooltip__notes {
  color: var(--muted-text-color);
  font-size: 12px;
  line-height: 1.55;
}

.slot-tooltip__state,
.slot-tooltip__time-pill {
  display: inline-flex;
  width: fit-content;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.slot-tooltip__state--event {
  background: rgba(79, 124, 255, 0.12);
  color: #2d4a85;
}

.slot-tooltip__state--task {
  background: rgba(18, 160, 127, 0.12);
  color: #166958;
}

.slot-tooltip__state--overdue {
  background: rgba(216, 75, 95, 0.12);
  color: #8c3141;
}

.slot-tooltip__state--completed {
  background: rgba(147, 161, 178, 0.14);
  color: #62707f;
}

.slot-tooltip__time-pill {
  background: rgba(23, 33, 43, 0.06);
  color: var(--body-text-color);
}

.calendar-toolbar {
  grid-template-columns: repeat(2, minmax(0, auto));
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-copy {
  gap: 4px;
}

.toolbar-copy__label,
.toolbar-copy__value,
.board-column__eyebrow,
.board-column__hint,
.board-card__kind,
.board-card__date,
.board-card__time,
.board-card__status,
.switch-row__label {
  margin: 0;
}

.toolbar-copy__label,
.board-column__eyebrow,
.board-card__kind {
  color: var(--muted-text-color);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.toolbar-copy__value {
  font-size: 18px;
  font-weight: 700;
}

.stepper {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.stepper__value {
  min-width: 24px;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
}

.calendar-board {
  display: grid;
  gap: 14px;
  min-width: 100%;
}

.week-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;
}

.week-layout--focus-open {
  grid-template-columns: minmax(0, 1fr) 280px;
}

.week-main {
  min-width: 0;
  overflow-x: auto;
  padding-bottom: 4px;
}

.board-column {
  gap: 14px;
  align-content: start;
  min-height: 460px;
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.82), rgba(248, 251, 255, 0.46)),
    rgba(242, 247, 252, 0.34);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.72),
    0 14px 30px rgba(84, 105, 137, 0.08);
}

.board-column--history {
  background:
    linear-gradient(180deg, rgba(255, 248, 249, 0.96), rgba(255, 242, 244, 0.72)),
    rgba(253, 239, 242, 0.42);
  border-color: rgba(216, 75, 95, 0.18);
}

.board-column--day {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(248, 251, 255, 0.52)),
    rgba(242, 247, 252, 0.34);
}

.board-column--today {
  border-color: rgba(79, 124, 255, 0.28);
}

.focus-sidebar {
  display: grid;
  gap: 18px;
  align-content: start;
  padding: 20px 16px 16px;
  border-left: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 20px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.36), rgba(255, 255, 255, 0.14)),
    var(--sidebar-background);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.56),
    0 10px 28px rgba(88, 112, 146, 0.08);
  backdrop-filter: blur(24px) saturate(150%);
}

.focus-sidebar__header,
.focus-sidebar__body {
  display: grid;
  gap: 12px;
}

.board-column__header {
  display: grid;
  gap: 8px;
}

.board-column__header h2,
.board-card h3 {
  margin: 0;
}

.board-column__header h2 {
  font-size: 18px;
  line-height: 1.25;
}

.board-column__hint {
  color: var(--muted-text-color);
  font-size: 13px;
  line-height: 1.5;
}

.board-column__body {
  gap: 12px;
  align-content: start;
}

.board-card {
  gap: 10px;
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.52);
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.74), rgba(255, 255, 255, 0.26)),
    rgba(246, 249, 252, 0.36);
  text-align: left;
  cursor: pointer;
}

.board-card.is-overdue {
  border-color: rgba(216, 75, 95, 0.22);
}

.board-card.is-completed {
  border-color: rgba(147, 161, 178, 0.24);
}

.board-card__topline,
.board-card__meta,
.switch-row,
.switch-field,
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.board-card__meta {
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 6px 10px;
}

.board-card__focus-chip,
.board-card__status {
  display: inline-flex;
  width: fit-content;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.board-card__focus-chip {
  background: rgba(243, 167, 27, 0.14);
  color: #996100;
}

.board-card h3 {
  font-size: 14px;
  line-height: 1.45;
  word-break: break-word;
}

.board-card__date,
.board-card__time,
.board-card__status {
  color: var(--muted-text-color);
  font-size: 12px;
  line-height: 1.5;
}

.board-card__status {
  background: rgba(255, 255, 255, 0.66);
}

.board-card--history {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.82), rgba(255, 245, 247, 0.54)),
    rgba(255, 244, 246, 0.52);
}

.focus-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 12px;
  border: 1px solid rgba(255, 255, 255, 0.44);
  border-radius: 999px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.28)),
    rgba(245, 248, 252, 0.38);
  color: var(--muted-text-color);
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.focus-toggle.is-active {
  color: var(--body-text-color);
  border-color: rgba(243, 167, 27, 0.28);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);
}

.focus-toggle__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: rgba(243, 167, 27, 0.14);
  color: #996100;
  font-size: 11px;
}

.modal-form,
.modal-group {
  gap: 12px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.native-time-input {
  width: 100%;
  min-height: 40px;
  padding: 0 12px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.72);
  color: var(--body-text-color);
  font: inherit;
}

.switch-field {
  min-height: 72px;
}

.modal-footer {
  width: 100%;
}

@media (max-width: 900px) {
  .month-weekdays,
  .month-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .calendar-toolbar,
  .form-row,
  .month-weekdays,
  .month-grid {
    grid-template-columns: 1fr;
  }

  .toolbar-actions {
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .week-layout--focus-open {
    grid-template-columns: 1fr;
  }

  .calendar-board {
    min-width: 860px;
  }
}
</style>
