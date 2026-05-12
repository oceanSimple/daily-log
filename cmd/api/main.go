package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"daily-log/internal/config"
	"daily-log/internal/httpapi"
	"daily-log/internal/migrations"
	"daily-log/internal/repository/postgres"
	"daily-log/internal/seed"
	"daily-log/internal/service"
)

func main() {
	cfg := config.Load()

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	store, err := postgres.New(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("connect database: %v", err)
	}
	defer store.Close()

	if err := migrations.Apply(ctx, store.Pool()); err != nil {
		log.Fatalf("apply migrations: %v", err)
	}

	if cfg.SeedOnBoot {
		records, err := seed.Load()
		if err != nil {
			log.Fatalf("load seed data: %v", err)
		}
		if err := store.ImportSeedRecords(ctx, records); err != nil {
			log.Fatalf("seed data: %v", err)
		}
	}

	svc := service.New(store, time.Now)
	server := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           httpapi.NewRouter(cfg, svc),
		ReadHeaderTimeout: 10 * time.Second,
	}

	go func() {
		<-ctx.Done()
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		_ = server.Shutdown(shutdownCtx)
	}()

	log.Printf("daily-log backend listening on :%s", cfg.Port)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("serve: %v", err)
	}
}
