# ft_transcendence

This project is run and developed via Docker Compose and `Makefile`.
Below is the working command sequence for developers, including the required step-by-step order.

## 1) Requirements

- Docker Engine + Docker Compose plugin
- GNU Make

Check:

```bash
docker --version
docker compose version
make --version
```

## 2) Initial `.env` Setup

Before the first run, create/fill all env files (if they do not exist):

```bash
cp infra/env/.env.example infra/env/.env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

At minimum, verify these values:

- `infra/env/.env`:
  - `COMPOSE_PROJECT_NAME`
  - `NGINX_PORT`
  - `POSTGRES_PORT`
  - `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
- `backend/.env`:
  - `PORT`
  - `DATABASE_URL` (inside the Docker network, DB host must be `postgres`)
  - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `frontend/.env`:
  - `VITE_BASE_URL`
  - `VITE_WS_BASE_URL`

## 3) Recommended Startup Order (Required)

```bash
make build
make deps
make prisma-deploy
make seed
```

What each step does:

1. `make build`:
  - builds and starts `nginx`, `backend`, `frontend`, and `postgres` containers.
2. `make deps`:
  - installs `pnpm` dependencies inside `backend` and `frontend` containers.
  - required because `node_modules` are mounted as separate volumes.
3. `make prisma-deploy`:
  - applies existing Prisma migrations to the database.
4. `make seed`:
  - seeds the database with initial data.

After that, the app is available at:

- `http://localhost:8080` (or your `NGINX_PORT` from `infra/env/.env`)

## 4) Daily Workflow

If the project is already initialized:

```bash
make up
```

If you changed Dockerfiles or image-level dependencies:

```bash
make build
make deps
```

If you changed the Prisma schema:

```bash
make prisma-migrate name=your_migration_name
make seed
```

## 5) Useful Makefile Commands

### Containers

- `make up` - start containers
- `make build` - rebuild and start containers
- `make down` - stop and remove containers
- `make re` - restart containers
- `make ps` - list containers
- `make logs` - follow logs
- `make logs-backend` - follow backend logs only
- `make logs-frontend` - follow frontend logs only
- `make logs-nginx` - follow nginx logs only
- `make logs-postgres` - follow postgres logs only

### Shell Access

- `make backend-shell` - shell inside backend
- `make frontend-shell` - shell inside frontend
- `make db-shell` - psql inside postgres

### Dependencies

- `make deps` - install backend + frontend dependencies
- `make deps-backend` - install backend dependencies only
- `make deps-frontend` - install frontend dependencies only

### Prisma / DB

- `make prisma-format`
- `make prisma-validate`
- `make prisma-generate`
- `make prisma-migrate name=...` - create and apply a new migration
- `make prisma-deploy` - apply existing migrations
- `make prisma-reset` - full DB reset (careful)
- `make seed` - run seed data

### Tests

- `make test-backend`
- `make test-orm`

### Docker Resource Cleanup

- `make clean` - stop containers + prune images/builders

## 6) Common Issues

1. DB connection error in backend:
  - check that `DATABASE_URL` in `backend/.env` uses host `postgres`, not `localhost`.

2. Module not found in `backend` or `frontend`:
  - run `make deps` after `make build`.

3. Env changed but nothing updated:
  - restart containers: `make down && make up`.

## 7) Quick Start

```bash
cp infra/env/.env.example infra/env/.env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

make build
make deps
make prisma-deploy
make seed
```

Open in browser: `http://localhost:8080`