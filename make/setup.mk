# ══════════════════════════════════════════════════════
#               DEFAULT SETUP FOR DEV USE
# ══════════════════════════════════════════════════════

SECRETS_DIR = secrets/

# ── Add new .env defaults here ────────────────────────────────────────────────
# Format: KEY=value   (replaces the KEY=... line after copying .env.example)
DEFAULT_ENV_VARS = \
	POSTGRES_VERSION=18-alpine \
	POSTGRES_DB=transcendence \
	POSTGRES_USER=postgres_superuser \
	BACKEND_USER=backend_user \
	JWT_SECRET=dev-jwt-secret-changeme

# ── Add new secrets here ───────────────────────────────────────────────────────
# Format: filename=content   (file created at $(SECRETS_DIR)filename)
DEFAULT_SECRETS = \
	backend_pw.txt=changeme \
	postgres_root_pw.txt=changeme

# ── Files that must exist before the stack can start ──────────────────────────
REQUIRED_FILES = \
	.env \
	$(SECRETS_DIR)backend_pw.txt \
	$(SECRETS_DIR)postgres_root_pw.txt

# ══════════════════════════════════════════════════════

##@ FAST SETUP

setup: ## Prompt to initialise .env and secrets — run automatically by 'make up'
	@printf "$(GOLD)Run with defaults?$(RES) [y/N]\n"
	@printf "$(ORANGE)[Warning] This will overwrite your current '.env' and secrets$(RES)\n"
	@printf "> "; read ans; \
	case "$$ans" in \
		y|Y|yes|Yes|YES) \
			$(MAKE) --no-print-directory _setup-apply ;; \
		*) \
			$(MAKE) --no-print-directory _check-missing ;; \
	esac

_setup-apply: # Wipe and recreate .env and all secrets with hardcoded defaults
	@cp .env.example .env
	@echo "$(GREEN)✓ .env created from .env.example$(RES)"
	@for pair in $(DEFAULT_ENV_VARS); do \
		key=$$(echo "$$pair" | cut -d= -f1); \
		val=$$(echo "$$pair" | cut -d= -f2-); \
		sed -i "s|^$${key}=.*|$${key}=$${val}|" .env; \
	done
	@echo "$(GREEN)✓ Default values applied to .env$(RES)"
	@mkdir -p $(SECRETS_DIR)
	@for pair in $(DEFAULT_SECRETS); do \
		file=$$(echo "$$pair" | cut -d= -f1); \
		content=$$(echo "$$pair" | cut -d= -f2-); \
		echo "$$content" > $(SECRETS_DIR)$$file; \
		echo "$(GREEN)✓ $(SECRETS_DIR)$$file created$(RES)"; \
	done

_check-missing: # Verify all required files exist; abort with warnings if any are missing
	@missing=0; \
	for f in $(REQUIRED_FILES); do \
		if [ ! -f "$$f" ]; then \
			echo "$(RED)✗ Missing required file: $$f$(RES)"; \
			missing=1; \
		fi; \
	done; \
	if [ "$$missing" -eq 1 ]; then \
		echo "$(ORANGE)Run \`make setup\` to initialise missing files.$(RES)"; \
		exit 1; \
	fi; \
	echo "$(GREEN)✓ All required files present$(RES)"

.PHONY: setup _setup-apply _check-missing
