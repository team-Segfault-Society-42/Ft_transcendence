# ══════════════════════════════════════════════════════
#                      HELP
# ══════════════════════════════════════════════════════
##@ HELP

PRINT_TAGS = \
	if (index(comment, "[DEV]")) { \
		tag = "$(GREEN)[DEV]$(RES)"; \
		gsub(/\[DEV\]/, "", comment); \
	} else if (index(comment, "[PROD]") || index(comment, "[PRODUCTION]")) { \
		tag = "$(RED)[PROD]$(RES)"; \
		gsub(/\[PROD\]|\[PRODUCTION\]/, "", comment); \
	} \
	printf " ・$(CYAN)%-12s$(RES) %s %s\n", target, tag, comment; \

help: ## Show help
	@grep -hE '^[a-zA-Z_-]+:.*?##|^##@' $(MAKEFILE_LIST) | awk ' \
		BEGIN { FS = ":.*?## " } \
		/^##@/ { \
			section = substr($$0, 5); \
			printf "\n$(BOLD_YEL) %-15s $(RES)\n", section; \
			is_stack = (section == "START STACK") ? 1 : 0; \
			next; \
		} \
		{ \
			target = $$1; \
			comment = $$2; \
			tag = ""; \
			\
			if (is_stack) { \
				$(PRINT_TAGS) \
			} \
			else { \
				printf " ・$(CYAN)%-12s$(RES) %s\n", target, comment; \
			}\
		}'

.PHONY: help