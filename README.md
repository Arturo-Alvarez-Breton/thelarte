# TheLarte - Sistema de Gestión de Tienda de Muebles

## Descripción del Proyecto

**TheLarte** es un sistema completo de gestión empresarial desarrollado en **Spring Boot** para la administración de una tienda de muebles. El sistema incluye módulos para inventario, ventas, contabilidad, gestión de usuarios y reportes, con un sistema de autenticación basado en JWT y control de acceso por roles.

## Arquitectura del Sistema

### Tecnologías Utilizadas
- **Backend**: Spring Boot 3.5.4 con Java 17
- **Base de Datos**: PostgreSQL 15
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Autenticación**: JWT (JSON Web Tokens)
- **Seguridad**: Spring Security con control de acceso basado en roles
- **Migraciones**: Flyway para gestión de base de datos
- **Contenedores**: Docker y Docker Compose
- **Estilos**: Tailwind CSS

### Módulos del Sistema

#### Autenticación y Autorización
- Sistema de login con JWT
- Control de acceso basado en roles (RBAC)
- 5 roles de usuario: ADMINISTRADOR, TI, VENDEDOR, CAJERO, CONTABILIDAD
- Validación de tokens en frontend y backend

#### Gestión de Usuarios
- CRUD completo de usuarios
- Asignación de roles
- Gestión de empleados
- Control de acceso por módulos

#### Inventario
- Gestión de productos
- Control de stock
- Categorización de productos
- Gestión de suplidores

#### Ventas y Transacciones
- Proceso de ventas
- Gestión de transacciones
- Control de caja
- Reportes de ventas

#### Contabilidad
- Reportes financieros
- Gestión de movimientos contables
- Análisis de rentabilidad

#### Tecnología de la Información (TI)
- Administración del sistema
- Gestión de usuarios y roles
- Configuración del sistema

## Inicio Rápido

### Prerrequisitos
- Docker y Docker Compose instalados
- Git
- Navegador web moderno

### Ejecutar con Docker (Recomendado)

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd thelarte

# 2. Ejecutar contenedores
docker-compose -f docker-compose.dev.yml up --build

# 3. Acceder a la aplicación
# Web: http://localhost:8080
# Base de datos: localhost:5432
```

### Ejecutar sin Docker (Desarrollo Local)

```bash
# 1. Instalar Java 17 y PostgreSQL
# 2. Configurar base de datos PostgreSQL
# 3. Ejecutar la aplicación
./gradlew bootRun
```

## Base de Datos

### Configuración PostgreSQL
- **Host**: `localhost` (o `172.22.41.217` si usas WSL)
- **Puerto**: `5432`
- **Base de datos**: `thelarte`
- **Usuario**: `thelarte_user`
- **Contraseña**: `thelarte123`

### Conectar desde pgAdmin (WSL)

Si usas WSL y quieres conectar desde pgAdmin en Windows:

1. **Obtener IP de WSL**:
   ```bash
   ip addr show eth0 | grep "inet " | awk '{print $2}' | cut -d/ -f1
   ```

2. **En pgAdmin usar**:
   - **Host**: `172.22.41.217` (tu IP de WSL)
   - **Puerto**: `5432`
   - **Base de datos**: `thelarte`
   - **Usuario**: `thelarte_user`
   - **Contraseña**: `thelarte123`

## Sistema de Roles y Permisos

### Matriz de Acceso por Roles

| Rol | Páginas Accesibles | Funcionalidades |
|-----|-------------------|-----------------|
| **ADMINISTRADOR** | `/pages/admin/**` | Acceso completo al sistema |
| **TI** | `/pages/ti/**` | Gestión de usuarios, empleados, suplidores, productos |
| **VENDEDOR** | `/pages/vendedor/**` | Gestión de suplidores, productos, ventas |
| **CAJERO** | `/pages/cajero/**` | Gestión de productos, transacciones, caja |
| **CONTABILIDAD** | `/pages/contabilidad/**` | Transacciones, reportes financieros |

### Usuarios de Prueba

- **Usuario**: `edwinbrito`
- **Contraseña**: `contrasena123`

- **Usuario**: `edwinb`
- **Contraseña**: `1234`

## Comandos Útiles

```bash
# Iniciar desarrollo
docker-compose -f docker-compose.dev.yml up --build

# Detener contenedores
docker-compose -f docker-compose.dev.yml down

# Ver logs
docker-compose -f docker-compose.dev.yml logs

# Ver contenedores corriendo
docker ps

# Acceder al contenedor de la app
docker exec -it thelarte-app-dev bash

# Acceder a PostgreSQL
docker exec -it thelarte-postgres-dev psql -U thelarte_user -d thelarte

# Ejecutar migraciones manualmente
./gradlew flywayMigrate

# Compilar el proyecto
./gradlew build

# Ejecutar tests
./gradlew test
```

## Estructura del Proyecto

```
thelarte/
├── src/main/java/com/thelarte/
│   ├── auth/           # Autenticación y autorización
│   ├── user/           # Gestión de usuarios
│   ├── inventory/      # Gestión de inventario
│   ├── contabilidad/   # Módulo de contabilidad
│   ├── transacciones/  # Gestión de transacciones
│   ├── suplidor/       # Gestión de suplidores
│   └── shared/         # Utilidades compartidas
├── src/main/resources/
│   ├── static/         # Archivos estáticos (HTML, CSS, JS)
│   ├── templates/      # Plantillas
│   └── db/migrations/  # Migraciones de Flyway
├── docker-compose.dev.yml
├── build.gradle
└── README.md
```

## Características de Seguridad

### Backend (Spring Security)
- Validación de JWT para todas las rutas protegidas
- Control de acceso basado en roles para páginas y endpoints API
- Redirección automática al login para acceso no autorizado
- Soporte para tokens en cookies y headers

### Frontend (JavaScript)
- Validación de roles en el cliente
- Redirección automática basada en permisos
- Refresco y validación automática de tokens
- Manejo mejorado de errores de autenticación

## Solución de Problemas

### No puedo conectar desde pgAdmin
1. Verifica que uses la IP correcta de WSL
2. Asegúrate de que los contenedores estén corriendo
3. Confirma que el puerto 5432 esté expuesto

### Error de contraseña
- La contraseña por defecto es: `thelarte123`
- Si cambiaste la variable `POSTGRES_PASSWORD`, usa esa

### Contenedores no inician
```bash
# Ver logs de errores
docker-compose -f docker-compose.dev.yml logs

# Limpiar y reiniciar
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up --build
```

### Error de migración de base de datos
```bash
# Verificar estado de migraciones
docker exec -it thelarte-postgres-dev psql -U thelarte_user -d thelarte -c "SELECT * FROM flyway_schema_history;"

# Ejecutar migraciones manualmente
docker exec -it thelarte-app-dev ./gradlew flywayMigrate
```

## Documentación Adicional

- [Guía de Implementación de Seguridad](SECURITY_IMPLEMENTATION_GUIDE.md)
- [Documentación de Claude](CLAUDE.md)

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Soporte

Para soporte técnico o preguntas sobre el sistema, contacta al equipo de desarrollo.

