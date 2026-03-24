# ══════════════════════════════════════════════════════
#                  CLEAN TARGETS
# ══════════════════════════════════════════════════════

##@ CLEAN

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
	@docker compose -f $(COMPOSE_ALL) down --volumes --remove-orphans
	@docker volume prune -f
 
	@echo $(CYAN)"<Removing images built by this stack>"$(RES)
	@docker compose -f $(COMPOSE_ALL) down --rmi local 2>/dev/null || true
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