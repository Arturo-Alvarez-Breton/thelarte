# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build and Run
- `./gradlew bootRun` - Start the Spring Boot application (available at http://localhost:8080)
- `./gradlew build` - Build the project
- `./gradlew clean` - Clean build artifacts

### Testing
- `./gradlew test` - Run all tests
- `./gradlew check` - Run all checks including tests

### Docker Commands

#### Production Deployment (with PostgreSQL)
- `docker-compose up -d` - Start app + PostgreSQL in production mode
- `docker-compose down` - Stop all services
- `docker-compose logs app` - View application logs
- `docker-compose logs postgres` - View database logs

#### Development Mode (with H2)
- `docker-compose -f docker-compose.dev.yml up` - Start app with H2 database
- `docker-compose -f docker-compose.dev.yml down` - Stop development services

#### Environment Setup
1. Copy `.env.example` to `.env`
2. Set `POSTGRES_PASSWORD` in `.env` file
3. Run `docker-compose up -d`

### Database Configuration
- **Development**: H2 in-memory database (default profile)
- **Production**: PostgreSQL with Docker (prod profile)
- **Docker Production**: Automatically uses `prod` profile with PostgreSQL container

## Architecture Overview

TheLarte is a consolidated Spring Boot application for furniture store management. Originally designed as microservices, it has been unified into a single application with modular package structure.

### Core Modules
- **Auth Module** (`com.thelarte.auth`): Authentication, JWT tokens, user management, and security configuration
- **Inventory Module** (`com.thelarte.inventory`): Product and unit management
- **Transactions Module** (`com.thelarte.transacciones`): Transaction processing and line items
- **User Module** (`com.thelarte.user`): Cliente, Empleado, and Persona management
- **Shared Module** (`com.thelarte.shared`): Common entities like Suplidor

### Key Technical Details
- Uses Spring Security with JWT authentication
- JPA/Hibernate for data persistence
- Lombok for reducing boilerplate code
- Custom DTOs for data transfer
- Exception handling with custom exceptions
- H2 for development, PostgreSQL for production

### Frontend Structure
Static files are located in `src/main/resources/static/`:
- HTML pages in `pages/` directory
- JavaScript modules in `js/` directory organized by feature
- Images and assets in respective directories
- No React - uses vanilla JavaScript with modular structure

### Database Migration
- Flyway migrations in `src/main/resources/db/migration/`
- Current schema supports transaction states and user roles

### Key Services
- `AuthService`: User authentication and registration
- `TransaccionService`: Transaction processing and management
- `ProductoService`: Product catalog management
- `UserService`: User profile management