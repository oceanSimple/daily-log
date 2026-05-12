import type { DailySummary, DayRecord, Event, JournalEntry, LogEntry, Task } from '@/types/daily-hub';

export interface DashboardDto {
  todayRecord: DayRecord;
  upcomingTasks: Task[];
  currentWeekEvents: Array<{
    date: string;
    events: Event[];
  }>;
}

export function toDayRecord(record: DayRecord): DayRecord {
  return structuredClone(record);
}

export function toDayRecords(records: DayRecord[]): DayRecord[] {
  return records.map(toDayRecord);
}

export function toTask(task: Task): Task {
  return structuredClone(task);
}

export function toTasks(tasks: Task[]): Task[] {
  return tasks.map(toTask);
}

export function toEvent(event: Event): Event {
  return structuredClone(event);
}

export function toEvents(events: Event[]): Event[] {
  return events.map(toEvent);
}

export function toJournalEntry(entry: JournalEntry): JournalEntry {
  return structuredClone(entry);
}

export function toDailySummary(summary: DailySummary): DailySummary {
  return structuredClone(summary);
}

export function toLogEntry(entry: LogEntry): LogEntry {
  return structuredClone(entry);
}

export function toDashboard(dto: DashboardDto): DashboardDto {
  return {
    todayRecord: toDayRecord(dto.todayRecord),
    upcomingTasks: toTasks(dto.upcomingTasks),
    currentWeekEvents: dto.currentWeekEvents.map((item) => ({
      date: item.date,
      events: toEvents(item.events),
    })),
  };
}
