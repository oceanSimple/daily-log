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
}

export interface Event {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  date: string;
  completed: boolean;
  notes?: string;
}

export interface JournalEntry {
  date: string;
  title: string;
  content: string;
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
  dailySummary: DailySummary;
  tasks: Task[];
  events: Event[];
}
