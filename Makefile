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
COMPOSE_ALL 		= $(COMPOSE_FILE) -f $(COMPOSE_DEV) -f $(COMPOSE_PROD)
SHOW_LOGS			= docker compose logs

# ══════════════════════════════════════════════════════
#                 STARTING THE STACK
# ══════════════════════════════════════════════════════
##@ START STACK

up: setup ##  Build and run all containers [DEV]
	@echo "$(GOLD)Building in Dev Mode$(RES)"
	@docker compose -p dev -f $(COMPOSE_FILE) -f $(COMPOSE_DEV) up -d

build: setup ##  Build all containers [DEV]
	@docker compose -p dev -f $(COMPOSE_FILE) -f $(COMPOSE_DEV) build

no-cache: setup ##  Rebuild all containers in no-cache mode [DEV]
	@docker compose -p dev -f $(COMPOSE_FILE) -f $(COMPOSE_DEV) build --no-cache

re: down build up ##  Stop, rebuild, and restart the full stack [DEV]

reset: down-v no-cache up ##  Stop (remove volumes), full rebuild (no cache), restart containers [DEV]

prod: ## Build and run all containers [PRODUCTION]
	@echo "$(GREEN)Building in Production Mode$(RES)"
	@docker compose -p prod -f $(COMPOSE_FILE) -f $(COMPOSE_PROD) up -d

.PHONY: up build no-cache re reset prod

# ══════════════════════════════════════════════════════
#                 STOPING THE STACK
# ══════════════════════════════════════════════════════

##@ STOP STACK

down: ## Stop all running containers
	@docker compose -f $(COMPOSE_ALL) down

down-v: ## Remove volumes and stop running containers
	@ docker compose -f $(COMPOSE_ALL) down -v

.PHONY: down down-v

# ══════════════════════════════════════════════════════
#               		UTILITY
# ══════════════════════════════════════════════════════
##@ UTILITY

ps: ## Display all running containers
	@docker compose -f $(COMPOSE_ALL) ps
	
ls: ## Display all images
	@docker image ls -a
	
info: ## Display Docker system information, build cache, etc. 
	@docker system df

.PHONY: ps ls info

# ══════════════════════════════════════════════════════
#               	 	 LOGS
# ══════════════════════════════════════════════════════

##@ LOGS

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

.PHONY: logs logs-proxy logs-front logs-back logs-db
