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
DELETE FROM pagos WHERE id > 20;
DELETE FROM lineas_transaccion WHERE id > 50;
DELETE FROM transacciones WHERE id > 10;
DELETE FROM productos WHERE id > 15;
DELETE FROM clientes WHERE id > 10;
DELETE FROM proveedores WHERE id > 5;

-- ===== RESETEAR SECUENCIAS =====
-- Ajustar las secuencias después de la limpieza
SELECT setval('pagos_id_seq', (SELECT COALESCE(MAX(id), 1) FROM pagos));
SELECT setval('lineas_transaccion_id_seq', (SELECT COALESCE(MAX(id), 1) FROM lineas_transaccion));
SELECT setval('transacciones_id_seq', (SELECT COALESCE(MAX(id), 1) FROM transacciones));
SELECT setval('productos_id_seq', (SELECT COALESCE(MAX(id), 1) FROM productos));
SELECT setval('clientes_id_seq', (SELECT COALESCE(MAX(id), 1) FROM clientes));
SELECT setval('proveedores_id_seq', (SELECT COALESCE(MAX(id), 1) FROM proveedores));

-- ========================================================================================
-- FIN MIGRACIÓN R__00
-- ========================================================================================
