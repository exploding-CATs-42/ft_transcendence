COMPOSE = docker compose --env-file infra/env/.env -f infra/docker/compose.dev.yml
BACKEND_DIR = backend
LOCAL_DATABASE_URL = postgresql://transcendence:TrAnsc3ndence_pg_dev_26@localhost:5432/transcendence?schema=public

all: build

install:
	pnpm install

up:
	$(COMPOSE) up -d

build:
	$(COMPOSE) up --build -d

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f

logs-backend:
	$(COMPOSE) logs -f backend

logs-db:
	$(COMPOSE) logs -f postgres

ps:
	$(COMPOSE) ps

re:
	$(COMPOSE) restart

backend-dev:
	pnpm --filter backend dev

frontend-dev:
	pnpm --filter frontend dev

backend-build:
	pnpm --filter backend build

clean:
	$(COMPOSE) down -v --remove-orphans

db-shell:
	docker exec -it ft-postgres psql -U transcendence -d transcendence

db-tables:
	docker exec -it ft-postgres psql -U transcendence -d transcendence -c '\dt'

db-users:
	docker exec -it ft-postgres psql -U transcendence -d transcendence -c 'SELECT id, email, username, created_at FROM users ORDER BY created_at;'

db-validate:
	cd $(BACKEND_DIR) && pnpm prisma:validate

db-generate:
	cd $(BACKEND_DIR) && pnpm prisma:generate

db-format:
	cd $(BACKEND_DIR) && pnpm prisma:format

db-migrate:
	cd $(BACKEND_DIR) && DATABASE_URL="$(LOCAL_DATABASE_URL)" pnpm prisma:migrate:dev --name $(name)

db-deploy:
	cd $(BACKEND_DIR) && DATABASE_URL="$(LOCAL_DATABASE_URL)" pnpm prisma:migrate:deploy

db-seed:
	cd $(BACKEND_DIR) && DATABASE_URL="$(LOCAL_DATABASE_URL)" pnpm prisma:seed

db-studio:
	cd $(BACKEND_DIR) && DATABASE_URL="$(LOCAL_DATABASE_URL)" pnpm prisma:studio

test:
	cd $(BACKEND_DIR) && DATABASE_URL="$(LOCAL_DATABASE_URL)" pnpm test

reset:
	$(COMPOSE) down -v --remove-orphans
	$(COMPOSE) up --build -d

.PHONY: all install up build down logs logs-backend logs-db ps re backend-dev frontend-dev backend-build clean reset db-shell db-tables db-users db-validate db-generate db-format db-migrate db-deploy db-seed db-studio test