# ══════════════════════════════════════════════════════
#               DEFAULT SETUP FOR DEV USE
# ══════════════════════════════════════════════════════

SECRETS_DIR = secrets/

# ── Add new .env defaults here ────────────────────────────────────────────────
# Format: KEY=value   (KEY must match KEYs in .env.dev.example and .env.prod.example)
# Note: if POSTGRES_VERSION is changed, please update it in `make/clean.mk` too
ENV_VARS = \
	POSTGRES_VERSION=18-alpine \
	POSTGRES_DB=transcendence \
	POSTGRES_USER=postgres_superuser \
	BACKEND_USER=backend_user \

# ── Add new secrets here ───────────────────────────────────────────────────────
# Format: filename=content   (file created at $(SECRETS_DIR)filename)
DEFAULT_SECRETS = \
	backend_pw.txt=changeme \
	postgres_root_pw.txt=changeme \
	jwt_secret.txt=jwt-changeme \
	database_url.txt=postgresql://backend_user:changeme@db:5432/transcendence?schema=public

# ── Files that must exist before the stack can start ──────────────────────────
REQUIRED_FILES = \
	.env.dev \
	.env.prod \
	$(SECRETS_DIR)backend_pw.txt \
	$(SECRETS_DIR)postgres_root_pw.txt \
	$(SECRETS_DIR)jwt_secret.txt \
	$(SECRETS_DIR)database_url.txt

# ══════════════════════════════════════════════════════

##@ DEV TOOLS

setup: ## Prompts user to create default setup and secrets [DEV]
	@echo "$(ORANGE)Building default setup will overwrite all setup files.$(RES)"; \
	printf "$(CYAN)Build default setup?$(RES) [y/N] "; read ans; \
	case "$$ans" in \
		y|Y|yes|Yes|YES) \
			$(MAKE) --no-print-directory _setup-apply ;; \
		*) \
			exit 0 ;; \
	esac

_check-required-files: # Checks required files exist
	@missing=0; \
	for f in $(REQUIRED_FILES); do \
		if [ ! -f "$$f" ]; then \
			echo "$(RED)✗ Missing required file: $$f$(RES)"; \
			missing=1; \
		fi; \
	done; \
	if [ "$$missing" -eq 0 ]; then \
		echo "$(GREEN)✓ All required files present$(RES)"; \
	else \
		echo "$(CYAN)Missing files detected. Rebuilding defaults.$(RES)"; \
		$(MAKE) --no-print-directory _setup-apply ; \
	fi; \


_setup-apply: # Wipe and recreate .env and all secrets with hardcoded defaults
  	# ── Overwrite .env File ─────────────────────────────────────────────────────
	@{ \
		for pair in $(DEV_ONLY_ENV_VARS); do \
			echo "$$pair"; \
		done; \
		grep -v '^\s*#' .env.example; \
	} > .env
	@echo "$(GREEN)✓ .env created (dev-only vars prepended, comments stripped)$(RES)"
  	# ── Replace values with Defaults ─────────────────────────────────────────
	@for pair in $(ENV_VARS); do \
		key=$$(echo "$$pair" | cut -d= -f1); \
		val=$$(echo "$$pair" | cut -d= -f2-); \
		sed -i "s|^$${key}=.*|$${key}=$${val}|" .env; \
	done
	@echo "$(GREEN)✓ Default values applied to .env$(RES)"
  	# ── Create Secret Files ──────────────────────────────────────────────────
	@mkdir -p $(SECRETS_DIR)
	@for pair in $(DEFAULT_SECRETS); do \
		file=$$(echo "$$pair" | cut -d= -f1); \
		content=$$(echo "$$pair" | cut -d= -f2-); \
		echo "$$content" > $(SECRETS_DIR)$$file; \
		echo "$(GREEN)✓ $(SECRETS_DIR)$$file created$(RES)"; \
	done
  	# ── Prompt for auto LAN setup ────────────────────────────────────────────
	@printf "$(CYAN)Setup with local LAN?$(RES) [y/N] "; read ans; \
	case "$$ans" in \
		y|Y|yes|Yes|YES) \
			ip=$$(ip route get 1.1.1.1 | awk '{for(i=1;i<=NF;i++) if($$i=="src") print $$(i+1)}'); \
			sed -i "s|^DOMAIN=.*|DOMAIN=$$ip|" .env; \
			echo "Using custom DOMAIN: '$(GOLD)$$ip$(RES)'";; \
		*) \
			echo "Using default DOMAIN: '$(GOLD)127.0.0.1$(RES)'";; \
	esac

seed: ## Populates the DB with 10 dummy users (Requires the stack to be running) [DEV]
	@docker compose -p dev -f $(COMPOSE_FILE) -f $(COMPOSE_DEV) exec backend npx prisma db seed

.PHONY: setup _setup-apply _check-required-files
