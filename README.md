# TheLarte - Microservices Architecture

TheLarte is a furniture store management system built with a microservices architecture, designed to be run exclusively with Docker.

## Architecture Overview

The system is composed of several microservices:

- **Discovery Service**: Eureka service registry for service discovery
- **API Gateway**: Routes requests to appropriate microservices
- **Auth Service**: Handles authentication and authorization using PostgreSQL
- **User Service**: Manages employee and customer data
- **Inventory Service**: Manages furniture inventory
- **Sales Service**: Handles sales operations
- **Billing Service**: Manages invoicing and payments

All services use PostgreSQL database with separate schemas for data isolation.

## Running the Application

### Prerequisites

- Docker and Docker Compose installed
- Git (to clone the repository)

### Running in Development Mode

Run the following commands from PowerShell:

```powershell
# Navigate to the infra directory
cd C:\Users\edwin\Desktop\integrador\thelarte\infra

# Run all services in development mode with H2 database
docker compose --profile dev up -d
```

### Running in Production Mode

For production mode with PostgreSQL, secure passwords are required:

```powershell
# Navigate to the infra directory
cd C:\Users\edwin\Desktop\integrador\thelarte\infra

# Set secure passwords as environment variables for PostgreSQL and JWT
$Env:POSTGRES_PASSWORD = "your_secure_password"
$Env:JWT_SECRET = "your_secure_jwt_secret"

# Run all services in production mode
docker compose --profile prod up -d
```

### Stopping the Application

```powershell
# Navigate to the infra directory
cd C:\Users\edwin\Desktop\integrador\thelarte\infra

# Stop all services
docker compose down
```

### Access Points

- **Eureka Dashboard**: http://localhost:8761
- **API Gateway**: http://localhost:8080

## Environment Profiles

### Development Profile (`dev`)

- H2 in-memory database for quick setup and testing
- Automatic database schema creation (`spring.jpa.hibernate.ddl-auto=update`)
- H2 console accessible at `/h2-console` for each service
- Detailed SQL logging
- Debug level logging

### Production Profile (`prod`)

- PostgreSQL database with schema separation
- No automatic schema changes (`spring.jpa.hibernate.ddl-auto=validate`)
- Environment variable based secure passwords
- Minimal SQL logging
- Appropriate log levels for production

## Project Structure


