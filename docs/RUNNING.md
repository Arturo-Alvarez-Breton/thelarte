# Running The Larte Microservices System

This document explains how to run The Larte furniture store management system using Docker.

## Prerequisites

- Docker and Docker Compose installed on your system
- JDK 17 or higher for development
- Gradle 7.6+ for building the project

## Building the Project

Before running the system with Docker, build all the services:

```bash
# From the root project directory
./gradlew clean build
```

## Running with Docker

The system can be run using Docker Compose which will start all services in the correct order:

```bash
# From the root project directory
cd infra
docker-compose up -d
```

This will start the following containers:
1. PostgreSQL database
2. Discovery Service (Eureka)
3. API Gateway
4. Auth Service
5. User Service
6. Inventory Service
7. Sales Service
8. Billing Service
9. Orchestrator Application

## Service Access

- **Discovery Service UI**: http://localhost:8761
- **API Gateway**: http://localhost:8080
- **Orchestrator**: http://localhost:9000
- **Individual services**: Available via the API Gateway

## Microservices Architecture

The system is built using the following architecture:

1. **Service Discovery**: Uses Netflix Eureka for service registration and discovery
2. **API Gateway**: Spring Cloud Gateway for routing requests to the appropriate service
3. **Database**: PostgreSQL for data persistence
4. **Microservices**:
   - Auth Service: Handles authentication and authorization
   - User Service: Manages users (employees, customers)
   - Inventory Service: Handles furniture inventory management 
   - Sales Service: Manages sales operations
   - Billing Service: Handles invoicing and payments

## Running Individual Services

For development, you can also run individual services using Gradle:

```bash
# Example: Running the Discovery Service
cd discovery-service
../gradlew bootRun
```

## Stopping the System

To stop all containers:

```bash
cd infra
docker-compose down
```

To also remove volumes (database data):

```bash
cd infra
docker-compose down -v
```
