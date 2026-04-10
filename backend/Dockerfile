# ── Stage 1: Development ─────────────────────────────────────────────────────
FROM node:25-alpine3.23 AS dev

WORKDIR /app
COPY package*json ./
RUN npm install

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .

EXPOSE 3000
CMD [ "sh", "-c", "npx prisma db push && npm run start:dev" ]

# ── Stage 2: Build ───────────────────────────────────────────────────────────
FROM node:25-alpine3.23 AS build

WORKDIR /app
COPY package*json ./
RUN npm install

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .
RUN npm run build

# ── Stage 3: Production ───────────────────────────────────────────────────────
FROM node:25-alpine3.23 AS prod

WORKDIR /app
COPY package*json ./
RUN npm install --only=production

COPY prisma ./prisma/
RUN npx prisma generate

COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD [ "sh", "-c", "npx prisma db push && npm run start:prod" ]

# NestJS multiple start script options:
	# start 		-> plain run, no waching
	# start:dev		-> Watches for file changes, auto-restart
	# start:prod	-> Runs the compiled `/dist` output

# NestJS defaults to port 3000