```
thelarte/
│
├── build.gradle                # Configuración de construcción del proyecto raíz
├── settings.gradle             # Configuración de módulos del proyecto
├── gradlew                     # Scripts del wrapper de Gradle
├── gradlew.bat
│
├── api-gateway/               # Servicio API Gateway
│   ├── build.gradle
│   └── src/
│       └── main/
│           ├── java/com/thelarte/gateway/
│           │   ├── config/
│           │   └── GatewayApplication.java
│           └── resources/
│               └── application.properties
│
├── microservices/            # Carpeta que contiene todos los microservicios
│   │
│   ├── auth-service/         # Servicio de autenticación
│   │   ├── build.gradle
│   │   └── src/
│   │       └── main/
│   │           ├── java/com/thelarte/auth/
│   │           │   ├── config/
│   │           │   ├── controller/
│   │           │   ├── dto/
│   │           │   ├── entity/
│   │           │   ├── repository/
│   │           │   ├── service/
│   │           │   ├── util/
│   │           │   └── AuthServiceApplication.java
│   │           └── resources/
│   │               └── application.properties
│   │
│   ├── inventory-service/    # Servicio de gestión de inventario
│   │   ├── build.gradle
│   │   └── src/
│   │       └── main/
│   │           ├── java/com/thelarte/inventory/
│   │           │   ├── config/
│   │           │   ├── controller/
│   │           │   ├── dto/
│   │           │   ├── entity/
│   │           │   ├── exception/
│   │           │   ├── repository/
│   │           │   ├── service/
│   │           │   └── InventoryServiceApplication.java
│   │           └── resources/
│   │               └── application.properties
│   │
│   ├── sales-service/        # Servicio de gestión de ventas
│   │   ├── build.gradle
│   │   └── src/
│   │       └── main/
│   │           ├── java/com/thelarte/sales/
│   │           │   ├── config/
│   │           │   ├── controller/
│   │           │   ├── dto/
│   │           │   ├── entity/
│   │           │   ├── exception/
│   │           │   ├── repository/
│   │           │   ├── service/
│   │           │   └── SalesServiceApplication.java
│   │           └── resources/
│   │               └── application.properties
│   │
│   ├── billing-service/      # Servicio de facturación y pagos
│   │   ├── build.gradle
│   │   └── src/
│   │       └── main/
│   │           ├── java/com/thelarte/billing/
│   │           │   ├── config/
│   │           │   ├── controller/
│   │           │   ├── dto/
│   │           │   ├── entity/
│   │           │   ├── exception/
│   │           │   ├── repository/
│   │           │   ├── service/
│   │           │   └── BillingServiceApplication.java
│   │           └── resources/
│   │               └── application.properties
│   │
│   └── user-service/        # Servicio de gestión de usuarios (empleados y clientes)
│       ├── build.gradle
│       └── src/
│           └── main/
│               ├── java/com/thelarte/user/
│               │   ├── controller/
│               │   │   ├── ClienteController.java
│               │   │   ├── EmpleadoController.java
│               │   │   └── PersonaController.java
│               │   ├── model/
│               │   │   ├── Cliente.java
│               │   │   ├── Empleado.java
│               │   │   └── Persona.java
│               │   ├── repository/
│               │   │   ├── ClienteRepository.java
│               │   │   ├── EmpleadoRepository.java
│               │   │   └── PersonaRepository.java
│               │   ├── service/
│               │   │   ├── ClienteService.java
│               │   │   ├── EmpleadoService.java
│               │   │   ├── PersonaService.java
│               │   │   └── impl/
│               │   │       ├── ClienteServiceImpl.java
│               │   │       ├── EmpleadoServiceImpl.java
│               │   │       └── PersonaServiceImpl.java
│               │   ├── util/
│               │   │   └── Rol.java
│               │   └── UserServiceApplication.java
│               └── resources/
│                   └── application.properties
│
├── shared-library/          # Biblioteca compartida entre servicios
│   ├── build.gradle
│   └── src/
│       └── main/
│           └── java/com/thelarte/shared/
│               ├── dto/
│               ├── exception/
│               ├── model/
│               └── util/
│
├── frontend/                # Aplicación frontend
│   ├── package.json
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── assets/
│
├── infra/                   # Infraestructura como código
│   ├── docker-compose.yml
│   ├── kubernetes/
│   └── ci-cd/
│
└── docs/                    # Documentación del proyecto
    ├── architecture/
    ├── api/
    └── user-guides/
```

## Organización interna de cada microservicio

Cada microservicio sigue una estructura común:

- **config/**: Configuraciones específicas del servicio
- **controller/**: Controladores REST
- **dto/**: Objetos de transferencia de datos
- **entity/**: Entidades específicas del servicio
- **exception/**: Excepciones personalizadas
- **repository/**: Repositorios de acceso a datos
- **service/**: Servicios de negocio
- **util/**: Utilidades específicas del servicio

## Shared Library

La biblioteca compartida (`shared-library`) contiene modelos de dominio comunes y utilidades compartidas entre servicios:

- **dto/**: DTOs compartidos
- **exception/**: Excepciones compartidas
- **model/**: Modelos de dominio compartidos
- **util/**: Utilidades generales

## Convenciones de nombrado

- Todos los paquetes siguen el formato `com.thelarte.[nombre-modulo]`
- Las clases de entidad usan nomenclatura singular (ej: Producto, not Productos)
- Los repositorios siguen la convención de Spring Data (ej: ProductoRepository)
- Los servicios implementan interfaces y tienen su implementación (ej: ProductoService, ProductoServiceImpl)