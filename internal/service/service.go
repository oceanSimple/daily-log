package service

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"time"

	"daily-log/internal/domain"
	"daily-log/internal/repository"
)

var (
	ErrInvalidInput = errors.New("invalid input")
	ErrNotFound     = errors.New("not found")
)

type Service struct {
	store repository.Store
	now   func() time.Time
}

func New(store repository.Store, now func() time.Time) *Service {
	return &Service{store: store, now: now}
}

func (s *Service) Ping(ctx context.Context) error {
	return s.store.Ping(ctx)
}

func (s *Service) ListDayRecords(ctx context.Context, filter domain.DayRecordFilter) ([]domain.DayRecord, error) {
	if err := validateDayRecordFilter(filter); err != nil {
		return nil, err
	}
	return s.store.ListDayRecords(ctx, filter)
}

func (s *Service) GetDayRecord(ctx context.Context, date string) (domain.DayRecord, error) {
	if err := validateDate(date); err != nil {
		return domain.DayRecord{}, err
	}
	return s.store.GetDayRecord(ctx, date)
}

func (s *Service) GetDashboard(ctx context.Context) (domain.Dashboard, error) {
	today := toDateKey(s.now())
	todayRecord, err := s.store.GetDayRecord(ctx, today)
	if err != nil {
		return domain.Dashboard{}, err
	}

	tasks, err := s.store.ListTasks(ctx, domain.TaskFilter{From: today})
	if err != nil {
		return domain.Dashboard{}, err
	}
	upcoming := make([]domain.Task, 0, len(tasks))
	for _, task := range tasks {
		if task.Status != "done" && task.DueAt >= today+"T00:00:00" {
			upcoming = append(upcoming, task)
		}
	}

	weekStart := startOfWeek(today)
	weekEnd := weekStart.AddDate(0, 0, 6)
	events, err := s.store.ListEvents(ctx, domain.EventFilter{
		From: toDateKey(weekStart),
		To:   toDateKey(weekEnd),
	})
	if err != nil {
		return domain.Dashboard{}, err
	}

	eventsByDate := make(map[string][]domain.Event, 7)
	for _, event := range events {
		eventsByDate[event.Date] = append(eventsByDate[event.Date], event)
	}

	currentWeek := make([]domain.CurrentWeekEvent, 0, 7)
	for i := 0; i < 7; i++ {
		current := weekStart.AddDate(0, 0, i)
		date := toDateKey(current)
		currentWeek = append(currentWeek, domain.CurrentWeekEvent{
			Date:   date,
			Events: eventsByDate[date],
		})
	}

	return domain.Dashboard{
		TodayRecord:       todayRecord,
		UpcomingTasks:     upcoming,
		CurrentWeekEvents: currentWeek,
	}, nil
}

func (s *Service) ListTasks(ctx context.Context, filter domain.TaskFilter) ([]domain.Task, error) {
	if err := validateTaskFilter(filter); err != nil {
		return nil, err
	}
	return s.store.ListTasks(ctx, filter)
}

func (s *Service) CreateTask(ctx context.Context, input domain.TaskInput) (domain.Task, error) {
	if err := validateTaskInput(input); err != nil {
		return domain.Task{}, err
	}
	return s.store.CreateTask(ctx, domain.Task{
		ID:       newID("task"),
		Title:    input.Title,
		Status:   input.Status,
		Priority: input.Priority,
		DueAt:    input.DueAt,
		Date:     input.Date,
		Notes:    input.Notes,
		IsFocus:  input.IsFocus,
	})
}

func (s *Service) UpdateTask(ctx context.Context, taskID string, input domain.TaskInput) (domain.Task, error) {
	if taskID == "" {
		return domain.Task{}, fmt.Errorf("%w: task id is required", ErrInvalidInput)
	}
	if err := validateTaskInput(input); err != nil {
		return domain.Task{}, err
	}
	return s.store.UpdateTask(ctx, taskID, input)
}

func (s *Service) DeleteTask(ctx context.Context, taskID string) error {
	if taskID == "" {
		return fmt.Errorf("%w: task id is required", ErrInvalidInput)
	}
	return s.store.DeleteTask(ctx, taskID)
}

func (s *Service) ListEvents(ctx context.Context, filter domain.EventFilter) ([]domain.Event, error) {
	if err := validateEventFilter(filter); err != nil {
		return nil, err
	}
	return s.store.ListEvents(ctx, filter)
}

func (s *Service) CreateEvent(ctx context.Context, input domain.EventInput) (domain.Event, error) {
	if err := validateEventInput(input); err != nil {
		return domain.Event{}, err
	}
	return s.store.CreateEvent(ctx, domain.Event{
		ID:        newID("event"),
		Title:     input.Title,
		StartAt:   input.StartAt,
		EndAt:     input.EndAt,
		Date:      input.Date,
		Completed: input.Completed,
		Notes:     input.Notes,
		IsFocus:   input.IsFocus,
	})
}

func (s *Service) UpdateEvent(ctx context.Context, eventID string, input domain.EventInput) (domain.Event, error) {
	if eventID == "" {
		return domain.Event{}, fmt.Errorf("%w: event id is required", ErrInvalidInput)
	}
	if err := validateEventInput(input); err != nil {
		return domain.Event{}, err
	}
	return s.store.UpdateEvent(ctx, eventID, input)
}

func (s *Service) DeleteEvent(ctx context.Context, eventID string) error {
	if eventID == "" {
		return fmt.Errorf("%w: event id is required", ErrInvalidInput)
	}
	return s.store.DeleteEvent(ctx, eventID)
}

func (s *Service) UpdateJournalEntry(ctx context.Context, date string, input domain.JournalEntryInput) (domain.JournalEntry, error) {
	if err := validateDate(date); err != nil {
		return domain.JournalEntry{}, err
	}
	return s.store.UpdateJournalEntry(ctx, date, input)
}

