package testutil

import (
	"context"
	"fmt"
	"sort"
	"time"

	"daily-log/internal/domain"
	"daily-log/internal/service"
)

type MemoryStore struct {
	Records map[string]domain.DayRecord
}

func NewMemoryStore(records []domain.DayRecord) *MemoryStore {
	store := &MemoryStore{Records: map[string]domain.DayRecord{}}
	for _, record := range records {
		store.Records[record.Date] = record
	}
	return store
}

func (m *MemoryStore) Ping(context.Context) error { return nil }

func (m *MemoryStore) ListDayRecords(_ context.Context, filter domain.DayRecordFilter) ([]domain.DayRecord, error) {
	var records []domain.DayRecord
	for _, record := range m.Records {
		if filter.From != "" && record.Date < filter.From {
			continue
		}
		if filter.To != "" && record.Date > filter.To {
			continue
		}
		records = append(records, record)
	}
	sort.Slice(records, func(i, j int) bool { return records[i].Date < records[j].Date })
	return records, nil
}

func (m *MemoryStore) GetDayRecord(_ context.Context, date string) (domain.DayRecord, error) {
	if record, ok := m.Records[date]; ok {
		return record, nil
	}
	record := emptyRecord(date)
	return record, nil
}

func (m *MemoryStore) ListTasks(_ context.Context, filter domain.TaskFilter) ([]domain.Task, error) {
	var tasks []domain.Task
	for _, record := range m.Records {
		for _, task := range record.Tasks {
			if filter.From != "" && task.Date < filter.From {
				continue
			}
			if filter.To != "" && task.Date > filter.To {
				continue
			}
			if filter.Status != "" && task.Status != filter.Status {
				continue
			}
			tasks = append(tasks, task)
		}
	}
	sort.Slice(tasks, func(i, j int) bool { return tasks[i].DueAt < tasks[j].DueAt })
	return tasks, nil
}

func (m *MemoryStore) CreateTask(_ context.Context, task domain.Task) (domain.Task, error) {
	record := m.ensureRecord(task.Date)
	record.Tasks = append(record.Tasks, task)
	sort.Slice(record.Tasks, func(i, j int) bool { return record.Tasks[i].DueAt < record.Tasks[j].DueAt })
	m.Records[task.Date] = record
	return task, nil
}

func (m *MemoryStore) UpdateTask(_ context.Context, id string, input domain.TaskInput) (domain.Task, error) {
	var existing *domain.Task
	var sourceDate string
	for date, record := range m.Records {
		for i, task := range record.Tasks {
			if task.ID == id {
				t := task
				existing = &t
				record.Tasks = append(record.Tasks[:i], record.Tasks[i+1:]...)
				m.Records[date] = record
				sourceDate = date
				break
			}
		}
		if existing != nil {
			break
		}
	}
	if existing == nil {
		return domain.Task{}, fmt.Errorf("%w: task %s", service.ErrNotFound, id)
	}
	_ = sourceDate
	updated := domain.Task{ID: id, Title: input.Title, Status: input.Status, Priority: input.Priority, DueAt: input.DueAt, Date: input.Date, Notes: input.Notes, IsFocus: input.IsFocus}
	record := m.ensureRecord(input.Date)
	record.Tasks = append(record.Tasks, updated)
	sort.Slice(record.Tasks, func(i, j int) bool { return record.Tasks[i].DueAt < record.Tasks[j].DueAt })
	m.Records[input.Date] = record
	return updated, nil
}

func (m *MemoryStore) DeleteTask(_ context.Context, id string) error {
	for date, record := range m.Records {
		for i, task := range record.Tasks {
			if task.ID == id {
				record.Tasks = append(record.Tasks[:i], record.Tasks[i+1:]...)
				m.Records[date] = record
				return nil
			}
		}
	}
	return nil
}

