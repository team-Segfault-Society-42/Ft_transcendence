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

### Basic Utility Commands

| Alias | Description |
| ------- | ------- |
| `make up` | _Builds and starts all containers_
| `make build` | _Builds all containers (does NOT start them)_
| `make down` | _Stops all containers_
| `make no-cache` | _Rebuilds all images with_ `--no-cache`
| `make ps` | _Display all running containers_
| `make ls` | _Shows list of containers_
| `make logs` | _Shows logs for all containers_
| `make clean` | _Remove dangling images, stopped containers, unused networks + build cache_
| `make nuke` | _Full wipe — stops stack, removes volumes + images_

### Container specific commands

| Alias | Description |
|-------|-------------|
| `make logs-proxy` | _Shows logs for NGINX service container_
| `make logs-front` | _Shows logs for FRONTEND service container_
| `make logs-back` | _Shows logs for BACKEND service container_
| `make no-cache` | _Rebuilds all images with --no-cache_