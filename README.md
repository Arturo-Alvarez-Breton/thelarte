# The Larte - Arquitectura de Microservicios

## Estructura del Proyecto

Se ha reorganizado la estructura del proyecto para hacerlo más escalable, mantenible y coherente con un enfoque de microservicios y arquitectura multicapa:

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
│   └── billing-service/      # Servicio de facturación y pagos
│       ├── build.gradle
│       └── src/
│           └── main/
│               ├── java/com/thelarte/billing/
│               │   ├── config/
│               │   ├── controller/
│               │   ├── dto/
│               │   ├── entity/
│               │   ├── exception/
│               │   ├── repository/
│               │   ├── service/
│               │   └── BillingServiceApplication.java
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