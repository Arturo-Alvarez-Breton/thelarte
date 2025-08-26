-- ========================================================================================
-- SCRIPT DE EJECUCIÓN DE MIGRACIONES OPTIMIZADAS
-- Sistema de gestión de muebles y decoración - The Larte
--
-- Este script ejecuta las migraciones optimizadas que:
-- 1. Arreglan errores de enum (GERENTE -> ADMINISTRADOR)
-- 2. Usan datos reducidos y bien formateados
-- 3. Son más eficientes para desarrollo y testing
-- ========================================================================================

-- ===== FASE 1: CORRECCIÓN DE ERRORES =====
-- Ejecutar primero la corrección de enums si hay datos existentes
\i R__00_Fix_Enum_Roles.sql

-- ===== FASE 2: RESET COMPLETO (OPCIONAL) =====
-- Si se quiere empezar desde cero, ejecutar R12 y R13
-- NOTA: Esto eliminará TODOS los datos existentes
-- \i R__12_Drop_Seguro_Todas_Tablas.sql
-- \i R__13_Recrear_Datos_Reduce_Formateados.sql

-- ===== FASE 3: MIGRACIONES DE DATOS REDUCIDAS =====
-- Si NO se ejecutó el reset, usar estas migraciones que son más eficientes
\i R__01_Empleados_y_Usuarios.sql
\i R__02_Clientes.sql
\i R__03_Proveedores.sql
\i R__04_Productos.sql
\i R__05_Transacciones_Compras.sql
\i R__06_Transacciones_Ventas.sql
\i R__07_Pagos_Cuotas.sql
\i R__08_Movimientos_Inventario.sql

-- ===== FASE 4: FINALIZACIÓN =====
\i R__14_Correccion_Passwords_y_Final.sql

-- ========================================================================================
-- VERIFICACIÓN FINAL
-- ========================================================================================

-- Contar registros en cada tabla principal
SELECT 'Empleados' as tabla, COUNT(*) as total FROM empleados WHERE deleted = FALSE
UNION ALL
SELECT 'Usuarios', COUNT(*) FROM users WHERE active = TRUE
UNION ALL
SELECT 'Roles de Usuario', COUNT(*) FROM user_roles
UNION ALL
SELECT 'Clientes', COUNT(*) FROM clientes WHERE activo = TRUE
UNION ALL
SELECT 'Proveedores', COUNT(*) FROM proveedores WHERE activo = TRUE
UNION ALL
SELECT 'Productos', COUNT(*) FROM productos WHERE activo = TRUE
UNION ALL
SELECT 'Transacciones', COUNT(*) FROM transacciones WHERE deleted = FALSE
UNION ALL
SELECT 'Líneas Transacción', COUNT(*) FROM lineas_transaccion
UNION ALL
SELECT 'Pagos', COUNT(*) FROM pagos
UNION ALL
SELECT 'Movimientos Inventario', COUNT(*) FROM movimientos_inventario
ORDER BY total DESC;

-- Mostrar resumen de transacciones por tipo
SELECT
    tipo,
    estado,
    COUNT(*) as cantidad,
    SUM(total) as total_monto
FROM transacciones
WHERE deleted = FALSE
GROUP BY tipo, estado
ORDER BY tipo, estado;

-- Mostrar productos con stock disponible
SELECT
    nombre,
    categoria,
    stock,
    precio_venta,
    CASE
        WHEN stock <= stock_minimo THEN 'BAJO STOCK'
        ELSE 'NORMAL'
    END as estado_stock
FROM productos
WHERE activo = TRUE
ORDER BY stock DESC
LIMIT 10;

-- Mostrar usuarios y roles
SELECT
    u.username,
    e.nombre || ' ' || e.apellido as nombre_completo,
    ur.role,
    u.active
FROM users u
LEFT JOIN empleados e ON u.empleado_cedula = e.cedula
LEFT JOIN user_roles ur ON u.id = ur.user_id
ORDER BY u.username;

-- ========================================================================================
-- FIN DEL SCRIPT DE EJECUCIÓN
-- ========================================================================================
