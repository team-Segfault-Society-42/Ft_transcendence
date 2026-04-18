# ══════════════════════════════════════════════════════
#               DEFAULT SETUP FOR DEV USE
# ══════════════════════════════════════════════════════

SECRETS_DIR = secrets/

# ── Add new .env defaults here ────────────────────────────────────────────────
# Format: KEY=value   (replaces the KEY=... line after copying .env.example)
DEFAULT_ENV_VARS = \
	DOMAIN=127.0.0.1 \
	POSTGRES_VERSION=18-alpine \
	POSTGRES_DB=transcendence \
	POSTGRES_USER=postgres_superuser \
	BACKEND_USER=backend_user \

# ── Dev-only vars not present in .env.example (appended to .env) ──────────────
DEV_ONLY_ENV_VARS = \
	BACKEND_PW=changeme \
	JWT_SECRET=jwt-changeme \

# ── Add new secrets here ───────────────────────────────────────────────────────
# Format: filename=content   (file created at $(SECRETS_DIR)filename)
DEFAULT_SECRETS = \
	backend_pw.txt=changeme \
	postgres_root_pw.txt=changeme \
	jwt_secret.txt=jwt-changeme \
	database_url.txt=postgresql://backend_user:changeme@db:5432/transcendence?schema=public

# ── Files that must exist before the stack can start ──────────────────────────
REQUIRED_FILES = \
	.env \
	$(SECRETS_DIR)backend_pw.txt \
	$(SECRETS_DIR)postgres_root_pw.txt \
	$(SECRETS_DIR)jwt_secret.txt \
	$(SECRETS_DIR)database_url.txt

# ══════════════════════════════════════════════════════

setup: # Checks required files; prompt for default setup if any are missing
	@missing=0; \
	for f in $(REQUIRED_FILES); do \
		if [ ! -f "$$f" ]; then \
			echo "$(RED)✗ Missing required file: $$f$(RES)"; \
			missing=1; \
		fi; \
	done; \
	if [ "$$missing" -eq 0 ]; then \
		echo "$(GREEN)✓ All required files present$(RES)"; \
		exit 0; \
	fi; \
	printf "$(CYAN)Build default setup?$(RES) [y/N] "; read ans; \
	case "$$ans" in \
		y|Y|yes|Yes|YES) \
			$(MAKE) --no-print-directory _setup-apply ;; \
		*) \
			echo "$(RED)Aborted. Fix missing files manually by running $(GOLD)\`make setup\`$(RES)"; \
			exit 1 ;; \
	esac

_setup-apply: # Wipe and recreate .env and all secrets with hardcoded defaults
	@{ \
		for pair in $(DEV_ONLY_ENV_VARS); do \
			echo "$$pair"; \
		done; \
		grep -v '^\s*#' .env.example; \
	} > .env
	@echo "$(GREEN)✓ .env created (dev-only vars prepended, comments stripped)$(RES)"
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

.PHONY: setup _setup-apply
