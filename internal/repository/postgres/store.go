package postgres

import (
	"context"
	"errors"
	"fmt"
	"sort"
	"strings"

	"daily-log/internal/domain"
	"daily-log/internal/service"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Store struct {
	pool *pgxpool.Pool
}

func New(ctx context.Context, databaseURL string) (*Store, error) {
	pool, err := pgxpool.New(ctx, databaseURL)
	if err != nil {
		return nil, err
	}
	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, err
	}
	return &Store{pool: pool}, nil
}

func (s *Store) Pool() *pgxpool.Pool {
	return s.pool
}

func (s *Store) Close() {
	s.pool.Close()
}

func (s *Store) Ping(ctx context.Context) error {
	return s.pool.Ping(ctx)
}

func (s *Store) ListDayRecords(ctx context.Context, filter domain.DayRecordFilter) ([]domain.DayRecord, error) {
	args := []any{}
	where := []string{}
	if filter.From != "" {
		args = append(args, filter.From)
		where = append(where, fmt.Sprintf("date >= $%d", len(args)))
	}
	if filter.To != "" {
		args = append(args, filter.To)
		where = append(where, fmt.Sprintf("date <= $%d", len(args)))
	}
	query := `SELECT date FROM day_records`
	if len(where) > 0 {
		query += " WHERE " + strings.Join(where, " AND ")
	}
	query += " ORDER BY date"

	rows, err := s.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var dates []string
	for rows.Next() {
		var date string
		if err := rows.Scan(&date); err != nil {
			return nil, err
		}
		dates = append(dates, date)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	if len(dates) == 0 {
		return []domain.DayRecord{}, nil
	}
	records, err := s.composeDayRecords(ctx, dates)
	if err != nil {
		return nil, err
	}
	return records, nil
}

func (s *Store) GetDayRecord(ctx context.Context, date string) (domain.DayRecord, error) {
	var exists bool
	if err := s.pool.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM day_records WHERE date = $1)`, date).Scan(&exists); err != nil {
		return domain.DayRecord{}, err
	}
	if !exists {
		return emptyDayRecord(date), nil
	}
	records, err := s.composeDayRecords(ctx, []string{date})
	if err != nil {
		return domain.DayRecord{}, err
	}
	if len(records) == 0 {
		return emptyDayRecord(date), nil
	}
	return records[0], nil
}

func (s *Store) ListTasks(ctx context.Context, filter domain.TaskFilter) ([]domain.Task, error) {
	args := []any{}
	where := []string{}
	if filter.From != "" {
		args = append(args, filter.From)
		where = append(where, fmt.Sprintf("date >= $%d", len(args)))
	}
	if filter.To != "" {
		args = append(args, filter.To)
		where = append(where, fmt.Sprintf("date <= $%d", len(args)))
	}
	if filter.Status != "" {
		args = append(args, filter.Status)
		where = append(where, fmt.Sprintf("status = $%d", len(args)))
	}
	query := `SELECT id, title, status, priority, due_at, date, notes, is_focus FROM tasks`
	if len(where) > 0 {
		query += " WHERE " + strings.Join(where, " AND ")
	}
	query += " ORDER BY due_at"

	rows, err := s.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tasks []domain.Task
	for rows.Next() {
		task, err := scanTask(rows)
		if err != nil {
			return nil, err
		}
		tasks = append(tasks, task)
	}
	return tasks, rows.Err()
}

func (s *Store) CreateTask(ctx context.Context, task domain.Task) (domain.Task, error) {
	if err := s.ensureDayRecord(ctx, task.Date); err != nil {
		return domain.Task{}, err
	}
	row := s.pool.QueryRow(ctx, `
		INSERT INTO tasks(id, title, status, priority, due_at, date, notes, is_focus)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
		RETURNING id, title, status, priority, due_at, date, notes, is_focus
	`, task.ID, task.Title, task.Status, task.Priority, task.DueAt, task.Date, task.Notes, task.IsFocus)
	return scanTaskRow(row)
}

func (s *Store) UpdateTask(ctx context.Context, id string, input domain.TaskInput) (domain.Task, error) {
	if err := s.ensureDayRecord(ctx, input.Date); err != nil {
		return domain.Task{}, err
	}
	row := s.pool.QueryRow(ctx, `
		UPDATE tasks
		SET title = $2, status = $3, priority = $4, due_at = $5, date = $6, notes = $7, is_focus = $8
		WHERE id = $1
		RETURNING id, title, status, priority, due_at, date, notes, is_focus
	`, id, input.Title, input.Status, input.Priority, input.DueAt, input.Date, input.Notes, input.IsFocus)
	task, err := scanTaskRow(row)
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.Task{}, fmt.Errorf("%w: task %s", service.ErrNotFound, id)
	}
	return task, err
}

func (s *Store) DeleteTask(ctx context.Context, id string) error {
	_, err := s.pool.Exec(ctx, `DELETE FROM tasks WHERE id = $1`, id)
	return err
}

func (s *Store) ListEvents(ctx context.Context, filter domain.EventFilter) ([]domain.Event, error) {
	args := []any{}
	where := []string{}
	if filter.From != "" {
		args = append(args, filter.From)
		where = append(where, fmt.Sprintf("date >= $%d", len(args)))
	}
	if filter.To != "" {
		args = append(args, filter.To)
		where = append(where, fmt.Sprintf("date <= $%d", len(args)))
	}
	query := `SELECT id, title, start_at, end_at, date, completed, notes, is_focus FROM events`
	if len(where) > 0 {
		query += " WHERE " + strings.Join(where, " AND ")
	}
	query += " ORDER BY start_at"

	rows, err := s.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var events []domain.Event
	for rows.Next() {
		event, err := scanEvent(rows)
		if err != nil {
			return nil, err
		}
		events = append(events, event)
	}
	return events, rows.Err()
}

func (s *Store) CreateEvent(ctx context.Context, event domain.Event) (domain.Event, error) {
	if err := s.ensureDayRecord(ctx, event.Date); err != nil {
		return domain.Event{}, err
	}
	row := s.pool.QueryRow(ctx, `
		INSERT INTO events(id, title, start_at, end_at, date, completed, notes, is_focus)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
		RETURNING id, title, start_at, end_at, date, completed, notes, is_focus
	`, event.ID, event.Title, event.StartAt, event.EndAt, event.Date, event.Completed, event.Notes, event.IsFocus)
	return scanEventRow(row)
}

func (s *Store) UpdateEvent(ctx context.Context, id string, input domain.EventInput) (domain.Event, error) {
	if err := s.ensureDayRecord(ctx, input.Date); err != nil {
		return domain.Event{}, err
	}
	row := s.pool.QueryRow(ctx, `
		UPDATE events
		SET title = $2, start_at = $3, end_at = $4, date = $5, completed = $6, notes = $7, is_focus = $8
		WHERE id = $1
		RETURNING id, title, start_at, end_at, date, completed, notes, is_focus
	`, id, input.Title, input.StartAt, input.EndAt, input.Date, input.Completed, input.Notes, input.IsFocus)
	event, err := scanEventRow(row)
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.Event{}, fmt.Errorf("%w: event %s", service.ErrNotFound, id)
	}
	return event, err
}

func (s *Store) DeleteEvent(ctx context.Context, id string) error {
	_, err := s.pool.Exec(ctx, `DELETE FROM events WHERE id = $1`, id)
	return err
}

func (s *Store) UpdateJournalEntry(ctx context.Context, date string, input domain.JournalEntryInput) (domain.JournalEntry, error) {
	if err := s.ensureDayRecord(ctx, date); err != nil {
		return domain.JournalEntry{}, err
	}
	row := s.pool.QueryRow(ctx, `
		INSERT INTO journal_entries(date, title, content)
		VALUES ($1,$2,$3)
		ON CONFLICT (date) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content
		RETURNING date, title, content
	`, date, input.Title, input.Content)
	var entry domain.JournalEntry
	err := row.Scan(&entry.Date, &entry.Title, &entry.Content)
	return entry, err
}

func (s *Store) UpdateDailySummary(ctx context.Context, date string, patch domain.DailySummaryPatch) (domain.DailySummary, error) {
	if err := s.ensureDayRecord(ctx, date); err != nil {
		return domain.DailySummary{}, err
	}
	current, err := s.getDailySummary(ctx, date)
	if err != nil {
		return domain.DailySummary{}, err
	}
	if patch.Mood != nil {
		current.Mood = *patch.Mood
	}
	if patch.Wins != nil {
		current.Wins = *patch.Wins
	}
	if patch.Blockers != nil {
		current.Blockers = *patch.Blockers
	}
	if patch.NextFocus != nil {
		current.NextFocus = *patch.NextFocus
	}
	if patch.Content != nil {
		current.Content = *patch.Content
	}

	row := s.pool.QueryRow(ctx, `
		INSERT INTO daily_summaries(date, mood, wins, blockers, next_focus, content)
		VALUES ($1,$2,$3,$4,$5,$6)
		ON CONFLICT (date) DO UPDATE
		SET mood = EXCLUDED.mood, wins = EXCLUDED.wins, blockers = EXCLUDED.blockers, next_focus = EXCLUDED.next_focus, content = EXCLUDED.content
		RETURNING date, mood, wins, blockers, next_focus, content
	`, current.Date, current.Mood, current.Wins, current.Blockers, current.NextFocus, current.Content)
	return scanDailySummaryRow(row)
}

func (s *Store) CreateLogEntry(ctx context.Context, entry domain.LogEntry) (domain.LogEntry, error) {
	if err := s.ensureDayRecord(ctx, entry.Date); err != nil {
		return domain.LogEntry{}, err
	}
	row := s.pool.QueryRow(ctx, `
		INSERT INTO log_entries(id, date, time, title, notes, is_highlight, source_type, source_id)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
		RETURNING id, date, time, title, notes, is_highlight, source_type, source_id
	`, entry.ID, entry.Date, entry.Time, entry.Title, entry.Notes, entry.IsHighlight, entry.SourceType, entry.SourceID)
	return scanLogEntryRow(row)
}

func (s *Store) UpdateLogEntry(ctx context.Context, id string, input domain.LogEntryInput) (domain.LogEntry, error) {
	if err := s.ensureDayRecord(ctx, input.Date); err != nil {
		return domain.LogEntry{}, err
	}
	row := s.pool.QueryRow(ctx, `
		UPDATE log_entries
		SET date = $2, time = $3, title = $4, notes = $5, is_highlight = $6, source_type = $7, source_id = $8
		WHERE id = $1
		RETURNING id, date, time, title, notes, is_highlight, source_type, source_id
	`, id, input.Date, input.Time, input.Title, input.Notes, input.IsHighlight, input.SourceType, input.SourceID)
	entry, err := scanLogEntryRow(row)
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.LogEntry{}, fmt.Errorf("%w: log entry %s", service.ErrNotFound, id)
	}
	return entry, err
}

func (s *Store) DeleteLogEntry(ctx context.Context, id string) error {
	_, err := s.pool.Exec(ctx, `DELETE FROM log_entries WHERE id = $1`, id)
	return err
}

func (s *Store) ImportSeedRecords(ctx context.Context, records []domain.DayRecord) error {
	var count int
	if err := s.pool.QueryRow(ctx, `SELECT COUNT(*) FROM day_records`).Scan(&count); err != nil {
		return err
	}
	if count > 0 {
		return nil
	}

	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	for _, record := range records {
		if err := ensureDayRecordTx(ctx, tx, record.Date); err != nil {
			return err
		}
		if _, err := tx.Exec(ctx, `
			INSERT INTO journal_entries(date, title, content)
			VALUES ($1,$2,$3)
			ON CONFLICT (date) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content
		`, record.Date, record.JournalEntry.Title, record.JournalEntry.Content); err != nil {
			return err
		}
		if _, err := tx.Exec(ctx, `
			INSERT INTO daily_summaries(date, mood, wins, blockers, next_focus, content)
			VALUES ($1,$2,$3,$4,$5,$6)
			ON CONFLICT (date) DO UPDATE
			SET mood = EXCLUDED.mood, wins = EXCLUDED.wins, blockers = EXCLUDED.blockers, next_focus = EXCLUDED.next_focus, content = EXCLUDED.content
		`, record.Date, record.DailySummary.Mood, record.DailySummary.Wins, record.DailySummary.Blockers, record.DailySummary.NextFocus, record.DailySummary.Content); err != nil {
			return err
		}
		for _, task := range record.Tasks {
			if _, err := tx.Exec(ctx, `
				INSERT INTO tasks(id, title, status, priority, due_at, date, notes, is_focus)
				VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
			`, task.ID, task.Title, task.Status, task.Priority, task.DueAt, task.Date, task.Notes, task.IsFocus); err != nil {
				return err
			}
		}
		for _, event := range record.Events {
			if _, err := tx.Exec(ctx, `
				INSERT INTO events(id, title, start_at, end_at, date, completed, notes, is_focus)
				VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
			`, event.ID, event.Title, event.StartAt, event.EndAt, event.Date, event.Completed, event.Notes, event.IsFocus); err != nil {
				return err
			}
		}
		for _, entry := range record.LogEntries {
			if _, err := tx.Exec(ctx, `
				INSERT INTO log_entries(id, date, time, title, notes, is_highlight, source_type, source_id)
				VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
			`, entry.ID, entry.Date, entry.Time, entry.Title, entry.Notes, entry.IsHighlight, entry.SourceType, entry.SourceID); err != nil {
				return err
			}
		}
	}

	return tx.Commit(ctx)
}

func (s *Store) ensureDayRecord(ctx context.Context, date string) error {
	_, err := s.pool.Exec(ctx, `
		INSERT INTO day_records(date) VALUES ($1)
		ON CONFLICT (date) DO NOTHING
	`, date)
	if err != nil {
		return err
	}
	_, err = s.pool.Exec(ctx, `
		INSERT INTO journal_entries(date, title, content) VALUES ($1, '', '')
		ON CONFLICT (date) DO NOTHING
	`, date)
	if err != nil {
		return err
	}
	_, err = s.pool.Exec(ctx, `
		INSERT INTO daily_summaries(date, mood, wins, blockers, next_focus, content)
		VALUES ($1, 'steady', '{}', '{}', '{}', '')
		ON CONFLICT (date) DO NOTHING
	`, date)
	return err
}

func ensureDayRecordTx(ctx context.Context, tx pgx.Tx, date string) error {
	if _, err := tx.Exec(ctx, `INSERT INTO day_records(date) VALUES ($1) ON CONFLICT (date) DO NOTHING`, date); err != nil {
		return err
	}
	if _, err := tx.Exec(ctx, `INSERT INTO journal_entries(date, title, content) VALUES ($1, '', '') ON CONFLICT (date) DO NOTHING`, date); err != nil {
		return err
	}
	_, err := tx.Exec(ctx, `INSERT INTO daily_summaries(date, mood, wins, blockers, next_focus, content) VALUES ($1, 'steady', '{}', '{}', '{}', '') ON CONFLICT (date) DO NOTHING`, date)
	return err
}

func (s *Store) getDailySummary(ctx context.Context, date string) (domain.DailySummary, error) {
	row := s.pool.QueryRow(ctx, `SELECT date, mood, wins, blockers, next_focus, content FROM daily_summaries WHERE date = $1`, date)
	summary, err := scanDailySummaryRow(row)
	if errors.Is(err, pgx.ErrNoRows) {
		return emptyDayRecord(date).DailySummary, nil
	}
	return summary, err
}

func (s *Store) composeDayRecords(ctx context.Context, dates []string) ([]domain.DayRecord, error) {
	recordMap := make(map[string]*domain.DayRecord, len(dates))
	for _, date := range dates {
		record := emptyDayRecord(date)
		recordMap[date] = &record
	}

	journalRows, err := s.pool.Query(ctx, `SELECT date, title, content FROM journal_entries WHERE date = ANY($1)`, dates)
	if err != nil {
		return nil, err
	}
	for journalRows.Next() {
		var entry domain.JournalEntry
		if err := journalRows.Scan(&entry.Date, &entry.Title, &entry.Content); err != nil {
			journalRows.Close()
			return nil, err
		}
		recordMap[entry.Date].JournalEntry = entry
	}
	journalRows.Close()

	summaryRows, err := s.pool.Query(ctx, `SELECT date, mood, wins, blockers, next_focus, content FROM daily_summaries WHERE date = ANY($1)`, dates)
	if err != nil {
		return nil, err
	}
	for summaryRows.Next() {
		summary, err := scanDailySummary(summaryRows)
		if err != nil {
			summaryRows.Close()
			return nil, err
		}
		recordMap[summary.Date].DailySummary = summary
	}
	summaryRows.Close()

	taskRows, err := s.pool.Query(ctx, `SELECT id, title, status, priority, due_at, date, notes, is_focus FROM tasks WHERE date = ANY($1) ORDER BY due_at`, dates)
	if err != nil {
		return nil, err
	}
	for taskRows.Next() {
		task, err := scanTask(taskRows)
		if err != nil {
			taskRows.Close()
			return nil, err
		}
		recordMap[task.Date].Tasks = append(recordMap[task.Date].Tasks, task)
	}
	taskRows.Close()

	eventRows, err := s.pool.Query(ctx, `SELECT id, title, start_at, end_at, date, completed, notes, is_focus FROM events WHERE date = ANY($1) ORDER BY start_at`, dates)
	if err != nil {
		return nil, err
	}
	for eventRows.Next() {
		event, err := scanEvent(eventRows)
		if err != nil {
			eventRows.Close()
			return nil, err
		}
		recordMap[event.Date].Events = append(recordMap[event.Date].Events, event)
	}
	eventRows.Close()

	logRows, err := s.pool.Query(ctx, `SELECT id, date, time, title, notes, is_highlight, source_type, source_id FROM log_entries WHERE date = ANY($1) ORDER BY time`, dates)
	if err != nil {
		return nil, err
	}
	for logRows.Next() {
		entry, err := scanLogEntry(logRows)
		if err != nil {
			logRows.Close()
			return nil, err
		}
		recordMap[entry.Date].LogEntries = append(recordMap[entry.Date].LogEntries, entry)
	}
	logRows.Close()

	records := make([]domain.DayRecord, 0, len(dates))
	for _, date := range dates {
		records = append(records, *recordMap[date])
	}
	sort.Slice(records, func(i, j int) bool {
		return records[i].Date < records[j].Date
	})
	return records, nil
}

func emptyDayRecord(date string) domain.DayRecord {
	return domain.DayRecord{
		Date: date,
		JournalEntry: domain.JournalEntry{
			Date:    date,
			Title:   "",
			Content: "",
		},
		LogEntries: []domain.LogEntry{},
		DailySummary: domain.DailySummary{
			Date:      date,
			Mood:      "steady",
			Wins:      []string{},
			Blockers:  []string{},
			NextFocus: []string{},
			Content:   "",
		},
		Tasks:  []domain.Task{},
		Events: []domain.Event{},
	}
}

type scanner interface {
	Scan(dest ...any) error
}

func scanTaskRow(row pgx.Row) (domain.Task, error)                 { return scanTask(row) }
func scanEventRow(row pgx.Row) (domain.Event, error)               { return scanEvent(row) }
func scanLogEntryRow(row pgx.Row) (domain.LogEntry, error)         { return scanLogEntry(row) }
func scanDailySummaryRow(row pgx.Row) (domain.DailySummary, error) { return scanDailySummary(row) }

func scanTask(row scanner) (domain.Task, error) {
	var task domain.Task
	err := row.Scan(&task.ID, &task.Title, &task.Status, &task.Priority, &task.DueAt, &task.Date, &task.Notes, &task.IsFocus)
	return task, err
}

func scanEvent(row scanner) (domain.Event, error) {
	var event domain.Event
	err := row.Scan(&event.ID, &event.Title, &event.StartAt, &event.EndAt, &event.Date, &event.Completed, &event.Notes, &event.IsFocus)
	return event, err
}

func scanLogEntry(row scanner) (domain.LogEntry, error) {
	var entry domain.LogEntry
	err := row.Scan(&entry.ID, &entry.Date, &entry.Time, &entry.Title, &entry.Notes, &entry.IsHighlight, &entry.SourceType, &entry.SourceID)
	return entry, err
}

func scanDailySummary(row scanner) (domain.DailySummary, error) {
	var summary domain.DailySummary
	err := row.Scan(&summary.Date, &summary.Mood, &summary.Wins, &summary.Blockers, &summary.NextFocus, &summary.Content)
	return summary, err
}
