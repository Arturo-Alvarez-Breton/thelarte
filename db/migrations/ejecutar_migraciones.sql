-- ========================================================================================
-- SCRIPT DE EJECUCIÓN DE TODAS LAS MIGRACIONES
-- Sistema de gestión de muebles y decoración - The Larte
--
-- Este script ejecuta todas las migraciones en el orden correcto
-- Incluye datos masivos para un entorno de pruebas realista
-- ========================================================================================

-- Ejecutar migraciones en orden
\i R__01_Empleados_y_Usuarios.sql
\i R__01A_Empleados_Expandidos.sql
\i R__02_Clientes.sql
\i R__02A_Clientes_Expandidos.sql
\i R__03_Proveedores.sql
\i R__04_Productos.sql
\i R__04A_Productos_Expandidos.sql
\i R__05_Transacciones_Compras.sql
\i R__05A_Transacciones_Compras_Masivas.sql
\i R__06_Transacciones_Ventas.sql
\i R__06A_Transacciones_Ventas_Masivas.sql
\i R__07_Pagos_Cuotas.sql
\i R__08_Movimientos_Inventario.sql
\i R__09_Devoluciones.sql

-- ========================================================================================
-- VERIFICACIÓN FINAL
-- ========================================================================================

-- Contar registros en cada tabla principal
SELECT 'Empleados' as tabla, COUNT(*) as total FROM empleados
UNION ALL
SELECT 'Usuarios', COUNT(*) FROM users
UNION ALL
SELECT 'Clientes', COUNT(*) FROM clientes
UNION ALL
SELECT 'Proveedores', COUNT(*) FROM suplidor
UNION ALL
SELECT 'Productos', COUNT(*) FROM producto
UNION ALL
SELECT 'Transacciones', COUNT(*) FROM transacciones
UNION ALL
SELECT 'Líneas Transacción', COUNT(*) FROM lineas_transaccion
UNION ALL
SELECT 'Pagos', COUNT(*) FROM pagos
UNION ALL
SELECT 'Movimientos Inventario', COUNT(*) FROM movimientos_producto
ORDER BY total DESC;

-- Mostrar resumen de transacciones por tipo
SELECT
    tipo,
    estado,
    COUNT(*) as cantidad,
    SUM(total) as total_monto
FROM transacciones
GROUP BY tipo, estado
ORDER BY tipo, estado;

-- Mostrar productos con stock disponible
SELECT
    nombre,
    tipo,
    cantidad_disponible,
    cantidad_almacen,
    cantidad_reservada,
    precio_venta
FROM producto
WHERE estado = 'DISPONIBLE'
ORDER BY cantidad_disponible DESC
LIMIT 10;

-- ========================================================================================
-- FIN DEL SCRIPT DE EJECUCIÓN
-- ========================================================================================
