# ══════════════════════════════════════════════════════
#                  CLEAN TARGETS
# ══════════════════════════════════════════════════════

# Fallback if .env is missing or does not define POSTGRES_VERSION (mirrors setup.mk default)
POSTGRES_VERSION ?= 18-alpine

##@ CLEAN

clean: ## Remove dangling images, stopped containers, unused networks + build cache [BOTH]
# ── Remove stopped containers ───────
	@echo "$(CYAN)<Removing Stopped Containers>$(RES)"
	@docker container prune -f
# ── Remove dangling images ──────────
	@echo "$(CYAN)<Removing Dangling Images>$(RES)"
	@docker image prune -f
# ── Remove unused networks ──────────
	@docker network prune -f
# ── Clear build cache ───────────────
	@echo "$(CYAN)<Removing Build Cache>$(RES)"
	@docker buildx prune -f
	@echo ""
	@docker system df


nuke: ## Full wipe — stops stack, removes volumes + images, deletes .env + secrets. [BOTH]
	@echo "$(ORANGE)⚠️  This will destroy all containers, images, and volumes for this stack,"
	@echo "$(RED)   AND:$(RES)"
	@echo "   - The .env file"
	@echo "   - All secret files"
	@echo "   - All Postgres data"
# 	@printf "$(CYAN)Continue? [y/N] $(RES)" && read ans && [ "$$ans" = "y" ] || (echo "$(RED)   Aborted$(RES)" && exit 1)
	@printf "$(CYAN)Continue? [y/N] $(RES)"; read ans; \
	case "$$ans" in \
		y|Y|yes|Yes|YES) \
			$(MAKE) --no-print-directory _nuke-apply ;; \
		*) \
			exit 0 ;; \
	esac
	
_nuke-apply: # Runs a full wipe
  	# ── Prompt for Postgres Image Removal ────────────────────────────────────
	@printf "$(CYAN)Remove postgres:$(POSTGRES_VERSION)? Skip if rebuilding soon$(RES) [y/N] "; read ans; \
	case "$$ans" in \
		y|Y|yes|Yes|YES) \
			echo "$(CYAN)<Removing postgres:$(POSTGRES_VERSION)>$(RES)"; \
			docker image rm postgres:$(POSTGRES_VERSION) 2>/dev/null || true ;; \
		*) ;; \
	esac

  	# ── Stop Stack, Remove Containers + Volumes ──────────────────────────────
	@echo ""
	@echo "$(CYAN)<Stopping stack and removing containers + volumes>$(RES)"
	@docker compose -p dev -f $(COMPOSE_FILE) -f $(COMPOSE_DEV) $(ENV_DEV) down --volumes --remove-orphans
	@docker compose -p prod -f $(COMPOSE_FILE) -f $(COMPOSE_PROD) $(ENV_PROD) down --volumes --remove-orphans
	@docker volume prune -f

  	# ── Remove dev & prod Images ─────────────────────────────────────────────
	@echo "$(CYAN)<Removing images built by this stack>$(RES)"
	@docker compose -p dev -f $(COMPOSE_FILE) -f $(COMPOSE_DEV) $(ENV_DEV) down --rmi local 2>/dev/null || true
	@docker compose -p prod -f $(COMPOSE_FILE) -f $(COMPOSE_PROD) $(ENV_PROD) down --rmi local 2>/dev/null || true
	@docker image prune -f

  	# ── Clear Build Cache ────────────────────────────────────────────────────
	@echo "$(CYAN)<Clearing all build cache>$(RES)"
	@docker buildx prune -f

  	# ── Remove Setup & Secret Files ──────────────────────────────────────────
	@echo "$(CYAN)<Removing .env and secret files>$(RES)"
	@rm -f $(REQUIRED_FILES)
	@echo ""
	@echo "$(GREEN)Task completed. Everything is gone.$(RES)"
	@echo "   Run \`make up\` to rebuild from scratch."
	@echo ""
	@docker system df
	
.PHONY: clean nuke _nuke-apply
