# ══════════════════════════════════════════════════════
#                      HELP
# ══════════════════════════════════════════════════════
##@ HELP

PRINT_TAGS = \
	if (index(comment, "[DEV]")) { \
		tag = "$(GREEN)[DEV]$(RES)   —  "; \
		gsub(/\[DEV\]/, "", comment); \
	} else if (index(comment, "[PROD]") || index(comment, "[PRODUCTION]")) { \
		tag = "$(RED)[PROD]$(RES)  —  "; \
		gsub(/\[PROD\]|\[PRODUCTION\]/, "", comment); \
	} else if (index(comment, "[BOTH]")) { \
		tag = "$(MAGENTA)[BOTH]$(RES)  —  "; \
		gsub(/\[BOTH\]/, "", comment); \
	} else if (index(comment, "[UTIL]")) { \
		tag = "$(GREY)[UTIL]$(RES)  —  "; \
		gsub(/\[UTIL\]/, "", comment); \
	} \
	printf " ・$(CYAN)%-12s$(RES) %s %s\n", target, tag, comment; \

help: ## Show help [UTIL]
	@grep -hE '^[a-zA-Z_-]+:.*?##|^##@' $(MAKEFILE_LIST) | awk ' \
		BEGIN { FS = ":.*?## " } \
		/^##@/ { \
			section = substr($$0, 5); \
			printf "\n$(BOLD_YEL) %-15s $(RES)\n", section; \
			next; \
		} \
		{ \
			target = $$1; \
			comment = $$2; \
			tag = ""; \
			$(PRINT_TAGS) \
		}'

.PHONY: help