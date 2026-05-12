package domain

type Task struct {
	ID       string  `json:"id"`
	Title    string  `json:"title"`
	Status   string  `json:"status"`
	Priority string  `json:"priority"`
	DueAt    string  `json:"dueAt"`
	Date     string  `json:"date"`
	Notes    *string `json:"notes,omitempty"`
	IsFocus  *bool   `json:"isFocus,omitempty"`
}

type Event struct {
	ID        string  `json:"id"`
	Title     string  `json:"title"`
	StartAt   string  `json:"startAt"`
	EndAt     string  `json:"endAt"`
	Date      string  `json:"date"`
	Completed bool    `json:"completed"`
	Notes     *string `json:"notes,omitempty"`
	IsFocus   *bool   `json:"isFocus,omitempty"`
}

type JournalEntry struct {
	Date    string `json:"date"`
	Title   string `json:"title"`
	Content string `json:"content"`
}

type LogEntry struct {
	ID          string  `json:"id"`
	Date        string  `json:"date"`
	Time        string  `json:"time"`
	Title       string  `json:"title"`
	Notes       *string `json:"notes,omitempty"`
	IsHighlight bool    `json:"isHighlight"`
	SourceType  string  `json:"sourceType"`
	SourceID    *string `json:"sourceId,omitempty"`
}

type DailySummary struct {
	Date      string   `json:"date"`
	Mood      string   `json:"mood"`
	Wins      []string `json:"wins"`
	Blockers  []string `json:"blockers"`
	NextFocus []string `json:"nextFocus"`
	Content   string   `json:"content"`
}

type DayRecord struct {
	Date         string       `json:"date"`
	JournalEntry JournalEntry `json:"journalEntry"`
	LogEntries   []LogEntry   `json:"logEntries"`
	DailySummary DailySummary `json:"dailySummary"`
	Tasks        []Task       `json:"tasks"`
	Events       []Event      `json:"events"`
}

type Dashboard struct {
	TodayRecord       DayRecord          `json:"todayRecord"`
	UpcomingTasks     []Task             `json:"upcomingTasks"`
	CurrentWeekEvents []CurrentWeekEvent `json:"currentWeekEvents"`
}

type CurrentWeekEvent struct {
	Date   string  `json:"date"`
	Events []Event `json:"events"`
}

type TaskInput struct {
	Title    string  `json:"title"`
	Status   string  `json:"status"`
	Priority string  `json:"priority"`
	DueAt    string  `json:"dueAt"`
	Date     string  `json:"date"`
	Notes    *string `json:"notes,omitempty"`
	IsFocus  *bool   `json:"isFocus,omitempty"`
}

type EventInput struct {
	Title     string  `json:"title"`
	StartAt   string  `json:"startAt"`
	EndAt     string  `json:"endAt"`
	Date      string  `json:"date"`
	Completed bool    `json:"completed"`
	Notes     *string `json:"notes,omitempty"`
	IsFocus   *bool   `json:"isFocus,omitempty"`
}

type JournalEntryInput struct {
	Title   string `json:"title"`
	Content string `json:"content"`
}

type DailySummaryPatch struct {
	Mood      *string   `json:"mood,omitempty"`
	Wins      *[]string `json:"wins,omitempty"`
	Blockers  *[]string `json:"blockers,omitempty"`
	NextFocus *[]string `json:"nextFocus,omitempty"`
	Content   *string   `json:"content,omitempty"`
}

type LogEntryInput struct {
	Date        string  `json:"date"`
	Time        string  `json:"time"`
	Title       string  `json:"title"`
	Notes       *string `json:"notes,omitempty"`
	IsHighlight bool    `json:"isHighlight"`
	SourceType  string  `json:"sourceType"`
	SourceID    *string `json:"sourceId,omitempty"`
}

type DayRecordFilter struct {
	From string
	To   string
}

type TaskFilter struct {
	From   string
	To     string
	Status string
}

type EventFilter struct {
	From string
	To   string
}
