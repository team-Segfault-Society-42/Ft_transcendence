#!/bin/sh

export DATABASE_URL=$(cat /run/secrets/database_url)
export JWT_SECRET=$(cat /run/secrets/jwt_secret)

npx prisma db push

echo "🌱 Seeding dummy users and games..."
if [ "$NODE_ENV" = "production" ]; then
	node ./dist/prisma/seed.js
else
	npx prisma db seed
fi

exec "$@"
