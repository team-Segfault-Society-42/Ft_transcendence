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

all:
	@$(COMPOSE) up -d
	
build:
	@$(COMPOSE) build

down:
	@$(COMPOSE) down

no-cache:
	@$(COMPOSE) build --no-cache
	
# ══════════════════════════════════════════════════════
#                  UTILITY TARGETS
# ══════════════════════════════════════════════════════

ps:
	@$(COMPOSE) ps
	
ls:
	docker image ls -a
	
logs:
	@$(SHOW_LOGS)

logs-proxy:
	@$(SHOW_LOGS) $(SERVICE_PROXY)
	
logs-front:
	@$(SHOW_LOGS) $(SERVICE_FRONTEND)

logs-back:
	@$(SHOW_LOGS) $(SERVICE_FRONTEND)
	