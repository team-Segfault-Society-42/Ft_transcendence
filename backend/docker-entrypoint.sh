#!/bin/sh
set -e

# Export Databse URL from secret(Required by Prisma)
export DATABASE_URL=$(cat /run/secrets/database_url)
npx prisma db push
exec "$@"