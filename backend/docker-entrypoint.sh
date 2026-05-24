#!/bin/sh

# ── Construct Database URL ───────────────────────────────────────────────────
BACKEND_PW=$(cat /run/secrets/backend_pw)
DATABASE_URL="postgresql://${BACKEND_USER}:${BACKEND_PW}@db:5432/${POSTGRES_DB}?schema=public"

# ── Export Environment Variables ─────────────────────────────────────────────
export DATABASE_URL
export JWT_SECRET=$(cat /run/secrets/jwt_secret)
export FORTYTWO_CLIENT_ID=$(cat /run/secrets/fortytwo_client_id)
export FORTYTWO_CLIENT_SECRET=$(cat /run/secrets/fortytwo_client_secret)

# ── Apply Schema to Database ─────────────────────────────────────────────────
npx prisma db push

# ── Seed Database ────────────────────────────────────────────────────────────
echo "🌱 Seeding dummy users and games..."
if [ "$NODE_ENV" = "production" ]; then
	node ./dist/prisma/seed.js
else
	npx prisma db seed
fi

exec "$@"
