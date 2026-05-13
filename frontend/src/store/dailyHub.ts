import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

import {
  createEvent as createEventRequest,
  createLogEntry as createLogEntryRequest,
  createTask as createTaskRequest,
  deleteEvent as deleteEventRequest,
  deleteLogEntry as deleteLogEntryRequest,
  deleteTask as deleteTaskRequest,
  listDayRecords,
  updateDailySummary as updateDailySummaryRequest,
  updateEvent as updateEventRequest,
  updateJournalEntry as updateJournalEntryRequest,
  updateLogEntry as updateLogEntryRequest,
  updateTask as updateTaskRequest,
} from '@/api/services';
import type {
  CalendarBoardItem,
  DailySummary,
  DayRecord,
  Event,
  JournalEntry,
  LogEntry,
  LogSourceOption,
  Task,
} from '@/types/daily-hub';
import { formatTimeLabel, formatTimeRange, startOfWeek, toDateKey } from '@/utils/date';

export const useDailyHubStore = defineStore('dailyHub', () => {
  const records = ref<DayRecord[]>([]);
  const isLoaded = ref(false);
  const isLoading = ref(false);

  function createEmptyDayRecord(date: string): DayRecord {
    return {
      date,
      journalEntry: {
        date,
        title: '',
        content: '',
      },
      logEntries: [],
      dailySummary: {
        date,
        mood: 'steady',
        wins: [],
        blockers: [],
        nextFocus: [],
        content: '',
      },
      tasks: [],
      events: [],
    };
  }

  function ensureRecord(date: string) {
    let record = records.value.find((item) => item.date === date);
    if (!record) {
      record = createEmptyDayRecord(date);
      records.value = [...records.value, record].sort((a, b) => a.date.localeCompare(b.date));
    }

    return record;
  }

  function createId(prefix: 'task' | 'event') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  async function initialize() {
    if (isLoading.value || isLoaded.value) return;
    isLoading.value = true;
    try {
      const result = await listDayRecords();
      records.value = result;
      isLoaded.value = true;
    } finally {
      isLoading.value = false;
    }
  }

  async function refreshRecords() {
    records.value = await listDayRecords();
    isLoaded.value = true;
  }

  const recordMap = computed(() =>
    Object.fromEntries(records.value.map((record) => [record.date, record])),
  );

  const todayKey = computed(() => toDateKey(new Date()));
  const todayRecord = computed(() => ensureRecord(todayKey.value));

  const allTasks = computed(() =>
    records.value.flatMap((record) => record.tasks).sort((a, b) => a.dueAt.localeCompare(b.dueAt)),
  );

  const archiveRecords = computed(() =>
    [...records.value].sort((a, b) => b.date.localeCompare(a.date)),
  );

  const journalOverviewDays = computed(() =>
    archiveRecords.value
      .filter((record) => record.date <= todayKey.value)
      .map((record) => ({
        ...record,
        logEntries: [...(record.logEntries ?? [])].sort((a, b) => a.time.localeCompare(b.time)),
        highlightCount: (record.logEntries ?? []).filter((entry) => entry.isHighlight).length,
      })),
  );

  const upcomingTasks = computed(() =>
    allTasks.value.filter((task) => task.status !== 'done' && task.dueAt >= `${todayKey.value}T00:00:00`),
  );

  const groupedTasks = computed(() =>
    archiveRecords.value.map((record) => ({
      date: record.date,
      tasks: record.tasks,
    })),
  );

  const currentWeekSchedule = computed(() => {
    const start = startOfWeek(todayKey.value);

    return Array.from({ length: 7 }, (_, index) => {
      const current = new Date(start);
      current.setDate(current.getDate() + index);
      const date = toDateKey(current);
      return {
        date,
        events: recordMap.value[date]?.events ?? [],
      };
    });
  });

  function taskIsAnytime(task: Task) {
    return task.dueAt.endsWith('23:59:00');
  }

  function sortLogEntries(entries: LogEntry[]) {
    return [...entries].sort((a, b) => a.time.localeCompare(b.time));
  }

  function dayLogEntries(date: string) {
    return sortLogEntries(recordMap.value[date]?.logEntries ?? []);
  }

  function logSourceUsageSet(record: DayRecord) {
    return new Set(
      (record.logEntries ?? [])
        .filter((entry) => entry.sourceId && entry.sourceType)
        .map((entry) => `${entry.sourceType}:${entry.sourceId}`),
    );
  }

  function availableLogSources(date: string, _includeUsed = false): LogSourceOption[] {
    const record = ensureRecord(date);
    const usageSet = logSourceUsageSet(record);
    const sources: LogSourceOption[] = [
      ...record.events.map((event) => ({
        id: `event:${event.id}`,
        sourceId: event.id,
        sourceType: 'event' as const,
        title: event.title,
        time: event.startAt.slice(11, 16),
        timeLabel: formatTimeRange(event.startAt, event.endAt, 'zh-CN'),
        notes: event.notes,
        isUsed: usageSet.has(`event:${event.id}`),
      })),
      ...record.tasks.map((task) => ({
        id: `task:${task.id}`,
        sourceId: task.id,
        sourceType: 'task' as const,
        title: task.title,
        time: task.dueAt.slice(11, 16),
        timeLabel: taskIsAnytime(task) ? '当天事项' : formatTimeLabel(task.dueAt, 'zh-CN'),
        notes: task.notes,
        isUsed: usageSet.has(`task:${task.id}`),
      })),
    ];

    return sources.sort((left, right) => {
      if (left.isUsed !== right.isUsed) return left.isUsed ? 1 : -1;
      return left.time.localeCompare(right.time);
    });
  }

  function buildCalendarItem(item: Event, kind: 'event', locale?: string, nowIso?: string): CalendarBoardItem;
  function buildCalendarItem(item: Task, kind: 'task', locale?: string, nowIso?: string): CalendarBoardItem;
  function buildCalendarItem(
    item: Event | Task,
    kind: 'event' | 'task',
    locale = 'zh-CN',
    nowIso?: string,
  ): CalendarBoardItem {
    if (kind === 'event') {
      const event = item as Event;
      return {
        id: `event-${event.id}`,
        sourceId: event.id,
        kind: 'event',
        title: event.title,
        date: event.date,
        timeLabel: formatTimeRange(event.startAt, event.endAt, locale),
        notes: event.notes,
        sortAt: event.startAt,
        isCompleted: event.completed,
        isOverdue: !event.completed && Boolean(nowIso && event.endAt < nowIso),
        isFocus: Boolean(event.isFocus),
      };
    }

    const task = item as Task;
    const isCompleted = task.status === 'done';
    return {
      id: `task-${task.id}`,
      sourceId: task.id,
      kind: 'task',
      title: task.title,
      date: task.date,
      timeLabel: taskIsAnytime(task) ? '23:59' : formatTimeLabel(task.dueAt, locale),
      notes: task.notes,
      sortAt: task.dueAt,
      isCompleted,
      isOverdue: !isCompleted && Boolean(nowIso && task.dueAt < nowIso),
      isFocus: Boolean(task.isFocus),
    };
  }

  function compareCalendarItems(left: CalendarBoardItem, right: CalendarBoardItem) {
    const byDate = left.date.localeCompare(right.date);
    if (byDate !== 0) return byDate;

    const byTime = left.sortAt.localeCompare(right.sortAt);
    if (byTime !== 0) return byTime;

    if (left.kind !== right.kind) {
      return left.kind === 'event' ? -1 : 1;
    }

    return left.title.localeCompare(right.title);
  }

  function collectCalendarItems(locale = 'zh-CN', nowIso?: string) {
    return records.value.flatMap((record) => [
      ...record.events.map((event) => buildCalendarItem(event, 'event', locale, nowIso)),
      ...record.tasks.map((task) => buildCalendarItem(task, 'task', locale, nowIso)),
    ]);
  }

  function pastOpenItems(locale = 'zh-CN', nowIso?: string) {
    return collectCalendarItems(locale, nowIso)
      .filter((item) => item.date < todayKey.value && !item.isCompleted)
      .sort(compareCalendarItems);
  }

  function futureFocusItems(locale = 'zh-CN', nowIso?: string) {
    return collectCalendarItems(locale, nowIso)
      .filter((item) => item.date > todayKey.value && item.isFocus && !item.isCompleted)
      .sort(compareCalendarItems);
  }

  function windowedCalendarItems(daySpan: number, locale = 'zh-CN', nowIso?: string) {
    const items = collectCalendarItems(locale, nowIso);

    return Array.from({ length: daySpan }, (_, index) => {
      const current = new Date(`${todayKey.value}T00:00:00`);
      current.setDate(current.getDate() + index);
      const date = toDateKey(current);

      return {
        date,
        items: items
          .filter((item) => item.date === date)
          .sort(compareCalendarItems),
      };
    });
  }

  function moodLabel(mood: DailySummary['mood']) {
    const mapping: Record<DailySummary['mood'], string> = {
      steady: '平稳',
      focused: '专注',
      energized: '有劲',
      tired: '疲惫',
    };

    return mapping[mood];
  }

  function taskStatusCounts(tasks: Task[]) {
    return tasks.reduce(
      (result, task) => {
        result[task.status] += 1;
        return result;
      },
      { todo: 0, in_progress: 0, done: 0 },
    );
  }

  function addTask(input: Omit<Task, 'id'>) {
    return createTaskRequest(input).then((task) => {
      const record = ensureRecord(task.date);
      record.tasks = [...record.tasks, task].sort((a, b) => a.dueAt.localeCompare(b.dueAt));
      records.value = [...records.value];
      return task;
    });
  }

  async function updateTask(taskId: string, input: Omit<Task, 'id'>) {
    const updatedTask = await updateTaskRequest(taskId, input);
    const sourceRecord = records.value.find((record) => record.tasks.some((task) => task.id === taskId));
    if (!sourceRecord) return;
    const taskIndex = sourceRecord.tasks.findIndex((task) => task.id === taskId);
    if (taskIndex < 0) return;
    const existing = sourceRecord.tasks[taskIndex];

    if (existing.date !== updatedTask.date) {
      sourceRecord.tasks = sourceRecord.tasks.filter((task) => task.id !== taskId);
      const targetRecord = ensureRecord(updatedTask.date);
      targetRecord.tasks = [...targetRecord.tasks, updatedTask].sort((a, b) => a.dueAt.localeCompare(b.dueAt));
    } else {
      sourceRecord.tasks[taskIndex] = updatedTask;
      sourceRecord.tasks = [...sourceRecord.tasks].sort((a, b) => a.dueAt.localeCompare(b.dueAt));
    }

    records.value = [...records.value];
  }

  async function deleteTask(taskId: string) {
    await deleteTaskRequest(taskId);
    const sourceRecord = records.value.find((record) => record.tasks.some((task) => task.id === taskId));
    if (!sourceRecord) return;
    sourceRecord.tasks = sourceRecord.tasks.filter((task) => task.id !== taskId);
    records.value = [...records.value];
  }

  function addEvent(input: Omit<Event, 'id'>) {
    return createEventRequest(input).then((event) => {
      const record = ensureRecord(event.date);
      record.events = [...record.events, event].sort((a, b) => a.startAt.localeCompare(b.startAt));
      records.value = [...records.value];
      return event;
    });
  }

  async function updateEvent(eventId: string, input: Omit<Event, 'id'>) {
    const updatedEvent = await updateEventRequest(eventId, input);
    const sourceRecord = records.value.find((record) => record.events.some((event) => event.id === eventId));
    if (!sourceRecord) return;
    const eventIndex = sourceRecord.events.findIndex((event) => event.id === eventId);
    if (eventIndex < 0) return;
    const existing = sourceRecord.events[eventIndex];

    if (existing.date !== updatedEvent.date) {
      sourceRecord.events = sourceRecord.events.filter((event) => event.id !== eventId);
      const targetRecord = ensureRecord(updatedEvent.date);
      targetRecord.events = [...targetRecord.events, updatedEvent].sort((a, b) => a.startAt.localeCompare(b.startAt));
    } else {
      sourceRecord.events[eventIndex] = updatedEvent;
      sourceRecord.events = [...sourceRecord.events].sort((a, b) => a.startAt.localeCompare(b.startAt));
    }

    records.value = [...records.value];
  }

  async function deleteEvent(eventId: string) {
    await deleteEventRequest(eventId);
    const sourceRecord = records.value.find((record) => record.events.some((event) => event.id === eventId));
    if (!sourceRecord) return;
    sourceRecord.events = sourceRecord.events.filter((event) => event.id !== eventId);
    records.value = [...records.value];
  }

  async function toggleEventCompleted(eventId: string) {
    const sourceRecord = records.value.find((record) => record.events.some((event) => event.id === eventId));
    if (!sourceRecord) return;
    const existing = sourceRecord.events.find((event) => event.id === eventId);
    if (!existing) return;

    const updatedEvent = await updateEventRequest(eventId, {
      title: existing.title,
      startAt: existing.startAt,
      endAt: existing.endAt,
      date: existing.date,
      completed: !existing.completed,
      isFocus: existing.isFocus,
      notes: existing.notes,
    });
    const eventIndex = sourceRecord.events.findIndex((event) => event.id === eventId);
    if (eventIndex < 0) return;
    sourceRecord.events[eventIndex] = updatedEvent;
    sourceRecord.events = [...sourceRecord.events].sort((a, b) => a.startAt.localeCompare(b.startAt));
    records.value = [...records.value];
  }

  async function toggleTaskCompleted(taskId: string) {
    const sourceRecord = records.value.find((record) => record.tasks.some((task) => task.id === taskId));
    if (!sourceRecord) return;
    const existing = sourceRecord.tasks.find((task) => task.id === taskId);
    if (!existing) return;

    const updatedTask = await updateTaskRequest(taskId, {
      title: existing.title,
      priority: existing.priority,
      status: existing.status === 'done' ? 'todo' : 'done',
      dueAt: existing.dueAt,
      date: existing.date,
      isFocus: existing.isFocus,
      notes: existing.notes,
    });
    const taskIndex = sourceRecord.tasks.findIndex((task) => task.id === taskId);
    if (taskIndex < 0) return;
    sourceRecord.tasks[taskIndex] = updatedTask;
    sourceRecord.tasks = [...sourceRecord.tasks].sort((a, b) => a.dueAt.localeCompare(b.dueAt));
    records.value = [...records.value];
  }

  function addLogEntry(input: Omit<LogEntry, 'id'>) {
    return createLogEntryRequest(input).then((entry) => {
      const record = ensureRecord(entry.date);
      record.logEntries = sortLogEntries([...(record.logEntries ?? []), entry]);
      records.value = [...records.value];
      return entry;
    });
  }

  async function updateLogEntry(entryId: string, input: Omit<LogEntry, 'id'>) {
    const updatedEntry = await updateLogEntryRequest(entryId, input);
    const record = records.value.find((item) => (item.logEntries ?? []).some((entry) => entry.id === entryId));
    if (!record) return;

    record.logEntries = sortLogEntries(
      (record.logEntries ?? []).map((entry) => (entry.id === entryId ? updatedEntry : entry)),
    );
    records.value = [...records.value];
  }

  async function deleteLogEntry(entryId: string) {
    await deleteLogEntryRequest(entryId);
    const record = records.value.find((item) => (item.logEntries ?? []).some((entry) => entry.id === entryId));
    if (!record) return;

    record.logEntries = (record.logEntries ?? []).filter((entry) => entry.id !== entryId);
    records.value = [...records.value];
  }

  async function updateJournalEntry(date: string, input: Pick<JournalEntry, 'title' | 'content'>) {
    const updatedEntry = await updateJournalEntryRequest(date, input);
    const record = ensureRecord(date);
    record.journalEntry = updatedEntry;
    records.value = [...records.value];
  }

  async function updateDailySummary(date: string, input: Partial<Omit<DailySummary, 'date'>>) {
    const updatedSummary = await updateDailySummaryRequest(date, input);
    const record = ensureRecord(date);
    record.dailySummary = updatedSummary;
    records.value = [...records.value];
  }

  return {
    records,
    isLoaded,
    isLoading,
    initialize,
    refreshRecords,
    todayKey,
    recordMap,
    todayRecord,
    allTasks,
    archiveRecords,
    journalOverviewDays,
    upcomingTasks,
    groupedTasks,
    currentWeekSchedule,
    pastOpenItems,
    futureFocusItems,
    windowedCalendarItems,
    dayLogEntries,
    availableLogSources,
    moodLabel,
    taskStatusCounts,
    addTask,
    updateTask,
    deleteTask,
    addEvent,
    updateEvent,
    deleteEvent,
    toggleEventCompleted,
    toggleTaskCompleted,
    addLogEntry,
    updateLogEntry,
    deleteLogEntry,
    updateJournalEntry,
    updateDailySummary,
    ensureRecord,
  };
});