func (m *MemoryStore) ListEvents(_ context.Context, filter domain.EventFilter) ([]domain.Event, error) {
	var events []domain.Event
	for _, record := range m.Records {
		for _, event := range record.Events {
			if filter.From != "" && event.Date < filter.From {
				continue
			}
			if filter.To != "" && event.Date > filter.To {
				continue
			}
			events = append(events, event)
		}
	}
	sort.Slice(events, func(i, j int) bool { return events[i].StartAt < events[j].StartAt })
	return events, nil
}

func (m *MemoryStore) CreateEvent(_ context.Context, event domain.Event) (domain.Event, error) {
	record := m.ensureRecord(event.Date)
	record.Events = append(record.Events, event)
	sort.Slice(record.Events, func(i, j int) bool { return record.Events[i].StartAt < record.Events[j].StartAt })
	m.Records[event.Date] = record
	return event, nil
}

func (m *MemoryStore) UpdateEvent(_ context.Context, id string, input domain.EventInput) (domain.Event, error) {
	var found bool
	for date, record := range m.Records {
		for i, event := range record.Events {
			if event.ID == id {
				record.Events = append(record.Events[:i], record.Events[i+1:]...)
				m.Records[date] = record
				found = true
				break
			}
		}
		if found {
			break
		}
	}
	if !found {
		return domain.Event{}, fmt.Errorf("%w: event %s", service.ErrNotFound, id)
	}
	updated := domain.Event{ID: id, Title: input.Title, StartAt: input.StartAt, EndAt: input.EndAt, Date: input.Date, Completed: input.Completed, Notes: input.Notes, IsFocus: input.IsFocus}
	record := m.ensureRecord(input.Date)
	record.Events = append(record.Events, updated)
	sort.Slice(record.Events, func(i, j int) bool { return record.Events[i].StartAt < record.Events[j].StartAt })
	m.Records[input.Date] = record
	return updated, nil
}

func (m *MemoryStore) DeleteEvent(_ context.Context, id string) error {
	for date, record := range m.Records {
		for i, event := range record.Events {
			if event.ID == id {
				record.Events = append(record.Events[:i], record.Events[i+1:]...)
				m.Records[date] = record
				return nil
			}
		}
	}
	return nil
}

func (m *MemoryStore) UpdateJournalEntry(_ context.Context, date string, input domain.JournalEntryInput) (domain.JournalEntry, error) {
	record := m.ensureRecord(date)
	record.JournalEntry = domain.JournalEntry{Date: date, Title: input.Title, Content: input.Content}
	m.Records[date] = record
	return record.JournalEntry, nil
}

func (m *MemoryStore) UpdateDailySummary(_ context.Context, date string, patch domain.DailySummaryPatch) (domain.DailySummary, error) {
	record := m.ensureRecord(date)
	if patch.Mood != nil {
		record.DailySummary.Mood = *patch.Mood
	}
	if patch.Wins != nil {
		record.DailySummary.Wins = *patch.Wins
	}
	if patch.Blockers != nil {
		record.DailySummary.Blockers = *patch.Blockers
	}
	if patch.NextFocus != nil {
		record.DailySummary.NextFocus = *patch.NextFocus
	}
	if patch.Content != nil {
		record.DailySummary.Content = *patch.Content
	}
	m.Records[date] = record
	return record.DailySummary, nil
}

func (m *MemoryStore) CreateLogEntry(_ context.Context, entry domain.LogEntry) (domain.LogEntry, error) {
	record := m.ensureRecord(entry.Date)
	record.LogEntries = append(record.LogEntries, entry)
	sort.Slice(record.LogEntries, func(i, j int) bool { return record.LogEntries[i].Time < record.LogEntries[j].Time })
	m.Records[entry.Date] = record
	return entry, nil
}

