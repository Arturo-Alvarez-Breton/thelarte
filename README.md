# TheLarte - Microservices Architecture

TheLarte is a furniture store management system built with a microservices architecture, designed to be run exclusively with Docker.

## Architecture Overview

The system is composed of several microservices:

- **Discovery Service**: Eureka service registry for service discovery
- **API Gateway**: Routes requests to appropriate microservices
- **Auth Service**: Handles authentication and authorization
- **User Service**: Manages employee and customer data
- **Inventory Service**: Manages furniture inventory
- **Sales Service**: Handles sales operations
- **Billing Service**: Manages invoicing and payments

## Running the Application

### Prerequisites

Ensure the following tools are installed:

- Docker and Docker Compose
- Git (to clone the repository)

### Steps to Run the Project

1. Clone the repository:

   ```bash
   git clone https://github.com/your-repo/thelarte.git
   cd thelarte
   ```

2. Run the application:

   - **Development Mode** (uses H2 database):
     ```bash
     docker compose --profile dev up -d
     ```

   - **Production Mode** (uses PostgreSQL):
     Set secure environment variables for PostgreSQL and JWT secrets:
     ```bash
     export POSTGRES_PASSWORD="your_secure_password"
     export JWT_SECRET="your_secure_jwt_secret"
     docker compose --profile prod up -d
     ```

3. Stop the application:
   ```bash
   docker compose down
   ```

### Access Points

Once the application is running, you can access the following:

- **Eureka Dashboard**: [http://localhost:8761](http://localhost:8761)
- **API Gateway**: [http://localhost:8080](http://localhost:8080)

### Environment Profiles

- **Development (`dev`)**:
  - Uses H2 in-memory database for quick setup.
  - Automatic schema creation and detailed logging.
  - Accessible H2 console at `/h2-console`.

- **Production (`prod`)**:
  - Uses PostgreSQL with secure credentials.
  - Validates schema without automatic changes.
  - Optimized logging for production.

## Project Structure

Refer to the detailed project structure in the original documentation for more information.