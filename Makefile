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

ps:
	$(COMPOSE) ps

re:
	$(COMPOSE) restart

db-shell:
	docker exec -it ft-postgres psql -U transcendence -d transcendence

clean:
	$(COMPOSE) down --remove-orphans
	docker image prune -f
	docker builder prune -f


.PHONY: all up build down logs ps re clean fclean db-shell