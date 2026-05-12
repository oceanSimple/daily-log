import { mockRecords } from '@/data/mockRecords';
import type { DailySummary, DayRecord, Event, JournalEntry, LogEntry, Task } from '@/types/daily-hub';
import { startOfWeek, toDateKey } from '@/utils/date';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

interface MockRequestInit {
  body?: unknown;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

let records = clone(mockRecords);

function sortRecords() {
  records = [...records].sort((left, right) => left.date.localeCompare(right.date));
}

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
  let record = records.find((item) => item.date === date);
  if (!record) {
    record = createEmptyDayRecord(date);
    records = [...records, record];
    sortRecords();
  }
  return record;
}

function createId(prefix: 'task' | 'event' | 'log') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function jsonResponse<T>(data: T) {
  return Promise.resolve(clone(data));
}

function extractDate(pathname: string) {
  const parts = pathname.split('/');
  return parts[parts.length - 1] ?? '';
}

function listDayRecords(url: URL) {
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');
  let filtered = [...records];
  if (from) filtered = filtered.filter((record) => record.date >= from);
  if (to) filtered = filtered.filter((record) => record.date <= to);
  sortRecords();
  return jsonResponse(filtered);
}

function getDashboard() {
  const today = toDateKey(new Date());
  const todayRecord = ensureRecord(today);
  const upcomingTasks = records
    .flatMap((record) => record.tasks)
    .filter((task) => task.status !== 'done' && task.dueAt >= `${today}T00:00:00`)
    .sort((left, right) => left.dueAt.localeCompare(right.dueAt));

  const weekStart = startOfWeek(today);
  const currentWeekEvents = Array.from({ length: 7 }, (_, index) => {
    const current = new Date(weekStart);
    current.setDate(current.getDate() + index);
    const date = toDateKey(current);
    return {
      date,
      events: ensureRecord(date).events,
    };
  });

  return jsonResponse({
    todayRecord,
    upcomingTasks,
    currentWeekEvents,
  });
}

function listTasks(url: URL) {
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');
  const status = url.searchParams.get('status');
  let tasks = records.flatMap((record) => record.tasks);
  if (from) tasks = tasks.filter((task) => task.date >= from);
  if (to) tasks = tasks.filter((task) => task.date <= to);
  if (status) tasks = tasks.filter((task) => task.status === status);
  tasks = [...tasks].sort((left, right) => left.dueAt.localeCompare(right.dueAt));
  return jsonResponse(tasks);
}

function createTask(input: Omit<Task, 'id'>) {
  const record = ensureRecord(input.date);
  const task: Task = {
    ...input,
    id: createId('task'),
  };
  record.tasks = [...record.tasks, task].sort((left, right) => left.dueAt.localeCompare(right.dueAt));
  return jsonResponse(task);
}

function updateTask(taskId: string, input: Omit<Task, 'id'>) {
  const sourceRecord = records.find((record) => record.tasks.some((task) => task.id === taskId));
  if (!sourceRecord) throw new Error(`Task ${taskId} not found`);
  const taskIndex = sourceRecord.tasks.findIndex((task) => task.id === taskId);
  const existing = sourceRecord.tasks[taskIndex];

  if (existing.date !== input.date) {
    sourceRecord.tasks = sourceRecord.tasks.filter((task) => task.id !== taskId);
    const targetRecord = ensureRecord(input.date);
    targetRecord.tasks = [...targetRecord.tasks, { ...existing, ...input, id: taskId }]
      .sort((left, right) => left.dueAt.localeCompare(right.dueAt));
  } else {
    sourceRecord.tasks[taskIndex] = { ...existing, ...input, id: taskId };
    sourceRecord.tasks = [...sourceRecord.tasks].sort((left, right) => left.dueAt.localeCompare(right.dueAt));
  }

  return jsonResponse({ ...existing, ...input, id: taskId });
}

function deleteTask(taskId: string) {
  const sourceRecord = records.find((record) => record.tasks.some((task) => task.id === taskId));
  if (!sourceRecord) return jsonResponse({ ok: true });
  sourceRecord.tasks = sourceRecord.tasks.filter((task) => task.id !== taskId);
  return jsonResponse({ ok: true });
}

function listEvents(url: URL) {
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');
  let events = records.flatMap((record) => record.events);
  if (from) events = events.filter((event) => event.date >= from);
  if (to) events = events.filter((event) => event.date <= to);
  events = [...events].sort((left, right) => left.startAt.localeCompare(right.startAt));
  return jsonResponse(events);
}

function createEvent(input: Omit<Event, 'id'>) {
  const record = ensureRecord(input.date);
  const event: Event = {
    ...input,
    id: createId('event'),
  };
  record.events = [...record.events, event].sort((left, right) => left.startAt.localeCompare(right.startAt));
  return jsonResponse(event);
}

function updateEvent(eventId: string, input: Omit<Event, 'id'>) {
  const sourceRecord = records.find((record) => record.events.some((event) => event.id === eventId));
  if (!sourceRecord) throw new Error(`Event ${eventId} not found`);
  const eventIndex = sourceRecord.events.findIndex((event) => event.id === eventId);
  const existing = sourceRecord.events[eventIndex];

  if (existing.date !== input.date) {
    sourceRecord.events = sourceRecord.events.filter((event) => event.id !== eventId);
    const targetRecord = ensureRecord(input.date);
    targetRecord.events = [...targetRecord.events, { ...existing, ...input, id: eventId }]
      .sort((left, right) => left.startAt.localeCompare(right.startAt));
  } else {
    sourceRecord.events[eventIndex] = { ...existing, ...input, id: eventId };
    sourceRecord.events = [...sourceRecord.events].sort((left, right) => left.startAt.localeCompare(right.startAt));
  }

  return jsonResponse({ ...existing, ...input, id: eventId });
}

