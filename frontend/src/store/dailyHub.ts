import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

import { mockRecords } from '@/data/mockRecords';
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
  const records = ref(mockRecords);

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

  function createLogEntryId() {
    return `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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

  function availableLogSources(date: string, includeUsed = false): LogSourceOption[] {
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

    return sources
      .filter((source) => includeUsed || !source.isUsed)
      .sort((left, right) => left.time.localeCompare(right.time));
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
    const record = ensureRecord(input.date);
    const task: Task = {
      isFocus: false,
      ...input,
      id: createId('task'),
    };

    record.tasks = [...record.tasks, task].sort((a, b) => a.dueAt.localeCompare(b.dueAt));
    records.value = [...records.value];
    return task;
  }

  function updateTask(taskId: string, input: Omit<Task, 'id'>) {
    const sourceRecord = records.value.find((record) => record.tasks.some((task) => task.id === taskId));
    if (!sourceRecord) return;

    const taskIndex = sourceRecord.tasks.findIndex((task) => task.id === taskId);
    if (taskIndex < 0) return;

    const existing = sourceRecord.tasks[taskIndex];

    if (existing.date !== input.date) {
      sourceRecord.tasks = sourceRecord.tasks.filter((task) => task.id !== taskId);
      const targetRecord = ensureRecord(input.date);
      targetRecord.tasks = [
        ...targetRecord.tasks,
        { ...existing, ...input, id: taskId },
      ].sort((a, b) => a.dueAt.localeCompare(b.dueAt));
    } else {
      sourceRecord.tasks[taskIndex] = { ...existing, ...input, id: taskId };
      sourceRecord.tasks = [...sourceRecord.tasks].sort((a, b) => a.dueAt.localeCompare(b.dueAt));
    }

    records.value = [...records.value];
  }

  function deleteTask(taskId: string) {
    const sourceRecord = records.value.find((record) => record.tasks.some((task) => task.id === taskId));
    if (!sourceRecord) return;
    sourceRecord.tasks = sourceRecord.tasks.filter((task) => task.id !== taskId);
    records.value = [...records.value];
  }

  function addEvent(input: Omit<Event, 'id'>) {
    const record = ensureRecord(input.date);
    const event: Event = {
      isFocus: false,
      ...input,
      id: createId('event'),
    };

    record.events = [...record.events, event].sort((a, b) => a.startAt.localeCompare(b.startAt));
    records.value = [...records.value];
    return event;
  }

  function updateEvent(eventId: string, input: Omit<Event, 'id'>) {
    const sourceRecord = records.value.find((record) => record.events.some((event) => event.id === eventId));
    if (!sourceRecord) return;

    const eventIndex = sourceRecord.events.findIndex((event) => event.id === eventId);
    if (eventIndex < 0) return;

    const existing = sourceRecord.events[eventIndex];

    if (existing.date !== input.date) {
      sourceRecord.events = sourceRecord.events.filter((event) => event.id !== eventId);
      const targetRecord = ensureRecord(input.date);
      targetRecord.events = [
        ...targetRecord.events,
        { ...existing, ...input, id: eventId },
      ].sort((a, b) => a.startAt.localeCompare(b.startAt));
    } else {
      sourceRecord.events[eventIndex] = { ...existing, ...input, id: eventId };
      sourceRecord.events = [...sourceRecord.events].sort((a, b) => a.startAt.localeCompare(b.startAt));
    }

    records.value = [...records.value];
  }

  function deleteEvent(eventId: string) {
    const sourceRecord = records.value.find((record) => record.events.some((event) => event.id === eventId));
    if (!sourceRecord) return;
    sourceRecord.events = sourceRecord.events.filter((event) => event.id !== eventId);
    records.value = [...records.value];
  }

  function toggleEventCompleted(eventId: string) {
    const sourceRecord = records.value.find((record) => record.events.some((event) => event.id === eventId));
    if (!sourceRecord) return;

    sourceRecord.events = sourceRecord.events.map((event) =>
      event.id === eventId ? { ...event, completed: !event.completed } : event,
    );
    records.value = [...records.value];
  }

  function toggleTaskCompleted(taskId: string) {
    const sourceRecord = records.value.find((record) => record.tasks.some((task) => task.id === taskId));
    if (!sourceRecord) return;

    sourceRecord.tasks = sourceRecord.tasks.map((task) => {
      if (task.id !== taskId) return task;
      return {
        ...task,
        status: task.status === 'done' ? 'todo' : 'done',
      };
    });
    records.value = [...records.value];
  }

  function addLogEntry(input: Omit<LogEntry, 'id'>) {
    const record = ensureRecord(input.date);
    const entry: LogEntry = {
      ...input,
      id: createLogEntryId(),
    };

    record.logEntries = sortLogEntries([...(record.logEntries ?? []), entry]);
    records.value = [...records.value];
    return entry;
  }

  function updateLogEntry(entryId: string, input: Omit<LogEntry, 'id'>) {
    const record = records.value.find((item) => (item.logEntries ?? []).some((entry) => entry.id === entryId));
    if (!record) return;

    record.logEntries = sortLogEntries(
      (record.logEntries ?? []).map((entry) => (entry.id === entryId ? { ...entry, ...input, id: entryId } : entry)),
    );
    records.value = [...records.value];
  }

  function deleteLogEntry(entryId: string) {
    const record = records.value.find((item) => (item.logEntries ?? []).some((entry) => entry.id === entryId));
    if (!record) return;

    record.logEntries = (record.logEntries ?? []).filter((entry) => entry.id !== entryId);
    records.value = [...records.value];
  }

  function updateJournalEntry(date: string, input: Pick<JournalEntry, 'title' | 'content'>) {
    const record = ensureRecord(date);
    record.journalEntry = {
      ...record.journalEntry,
      ...input,
      date,
    };
    records.value = [...records.value];
  }

  function updateDailySummary(date: string, input: Partial<Omit<DailySummary, 'date'>>) {
    const record = ensureRecord(date);
    record.dailySummary = {
      ...record.dailySummary,
      ...input,
      date,
    };
    records.value = [...records.value];
  }

  return {
    records,
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
