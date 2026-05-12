package httpapi_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"daily-log/internal/config"
	"daily-log/internal/domain"
	"daily-log/internal/httpapi"
	"daily-log/internal/service"
	"daily-log/internal/testutil"
)

func TestListDayRecords(t *testing.T) {
	store := testutil.NewMemoryStore(testutil.SeedRecords())
	svc := service.New(store, time.Now)
	router := httpapi.NewRouter(config.Config{CORSOrigin: "*"}, svc)

	req := httptest.NewRequest(http.MethodGet, "/api/day-records?from=2026-05-01&to=2026-05-31", nil)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d body=%s", rec.Code, rec.Body.String())
	}
	var records []domain.DayRecord
	if err := json.Unmarshal(rec.Body.Bytes(), &records); err != nil {
		t.Fatalf("unmarshal = %v", err)
	}
	if len(records) != 2 {
		t.Fatalf("records len = %d", len(records))
	}
}

func TestCreateTask(t *testing.T) {
	store := testutil.NewMemoryStore(testutil.SeedRecords())
	svc := service.New(store, time.Now)
	router := httpapi.NewRouter(config.Config{CORSOrigin: "*"}, svc)

	body, _ := json.Marshal(domain.TaskInput{
		Title:    "new task",
		Status:   "todo",
		Priority: "low",
		DueAt:    "2026-05-12T12:00:00",
		Date:     "2026-05-12",
	})
	req := httptest.NewRequest(http.MethodPost, "/api/tasks", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d body=%s", rec.Code, rec.Body.String())
	}
}

func TestInvalidTaskStatus(t *testing.T) {
	store := testutil.NewMemoryStore(testutil.SeedRecords())
	svc := service.New(store, time.Now)
	router := httpapi.NewRouter(config.Config{CORSOrigin: "*"}, svc)

	body, _ := json.Marshal(domain.TaskInput{
		Title:    "bad task",
		Status:   "weird",
		Priority: "low",
		DueAt:    "2026-05-12T12:00:00",
		Date:     "2026-05-12",
	})
	req := httptest.NewRequest(http.MethodPost, "/api/tasks", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("status = %d body=%s", rec.Code, rec.Body.String())
	}
}
