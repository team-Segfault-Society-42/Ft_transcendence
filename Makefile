include .env
export

# ══════════════════════════════════════════════════════
#                       COLOURS
# ══════════════════════════════════════════════════════
RES			= "\033[0m"
RED			= "\033[91m"
GREEN		= "\033[92m"
YELLOW		= "\033[93m"
ORANGE		= "\033[38;5;208m"
CYAN		= "\033[96m"
GOLD		= "\033[38;5;220m"
BOLD_YEL	= "\033[1m\033[33m"

# ══════════════════════════════════════════════════════
#                      VARIABLES
# ══════════════════════════════════════════════════════

SERVICE_PROXY		= proxy
SERVICE_FRONTEND	= frontend
SERVICE_BACKEND		= backend

COMPOSE_FILE		= compose.yaml
SHOW_LOGS			= docker compose logs

# ══════════════════════════════════════════════════════
#                      HELP
# ══════════════════════════════════════════════════════
##@ HELP

help: ## Show available targets
	@grep -hE '^[a-zA-Z_-]+:.*?##|^##@' Makefile \
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

up: ## Build and run all containers
	docker compose -f $(COMPOSE_FILE) up -d
	
build: ## Build all containers
	@docker compose -f $(COMPOSE_FILE) build

down: ## Stop all running containers
	@docker compose -f $(COMPOSE_FILE) down

down-v: ## Remove volumes and stop running containers
	@ docker compose -f $(COMPOSE_FILE) down -v

no-cache: ## Rebuild all containers in no-cache mode
	@docker compose -f $(COMPOSE_FILE) build --no-cache
	
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

# ══════════════════════════════════════════════════════
#                  CLEAN TARGETS
# ══════════════════════════════════════════════════════
##@ CLEAN
info: ## Display Docker system information, build cache, etc. 
	@docker system df

clean: ## Remove dangling images, stopped containers, unused networks + build cache
# ── Remove stopped containers ───────
	@echo $(CYAN)"<Removing Stopped Containers>"$(RES)
	@docker container prune -f
# ── Remove dangling images ──────────
	@echo $(CYAN)"<Removing Dangling Images>"$(RES)
	@docker image prune -f
# ── Remove unused networks ──────────
	@docker network prune -f
# ── Clear build cache ───────────────
	@echo $(CYAN)"<Removing Build Cache>"$(RES)
	@docker buildx prune -f
	@echo ""
	@docker system df


nuke: ## Full wipe — stops stack, removes volumes + images.
	@echo $(ORANGE)"⚠️  This will destroy all containers, images, and volumes for this stack."
	@echo "   Postgres data will be wiped."$(RES)
	@printf "   Continue? [y/N] " && read ans && [ "$$ans" = "y" ] || (echo $(RED)"   Aborted"$(RES) && exit 1)
 
	@echo ""
	@echo $(CYAN)"<Stopping stack and removing containers + volumes>"$(RES)
	@docker compose -f $(COMPOSE_FILE) down --volumes --remove-orphans
	@docker volume prune -f
 
	@echo $(CYAN)"<Removing images built by this stack>"$(RES)
	@docker compose -f $(COMPOSE_FILE) down --rmi local 2>/dev/null || true
	@docker image prune -f
 
	@echo $(CYAN)"<Removing postgres:$(POSTGRES_VERSION)>"$(RES)
	@docker image rm postgres:$(POSTGRES_VERSION) 2>/dev/null || true
 
	@echo $(CYAN)"<Clearing all build cache>"$(RES)
	@docker buildx prune -f
 
	@echo ""
	@echo $(GREEN)"Task completed. Everything is gone."$(RES)
	@echo "   Run \`make up\` to rebuild from scratch."
	@echo ""
	@docker system df

.PHONY: up build down no-cache ps ls logs logs-proxy logs-front logs-back clean nuke help
