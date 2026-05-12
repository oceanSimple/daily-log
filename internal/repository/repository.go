package repository

import (
	"context"

	"daily-log/internal/domain"
)

type Store interface {
	Ping(context.Context) error
	ListDayRecords(context.Context, domain.DayRecordFilter) ([]domain.DayRecord, error)
	GetDayRecord(context.Context, string) (domain.DayRecord, error)
	ListTasks(context.Context, domain.TaskFilter) ([]domain.Task, error)
	CreateTask(context.Context, domain.Task) (domain.Task, error)
	UpdateTask(context.Context, string, domain.TaskInput) (domain.Task, error)
	DeleteTask(context.Context, string) error
	ListEvents(context.Context, domain.EventFilter) ([]domain.Event, error)
	CreateEvent(context.Context, domain.Event) (domain.Event, error)
	UpdateEvent(context.Context, string, domain.EventInput) (domain.Event, error)
	DeleteEvent(context.Context, string) error
	UpdateJournalEntry(context.Context, string, domain.JournalEntryInput) (domain.JournalEntry, error)
	UpdateDailySummary(context.Context, string, domain.DailySummaryPatch) (domain.DailySummary, error)
	CreateLogEntry(context.Context, domain.LogEntry) (domain.LogEntry, error)
	UpdateLogEntry(context.Context, string, domain.LogEntryInput) (domain.LogEntry, error)
	DeleteLogEntry(context.Context, string) error
}
