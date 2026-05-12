package httpapi

import (
	"encoding/json"
	"errors"
	"net/http"

	"daily-log/internal/config"
	"daily-log/internal/domain"
	"daily-log/internal/service"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
)

type handler struct {
	service *service.Service
}

func NewRouter(cfg config.Config, svc *service.Service) http.Handler {
	h := &handler{service: svc}
	router := chi.NewRouter()
	router.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{cfg.CORSOrigin},
		AllowedMethods:   []string{"GET", "POST", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: false,
	}))

	router.Get("/healthz", h.healthz)
	router.Get("/api/dashboard", h.getDashboard)
	router.Get("/api/day-records", h.listDayRecords)
	router.Get("/api/day-records/{date}", h.getDayRecord)
	router.Get("/api/tasks", h.listTasks)
	router.Post("/api/tasks", h.createTask)
	router.Patch("/api/tasks/{id}", h.updateTask)
	router.Delete("/api/tasks/{id}", h.deleteTask)
	router.Get("/api/events", h.listEvents)
	router.Post("/api/events", h.createEvent)
	router.Patch("/api/events/{id}", h.updateEvent)
	router.Delete("/api/events/{id}", h.deleteEvent)
	router.Patch("/api/journal-entries/{date}", h.updateJournalEntry)
	router.Patch("/api/daily-summaries/{date}", h.updateDailySummary)
	router.Post("/api/log-entries", h.createLogEntry)
	router.Patch("/api/log-entries/{id}", h.updateLogEntry)
	router.Delete("/api/log-entries/{id}", h.deleteLogEntry)
	return router
}

func (h *handler) healthz(w http.ResponseWriter, r *http.Request) {
	if err := h.service.Ping(r.Context()); err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (h *handler) getDashboard(w http.ResponseWriter, r *http.Request) {
	result, err := h.service.GetDashboard(r.Context())
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func (h *handler) listDayRecords(w http.ResponseWriter, r *http.Request) {
	result, err := h.service.ListDayRecords(r.Context(), domain.DayRecordFilter{
		From: r.URL.Query().Get("from"),
		To:   r.URL.Query().Get("to"),
	})
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func (h *handler) getDayRecord(w http.ResponseWriter, r *http.Request) {
	result, err := h.service.GetDayRecord(r.Context(), chi.URLParam(r, "date"))
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func (h *handler) listTasks(w http.ResponseWriter, r *http.Request) {
	result, err := h.service.ListTasks(r.Context(), domain.TaskFilter{
		From:   r.URL.Query().Get("from"),
		To:     r.URL.Query().Get("to"),
		Status: r.URL.Query().Get("status"),
	})
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func (h *handler) createTask(w http.ResponseWriter, r *http.Request) {
	var input domain.TaskInput
	if err := decodeJSON(r, &input); err != nil {
		writeError(w, err)
		return
	}
	result, err := h.service.CreateTask(r.Context(), input)
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func (h *handler) updateTask(w http.ResponseWriter, r *http.Request) {
	var input domain.TaskInput
	if err := decodeJSON(r, &input); err != nil {
		writeError(w, err)
		return
	}
	result, err := h.service.UpdateTask(r.Context(), chi.URLParam(r, "id"), input)
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func (h *handler) deleteTask(w http.ResponseWriter, r *http.Request) {
	if err := h.service.DeleteTask(r.Context(), chi.URLParam(r, "id")); err != nil {
		writeError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *handler) listEvents(w http.ResponseWriter, r *http.Request) {
	result, err := h.service.ListEvents(r.Context(), domain.EventFilter{
		From: r.URL.Query().Get("from"),
		To:   r.URL.Query().Get("to"),
	})
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func (h *handler) createEvent(w http.ResponseWriter, r *http.Request) {
	var input domain.EventInput
	if err := decodeJSON(r, &input); err != nil {
		writeError(w, err)
		return
	}
	result, err := h.service.CreateEvent(r.Context(), input)
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func (h *handler) updateEvent(w http.ResponseWriter, r *http.Request) {
	var input domain.EventInput
	if err := decodeJSON(r, &input); err != nil {
		writeError(w, err)
		return
	}
	result, err := h.service.UpdateEvent(r.Context(), chi.URLParam(r, "id"), input)
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func (h *handler) deleteEvent(w http.ResponseWriter, r *http.Request) {
	if err := h.service.DeleteEvent(r.Context(), chi.URLParam(r, "id")); err != nil {
		writeError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *handler) updateJournalEntry(w http.ResponseWriter, r *http.Request) {
	var input domain.JournalEntryInput
	if err := decodeJSON(r, &input); err != nil {
		writeError(w, err)
		return
	}
	result, err := h.service.UpdateJournalEntry(r.Context(), chi.URLParam(r, "date"), input)
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func (h *handler) updateDailySummary(w http.ResponseWriter, r *http.Request) {
	var input domain.DailySummaryPatch
	if err := decodeJSON(r, &input); err != nil {
		writeError(w, err)
		return
	}
	result, err := h.service.UpdateDailySummary(r.Context(), chi.URLParam(r, "date"), input)
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func (h *handler) createLogEntry(w http.ResponseWriter, r *http.Request) {
	var input domain.LogEntryInput
	if err := decodeJSON(r, &input); err != nil {
		writeError(w, err)
		return
	}
	result, err := h.service.CreateLogEntry(r.Context(), input)
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func (h *handler) updateLogEntry(w http.ResponseWriter, r *http.Request) {
	var input domain.LogEntryInput
	if err := decodeJSON(r, &input); err != nil {
		writeError(w, err)
		return
	}
	result, err := h.service.UpdateLogEntry(r.Context(), chi.URLParam(r, "id"), input)
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func (h *handler) deleteLogEntry(w http.ResponseWriter, r *http.Request) {
	if err := h.service.DeleteLogEntry(r.Context(), chi.URLParam(r, "id")); err != nil {
		writeError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func decodeJSON(r *http.Request, target any) error {
	defer r.Body.Close()
	if err := json.NewDecoder(r.Body).Decode(target); err != nil {
		return errors.New("invalid json body")
	}
	return nil
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func writeError(w http.ResponseWriter, err error) {
	status := http.StatusInternalServerError
	switch {
	case errors.Is(err, service.ErrInvalidInput):
		status = http.StatusBadRequest
	case errors.Is(err, service.ErrNotFound):
		status = http.StatusNotFound
	}
	writeJSON(w, status, map[string]string{"error": err.Error()})
}
