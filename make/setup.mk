# ══════════════════════════════════════════════════════
#               DEFAULTS FOR DOTENV FILES
# ══════════════════════════════════════════════════════

SECRETS_DIR = secrets/

# ── 42 OAuth field → secret file mapping ─────────────────────────────────────
# Format: CONF_KEY=secretfilename   (read from oauth-credentials.conf)
OAUTH_FIELDS = \
	FORTYTWO_CLIENT_ID=fortytwo_client_id.txt \
	FORTYTWO_CLIENT_SECRET=fortytwo_client_secret.txt

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
	database_url.txt=postgresql://backend_user:changeme@db:5432/transcendence?schema=public \
	fortytwo_client_id.txt=your_42_OAuth_id \
	fortytwo_client_secret.txt=your_42_OAuth_Secret

# ── Files that must exist before the stack can start ──────────────────────────
REQUIRED_FILES = \
	.env.dev \
	.env.prod \
	$(SECRETS_DIR)backend_pw.txt \
	$(SECRETS_DIR)postgres_root_pw.txt \
	$(SECRETS_DIR)jwt_secret.txt \
	$(SECRETS_DIR)database_url.txt \
	$(SECRETS_DIR)fortytwo_client_id.txt \
	$(SECRETS_DIR)fortytwo_client_secret.txt

# ══════════════════════════════════════════════════════

##@ DEV TOOLS

setup: ## Prompts user to create default setup and secrets [DEV]
	@echo "$(ORANGE)Building default setup will overwrite all setup files.$(RES)"; \
	printf "$(CYAN)Build default setup?$(RES) [Y/n] "; read ans; \
	case "$$ans" in \
		y|Y|yes|Yes|YES|"") \
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

.PHONY: setup _check-required-files

# ══════════════════════════════════════════════════════
#               AUTO BUILD DOTENV FILES
# ══════════════════════════════════════════════════════

_setup-apply: # Generate .env.dev and .env.prod and create all secrets
# ── Build .env.dev ───────────────────────────────────────────────────────────
	@cp .env.dev.example .env.dev
	@for pair in $(ENV_VARS); do \
		key=$$(echo "$$pair" | cut -d= -f1); \
		val=$$(echo "$$pair" | cut -d= -f2-); \
		sed -i "s|^$${key}=.*|$${key}=$${val}|" .env.dev; \
	done
	@echo "$(GREEN)✓ Created .env.dev with defaults$(RES)"
# ── Build .env.prod ──────────────────────────────────────────────────────────
	@cp .env.prod.example .env.prod
	@for pair in $(ENV_VARS); do \
		key=$$(echo "$$pair" | cut -d= -f1); \
		val=$$(echo "$$pair" | cut -d= -f2-); \
		sed -i "s|^$${key}=.*|$${key}=$${val}|" .env.prod; \
	done
	@echo "$(GREEN)✓ Created .env.prod with defaults$(RES)"
# ── Create Secret Files ──────────────────────────────────────────────────────
	@mkdir -p $(SECRETS_DIR)
	@for pair in $(DEFAULT_SECRETS); do \
		file=$$(echo "$$pair" | cut -d= -f1); \
		content=$$(echo "$$pair" | cut -d= -f2-); \
		echo "$$content" > $(SECRETS_DIR)$$file; \
		echo "$(GREEN)✓ $(SECRETS_DIR)$$file created$(RES)"; \
	done
# ── Prompt for auto LAN setup ────────────────────────────────────────────────
	@printf "$(CYAN)Automatically setup DOMAIN?$(RES) [Y/n] "; read ans; \
	case "$$ans" in \
		y|Y|yes|Yes|YES|"") \
			$(MAKE) --no-print-directory _domain-dev ;\
			$(MAKE) --no-print-directory _domain-prod ;; \
		*) \
			exit 0 ;; \
	esac
# ── 42 OAuth Secrets ────────────────────────────────────────────────
	@$(MAKE) --no-print-directory _oauth-credentials ;

.PHONY: _setup-apply

