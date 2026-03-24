# ── Stage 1: Development ─────────────────────────────────────────────────────
FROM node:25-alpine3.23 AS dev

WORKDIR /app

COPY package*json ./

RUN npm install

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .

# NestJS defaults to port 3000
EXPOSE 3000

# NestJS has multiple start script options:
	# start 		-> plain run, no waching
	# start:dev		-> Watches for file changes, auto-restart
	# start:prod	-> Runs the compiled `/dist` output
CMD [ "sh", "-c", "npx prisma db push && npm run start:dev" ]

# ── Stage 2: Production ─────────────────────────────────────────────────────
FROM node:25-alpine3.23 AS prod

WORKDIR /app

COPY package*json ./

RUN npm install --only=production

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .

RUN npm run build

# NestJS defaults to port 3000
EXPOSE 3000

# NestJS has multiple start script options:
	# start 		-> plain run, no waching
	# start:dev		-> Watches for file changes, auto-restart
	# start:prod	-> Runs the compiled `/dist` output
CMD [ "sh", "-c", "npx prisma db push && npm run start:prod" ]