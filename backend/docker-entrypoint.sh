#!/bin/sh
set -e

export DATABASE_URL=$(cat /run/secrets/database_url)
export JWT_SECRET=$(cat /run/secrets/jwt_secret)

npx prisma db push
exec "$@"