PROJECT_NAME := ft_transcendence
COMPOSE_FILE := docker-compose.yml

build:
	docker compose -f $(COMPOSE_FILE) build
up:
	docker compose -f $(COMPOSE_FILE) up -d
down:
	docker compose -f $(COMPOSE_FILE) down
logs:
	docker compose -f $(COMPOSE_FILE) logs -f
clean:
	docker compose -f $(COMPOSE_FILE) down --rmi all --volumes --remove-orphans

.PHONY: build up down clean logs