func (m *MemoryStore) UpdateLogEntry(_ context.Context, id string, input domain.LogEntryInput) (domain.LogEntry, error) {
	var found bool
	for date, record := range m.Records {
		for i, entry := range record.LogEntries {
			if entry.ID == id {
				record.LogEntries = append(record.LogEntries[:i], record.LogEntries[i+1:]...)
				m.Records[date] = record
				found = true
				break
			}
		}
		if found {
			break
		}
	}
	if !found {
		return domain.LogEntry{}, fmt.Errorf("%w: log entry %s", service.ErrNotFound, id)
	}
	updated := domain.LogEntry{ID: id, Date: input.Date, Time: input.Time, Title: input.Title, Notes: input.Notes, IsHighlight: input.IsHighlight, SourceType: input.SourceType, SourceID: input.SourceID}
	record := m.ensureRecord(input.Date)
	record.LogEntries = append(record.LogEntries, updated)
	sort.Slice(record.LogEntries, func(i, j int) bool { return record.LogEntries[i].Time < record.LogEntries[j].Time })
	m.Records[input.Date] = record
	return updated, nil
}

func (m *MemoryStore) DeleteLogEntry(_ context.Context, id string) error {
	for date, record := range m.Records {
		for i, entry := range record.LogEntries {
			if entry.ID == id {
				record.LogEntries = append(record.LogEntries[:i], record.LogEntries[i+1:]...)
				m.Records[date] = record
				return nil
			}
		}
	}
	return nil
}

func (m *MemoryStore) ensureRecord(date string) domain.DayRecord {
	record, ok := m.Records[date]
	if !ok {
		record = emptyRecord(date)
	}
	return record
}

func emptyRecord(date string) domain.DayRecord {
	return domain.DayRecord{
		Date: date,
		JournalEntry: domain.JournalEntry{
			Date: date,
		},
		LogEntries: []domain.LogEntry{},
		DailySummary: domain.DailySummary{
			Date:      date,
			Mood:      "steady",
			Wins:      []string{},
			Blockers:  []string{},
			NextFocus: []string{},
		},
		Tasks:  []domain.Task{},
		Events: []domain.Event{},
	}
}

func SeedRecords() []domain.DayRecord {
	notes := "保留总览感"
	focus := true
	return []domain.DayRecord{
		{
			Date: "2026-05-07",
			JournalEntry: domain.JournalEntry{
				Date:    "2026-05-07",
				Title:   "seed",
				Content: "hello",
			},
			LogEntries: []domain.LogEntry{
				{ID: "log-1", Date: "2026-05-07", Time: "16:40", Title: "log", IsHighlight: true, SourceType: "event"},
			},
			DailySummary: domain.DailySummary{
				Date:      "2026-05-07",
				Mood:      "focused",
				Wins:      []string{"a"},
				Blockers:  []string{"b"},
				NextFocus: []string{"c"},
				Content:   "summary",
			},
			Tasks: []domain.Task{
				{ID: "task-1", Title: "task", Status: "done", Priority: "high", DueAt: "2026-05-07T11:00:00", Date: "2026-05-07", Notes: &notes},
			},
			Events: []domain.Event{
				{ID: "event-1", Title: "event", StartAt: "2026-05-07T09:00:00", EndAt: "2026-05-07T09:30:00", Date: "2026-05-07", Completed: true, IsFocus: &focus},
			},
		},
		{
			Date: "2026-05-12",
			Tasks: []domain.Task{
				{ID: "task-2", Title: "future", Status: "todo", Priority: "medium", DueAt: "2026-05-12T20:00:00", Date: "2026-05-12"},
			},
			DailySummary: domain.DailySummary{
				Date:      "2026-05-12",
				Mood:      "steady",
				Wins:      []string{},
				Blockers:  []string{},
				NextFocus: []string{},
			},
			JournalEntry: domain.JournalEntry{Date: "2026-05-12"},
			LogEntries:   []domain.LogEntry{},
			Events: []domain.Event{
				{ID: "event-2", Title: "week", StartAt: time.Date(2026, 5, 12, 10, 0, 0, 0, time.UTC).Format("2006-01-02T15:04:05"), EndAt: time.Date(2026, 5, 12, 11, 0, 0, 0, time.UTC).Format("2006-01-02T15:04:05"), Date: "2026-05-12", Completed: false},
			},
		},
	}
}
