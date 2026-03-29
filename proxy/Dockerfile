# ── Development ──────────────────────────────────────────────────────────────
FROM nginx:1.28-alpine AS dev
COPY nginx.dev.conf /etc/nginx/nginx.conf

EXPOSE 1024

# ── Production ───────────────────────────────────────────────────────────────
FROM nginx:1.28-alpine AS prod
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 443