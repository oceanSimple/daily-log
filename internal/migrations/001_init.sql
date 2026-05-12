CREATE TABLE IF NOT EXISTS day_records (
    date TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS journal_entries (
    date TEXT PRIMARY KEY REFERENCES day_records(date) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS daily_summaries (
    date TEXT PRIMARY KEY REFERENCES day_records(date) ON DELETE CASCADE,
    mood TEXT NOT NULL DEFAULT 'steady',
    wins TEXT[] NOT NULL DEFAULT '{}',
    blockers TEXT[] NOT NULL DEFAULT '{}',
    next_focus TEXT[] NOT NULL DEFAULT '{}',
    content TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    status TEXT NOT NULL,
    priority TEXT NOT NULL,
    due_at TEXT NOT NULL,
    date TEXT NOT NULL REFERENCES day_records(date) ON DELETE CASCADE,
    notes TEXT,
    is_focus BOOLEAN
);

CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    start_at TEXT NOT NULL,
    end_at TEXT NOT NULL,
    date TEXT NOT NULL REFERENCES day_records(date) ON DELETE CASCADE,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    is_focus BOOLEAN
);

CREATE TABLE IF NOT EXISTS log_entries (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL REFERENCES day_records(date) ON DELETE CASCADE,
    time TEXT NOT NULL,
    title TEXT NOT NULL,
    notes TEXT,
    is_highlight BOOLEAN NOT NULL DEFAULT FALSE,
    source_type TEXT NOT NULL,
    source_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_at ON tasks(due_at);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_start_at ON events(start_at);
CREATE INDEX IF NOT EXISTS idx_log_entries_date ON log_entries(date);
CREATE INDEX IF NOT EXISTS idx_log_entries_time ON log_entries(time);
