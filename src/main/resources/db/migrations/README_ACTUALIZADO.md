# MIGRACIONES DE BASE DE DATOS - ESTRATEGIA SEGURA

## 📁 Estructura de Migraciones

### **🏗️ Migraciones Principales** (Carpeta actual)
**Migraciones que validan y complementan la estructura existente:**

#### **Validación y Baseline:**
- `V0__Clean_Database.sql` - **VALIDACIÓN INICIAL** (No elimina nada)
- `R__01_Baseline_Validation.sql` - **VALIDACIÓN Y BASELINE** (Verifica estado)

#### **Creación de Tablas (V1-V9):**
- `V1__Create_Empleados.sql` - Crea tabla empleados (IF NOT EXISTS)
- `V2__Create_Clientes.sql` - Crea tabla clientes (IF NOT EXISTS)
- `V3__Create_Users.sql` - Crea tabla users y user_roles (IF NOT EXISTS)
- `V4__Create_Suplidor.sql` - Crea tabla proveedores (IF NOT EXISTS)
- `V5__Create_Producto.sql` - Crea tabla productos (IF NOT EXISTS)
- `V6__Create_Transacciones.sql` - Crea tabla transacciones y lineas_transaccion (IF NOT EXISTS)
- `V7__Create_Pagos.sql` - Crea tabla pagos (IF NOT EXISTS)
- `V8__Create_Movimientos.sql` - Crea tabla movimientos_producto (IF NOT EXISTS)
- `V9__Create_Devoluciones.sql` - Crea tabla devoluciones (IF NOT EXISTS)

#### **Usuarios y Datos:**
- `R__15_Usuarios_Por_Defecto_Roles.sql` - **USUARIOS POR DEFECTO**

#### **Scripts de Ejecución:**
- `run_clean_install.sql` - **INSTALACIÓN LIMPIA COMPLETA** (Elimina todo y recrea)

## 🚀 **Estrategia de Migración**

### **Flujo con Limpieza Completa:**
```bash
# Flyway ejecuta automáticamente en orden:
V0 → R__01 → V1 → V2 → V3 → ... → V9 → R__15

# V0: 🗑️ ELIMINA TODAS LAS TABLAS Y DATOS
# R__01: Verifica estado post-limpieza
# V1-V9: Crea toda la estructura desde cero
# R__15: Crea usuarios por defecto
```

### **Características:**
- ⚠️ **ELIMINA TODOS LOS DATOS EXISTENTES**
- ✅ **CREA ESTRUCTURA COMPLETAMENTE LIMPIA**
- ✅ **RESETEA SECUENCIAS** a valores iniciales
- ✅ **IDEMPOTENT** - Se puede ejecutar múltiples veces

### **Ejecución:**
```bash
# Para instalación completamente limpia (ELIMINA TODO):
psql -d tu_base_datos -f run_clean_install.sql

# O ejecutar automáticamente con Flyway:
mvn spring-boot:run  # V0 eliminará todo automáticamente
```

## 🎯 **Resultado**

### **Siempre (con cualquier estado de BD):**
- 🗑️ **ELIMINA TODAS LAS TABLAS Y DATOS EXISTENTES**
- ✅ **CREA TODA LA ESTRUCTURA DESDE CERO**
- ✅ **ESTABLECE USUARIOS POR DEFECTO**
- ✅ **RESETEA TODAS LAS SECUENCIAS**

### **Resultado Final:**
- ✅ **Base de datos completamente limpia**
- ✅ **Estructura fresca y consistente**
- ✅ **Usuarios listos para usar**
- ✅ **Secuencias reseteadas**

## 👥 **Usuarios Creados**

### **Administradores por Defecto:**
- `edwinb` / `1234` (ADMINISTRADOR)
- `jeanp` / `1234` (ADMINISTRADOR)
- `arturob` / `1234` (ADMINISTRADOR)

### **Usuarios de Prueba por Rol:**
- `test_ti` / `1234` (TI)
- `test_vendedor` / `1234` (VENDEDOR)
- `test_cajero` / `1234` (CAJERO)
- `test_contabilidad` / `1234` (CONTABILIDAD)

## 🔧 **Configuración de Flyway**

```properties
# application-railway.properties
spring.flyway.enabled=true
spring.flyway.baseline-on-migrate=true
spring.flyway.validate-on-migrate=false
spring.flyway.out-of-order=true
spring.flyway.ignore-missing-migrations=true
```

## 📦 **Migraciones Legacy**

**Archivos movidos a `/legacy`:**
- Migraciones antiguas con datos masivos
- Scripts de corrección específicos
- Archivos de testing antiguos
- Scripts standalone

## 📝 **Notas Importantes**

- ⚠️ **V0 ELIMINA TODOS LOS DATOS EXISTENTES** - ¡Backup recomendado!
- 🔄 **Las migraciones V1-V9 crean estructura desde cero**
- 👥 **R__15 crea usuarios por defecto** - Siempre se ejecuta
- 🛡️ **Convierte cualquier BD al estado inicial**
- 🎯 **Ideal para instalación limpia** - Estructura fresca garantizada

**¡Esta estrategia garantiza una base de datos completamente limpia y fresca!** 🗑️✨
