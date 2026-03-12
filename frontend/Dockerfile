FROM node:alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Vite default port 5173, adjust depending on setup, port can be modified
# in command line with the --port <port_number> option
# or in vite.config.ts using the server { port: <port_number> } directive
EXPOSE 5173

CMD [ "npx", "vite", "--host" ]