# Vite default port 5173, adjust depending on setup, port can be modified
# in command line with the --port <port_number> option
# or in vite.config.ts using the server { port: <port_number> } directive

# ── Stage 1: Development (For local coding/HMR) ──────────────────────────────
FROM node:25-alpine3.23 AS dev

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173
CMD [ "npx", "vite", "--host" ]


# ── Stage 2: Build (helper to compile the app) ───────────────────────────────
FROM node:25-alpine3.23 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build 

# ── Stage 3: Production ──────────────────────────────────────────────────────
FROM nginx:1.28-alpine AS prod

RUN rm -rf /usr/share/nginx/html/*
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80