export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt: string;
  date: string;
  notes?: string;
  isFocus?: boolean;
}

export interface Event {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  date: string;
  completed: boolean;
  notes?: string;
  isFocus?: boolean;
}

export interface JournalEntry {
  date: string;
  title: string;
  content: string;
}

export type LogEntrySourceType = 'task' | 'event';

export interface LogEntry {
  id: string;
  date: string;
  time: string;
  title: string;
  notes?: string;
  isHighlight: boolean;
  sourceType: LogEntrySourceType;
  sourceId?: string;
}

export interface DailySummary {
  date: string;
  mood: 'steady' | 'focused' | 'energized' | 'tired';
  wins: string[];
  blockers: string[];
  nextFocus: string[];
  content: string;
}

export interface DayRecord {
  date: string;
  journalEntry: JournalEntry;
  logEntries: LogEntry[];
  dailySummary: DailySummary;
  tasks: Task[];
  events: Event[];
}

export type CalendarItemKind = 'event' | 'task';

export interface CalendarBoardItem {
  id: string;
  sourceId: string;
  kind: CalendarItemKind;
  title: string;
  date: string;
  timeLabel: string;
  notes?: string;
  sortAt: string;
  isCompleted: boolean;
  isOverdue: boolean;
  isFocus: boolean;
}

export interface LogSourceOption {
  id: string;
  sourceId: string;
  sourceType: LogEntrySourceType;
  title: string;
  time: string;
  timeLabel: string;
  notes?: string;
  isUsed: boolean;
}
