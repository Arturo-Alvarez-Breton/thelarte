# Desarrollo con H2 Database

Este documento explica cómo usar el perfil de desarrollo (`dev`) con base de datos H2 en modo servidor.

## Configuración H2

Se ha configurado H2 en modo servidor para permitir múltiples conexiones simultáneas a las bases de datos de desarrollo.

### Microservicios configurados:
- **inventory-service**: Puerto H2 9092, Base de datos `inventory_dev_db`
- **sales-service**: Puerto H2 9093, Base de datos `sales_dev_db`  
- **billing-service**: Puerto H2 9094, Base de datos `billing_dev_db`
- **auth-service**: Usa MongoDB con base de datos `auth_dev_db`

## Uso

### Opción 1: Scripts automatizados (Recomendado)

1. **Iniciar servidores H2:**
   ```powershell
   .\start-h2-servers.ps1
   ```

2. **Iniciar todos los microservicios:**
   ```powershell
   .\start-dev-services.ps1
   ```

### Opción 2: Manual

1. **Iniciar servidores H2 manualmente:**
   ```powershell
   # Crear directorio de datos
   mkdir data -Force

   # Encontrar el JAR de H2 (después de ejecutar gradlew build)
   $h2Jar = Get-ChildItem -Path "$env:USERPROFILE\.gradle\caches\modules-2\files-2.1\com.h2database\h2" -Recurse -Filter "h2-*.jar" | Select-Object -First 1

   # Iniciar servidores H2
   java -cp "$($h2Jar.FullName)" org.h2.tools.Server -tcp -tcpPort 9092 -tcpAllowOthers -baseDir ./data &
   java -cp "$($h2Jar.FullName)" org.h2.tools.Server -tcp -tcpPort 9093 -tcpAllowOthers -baseDir ./data &
   java -cp "$($h2Jar.FullName)" org.h2.tools.Server -tcp -tcpPort 9094 -tcpAllowOthers -baseDir ./data &
   ```

2. **Iniciar microservicios individualmente:**
   ```powershell
   # Auth Service
   .\gradlew.bat :microservices:auth-service:bootRun --args="--spring.profiles.active=dev"

   # Inventory Service  
   .\gradlew.bat :microservices:inventory-service:bootRun --args="--spring.profiles.active=dev"

   # Sales Service
   .\gradlew.bat :microservices:sales-service:bootRun --args="--spring.profiles.active=dev"

   # Billing Service
   .\gradlew.bat :microservices:billing-service:bootRun --args="--spring.profiles.active=dev"

   # API Gateway
   .\gradlew.bat :api-gateway:bootRun --args="--spring.profiles.active=dev"
   ```

## URLs de Acceso

### Servicios
- **API Gateway**: http://localhost:8080
- **Auth Service**: http://localhost:8081/auth
- **Inventory Service**: http://localhost:8082/inventory
- **Sales Service**: http://localhost:8083/sales
- **Billing Service**: http://localhost:8084/billing

### Consolas H2 (para debugging)
- **Inventory**: http://localhost:8082/inventory/h2-console
- **Sales**: http://localhost:8083/sales/h2-console
- **Billing**: http://localhost:8084/billing/h2-console

### Conexiones JDBC
- **Inventory**: `jdbc:h2:tcp://localhost:9092/./data/inventory_dev_db`
- **Sales**: `jdbc:h2:tcp://localhost:9093/./data/sales_dev_db`
- **Billing**: `jdbc:h2:tcp://localhost:9094/./data/billing_dev_db`

**Credenciales H2:**
- Usuario: `sa`
- Contraseña: `password`

## Características del Perfil Dev

- **H2 en modo servidor**: Permite múltiples conexiones simultáneas
- **Auto-Server**: Se activa automáticamente si el puerto está ocupado
- **Persistencia**: Los datos se guardan en archivos en el directorio `./data/`
- **DDL Auto**: Actualización automática del esquema de base de datos
- **SQL Logging**: Habilitado para debugging
- **H2 Console**: Habilitada para cada servicio

## Persistencia de Datos

Los datos se almacenan en archivos físicos en el directorio `data/`:
- `inventory_dev_db.mv.db`
- `sales_dev_db.mv.db`  
- `billing_dev_db.mv.db`

Los datos persisten entre reinicios de la aplicación.

## Troubleshooting

1. **Error de puerto ocupado**: Los servidores H2 usan AUTO_SERVER, pero si hay conflictos, cambiar los puertos en `application-dev.properties`

2. **JAR H2 no encontrado**: Ejecutar `.\gradlew.bat build` para descargar dependencias

3. **Conexión rechazada**: Verificar que los servidores H2 estén ejecutándose antes de iniciar los microservicios
