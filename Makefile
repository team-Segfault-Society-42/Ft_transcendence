# ══════════════════════════════════════════════════════
#                      VARIABLES
# ══════════════════════════════════════════════════════

SERVICE_PROXY		= proxy
SERVICE_FRONTEND	= frontend
SERVICE_BACKEND		= backend

COMPOSE				= docker compose
SHOW_LOGS			= docker compose logs

# ══════════════════════════════════════════════════════
#                 CORE DOCKER TARGETS
# ══════════════════════════════════════════════════════

up:
	$(COMPOSE) up -d
	
build:
	@$(COMPOSE) build

down:
	@$(COMPOSE) down

no-cache:
	@$(COMPOSE) build --no-cache
	
# ══════════════════════════════════════════════════════
#               UTILITY & LOGS TARGETS
# ══════════════════════════════════════════════════════

ps:
	@$(COMPOSE) ps
	
ls:
	@docker image ls -a
	
logs:
	@$(SHOW_LOGS)

logs-proxy:
	@$(SHOW_LOGS) $(SERVICE_PROXY)
	
logs-front:
	@$(SHOW_LOGS) $(SERVICE_FRONTEND)

logs-back:
	@$(SHOW_LOGS) $(SERVICE_BACKEND)

.PHONY: up build down no-cache ps ls logs logs-proxy logs-front logs-back clean nuke
