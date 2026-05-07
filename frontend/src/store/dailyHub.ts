import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

import { mockRecords } from '@/data/mockRecords';
import type { DailySummary, DayRecord, Event, Task } from '@/types/daily-hub';
import { startOfWeek, toDateKey } from '@/utils/date';

const TODAY_KEY = '2026-05-07';

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

  const recordMap = computed(() =>
    Object.fromEntries(records.value.map((record) => [record.date, record])),
  );

  const todayRecord = computed(() => recordMap.value[TODAY_KEY] ?? records.value[0]);

  const allTasks = computed(() =>
    records.value.flatMap((record) => record.tasks).sort((a, b) => a.dueAt.localeCompare(b.dueAt)),
  );

  const archiveRecords = computed(() =>
    [...records.value].sort((a, b) => b.date.localeCompare(a.date)),
  );

  const upcomingTasks = computed(() =>
    allTasks.value.filter((task) => task.status !== 'done' && task.dueAt >= `${TODAY_KEY}T00:00:00`),
  );

  const groupedTasks = computed(() =>
    archiveRecords.value.map((record) => ({
      date: record.date,
      tasks: record.tasks,
    })),
  );

  const currentWeekSchedule = computed(() => {
    const start = startOfWeek(TODAY_KEY);

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
      targetRecord.tasks = [...targetRecord.tasks, { ...input, id: taskId }].sort((a, b) =>
        a.dueAt.localeCompare(b.dueAt),
      );
    } else {
      sourceRecord.tasks[taskIndex] = { ...input, id: taskId };
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
      targetRecord.events = [...targetRecord.events, { ...input, id: eventId }].sort((a, b) =>
        a.startAt.localeCompare(b.startAt),
      );
    } else {
      sourceRecord.events[eventIndex] = { ...input, id: eventId };
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

  return {
    records,
    recordMap,
    todayRecord,
    allTasks,
    archiveRecords,
    upcomingTasks,
    groupedTasks,
    currentWeekSchedule,
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
    ensureRecord,
  };
});
