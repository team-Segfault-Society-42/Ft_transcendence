# ── Development ──────────────────────────────────────────────────────────────
FROM nginx:1.28-alpine AS dev
COPY nginx.dev.conf /etc/nginx/nginx.conf

EXPOSE 1024

# ── Production ───────────────────────────────────────────────────────────────
FROM nginx:1.28-alpine AS prod

# Generate a self-signed TLS certificate at build time.
# -x509       : output a self-signed cert rather than a CSR
# -nodes      : don't encrypt the private key (no passphrase — nginx can read it without interaction)
# -days 365   : cert is valid for 1 year
# -newkey rsa:2048 : generate a fresh 2048-bit RSA key pair
# -subj       : skip the interactive prompt; CN=localhost works for local / 42 eval machines
RUN apk add --no-cache openssl && \
    mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout /etc/nginx/ssl/key.pem \
      -out /etc/nginx/ssl/cert.pem \
      -subj "/C=CH/ST=Vaud/L=Lausanne/O=42Lausanne/CN=localhost"

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80 443