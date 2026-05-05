# ── Stage 1: Development ─────────────────────────────────────────────────────
FROM node:24-alpine3.23 AS dev

WORKDIR /app
COPY package*json ./
RUN npm install

COPY prisma ./prisma/
RUN npx prisma generate

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

COPY . .

EXPOSE 3000
ENTRYPOINT ["docker-entrypoint.sh"]
CMD [ "npm", "run", "start:dev" ]

# ── Stage 2: Build ───────────────────────────────────────────────────────────
FROM node:24-alpine3.23 AS build

WORKDIR /app
COPY package*json ./
RUN npm install

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .
RUN 	npm run build \
	&&	npx tsc --project tsconfig.seed.json \
	&& 	ls -la /app/dist/


# ── Stage 3: Production ───────────────────────────────────────────────────────
FROM node:24-alpine3.23 AS prod

WORKDIR /app
COPY package*json ./
RUN npm install --omit=dev

COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN npx prisma generate

COPY --from=build /app/dist ./dist

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["docker-entrypoint.sh"]
CMD [ "npm", "run", "start:prod" ]

# NestJS multiple start script options:
	# start 		-> plain run, no waching
	# start:dev		-> Watches for file changes, auto-restart
	# start:prod	-> Runs the compiled `/dist` output

# NestJS defaults to port 3000
