COMPOSE = docker compose --env-file infra/env/.env -f infra/docker/compose.dev.yml

all: build

up:
	$(COMPOSE) up -d

build:
	$(COMPOSE) up --build -d

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f

ps:
	$(COMPOSE) ps

re:
	$(COMPOSE) restart



db-shell:
	docker exec -it ft-postgres psql -U transcendence -d transcendence



.PHONY: all up build down logs ps re clean reset db-shell