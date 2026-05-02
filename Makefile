COMPOSE = docker compose --env-file infra/env/.env -f infra/docker/compose.dev.yml

all: build

up:
	$(COMPOSE) up -d --remove-orphans

build:
	$(COMPOSE) up --build -d --remove-orphans

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f

logs-backend:
	$(COMPOSE) logs -f backend

logs-frontend:
	$(COMPOSE) logs -f frontend

logs-nginx:
	$(COMPOSE) logs -f nginx

logs-postgres:
	$(COMPOSE) logs -f postgres

ps:
	$(COMPOSE) ps

re:
	$(COMPOSE) restart

backend-shell:
	$(COMPOSE) exec backend sh

frontend-shell:
	$(COMPOSE) exec frontend sh

db-shell:
	$(COMPOSE) exec postgres psql -U transcendence -d transcendence

prisma-format:
	$(COMPOSE) exec backend pnpm prisma format

prisma-validate:
	$(COMPOSE) exec backend pnpm prisma validate

prisma-generate:
	$(COMPOSE) exec backend pnpm prisma generate

prisma-migrate:
	@if [ -z "$(name)" ]; then echo "Usage: make prisma-migrate name=init"; exit 1; fi
	$(COMPOSE) exec backend pnpm prisma migrate dev --name $(name)

prisma-deploy:
	$(COMPOSE) exec backend pnpm prisma migrate deploy

prisma-reset:
	$(COMPOSE) exec backend pnpm prisma migrate reset --force

seed:
	$(COMPOSE) exec backend pnpm run seed

test-backend:
	$(COMPOSE) exec backend pnpm test

test-orm:
	$(COMPOSE) exec backend pnpm test:orm


deps-frontend:
	$(COMPOSE) exec frontend sh -c "CI=true pnpm install"

deps-backend:
	$(COMPOSE) exec backend sh -c "CI=true pnpm install"

deps:
	$(COMPOSE) exec backend sh -c "CI=true pnpm install"
	$(COMPOSE) exec frontend sh -c "CI=true pnpm install"

format-frontend:
	$(COMPOSE) exec frontend sh -c "CI=true pnpm run format"

format-backend:
	$(COMPOSE) exec backend sh -c "CI=true pnpm run format"

format: format-frontend format-backend

lint-frontend:
	$(COMPOSE) exec frontend sh -c "CI=true pnpm run lint"

lint-backend:
	$(COMPOSE) exec backend sh -c "CI=true pnpm run lint"

lint: lint-frontend lint-backend

typecheck-frontend:
	$(COMPOSE) exec frontend sh -c "CI=true pnpm run typecheck"

typecheck-backend:
	$(COMPOSE) exec backend sh -c "CI=true pnpm run typecheck"

typecheck: typecheck-frontend typecheck-backend

code-quality-check: format lint typecheck

clean:
	$(COMPOSE) down --remove-orphans
	docker image prune -f
	docker builder prune -f

.PHONY: all up build down logs ps re backend-shell frontend-shell db-shell \
prisma-format prisma-validate prisma-generate prisma-migrate prisma-deploy \
prisma-reset seed test-backend test-orm clean \
deps deps-frontend deps-backend logs-backend logs-frontend logs-nginx logs-postgres