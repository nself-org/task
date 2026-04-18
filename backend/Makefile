# =============================================================================
# nSelf Backend - Makefile
#
# Quick commands for managing the backend stack.
#
# Usage:
#   make up        - Start all services
#   make down      - Stop all services
#   make logs      - View logs
#   make status    - Show service status
#   make console   - Open Hasura Console
#   make psql      - Connect to PostgreSQL
#   make migrate   - Apply Hasura migrations
#   make seed      - Seed the database
#   make backup    - Create a database backup
#   make restore   - Restore from backup
#   make clean     - Remove all data (DESTRUCTIVE)
# =============================================================================

COMPOSE = docker compose
COMPOSE_STAGING = docker compose -f docker-compose.yml -f docker-compose.staging.yml
COMPOSE_PROD = docker compose -f docker-compose.yml -f docker-compose.production.yml

# Default values (override via .env)
POSTGRES_USER ?= postgres
POSTGRES_PASSWORD ?= postgres
POSTGRES_DB ?= nself
HASURA_ADMIN_SECRET ?= nself-admin-secret

# ---------------------------------------------------------------------------
# Local Development
# ---------------------------------------------------------------------------

.PHONY: up
up: ## Start all services (local development)
	$(COMPOSE) --profile dev up -d

.PHONY: down
down: ## Stop all services
	$(COMPOSE) --profile dev down

.PHONY: restart
restart: down up ## Restart all services

.PHONY: logs
logs: ## View logs from all services
	$(COMPOSE) logs -f

.PHONY: logs-hasura
logs-hasura: ## View Hasura logs only
	$(COMPOSE) logs -f graphql-engine

.PHONY: logs-auth
logs-auth: ## View auth service logs only
	$(COMPOSE) logs -f auth

.PHONY: status
status: ## Show service status
	$(COMPOSE) ps

.PHONY: health
health: ## Check health of all services
	@echo "--- PostgreSQL ---"
	@docker compose exec postgres pg_isready -U $(POSTGRES_USER) 2>/dev/null || echo "DOWN"
	@echo "--- Hasura ---"
	@curl -sf http://localhost:8080/healthz && echo " OK" || echo "DOWN"
	@echo "--- Auth ---"
	@curl -sf http://localhost:4000/healthz && echo " OK" || echo "DOWN"
	@echo "--- Storage ---"
	@curl -sf http://localhost:8484/healthz && echo " OK" || echo "DOWN"

# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------

.PHONY: psql
psql: ## Connect to PostgreSQL shell
	docker compose exec postgres psql -U $(POSTGRES_USER) -d $(POSTGRES_DB)

.PHONY: backup
backup: ## Create a database backup
	@mkdir -p ./backups
	docker compose exec postgres pg_dump -U $(POSTGRES_USER) $(POSTGRES_DB) > ./backups/backup-$$(date +%Y%m%d-%H%M%S).sql
	@echo "Backup created in ./backups/"

.PHONY: restore
restore: ## Restore from most recent backup (usage: make restore FILE=backups/backup-xxx.sql)
	@if [ -z "$(FILE)" ]; then echo "Usage: make restore FILE=backups/backup-xxx.sql"; exit 1; fi
	docker compose exec -T postgres psql -U $(POSTGRES_USER) -d $(POSTGRES_DB) < $(FILE)

# ---------------------------------------------------------------------------
# Hasura
# ---------------------------------------------------------------------------

.PHONY: console
console: ## Open Hasura Console (requires hasura-cli)
	cd hasura && hasura console --admin-secret $(HASURA_ADMIN_SECRET)

.PHONY: migrate
migrate: ## Apply all pending Hasura migrations
	cd hasura && hasura migrate apply --database-name default --admin-secret $(HASURA_ADMIN_SECRET)

.PHONY: migrate-status
migrate-status: ## Show migration status
	cd hasura && hasura migrate status --database-name default --admin-secret $(HASURA_ADMIN_SECRET)

.PHONY: metadata-apply
metadata-apply: ## Apply Hasura metadata
	cd hasura && hasura metadata apply --admin-secret $(HASURA_ADMIN_SECRET)

.PHONY: metadata-export
metadata-export: ## Export current Hasura metadata
	cd hasura && hasura metadata export --admin-secret $(HASURA_ADMIN_SECRET)

.PHONY: seed
seed: ## Seed the database (runs from frontend)
	cd .. && npm run db:seed

# ---------------------------------------------------------------------------
# Staging
# ---------------------------------------------------------------------------

.PHONY: staging-up
staging-up: ## Start staging stack
	$(COMPOSE_STAGING) up -d

.PHONY: staging-down
staging-down: ## Stop staging stack
	$(COMPOSE_STAGING) down

.PHONY: staging-logs
staging-logs: ## View staging logs
	$(COMPOSE_STAGING) logs -f

# ---------------------------------------------------------------------------
# Production
# ---------------------------------------------------------------------------

.PHONY: prod-up
prod-up: ## Start production stack
	$(COMPOSE_PROD) up -d

.PHONY: prod-down
prod-down: ## Stop production stack
	$(COMPOSE_PROD) down

.PHONY: prod-logs
prod-logs: ## View production logs
	$(COMPOSE_PROD) logs -f

# ---------------------------------------------------------------------------
# Cleanup
# ---------------------------------------------------------------------------

.PHONY: clean
clean: ## Remove all containers and volumes (DESTRUCTIVE - deletes all data)
	@echo "WARNING: This will delete ALL data including the database!"
	@read -p "Are you sure? [y/N] " confirm && [ "$$confirm" = "y" ] || exit 1
	$(COMPOSE) --profile dev down -v
	@echo "All data removed."

# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

.PHONY: test
test: ## Run the backend smoke-test suite (full up, health, CRUD, teardown)
	./test/smoke.sh

.PHONY: test-keep-up
test-keep-up: ## Run smoke tests but leave the stack running on success
	SMOKE_KEEP_UP=1 ./test/smoke.sh

.PHONY: help
help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
