FROM node:25-alpine3.23

WORKDIR /app

COPY package*json ./

RUN npm install

COPY . .

# NestJS defaults to port 3000
EXPOSE 3000

# NestJS has multiple start script options:
	# start 		-> plain run, no waching
	# start:dev		-> Watches for file changes, auto-restart
	# start:prod	-> Runs the compiled `/dist` output
CMD [ "npm", "run", "start:dev" ]