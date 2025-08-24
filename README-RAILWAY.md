# TheLarte - Deployment en Railway

Guía para desplegar TheLarte en Railway con contenedor PostgreSQL en modo producción.

## 📋 Prerequisitos

1. Cuenta en [Railway](https://railway.app)
2. Repositorio conectado a Railway
3. Variables de entorno configuradas

## 🚀 Configuración de Deployment

### 1. Variables de Entorno Requeridas

En el dashboard de Railway, configura estas variables de entorno:

```bash
# Base de Datos
POSTGRES_PASSWORD=tu_password_seguro_aqui
DB_HOST=postgres
DB_PORT=5432
DB_NAME=thelarte
DB_USERNAME=thelarte_user

# Aplicación
SPRING_PROFILES_ACTIVE=prod
JWT_SECRET=tu_jwt_secret_muy_seguro_de_al_menos_64_caracteres_aqui

# Railway configurará automáticamente:
# PORT - Puerto dinámico asignado por Railway
```

### 2. Archivos de Configuración

Los siguientes archivos han sido creados para Railway:

- `railway.toml` - Configuración principal de Railway
- `docker-compose.railway.yml` - Compose optimizado para Railway
- `.env.railway` - Plantilla de variables de entorno
- `Dockerfile` - Optimizado con multi-stage build

### 3. Estructura de Servicios

**Aplicación Spring Boot:**
- Puerto dinámico asignado por Railway
- Perfil de producción activado
- Health checks configurados
- JVM optimizada para contenedores

**PostgreSQL:**
- Contenedor postgres:15-alpine
- Base de datos: `thelarte`
- Usuario: `thelarte_user`
- Persistent volume para datos

## 🔧 Proceso de Deployment

### Opción 1: Deployment Automático (Recomendado)
1. Conecta tu repositorio GitHub a Railway
2. Railway detectará automáticamente la configuración
3. Configurar variables de entorno
4. Deploy automático con cada push

### Opción 2: Railway CLI
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Crear proyecto
railway create

# Deploy
railway deploy
```

## 🏥 Health Checks

La aplicación incluye endpoints de salud:
- `/actuator/health` - Estado general de la aplicación
- `/actuator/info` - Información de la aplicación

Railway usará estos endpoints para verificar el estado de la aplicación.

## 🔒 Seguridad

- Usuario no-root en contenedor
- JWT secret configurable
- PostgreSQL no expuesto externamente
- Configuración de pool de conexiones optimizada

## 📊 Monitoring

Railway proporciona:
- Logs en tiempo real
- Métricas de CPU/memoria
- Alertas de deployment
- Health monitoring automático

## 🛠️ Troubleshooting

### Problema: La aplicación no inicia
```bash
# Ver logs en Railway dashboard o CLI
railway logs

# Verificar variables de entorno
railway variables
```

### Problema: No puede conectar a PostgreSQL
- Verificar que POSTGRES_PASSWORD esté configurado
- Confirmar que DB_HOST=postgres
- Revisar que los contenedores estén en la misma red

### Problema: Build falla
- Verificar que Java 17 esté disponible
- Confirmar que `./gradlew build` funciona localmente
- Revisar logs de build en Railway

## 🌐 Acceso a la Aplicación

Una vez desplegada, Railway proporcionará:
- URL pública para acceder a la aplicación
- HTTPS automático con certificado SSL
- Dominio personalizable (opcional)

## 📝 Comandos Útiles

```bash
# Ver status del deployment
railway status

# Ver variables de entorno
railway variables

# Ver logs en tiempo real
railway logs --tail

# Conectar a base de datos
railway run psql $DATABASE_URL
```

## 🔄 Actualizaciones

Railway redesplegará automáticamente cuando:
- Hagas push al branch principal
- Cambies variables de entorno
- Actualices la configuración de Railway

---

Para más información, consulta la [documentación oficial de Railway](https://docs.railway.app/).