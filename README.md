# TheLarte

Sistema de gestión de tienda de muebles desarrollado en Spring Boot.

## 🚀 Inicio Rápido

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

## 🗄️ Base de Datos

### Conexión PostgreSQL
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

## 🔧 Comandos Útiles

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
```

## 👤 Usuarios de Prueba

- **Usuario**: `edwinbrito`
- **Contraseña**: `contrasena123`

- **Usuario**: `edwinb`
- **Contraseña**: `1234`

## 🐛 Problemas Comunes

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