function deleteEvent(eventId: string) {
  const sourceRecord = records.find((record) => record.events.some((event) => event.id === eventId));
  if (!sourceRecord) return jsonResponse({ ok: true });
  sourceRecord.events = sourceRecord.events.filter((event) => event.id !== eventId);
  return jsonResponse({ ok: true });
}

function updateJournalEntry(date: string, input: Pick<JournalEntry, 'title' | 'content'>) {
  const record = ensureRecord(date);
  record.journalEntry = {
    ...record.journalEntry,
    ...input,
    date,
  };
  return jsonResponse(record.journalEntry);
}

function updateDailySummary(date: string, input: Partial<Omit<DailySummary, 'date'>>) {
  const record = ensureRecord(date);
  record.dailySummary = {
    ...record.dailySummary,
    ...input,
    date,
  };
  return jsonResponse(record.dailySummary);
}

function createLogEntry(input: Omit<LogEntry, 'id'>) {
  const record = ensureRecord(input.date);
  const entry: LogEntry = {
    ...input,
    id: createId('log'),
  };
  record.logEntries = [...record.logEntries, entry].sort((left, right) => left.time.localeCompare(right.time));
  return jsonResponse(entry);
}

function updateLogEntry(entryId: string, input: Omit<LogEntry, 'id'>) {
  const record = records.find((item) => item.logEntries.some((entry) => entry.id === entryId));
  if (!record) throw new Error(`Log entry ${entryId} not found`);
  record.logEntries = record.logEntries
    .map((entry) => (entry.id === entryId ? { ...entry, ...input, id: entryId } : entry))
    .sort((left, right) => left.time.localeCompare(right.time));
  return jsonResponse(record.logEntries.find((entry) => entry.id === entryId)!);
}

function deleteLogEntry(entryId: string) {
  const record = records.find((item) => item.logEntries.some((entry) => entry.id === entryId));
  if (!record) return jsonResponse({ ok: true });
  record.logEntries = record.logEntries.filter((entry) => entry.id !== entryId);
  return jsonResponse({ ok: true });
}

export async function handleMockRequest<T>(method: HttpMethod, input: string, init?: MockRequestInit): Promise<T> {
  const url = new URL(input, 'http://mock.local');
  const { pathname } = url;
  const body = init?.body;

  if (method === 'GET' && pathname === '/api/dashboard') {
    return getDashboard() as Promise<T>;
  }
  if (method === 'GET' && pathname === '/api/day-records') {
    return listDayRecords(url) as Promise<T>;
  }
  if (method === 'GET' && pathname.startsWith('/api/day-records/')) {
    return jsonResponse(ensureRecord(extractDate(pathname))) as Promise<T>;
  }
  if (method === 'GET' && pathname === '/api/tasks') {
    return listTasks(url) as Promise<T>;
  }
  if (method === 'POST' && pathname === '/api/tasks') {
    return createTask(body as Omit<Task, 'id'>) as Promise<T>;
  }
  if (method === 'PATCH' && pathname.startsWith('/api/tasks/')) {
    return updateTask(extractDate(pathname), body as Omit<Task, 'id'>) as Promise<T>;
  }
  if (method === 'DELETE' && pathname.startsWith('/api/tasks/')) {
    return deleteTask(extractDate(pathname)) as Promise<T>;
  }
  if (method === 'GET' && pathname === '/api/events') {
    return listEvents(url) as Promise<T>;
  }
  if (method === 'POST' && pathname === '/api/events') {
    return createEvent(body as Omit<Event, 'id'>) as Promise<T>;
  }
  if (method === 'PATCH' && pathname.startsWith('/api/events/')) {
    return updateEvent(extractDate(pathname), body as Omit<Event, 'id'>) as Promise<T>;
  }
  if (method === 'DELETE' && pathname.startsWith('/api/events/')) {
    return deleteEvent(extractDate(pathname)) as Promise<T>;
  }
  if (method === 'PATCH' && pathname.startsWith('/api/journal-entries/')) {
    return updateJournalEntry(extractDate(pathname), body as Pick<JournalEntry, 'title' | 'content'>) as Promise<T>;
  }
  if (method === 'PATCH' && pathname.startsWith('/api/daily-summaries/')) {
    return updateDailySummary(extractDate(pathname), body as Partial<Omit<DailySummary, 'date'>>) as Promise<T>;
  }
  if (method === 'POST' && pathname === '/api/log-entries') {
    return createLogEntry(body as Omit<LogEntry, 'id'>) as Promise<T>;
  }
  if (method === 'PATCH' && pathname.startsWith('/api/log-entries/')) {
    return updateLogEntry(extractDate(pathname), body as Omit<LogEntry, 'id'>) as Promise<T>;
  }
  if (method === 'DELETE' && pathname.startsWith('/api/log-entries/')) {
    return deleteLogEntry(extractDate(pathname)) as Promise<T>;
  }

  throw new Error(`Unhandled mock request: ${method} ${pathname}`);
}
