-- ========================================================================================
-- SCRIPT STANDALONE: CORRECCIÓN DE ENUMS Y LIMPIEZA DE DATOS
-- Sistema de gestión de muebles y decoración - The Larte
-- ========================================================================================
-- Este script corrige el error de enum GERENTE y limpia datos excesivos
-- EJECUTAR ESTE SCRIPT DIRECTAMENTE EN LA BASE DE DATOS DE RAILWAY
-- ========================================================================================

-- Deshabilitar temporalmente las restricciones de foreign key
SET CONSTRAINTS ALL DEFERRED;

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

-- Rehabilitar restricciones
SET CONSTRAINTS ALL IMMEDIATE;

-- ===== VERIFICACIÓN FINAL =====
DO $$
DECLARE
    total_empleados INTEGER;
    total_usuarios INTEGER;
    total_roles_invalidos INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_empleados FROM empleados WHERE deleted = FALSE;
    SELECT COUNT(*) INTO total_usuarios FROM users WHERE active = TRUE;
    SELECT COUNT(*) INTO total_roles_invalidos FROM user_roles WHERE role NOT IN ('ADMINISTRADOR', 'TI', 'VENDEDOR', 'CAJERO', 'CONTABILIDAD');

    RAISE NOTICE '=====================================';
    RAISE NOTICE 'VERIFICACIÓN DE CORRECCIÓN:';
    RAISE NOTICE '=====================================';
    RAISE NOTICE 'Empleados activos: %', total_empleados;
    RAISE NOTICE 'Usuarios activos: %', total_usuarios;
    RAISE NOTICE 'Roles inválidos restantes: %', total_roles_invalidos;

    IF total_roles_invalidos = 0 THEN
        RAISE NOTICE '✅ ÉXITO: No hay roles inválidos';
    ELSE
        RAISE WARNING '⚠️  ALERTA: Aún hay % roles inválidos', total_roles_invalidos;
    END IF;

    RAISE NOTICE '=====================================';
END $$;

-- ========================================================================================
-- FIN DEL SCRIPT STANDALONE
-- ========================================================================================