# ══════════════════════════════════════════════════════
#             DOMAIN AUTOMATIC CONFIGURATION
# ══════════════════════════════════════════════════════
_domain-dev: # Prompt user and setup DOMAIN in .env.dev
	@printf "$(GREEN)[DEV]  $(CYAN)Set DOMAIN to local LAN?$(RES) [Y/n] "; read ans; \
	case "$$ans" in \
		y|Y|yes|Yes|YES|"") \
			ip=$$(ip route get 1.1.1.1 | awk '{for(i=1;i<=NF;i++) if($$i=="src") print $$(i+1)}'); \
			sed -i "s|^DOMAIN=.*|DOMAIN=$$ip|" .env.dev; \
			sed -i "s|http://[0-9.]*:1024|http://$$ip:1024|g" .env.dev; \
			echo "       Using custom DOMAIN: '$(GOLD)$$ip$(RES)'\n";; \
		*) \
			echo "       Using default DOMAIN: '$(GOLD)127.0.0.1$(RES)'\n";; \
	esac

_domain-prod: # Prompt user and setup DOMAIN in .env.prod
	@printf "$(RED)[PROD] $(CYAN)Set DOMAIN to local LAN?$(RES) [Y/n] "; read ans; \
	case "$$ans" in \
		y|Y|yes|Yes|YES|"") \
			ip=$$(ip route get 1.1.1.1 | awk '{for(i=1;i<=NF;i++) if($$i=="src") print $$(i+1)}'); \
			sed -i "s|^DOMAIN=.*|DOMAIN=$$ip|" .env.prod; \
			sed -i "s|https://[0-9.]*:8443|https://$$ip:8443|g" .env.prod; \
			echo "       Using custom DOMAIN: '$(GOLD)$$ip$(RES)'\n";; \
		*) \
			echo "       Using default DOMAIN: '$(GOLD)127.0.0.1$(RES)'\n";; \
	esac

seed: ## Populates the DB with 10 dummy users (Requires the stack to be running) [DEV]
	@echo "$(GREEN)═════ DEV ═════════════════════════$(RES)"
	@docker compose -p dev -f $(COMPOSE_FILE) -f $(COMPOSE_DEV) exec backend npx prisma db seed
	@echo "\n$(RED)═════ PROD ════════════════════════$(RES)"
	@docker compose -p prod -f $(COMPOSE_FILE) -f $(COMPOSE_PROD) exec backend node ./dist/prisma/seed.js

.PHONY: _domain-dev _domain-prod

# ══════════════════════════════════════════════════════
#            42 OAUTH AUTOMATIC CONFIGURATION
# ══════════════════════════════════════════════════════

_oauth-credentials: # Reads values from oauth-credentials.conf and copies them to relevant secrets
	@if [ ! -f "oauth-credentials.conf" ]; then \
		echo "$(BOLD_ORANGE)△ Missing file for automatic setup: $(RES)oauth-credentials.conf"; \
		echo "$(ORANGE)└─$(RES) Secrets $(MAGENTA)fortytwo_client_id.txt$(RES) and $(MAGENTA)fortytwo_client_secret.txt$(RES) must be set manually."; \
		echo "   Alternatively, refer to 'oauth-credentials.conf.example' for automatic setup instructions."; \
	else \
		missing=""; \
		for pair in $(OAUTH_FIELDS); do \
			field=$$(echo "$$pair" | cut -d= -f1); \
			val=$$(grep "^$${field}=" oauth-credentials.conf | cut -d= -f2-); \
			if [ -z "$$val" ]; then \
				missing="$$missing $$field"; \
			fi; \
		done; \
		if [ -n "$$missing" ]; then \
			echo "$(BOLD_ORANGE)△ oauth-credentials.conf is misconfigured — missing:$(RES)$$missing"; \
			echo "$(ORANGE)└─$(RES) Fix it or set the secrets manually."; \
		else \
			for pair in $(OAUTH_FIELDS); do \
				field=$$(echo "$$pair" | cut -d= -f1); \
				file=$$(echo "$$pair" | cut -d= -f2-); \
				val=$$(grep "^$${field}=" oauth-credentials.conf | cut -d= -f2-); \
				echo "$$val" > $(SECRETS_DIR)$$file; \
				echo "$(GREEN)✓ $(SECRETS_DIR)$$file updated from oauth-credentials.conf$(RES)"; \
			done; \
		fi; \
	fi

.PHONY: _oauth-credentials
