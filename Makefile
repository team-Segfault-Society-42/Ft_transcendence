include make/colours.mk make/help.mk make/clean.mk make/setup.mk 
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

# ══════════════════════════════════════════════════════
#                 STARTING THE STACK
# ══════════════════════════════════════════════════════
##@ START STACK

up: setup ## Build and run all containers [DEV]
	@echo "$(GOLD)Building in Dev Mode$(RES)"
	@docker compose -p dev -f $(COMPOSE_FILE) -f $(COMPOSE_DEV) up -d

build: setup ## Build all containers [DEV]
	@docker compose -p dev -f $(COMPOSE_FILE) -f $(COMPOSE_DEV) build

no-cache: setup ## Rebuild all containers in no-cache mode [DEV]
	@docker compose -p dev -f $(COMPOSE_FILE) -f $(COMPOSE_DEV) build --no-cache

re: down build up ## Stop, rebuild, and restart the full stack [DEV]

reset: down-v no-cache up ## Stop (remove volumes), full rebuild (no cache), restart containers [DEV]

prod: ## Build and run all containers [PROD]
	@echo "$(GREEN)Building in Production Mode$(RES)"
	@docker compose -p prod -f $(COMPOSE_FILE) -f $(COMPOSE_PROD) up -d

.PHONY: up build no-cache re reset prod

# ══════════════════════════════════════════════════════
#                 STOPING THE STACK
# ══════════════════════════════════════════════════════

##@ STOP STACK

down: ## Stop all running containers [DEV]
	@docker compose -p dev -f $(COMPOSE_FILE) -f $(COMPOSE_DEV) down

down-v: ## Remove volumes and stop running containers [DEV]
	@docker compose -p dev -f $(COMPOSE_FILE) -f $(COMPOSE_DEV) down -v
	
down-prod: ## Stop all running containers [PROD]
	@docker compose -p prod -f $(COMPOSE_FILE) -f $(COMPOSE_PROD) down
	

.PHONY: down down-v down-prod

# ══════════════════════════════════════════════════════
#               		UTILITY
# ══════════════════════════════════════════════════════
##@ UTILITY

ps: ## Display all running containers [DEV]
	@docker compose -p dev -f $(COMPOSE_FILE) -f $(COMPOSE_DEV) ps

ps-prod: ## Display all running containers [PROD]
	@docker compose -p prod -f $(COMPOSE_FILE) -f $(COMPOSE_PROD) ps
	
ls: ## Display all images [UTIL]
	@docker image ls -a
	
info: ## Display Docker system information, build cache, etc. [UTIL]
	@docker system df

.PHONY: ps ls info

# ══════════════════════════════════════════════════════
#               	 	 LOGS
# ══════════════════════════════════════════════════════

SHOW_DEV_LOGS = docker compose -p dev -f $(COMPOSE_FILE) -f $(COMPOSE_DEV) logs

##@ LOGS

logs: ## Display logs for all containers [DEV]
	@$(SHOW_DEV_LOGS)

logs-proxy: ## Display logs for the proxy container [DEV]
	@$(SHOW_DEV_LOGS) -f $(SERVICE_PROXY)
	
logs-front: ## Display logs for the frontend container [DEV]
	@$(SHOW_DEV_LOGS) -f $(SERVICE_FRONTEND)

logs-back: ## Display logs for the backend container [DEV]
	@$(SHOW_DEV_LOGS) -f $(SERVICE_BACKEND)

logs-db: ## Display logs for the database container [DEV]
	@$(SHOW_DEV_LOGS) -f $(SERVICE_DATABASE)

.PHONY: logs logs-proxy logs-front logs-back logs-db
