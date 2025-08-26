# 🚨 SOLUCIÓN AL ERROR DE ENUM GERENTE

## 📋 **Problema Identificado**
```
java.lang.IllegalArgumentException: No enum constant com.thelarte.auth.entity.UserRole.GERENTE
```
Este error ocurre porque la base de datos contiene roles `GERENTE` que no existen en el enum Java `UserRole`.

## 🔧 **Solución Paso a Paso**

### **Opción 1: Ejecutar Script Standalone (Recomendado)**
1. **Conectar a tu base de datos PostgreSQL** (Railway)
2. **Ejecutar el script** `fix_enum_standalone.sql`:
   ```sql
   -- Copia y pega el contenido del archivo fix_enum_standalone.sql
   ```
3. **Verificar la corrección** ejecutando `verificar_correccion.sql`

### **Opción 2: Usar Migraciones Corregidas**
1. **Asegúrate de que la migración R__00_Fix_Enum_Roles.sql esté corregida**
2. **Reinicia tu aplicación** - Flyway ejecutará automáticamente las migraciones

## 📁 **Archivos Creados**

### **Scripts Principales:**
- ✅ `fix_enum_standalone.sql` - Script standalone para ejecutar directamente
- ✅ `verificar_correccion.sql` - Verificación post-corrección
- ✅ `test_fix_enum.sql` - Test rápido para verificar la corrección
- ✅ `R__00_Fix_Enum_Roles.sql` - Migración corregida (ya actualizada)

### **Migraciones Optimizadas:**
- ✅ `R__12_Drop_Seguro_Todas_Tablas.sql` - Drop seguro con verificación
- ✅ `R__13_Recrear_Datos_Reduce_Formateados.sql` - Datos reducidos y formateados
- ✅ `R__14_Correccion_Passwords_y_Final.sql` - Contraseñas y verificación final

## 🛠️ **Lo que Corrige el Script**

### **Corrección de Enums:**
```sql
-- Convierte GERENTE → ADMINISTRADOR
UPDATE user_roles SET role = 'ADMINISTRADOR' WHERE role = 'GERENTE';

-- Mapea roles antiguos a nuevos
UPDATE empleados SET rol = CASE
    WHEN rol = 'ADMIN' THEN 'ADMINISTRADOR'
    WHEN rol = 'COMERCIAL' THEN 'VENDEDOR'
    -- ... más mapeos
END;
```

### **Limpieza de Datos (Reduce ~85%):**
- **Antes**: 200+ registros
- **Después**: ~30 registros optimizados
- Eliminación ordenada respetando foreign keys

### **Verificación de Integridad:**
- ✅ No hay roles inválidos
- ✅ No hay registros huérfanos
- ✅ Secuencias reseteadas correctamente

## 🎯 **Usuarios de Prueba Disponibles**
```sql
-- Después de la corrección, tendrás estos usuarios:
adminroot / 1234 (ADMINISTRADOR)
carlosmendoza / 1234 (ADMINISTRADOR)
mariasanchez / 1234 (VENDEDOR)
juanperez / 1234 (TI)
carlasantos / 1234 (CONTABILIDAD)
testuser / 1234 (VENDEDOR)
```

## 📊 **Resultado Esperado**
Después de ejecutar la corrección:
- ✅ **Aplicación inicia correctamente**
- ✅ **No hay error de enum GERENTE**
- ✅ **Listas de usuarios, empleados y transacciones funcionan**
- ✅ **Base de datos optimizada y consistente**

## 🚨 **Error Específico Corregido**
```
ERROR: relation "movimientos_inventario" does not exist
Position: 102
Location: R__00_Fix_Enum_Roles.sql, Line: 35
```

**Causa:** La migración referenciaba `movimientos_inventario` pero la tabla real es `movimientos_producto`.

**Solución:** Se actualizaron todas las referencias para usar el nombre correcto de la tabla.

## 🚀 **Pasos para Railway**

### **Opción 1: Test Rápido (Recomendado)**
1. **Ir al panel de Railway** → Tu proyecto → **Data** → **Database**
2. **Abrir Query Tab**
3. **Ejecutar** `test_fix_enum.sql` (para verificar que todo esté correcto)
4. **Ejecutar** `fix_enum_standalone.sql`
5. **Ejecutar** `verificar_correccion.sql`
6. **Reiniciar** la aplicación

### **Opción 2: Solo Corrección**
1. **Ejecutar** `fix_enum_standalone.sql`
2. **Reiniciar** la aplicación

## 📝 **Notas Importantes**
- ⚠️ **Backup recomendado** antes de ejecutar
- 🔄 **El script es idempotent** - se puede ejecutar múltiples veces
- 🛡️ **Maneja foreign keys correctamente** para evitar violaciones
- 📈 **Optimiza rendimiento** reduciendo significativamente los datos

---
**¿Problemas?** Revisa los logs de Railway después de ejecutar los scripts.