func (s *Service) UpdateDailySummary(ctx context.Context, date string, patch domain.DailySummaryPatch) (domain.DailySummary, error) {
	if err := validateDate(date); err != nil {
		return domain.DailySummary{}, err
	}
	if patch.Mood != nil && !oneOf(*patch.Mood, "steady", "focused", "energized", "tired") {
		return domain.DailySummary{}, fmt.Errorf("%w: invalid mood", ErrInvalidInput)
	}
	return s.store.UpdateDailySummary(ctx, date, patch)
}

func (s *Service) CreateLogEntry(ctx context.Context, input domain.LogEntryInput) (domain.LogEntry, error) {
	if err := validateLogEntryInput(input); err != nil {
		return domain.LogEntry{}, err
	}
	return s.store.CreateLogEntry(ctx, domain.LogEntry{
		ID:          newID("log"),
		Date:        input.Date,
		Time:        input.Time,
		Title:       input.Title,
		Notes:       input.Notes,
		IsHighlight: input.IsHighlight,
		SourceType:  input.SourceType,
		SourceID:    input.SourceID,
	})
}

func (s *Service) UpdateLogEntry(ctx context.Context, entryID string, input domain.LogEntryInput) (domain.LogEntry, error) {
	if entryID == "" {
		return domain.LogEntry{}, fmt.Errorf("%w: log entry id is required", ErrInvalidInput)
	}
	if err := validateLogEntryInput(input); err != nil {
		return domain.LogEntry{}, err
	}
	return s.store.UpdateLogEntry(ctx, entryID, input)
}

func (s *Service) DeleteLogEntry(ctx context.Context, entryID string) error {
	if entryID == "" {
		return fmt.Errorf("%w: log entry id is required", ErrInvalidInput)
	}
	return s.store.DeleteLogEntry(ctx, entryID)
}

func validateDayRecordFilter(filter domain.DayRecordFilter) error {
	if filter.From != "" {
		if err := validateDate(filter.From); err != nil {
			return err
		}
	}
	if filter.To != "" {
		if err := validateDate(filter.To); err != nil {
			return err
		}
	}
	return nil
}

func validateTaskFilter(filter domain.TaskFilter) error {
	if err := validateDayRecordFilter(domain.DayRecordFilter{From: filter.From, To: filter.To}); err != nil {
		return err
	}
	if filter.Status != "" && !oneOf(filter.Status, "todo", "in_progress", "done") {
		return fmt.Errorf("%w: invalid task status", ErrInvalidInput)
	}
	return nil
}

func validateEventFilter(filter domain.EventFilter) error {
	return validateDayRecordFilter(domain.DayRecordFilter{From: filter.From, To: filter.To})
}

func validateTaskInput(input domain.TaskInput) error {
	if input.Title == "" {
		return fmt.Errorf("%w: title is required", ErrInvalidInput)
	}
	if err := validateDate(input.Date); err != nil {
		return err
	}
	if err := validateDateTime(input.DueAt); err != nil {
		return err
	}
	if !oneOf(input.Status, "todo", "in_progress", "done") {
		return fmt.Errorf("%w: invalid task status", ErrInvalidInput)
	}
	if !oneOf(input.Priority, "low", "medium", "high") {
		return fmt.Errorf("%w: invalid task priority", ErrInvalidInput)
	}
	return nil
}

func validateEventInput(input domain.EventInput) error {
	if input.Title == "" {
		return fmt.Errorf("%w: title is required", ErrInvalidInput)
	}
	if err := validateDate(input.Date); err != nil {
		return err
	}
	if err := validateDateTime(input.StartAt); err != nil {
		return err
	}
	if err := validateDateTime(input.EndAt); err != nil {
		return err
	}
	if input.EndAt < input.StartAt {
		return fmt.Errorf("%w: endAt must be after startAt", ErrInvalidInput)
	}
	return nil
}

func validateLogEntryInput(input domain.LogEntryInput) error {
	if input.Title == "" {
		return fmt.Errorf("%w: title is required", ErrInvalidInput)
	}
	if err := validateDate(input.Date); err != nil {
		return err
	}
	if _, err := time.Parse("15:04", input.Time); err != nil {
		return fmt.Errorf("%w: invalid time", ErrInvalidInput)
	}
	if !oneOf(input.SourceType, "task", "event") {
		return fmt.Errorf("%w: invalid sourceType", ErrInvalidInput)
	}
	return nil
}

func validateDate(date string) error {
	if _, err := time.Parse("2006-01-02", date); err != nil {
		return fmt.Errorf("%w: invalid date", ErrInvalidInput)
	}
	return nil
}

func validateDateTime(value string) error {
	if _, err := time.Parse("2006-01-02T15:04:05", value); err != nil {
		return fmt.Errorf("%w: invalid datetime", ErrInvalidInput)
	}
	return nil
}

func oneOf(value string, choices ...string) bool {
	for _, choice := range choices {
		if value == choice {
			return true
		}
	}
	return false
}

func newID(prefix string) string {
	buf := make([]byte, 4)
	if _, err := rand.Read(buf); err != nil {
		return fmt.Sprintf("%s-%d", prefix, time.Now().UnixNano())
	}
	return fmt.Sprintf("%s-%d-%s", prefix, time.Now().UnixMilli(), hex.EncodeToString(buf))
}

func startOfWeek(now string) time.Time {
	current, _ := time.Parse("2006-01-02", now)
	day := current.Weekday()
	diff := 1 - int(day)
	if day == time.Sunday {
		diff = -6
	}
	return current.AddDate(0, 0, diff)
}

func toDateKey(value time.Time) string {
	return value.Format("2006-01-02")
}
