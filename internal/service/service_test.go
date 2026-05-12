package service_test

import (
	"context"
	"testing"
	"time"

	"daily-log/internal/domain"
	"daily-log/internal/service"
	"daily-log/internal/testutil"
)

func TestGetDashboard(t *testing.T) {
	store := testutil.NewMemoryStore(testutil.SeedRecords())
	svc := service.New(store, func() time.Time {
		return time.Date(2026, 5, 12, 12, 0, 0, 0, time.UTC)
	})

	result, err := svc.GetDashboard(context.Background())
	if err != nil {
		t.Fatalf("GetDashboard error = %v", err)
	}
	if result.TodayRecord.Date != "2026-05-12" {
		t.Fatalf("todayRecord.date = %s", result.TodayRecord.Date)
	}
	if len(result.UpcomingTasks) != 1 {
		t.Fatalf("upcomingTasks len = %d", len(result.UpcomingTasks))
	}
	if len(result.CurrentWeekEvents) != 7 {
		t.Fatalf("currentWeekEvents len = %d", len(result.CurrentWeekEvents))
	}
}

func TestUpdateTaskMovesAcrossDates(t *testing.T) {
	store := testutil.NewMemoryStore(testutil.SeedRecords())
	svc := service.New(store, time.Now)

	updated, err := svc.UpdateTask(context.Background(), "task-1", domain.TaskInput{
		Title:    "task moved",
		Status:   "todo",
		Priority: "medium",
		DueAt:    "2026-05-12T21:00:00",
		Date:     "2026-05-12",
	})
	if err != nil {
		t.Fatalf("UpdateTask error = %v", err)
	}
	if updated.Date != "2026-05-12" {
		t.Fatalf("updated date = %s", updated.Date)
	}

	record, _ := store.GetDayRecord(context.Background(), "2026-05-12")
	if len(record.Tasks) != 2 {
		t.Fatalf("target tasks len = %d", len(record.Tasks))
	}
}

func TestUpdateDailySummaryPatch(t *testing.T) {
	store := testutil.NewMemoryStore(testutil.SeedRecords())
	svc := service.New(store, time.Now)
	content := "patched"
	wins := []string{"win"}

	summary, err := svc.UpdateDailySummary(context.Background(), "2026-05-12", domain.DailySummaryPatch{
		Content: &content,
		Wins:    &wins,
	})
	if err != nil {
		t.Fatalf("UpdateDailySummary error = %v", err)
	}
	if summary.Content != "patched" || len(summary.Wins) != 1 {
		t.Fatalf("unexpected summary = %+v", summary)
	}
}
