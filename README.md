# daily-log

`daily-log` is a Docker-deployable daily planning app with a Vue frontend, a Go backend API, and PostgreSQL for persistence.

## Project Overview

- Frontend: `http://127.0.0.1:5173`
- Backend API: `http://127.0.0.1:8080`
- PostgreSQL: `127.0.0.1:5432`
- Health check: `GET /healthz`
- Backend entry: `cmd/api`
- REST contract: `frontend/docs/backend-api-plan.md`
- PostgreSQL data directory: `./docker-data/postgres`

## Local Docker Compose Usage

1. Copy `.env.example` to `.env` if you want custom values.
2. Start the stack:

```bash
docker compose up --build -d
```

3. Check running services:

```bash
docker compose ps
```

4. View logs:

```bash
docker compose logs -f
```

5. Open the app:
   - Frontend: `http://127.0.0.1:5173`
   - Backend: `http://127.0.0.1:8080`

6. Stop the stack:

```bash
docker compose down
```

## Quick Deployment on a Cloud Server

This project can be deployed directly from source on a Linux cloud server with Docker and Docker Compose installed.

### 1. Install Docker and Docker Compose

Make sure both `docker` and `docker compose` are available on the server.

### 2. Clone the repository

```bash
git clone https://github.com/oceanSimple/daily-log.git
cd daily-log
```

### 3. Create `.env`

You can start from the example file:

```bash
cp .env.example .env
```

Recommended production-style values:

```bash
DB_NAME=daily_log
DB_USER=daily_log
DB_PASSWORD=<strong-password>
CORS_ORIGIN=http://<server-ip>:5173
SEED_ON_BOOT=true
VITE_API_BASE_URL=http://<server-ip>:8080
```

If you have a domain, replace `http://<server-ip>:5173` and `http://<server-ip>:8080` with your real frontend and API URLs.

### 4. Build and start the stack

```bash
docker compose up --build -d
```

### 5. Verify the deployment

Check container status:

```bash
docker compose ps
```

Tail logs:

```bash
docker compose logs -f
```

Verify the backend health endpoint from the server:

```bash
curl http://127.0.0.1:8080/healthz
```

Default access URLs:

- Frontend: `http://<server-ip>:5173`
- Backend: `http://<server-ip>:8080`

## Operations and Updates

Pull the latest code and rebuild containers after updates:

```bash
git pull
docker compose up --build -d
```

Check service status:

```bash
docker compose ps
```

Follow logs:

```bash
docker compose logs -f
```

Stop services:

```bash
docker compose down
```

Persistent PostgreSQL data is stored in:

```bash
./docker-data/postgres
```

## Production Notes

- `VITE_API_BASE_URL` must not stay as `http://127.0.0.1:8080` on a real server. Use the server IP or your production API domain.
- `CORS_ORIGIN` should not remain `*` in production. Restrict it to the actual frontend origin.
- If you need HTTPS, place Nginx or Caddy in front of the frontend and backend services.
- `docker-compose.yml` currently exposes PostgreSQL on `5432`. On a public server, restrict access with firewall rules or remove the external port mapping if you do not need direct database access.

## Common Pitfalls

- `--build` must use two ASCII hyphens. Do not use the long dash form `—build`.
- After pulling new code, rebuild the stack with `docker compose up --build -d` instead of only restarting old containers.
