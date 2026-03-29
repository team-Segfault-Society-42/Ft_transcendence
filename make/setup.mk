# ══════════════════════════════════════════════════════
#               DEFAULT SETUP FOR DEV USE
# ══════════════════════════════════════════════════════

SECRETS_DIR				= secrets/
BACKEND_PW_FILE			= backend_pw.txt
POSTGRES_ROOT_PW_FILE	= postgres_root_pw.txt

##@ FAST SETUP
setup: check-env create-secrets set-defaults-env ## Initialise all files needed to run the project (uses default values)
	@echo "$(GREEN)✓ Setup complete. Run \`make up\` to start the stack.$(RES)"

# ── .env ─────────────────────────────────────────────────────
check-env: # Create .env from .env.example if it doesn't already exist
	@if [ -f .env ]; then \
		echo "$(CYAN)<.env already exists, skipping>$(RES)"; \
	else \
		cp .env.example .env; \
		echo "$(GREEN)✓ .env created from .env.example$(RES)"; \
	fi

set-defaults-env: # Replaces placeholders for Key-Value pairs that need a valid value
	@sed -i -e 's/postgres_image_tag #ex: 18-alpine/18-alpine/' .env

# ── Secrets ──────────────────────────────────────────────────
create-secrets: backend-pw postgres-root-pw # Create default secret files if missing

backend-pw:
	@mkdir -p secrets
	@echo "changeme" > $(SECRETS_DIR)$(BACKEND_PW_FILE)
	@echo "$(GREEN)✓ $(SECRETS_DIR)$(BACKEND_PW_FILE) created$(RES)"

postgres-root-pw:
	@mkdir -p secrets
	@echo "changeme" > $(SECRETS_DIR)$(POSTGRES_ROOT_PW_FILE)
	@echo "$(GREEN)✓ $(SECRETS_DIR)$(POSTGRES_ROOT_PW_FILE) created$(RES)"

.PHONY: setup check-env set-defaults-env create-secrets backend-pw postgres-root-pw
