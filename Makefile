# -------------------------------------------------
# Variables
# -------------------------------------------------
DOCKER_USERNAME      := softvence
PACKAGE_NAME         := diaz_backend
PACKAGE_VERSION      := latest

APP_IMAGE            := $(DOCKER_USERNAME)/$(PACKAGE_NAME):$(PACKAGE_VERSION)
COMPOSE_FILE         := compose.yaml

API_CONTAINER        := $(PACKAGE_NAME)_api
CADDY_CONTAINER      := $(PACKAGE_NAME)_caddy
DB_CONTAINER         := $(PACKAGE_NAME)_db
REDIS_MASTER         := $(PACKAGE_NAME)_redis-master
REDIS_REPLICA        := $(PACKAGE_NAME)_redis-replica

# -------------------------------------------------
# Commands
# -------------------------------------------------
.PHONY: help build up up-prod up-dev down restart logs clean push containers volumes networks images

# Show help
help:
	@echo "Available commands:"
	@echo "  make build         Build the Docker image"
	@echo "  make up            Start containers (default profile)"
	@echo "  make up-prod       Start containers with prod profile"
	@echo "  make up-dev        Start containers with dev profile"
	@echo "  make down          Stop containers"
	@echo "  make restart       Restart all containers"
	@echo "  make logs          Show logs of API container"
	@echo "  make clean         Remove all containers, volumes, networks, and image"
	@echo "  make push          Push the Docker image to Docker Hub"
	@echo "  make containers    List compose containers"
	@echo "  make volumes       List compose volumes"
	@echo "  make networks      List compose networks"
	@echo "  make images        List compose images"

# -------------------------------------------------
# Build Docker image
# -------------------------------------------------
build:
	docker build -t $(APP_IMAGE) .

# -------------------------------------------------
# Compose Up
# -------------------------------------------------
up:
	docker compose -f $(COMPOSE_FILE) --profile prod up -d

up-dev:
	docker compose -f $(COMPOSE_FILE) --profile dev up -d

# -------------------------------------------------
# Down
# -------------------------------------------------
down:
	docker compose -f $(COMPOSE_FILE) --profile prod down

restart: down up

# -------------------------------------------------
# Logs
# -------------------------------------------------
logs:
	docker logs -f $(API_CONTAINER)

# -------------------------------------------------
# Cleanup
# -------------------------------------------------
clean:
	docker compose -f $(COMPOSE_FILE) down --volumes --remove-orphans
	- docker rmi $(APP_IMAGE) || true

# -------------------------------------------------
# Utility Commands
# -------------------------------------------------
containers:
	docker compose -f $(COMPOSE_FILE) ps

volumes:
	docker compose -f $(COMPOSE_FILE) volume ls

networks:
	docker compose -f $(COMPOSE_FILE) network ls

images:
	docker compose -f $(COMPOSE_FILE) images

# -------------------------------------------------
# Push image
# -------------------------------------------------
push: build
	docker push $(APP_IMAGE)
