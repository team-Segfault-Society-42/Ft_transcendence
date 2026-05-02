include make/colours.mk make/help.mk make/clean.mk make/setup.mk
-include .env.dev
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

ENV_DEV				= --env-file .env.dev
ENV_PROD			= --env-file .env.prod

# ══════════════════════════════════════════════════════
#                 STARTING THE STACK
# ══════════════════════════════════════════════════════
##@ START STACK

up: _check-required-files ## Start (or restart) the dev stack [DEV]
	@echo "$(GREEN)Running in Dev Mode$(RES)"
	@docker compose -p dev -f $(COMPOSE_FILE) -f $(COMPOSE_DEV) $(ENV_DEV) up -d

build: _check-required-files
	@docker compose -p dev -f $(COMPOSE_FILE) -f $(COMPOSE_DEV) $(ENV_DEV) build

no-cache: _check-required-files
	@docker compose -p dev -f $(COMPOSE_FILE) -f $(COMPOSE_DEV) $(ENV_DEV) build --no-cache

re: down build up ## Rebuild images and restart — use when Dockerfile or dependencies change [DEV]

reset: downv no-cache up ## Wipe volumes, full no-cache rebuild, restart [DEV]

prod: ## Start the stack, rebuild images [PROD]
	@echo "$(RED)Running in Production Mode$(RES)"
	@docker compose -p prod -f $(COMPOSE_FILE) -f $(COMPOSE_PROD) $(ENV_PROD) up -d --build

.PHONY: up build no-cache re reset prod

# ══════════════════════════════════════════════════════
#                 STOPING THE STACK
# ══════════════════════════════════════════════════════

##@ STOP STACK

down: ## Stop all running dev containers [DEV]
	@docker compose -p dev -f $(COMPOSE_FILE) -f $(COMPOSE_DEV) $(ENV_DEV) down

downv: # Remove volumes and stop running containers [DEV]
	@docker compose -p dev -f $(COMPOSE_FILE) -f $(COMPOSE_DEV) $(ENV_DEV) down -v

down-all: ## Stop all dev & prod containers [BOTH]
	@echo "$(GREEN)═════ DEV ═════════════════════════$(RES)"
	@docker compose -p dev -f $(COMPOSE_FILE) -f $(COMPOSE_DEV) $(ENV_DEV) down
	@echo "\n$(RED)═════ PROD ════════════════════════$(RES)"
	@docker compose -p prod -f $(COMPOSE_FILE) -f $(COMPOSE_PROD) $(ENV_PROD) down

p-down: ## Stop all running prod containers [PROD]
	@docker compose -p prod -f $(COMPOSE_FILE) -f $(COMPOSE_PROD) $(ENV_PROD) down

p-downv: # Remove volumes and stop running containers [PROD]
	@docker compose -p prod -f $(COMPOSE_FILE) -f $(COMPOSE_PROD) $(ENV_PROD) down -v

.PHONY: down downv down-all p-down p-downv

# ══════════════════════════════════════════════════════
#               		UTILITY
# ══════════════════════════════════════════════════════
##@ UTILITY

ps: ## Display all running containers [BOTH]
	@echo "$(GREEN)═════ DEV ═════════════════════════$(RES)"
	@docker compose -p dev -f $(COMPOSE_FILE) -f $(COMPOSE_DEV) $(ENV_DEV) ps
	@echo "\n$(RED)═════ PROD ════════════════════════$(RES)"
	@docker compose -p prod -f $(COMPOSE_FILE) -f $(COMPOSE_PROD) $(ENV_PROD) ps

ls: ## Display all images [UTIL]
	@docker image ls -a

info: # Display Docker system information, build cache, etc. [UTIL]
	@docker system df

swagger: ## Print URL to access Swagger Documentation [UTIL]
	@echo "$(GREEN)═════ DEV ═════════════════════════$(RES)"
	@echo "http://$(DOMAIN):1024/api/api-docs"
	@echo "\n$(RED)═════ PROD ════════════════════════$(RES)"
	@echo "https://$(DOMAIN):8443/api/api-docs"

prisma: ## Start Prisma Studio (Stack MUST be running) [DEV]
	@docker ps --filter "name=dev-backend" --filter "status=running" -q | grep -q . \
		|| (echo "$(BOLD_RED)Error: dev-backend not running, $(RES)Run $(BOLD_CYAN)make up$(RES) first." && exit 1)
	@docker exec -it dev-backend npx prisma studio --port 5555 --browser none --url="$(shell cat $(SECRETS_DIR)database_url.txt)" \
		|| true

.PHONY: ps ls info swagger prisma

# ══════════════════════════════════════════════════════
#               	 	 LOGS
# ══════════════════════════════════════════════════════

SHOW_DEV_LOGS = docker compose -p dev -f $(COMPOSE_FILE) -f $(COMPOSE_DEV) $(ENV_DEV) logs
SHOW_PROD_LOGS = docker compose -p prod -f $(COMPOSE_FILE) -f $(COMPOSE_PROD) $(ENV_PROD) logs

##@ LOGS

logs: ## Display logs for all containers [DEV]
	@$(SHOW_DEV_LOGS)

logs-proxy: ### Display logs for the proxy container [DEV]
	@$(SHOW_DEV_LOGS) -f $(SERVICE_PROXY)

logs-front: ### Display logs for the frontend container [DEV]
	@$(SHOW_DEV_LOGS) -f $(SERVICE_FRONTEND)

logs-back: ### Display logs for the backend container [DEV]
	@$(SHOW_DEV_LOGS) -f $(SERVICE_BACKEND)

logs-db: ### Display logs for the database container [DEV]
	@$(SHOW_DEV_LOGS) -f $(SERVICE_DATABASE)

p-logs: ## Display logs for all containers [PROD]
	@$(SHOW_PROD_LOGS)

p-logs-proxy: ### Display logs for the proxy container [PROD]
	@$(SHOW_PROD_LOGS) -f $(SERVICE_PROXY)

p-logs-front: ### Display logs for the frontend container [PROD]
	@$(SHOW_PROD_LOGS) -f $(SERVICE_FRONTEND)

p-logs-back: ### Display logs for the backend container [PROD]
	@$(SHOW_PROD_LOGS) -f $(SERVICE_BACKEND)

p-logs-db: ### Display logs for the database container [PROD]
	@$(SHOW_PROD_LOGS) -f $(SERVICE_DATABASE)

logs-help: ## Show all available log commands [UTIL]
	@printf "\n$(BOLD_YEL) LOGS           $(RES)\n"
	@grep -hE '^[a-zA-Z_-]+:.*?###|^##@' $(MAKEFILE_LIST) | awk ' \
		BEGIN { FS = ":.*?### "; in_logs = 0 } \
		/^##@ LOGS/ { in_logs = 1; next } \
		/^##@/      { in_logs = 0; next } \
		in_logs && /###/ { \
			target = $$1; \
			comment = $$2; \
			tag = ""; \
			$(PRINT_TAGS) \
		}'

.PHONY: logs logs-proxy logs-front logs-back logs-db p-logs p-logs-proxy p-logs-front p-logs-back p-logs-db logs-help
