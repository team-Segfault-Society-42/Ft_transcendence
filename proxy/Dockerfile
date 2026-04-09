# ── Development ──────────────────────────────────────────────────────────────
FROM nginx:1.28-alpine AS dev
COPY nginx.dev.conf /etc/nginx/nginx.conf

EXPOSE 1024

# ── Production ───────────────────────────────────────────────────────────────
FROM nginx:1.28-alpine AS prod

ARG DOMAIN

# Generate a self-signed TLS certificate at build time.
# -x509            : output a self-signed cert rather than a CSR
# -nodes           : no passphrase on the private key — nginx reads it without interaction
# -days 365        : cert valid for 1 year
# -newkey rsa:2048 : generate a fresh 2048-bit RSA key pair
# -subj            : certificate metadata; CN is the domain the cert is issued for
# -addext SAN      : modern browsers check SAN rather than CN — must match the domain
RUN apk add --no-cache openssl && \
    mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout /etc/nginx/ssl/key.pem \
      -out /etc/nginx/ssl/cert.pem \
      -subj "/C=CH/ST=Vaud/L=Lausanne/O=42Lausanne/CN=${DOMAIN}" \
      -addext "subjectAltName=DNS:localhost,IP:${DOMAIN}"

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80 443