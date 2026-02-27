PROJECT_NAME := ft_transcendence
COMPOSE_FILE := docker-compose.yml
DC := docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE)

.DEFAULT_GOAL := up

all: build up

build:
	$(DC) build

up:
	$(DC) up -d --remove-orphans

down:
	$(DC) down --remove-orphans

restart: down up

rebuild:
	$(DC) build --no-cache
	$(DC) up -d --remove-orphans

logs:
	$(DC) logs -f

ps:
	$(DC) ps

clean:
	$(DC) down --rmi all --volumes --remove-orphans

fclean: clean
	docker system prune -af

stop:
	$(DC) stop

re: fclean build up

.PHONY: all build up down restart rebuild logs ps clean fclean re stop