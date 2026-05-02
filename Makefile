COMPOSE = docker compose --env-file infra/env/.env -f infra/docker/compose.dev.yml


## -------------------------
## Docker lifecycle
## -------------------------

all: build ## Build and start all containers

up: ## Start containers in detached mode
	$(COMPOSE) up -d --remove-orphans

build: ## Build images and start containers
	$(COMPOSE) up --build -d --remove-orphans

down: ## Stop and remove containers
	$(COMPOSE) down

re: ## Restart running containers
	$(COMPOSE) restart

ps: ## Show running containers
	$(COMPOSE) ps

clean: ## Stop containers and prune Docker images/build cache
	$(COMPOSE) down --remove-orphans
	docker image prune -f
	docker builder prune -f

## -------------------------
## Logs
## -------------------------

logs: ## Follow logs from all services
	$(COMPOSE) logs -f

logs-backend: ## Follow backend logs
	$(COMPOSE) logs -f backend

logs-frontend: ## Follow frontend logs
	$(COMPOSE) logs -f frontend

logs-nginx: ## Follow nginx logs
	$(COMPOSE) logs -f nginx

logs-postgres: ## Follow postgres logs
	$(COMPOSE) logs -f postgres

## -------------------------
## Shell access
## -------------------------

backend-shell: ## Open shell inside backend container
	$(COMPOSE) exec backend sh

frontend-shell: ## Open shell inside frontend container
	$(COMPOSE) exec frontend sh

db-shell: ## Open psql shell inside postgres container
	$(COMPOSE) exec postgres psql -U transcendence -d transcendence

## -------------------------
## Dependencies
## -------------------------

deps: ## Install dependencies in backend and frontend containers
	$(COMPOSE) exec backend sh -c "CI=true pnpm install"
	$(COMPOSE) exec frontend sh -c "CI=true pnpm install"

deps-backend: ## Install backend dependencies
	$(COMPOSE) exec backend sh -c "CI=true pnpm install"

deps-frontend: ## Install frontend dependencies
	$(COMPOSE) exec frontend sh -c "CI=true pnpm install"

## -------------------------
## Prisma / Database
## -------------------------

prisma-format: ## Format Prisma schema
	$(COMPOSE) exec backend pnpm prisma format

prisma-validate: ## Validate Prisma schema
	$(COMPOSE) exec backend pnpm prisma validate

prisma-generate: ## Generate Prisma client
	$(COMPOSE) exec backend pnpm prisma generate

prisma-migrate: ## Create and apply a new Prisma migration. Usage: make prisma-migrate name=init
	@if [ -z "$(name)" ]; then echo "Usage: make prisma-migrate name=init"; exit 1; fi
	$(COMPOSE) exec backend pnpm prisma migrate dev --name $(name)

prisma-deploy: ## Apply pending Prisma migrations
	$(COMPOSE) exec backend pnpm prisma migrate deploy

prisma-reset: ## Reset database and apply migrations from scratch
	$(COMPOSE) exec backend pnpm prisma migrate reset --force

seed: ## Seed the database
	$(COMPOSE) exec backend pnpm run seed

## -------------------------
## Tests
## -------------------------

test-backend: ## Run backend tests
	$(COMPOSE) exec backend pnpm test

test-orm: ## Run backend ORM tests
	$(COMPOSE) exec backend pnpm test:orm

## -------------------------
## Formatting
## -------------------------

format-check: format-check-frontend format-check-backend ## Check formatting for frontend and backend

format-fix: format-fix-frontend format-fix-backend ## Fix formatting for frontend and backend

format-check-frontend: ## Check frontend formatting
	$(COMPOSE) exec frontend sh -c "CI=true pnpm run format:check"

format-fix-frontend: ## Fix frontend formatting
	$(COMPOSE) exec frontend sh -c "CI=true pnpm run format"

format-check-backend: ## Check backend formatting
	$(COMPOSE) exec backend sh -c "CI=true pnpm run format:check"

format-fix-backend: ## Fix backend formatting
	$(COMPOSE) exec backend sh -c "CI=true pnpm run format"

## -------------------------
## Linting
## -------------------------

lint-check: lint-check-frontend lint-check-backend ## Check linting for frontend and backend

lint-fix: lint-fix-frontend lint-fix-backend ## Fix linting for frontend and backend

lint-check-frontend: ## Check frontend linting
	$(COMPOSE) exec frontend sh -c "CI=true pnpm run lint:check"

lint-fix-frontend: ## Fix frontend linting
	$(COMPOSE) exec frontend sh -c "CI=true pnpm run lint"

lint-check-backend: ## Check backend linting
	$(COMPOSE) exec backend sh -c "CI=true pnpm run lint:check"

lint-fix-backend: ## Fix backend linting
	$(COMPOSE) exec backend sh -c "CI=true pnpm run lint"

## -------------------------
## Type checking
## -------------------------

typecheck: typecheck-frontend typecheck-backend ## Run TypeScript typecheck for frontend and backend

typecheck-frontend: ## Run frontend TypeScript typecheck
	$(COMPOSE) exec frontend sh -c "CI=true pnpm run typecheck"

typecheck-backend: ## Run backend TypeScript typecheck
	$(COMPOSE) exec backend sh -c "CI=true pnpm run typecheck"

## -------------------------
## Code quality
## -------------------------

code-quality-check: format-check lint-check typecheck ## Run format check, lint check, and typecheck

code-quality-fix: format-fix lint-fix ## Run format fix and lint fix



## -------------------------
## Help
## -------------------------

help: ## Show available make commands
	@echo ""
	@echo "Usage:"
	@echo "  make <command>"
	@echo ""
	@echo "Examples:"
	@echo "  make build"
	@echo "  make logs-backend"
	@echo "  make prisma-migrate name=init"
	@echo "  make code-quality-check"
	@echo ""
	@echo "Available commands:"
	@awk 'BEGIN {FS = ":.*##"; category=""} \
		/^## / { \
			if ($$0 ~ /^## -/) next; \
			category=substr($$0, 4); \
			printf "\n\033[1m%s\033[0m\n", category; \
		} \
		/^[a-zA-Z0-9_-]+:.*##/ { \
			printf "  \033[36m%-24s\033[0m %s\n", $$1, $$2; \
		}' $(MAKEFILE_LIST)
	@echo ""

.PHONY: help all up build down re ps clean \
logs logs-backend logs-frontend logs-nginx logs-postgres \
backend-shell frontend-shell db-shell \
deps deps-backend deps-frontend \
prisma-format prisma-validate prisma-generate prisma-migrate prisma-deploy prisma-reset seed \
test-backend test-orm \
format-check format-fix format-check-frontend format-fix-frontend format-check-backend format-fix-backend \
lint-check lint-fix lint-check-frontend lint-fix-frontend lint-check-backend lint-fix-backend \
typecheck typecheck-frontend typecheck-backend \
code-quality-check code-quality-fix