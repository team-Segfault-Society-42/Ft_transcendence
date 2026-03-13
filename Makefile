# ══════════════════════════════════════════════════════
#                      VARIABLES
# ══════════════════════════════════════════════════════

SERVICE_PROXY		= proxy
SERVICE_FRONTEND	= frontend
SERVICE_BACKEND		= backend

COMPOSE_FILE		= compose.yaml
SHOW_LOGS			= docker compose logs

# ══════════════════════════════════════════════════════
#                 CORE DOCKER TARGETS
# ══════════════════════════════════════════════════════

up: ## Build and run all containers
	docker compose -f $(COMPOSE_FILE) up -d
	
build: ## Build all containers
	@docker compose -f $(COMPOSE_FILE) build

down: ## Stop all running containers
	@docker compose -f $(COMPOSE_FILE) down

no-cache: ## Rebuild all containers in no-cache mode
	@docker compose -f $(COMPOSE_FILE) build --no-cache
	
# ══════════════════════════════════════════════════════
#               UTILITY & LOGS TARGETS
# ══════════════════════════════════════════════════════

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

clean: ## Remove dangling images, stopped containers, unused networks + build cache
# ── Removes stopped containers ───────
	docker container prune -f
# ── Removes dangling images ──────────
	docker image prune -f
# ── Removes unused networks ──────────
	docker network prune -f
# ── clears build cache ───────────────
	docker buildx prune -f
	@echo ""
	@docker system df


.PHONY: up build down no-cache ps ls logs logs-proxy logs-front logs-back clean nuke
