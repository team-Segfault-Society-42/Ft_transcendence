*This project has been created as part of the 42 curriculum by ameechan, nryser, nadahman, mbendidi and jdecarro.*

# ft_transcendance

## Description

This project is a web application developed as the final project of the 42 curriculum.

The goal is to create a mulitplayer web application where users can interact and play games online.

Our project is based on a modern web architecture using a forntend, backend and database.

## Technical Stack

Frontend :  
-React  
-Vite  
-React Router  
-Tailwind CSS

Backend :  
-NestJS

Infrastructure :  
-NGINX (reverse proxy)  
-Docker / Docker compose

Database :  
-PostgreSQL

## Instructions

### Requirements

You must have the following installed :
-Docker  
-Docker compose

Check installation :
```bash
docker --version  
docker Compose version
```

### Run the project

### Basic utility commands

| Command | Alias | Description |
|-------|-------|-------------|
| docker compose build | make build | Builds all containers |
| docker compose up -d | make | Builds and starts all containers |
| docker compose down | make down | Stops all containers |
| docker image ls | make ls | Shows list of images |
| docker compose logs | make logs | Shows logs for all containers |

### Container specific commands

| Alias | Description |
|-------|-------------|
| make logs-proxy | Shows logs for NGINX service container
| make logs-front | Shows logs for FRONTEND service container
| make logs-back | Shows logs for BACKEND service container
| make no-cache | Rebuilds all images with --no-cache