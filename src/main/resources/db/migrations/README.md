# MIGRACIONES DE BASE DE DATOS

## 📁 Estructura de Migraciones

### **🏗️ Migraciones Principales** (Carpeta actual)
**Solo migraciones que definen la estructura de la base de datos:**

#### **Limpieza y Creación de Tablas:**
- `V0__Clean_Database.sql` - **LIMPIEZA COMPLETA** (Ejecutar primero)
- `V1__Create_Empleados.sql` - Crea tabla empleados
- `V2__Create_Clientes.sql` - Crea tabla clientes
- `V3__Create_Users.sql` - Crea tabla users y user_roles
- `V4__Create_Suplidor.sql` - Crea tabla proveedores
- `V5__Create_Producto.sql` - Crea tabla productos
- `V6__Create_Transacciones.sql` - Crea tabla transacciones y lineas_transaccion
- `V7__Create_Pagos.sql` - Crea tabla pagos
- `V8__Create_Movimientos.sql` - Crea tabla movimientos_producto
- `V9__Create_Devoluciones.sql` - Crea tabla devoluciones

### **📦 Migraciones Legacy** (Carpeta `/legacy`)
**Archivos movidos aquí:**
- `R__12_Drop_Seguro_Todas_Tablas.sql` - Drop seguro de todas las tablas
- `R__13_Recrear_Datos_Reduce_Formateados.sql` - Datos de prueba básicos
- Todas las migraciones de datos masivos (R__01 a R__11, R__14)
- Scripts de corrección específicos
- Archivos de testing y standalone

## 🚀 **Uso**

### **Desarrollo con estructura limpia:**
```bash
# Flyway ejecuta automáticamente todas las migraciones en orden:
# V0 → V1 → V2 → V3 → ... → V9
# V0: Limpieza completa, V1-V9: Creación de tablas
mvn spring-boot:run
```

### **Para datos de prueba (desde legacy):**
```bash
# Si necesitas datos de prueba, usa los archivos legacy:
psql -d tu_base_datos -f legacy/R__12_Drop_Seguro_Todas_Tablas.sql
psql -d tu_base_datos -f legacy/R__13_Recrear_Datos_Reduce_Formateados.sql
```

## 🎯 **Resultado**
- ✅ **Base de datos completamente limpia** (V0 elimina todo)
- ✅ **Estructura actual** (V1-V9 crean tablas)
- ✅ **Sin datos de prueba** (base limpia)
- ✅ **Flyway optimizado** (V0 + estructura)
- ✅ **Fácil mantenimiento** (solo archivos esenciales)

## 📝 **Notas**
- Las migraciones se ejecutan en **orden numérico** (V0 → V1 → V2 → ... → V9)
- **V0 se ejecuta primero** - Limpieza completa antes de crear tablas
- Flyway maneja automáticamente la ejecución
- Los archivos legacy contienen datos de prueba si los necesitas
- **Ideal para producción** - Limpieza + estructura, sin datos de desarrollo
