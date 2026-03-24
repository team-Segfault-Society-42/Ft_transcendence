include make/colours.mk make/clean.mk make/setup.mk 
-include .env
export

# ══════════════════════════════════════════════════════
#                      VARIABLES
# ══════════════════════════════════════════════════════

SERVICE_PROXY		= proxy
SERVICE_FRONTEND	= frontend
SERVICE_BACKEND		= backend
SERVICE_DATABASE	= db

COMPOSE_FILE		= compose.yaml
COMPOSE_DEV			= compose.dev.yaml
COMPOSE_PROD		= compose.prod.yaml
SHOW_LOGS			= docker compose logs

# ══════════════════════════════════════════════════════
#                      HELP
# ══════════════════════════════════════════════════════
##@ HELP

help: ## Show available targets
	@grep -hE '^[a-zA-Z_-]+:.*?##|^##@' $(MAKEFILE_LIST) \
		| awk ' \
			/^##@/ { printf "\n"$(BOLD_YEL)"< %s >"$(RES)"\n", substr($$0, 5) } \
			/^[a-zA-Z_-]+:.*?##/ { \
				split($$0, a, ":.*?## "); \
				printf " ・"$(CYAN)"%-14s"$(RES)" %s\n", a[1], a[2] \
			}'

# ══════════════════════════════════════════════════════
#                 CORE DOCKER TARGETS
# ══════════════════════════════════════════════════════
##@ STACK

prod: ## Build and run all containers in production mode
	docker compose -f $(COMPOSE_FILE) -f $(COMPOSE_PROD) up -d

dev: ## Build and run all containers in dev mode (hot reload)
	docker compose -f $(COMPOSE_FILE) -f $(COMPOSE_DEV) up -d

build: ## Build all containers
	@docker compose -f $(COMPOSE_FILE) build

down: ## Stop all running containers
	@docker compose -f $(COMPOSE_FILE) down

down-v: ## Remove volumes and stop running containers
	@ docker compose -f $(COMPOSE_FILE) down -v

no-cache: ## Rebuild all containers in no-cache mode
	@docker compose -f $(COMPOSE_FILE) build --no-cache

re: down build up ## Stop, rebuild, and restart the full stack

reset: down-v no-cache up ## Stop (remove volumes), full rebuild (no cache), restart containers

# ══════════════════════════════════════════════════════
#               UTILITY & LOGS TARGETS
# ══════════════════════════════════════════════════════
##@ UTILITY & LOGS

ps: ## Display all running containers
	@docker compose -f $(COMPOSE_FILE) ps
	
ls: ## Display all images
	@docker image ls -a
	
logs: ## Display logs for all containers
	@$(SHOW_LOGS)

logs-proxy: ## Display logs for the proxy container
	@$(SHOW_LOGS) $(SERVICE_PROXY)
	
logs-front: ## Display logs for the frontend container
	@$(SHOW_LOGS) $(SERVICE_FRONTEND)

logs-back: ## Display logs for the backend container
	@$(SHOW_LOGS) $(SERVICE_BACKEND)

logs-db: ## Display logs for the database container
	@$(SHOW_LOGS) $(SERVICE_DATABASE)

.PHONY: up build down no-cache ps ls logs logs-proxy logs-front logs-back clean nuke help
