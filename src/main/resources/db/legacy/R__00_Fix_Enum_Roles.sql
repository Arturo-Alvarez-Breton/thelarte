-- ========================================================================================
-- MIGRACIÓN R__00: CORRECCIÓN DE ENUMS Y LIMPIEZA DE DATOS
-- Sistema de gestión de muebles y decoración - The Larte
-- ========================================================================================

-- ===== CORRECCIÓN DE ROLES EN USER_ROLES =====
-- Convertir GERENTE a ADMINISTRADOR para que coincida con el enum Java
UPDATE user_roles 
SET role = 'ADMINISTRADOR' 
WHERE role = 'GERENTE';

-- ===== CORRECCIÓN DE ROLES EN EMPLEADOS =====
-- Convertir roles antiguos a los nuevos valores del enum
UPDATE empleados 
SET rol = CASE
    WHEN rol = 'ADMIN' THEN 'ADMINISTRADOR'
    WHEN rol = 'COMERCIAL' THEN 'VENDEDOR'
    WHEN rol = 'CAJERO' THEN 'CAJERO'
    WHEN rol = 'TI' THEN 'TI'
    WHEN rol = 'CONTABILIDAD' THEN 'CONTABILIDAD'
    ELSE 'VENDEDOR'
END;

-- ===== LIMPIEZA DE DATOS EXCESIVOS =====
-- Eliminar datos de prueba masivos para reducir el tamaño
-- IMPORTANTE: Eliminar en orden correcto para evitar violaciones de FK

-- 1. Eliminar pagos que referencian transacciones que se van a eliminar
DELETE FROM pagos WHERE transaccion_id > 10;

-- 2. Eliminar todas las líneas de transacción que referencian transacciones que se van a eliminar
DELETE FROM lineas_transaccion WHERE transaccion_id > 10;

-- 3. Eliminar movimientos de producto que referencian productos que se van a eliminar
-- (Nota: La tabla se llama movimientos_producto, no movimientos_inventario)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'movimientos_producto') THEN
        DELETE FROM movimientos_producto WHERE producto_id > 15;
    END IF;
END $$;

-- 4. Eliminar transacciones
DELETE FROM transacciones WHERE id > 10;

-- 5. Eliminar productos
DELETE FROM productos WHERE id > 15;

-- 6. Eliminar clientes
DELETE FROM clientes WHERE id > 10;

-- 7. Eliminar proveedores
DELETE FROM proveedores WHERE id > 5;

-- ===== RESETEAR SECUENCIAS =====
-- Ajustar las secuencias después de la limpieza
SELECT setval('pagos_id_seq', COALESCE((SELECT MAX(id) FROM pagos), 1));
SELECT setval('lineas_transaccion_id_seq', COALESCE((SELECT MAX(id) FROM lineas_transaccion), 1));

-- Resetear secuencia de movimientos_producto si existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'movimientos_producto_id_seq') THEN
        PERFORM setval('movimientos_producto_id_seq', COALESCE((SELECT MAX(id) FROM movimientos_producto), 1));
    END IF;
END $$;

SELECT setval('transacciones_id_seq', COALESCE((SELECT MAX(id) FROM transacciones), 1));
SELECT setval('productos_id_seq', COALESCE((SELECT MAX(id) FROM productos), 1));
SELECT setval('clientes_id_seq', COALESCE((SELECT MAX(id) FROM clientes), 1));
SELECT setval('proveedores_id_seq', COALESCE((SELECT MAX(id) FROM proveedores), 1));

-- ========================================================================================
-- FIN MIGRACIÓN R__00
-- ========================================================================================
