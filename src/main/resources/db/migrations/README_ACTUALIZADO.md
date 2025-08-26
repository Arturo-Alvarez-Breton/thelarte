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

## 🚀 **Estrategia de Migración**

### **Flujo Seguro:**
```bash
# Flyway ejecuta automáticamente en orden:
V0 → R__01 → V1 → V2 → V3 → ... → V9 → R__15

# V0: Valida estado actual (NO ELIMINA)
# R__01: Verifica consistencia
# V1-V9: Crea tablas faltantes (IF NOT EXISTS)
# R__15: Crea usuarios por defecto
```

### **Características de Seguridad:**
- ✅ **NO ELIMINA** datos existentes
- ✅ **PRESERVA** información actual
- ✅ **CREA** solo lo que falta
- ✅ **VALIDA** consistencia
- ✅ **IDEMPOTENT** - Se puede ejecutar múltiples veces

## 🎯 **Resultado**

### **Si la BD ya tiene datos:**
- ✅ **Mantiene todas las tablas existentes**
- ✅ **Crea solo las tablas faltantes**
- ✅ **Valida estructura y datos**
- ✅ **Agrega usuarios por defecto**

### **Si la BD está vacía:**
- ✅ **Crea todas las tablas**
- ✅ **Establece estructura completa**
- ✅ **Agrega usuarios por defecto**

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

- ⚠️ **La migración V0 NO ELIMINA NADA** - Solo valida
- 🔄 **Las migraciones V1-V9 usan IF NOT EXISTS** - Seguras
- 👥 **R__15 crea usuarios si no existen** - Idempotent
- 🛡️ **Compatible con bases de datos existentes**
- 🎯 **Ideal para entornos con datos reales**

**¡Esta estrategia es completamente segura y preserva todos los datos existentes!** 🚀
