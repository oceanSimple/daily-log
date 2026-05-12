# daily-log

## Backend

- Go API entry: `cmd/api`
- Health check: `GET /healthz`
- REST contract: `frontend/docs/backend-api-plan.md`

## Local run with Docker Compose

1. Copy `.env.example` to `.env` if you want custom values.
2. Run `docker compose up --build`.
3. Open frontend at `http://127.0.0.1:5173`.
4. Backend API is at `http://127.0.0.1:8080`.

PostgreSQL data is persisted to `./docker-data/postgres`.
