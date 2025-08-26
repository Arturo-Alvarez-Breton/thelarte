-- ========================================================================================
-- VERIFICACIÓN POST-CORRECCIÓN
-- Sistema de gestión de muebles y decoración - The Larte
-- ========================================================================================
-- Ejecutar este script para verificar que la corrección funcionó correctamente
-- ========================================================================================

-- ===== VERIFICACIÓN DE ROLES =====
DO $$
DECLARE
    roles_invalidos INTEGER;
    roles_validos INTEGER;
BEGIN
    -- Verificar que no hay roles inválidos
    SELECT COUNT(*) INTO roles_invalidos
    FROM user_roles
    WHERE role NOT IN ('ADMINISTRADOR', 'TI', 'VENDEDOR', 'CAJERO', 'CONTABILIDAD');

    SELECT COUNT(*) INTO roles_validos
    FROM user_roles
    WHERE role IN ('ADMINISTRADOR', 'TI', 'VENDEDOR', 'CAJERO', 'CONTABILIDAD');

    RAISE NOTICE '=====================================';
    RAISE NOTICE 'VERIFICACIÓN DE ROLES:';
    RAISE NOTICE '=====================================';
    RAISE NOTICE 'Roles válidos: %', roles_validos;
    RAISE NOTICE 'Roles inválidos: %', roles_invalidos;

    IF roles_invalidos = 0 THEN
        RAISE NOTICE '✅ CORRECTO: Todos los roles son válidos';
    ELSE
        RAISE WARNING '❌ ERROR: Hay % roles inválidos', roles_invalidos;
    END IF;
END $$;

-- ===== VERIFICACIÓN DE DATOS =====
DO $$
DECLARE
    emp_count INTEGER;
    user_count INTEGER;
    prod_count INTEGER;
    trans_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO emp_count FROM empleados WHERE deleted = FALSE;
    SELECT COUNT(*) INTO user_count FROM users WHERE active = TRUE;
    SELECT COUNT(*) INTO prod_count FROM productos WHERE activo = TRUE;
    SELECT COUNT(*) INTO trans_count FROM transacciones WHERE deleted = FALSE;

    RAISE NOTICE '=====================================';
    RAISE NOTICE 'VERIFICACIÓN DE DATOS:';
    RAISE NOTICE '=====================================';
    RAISE NOTICE 'Empleados activos: %', emp_count;
    RAISE NOTICE 'Usuarios activos: %', user_count;
    RAISE NOTICE 'Productos activos: %', prod_count;
    RAISE NOTICE 'Transacciones: %', trans_count;
END $$;

-- ===== VERIFICACIÓN DE INTEGRIDAD REFERENCIAL =====
DO $$
DECLARE
    orphan_pagos INTEGER;
    orphan_lineas INTEGER;
    orphan_movimientos INTEGER;
BEGIN
    -- Verificar pagos huérfanos
    SELECT COUNT(*) INTO orphan_pagos
    FROM pagos p
    LEFT JOIN transacciones t ON p.transaccion_id = t.id
    WHERE t.id IS NULL;

    -- Verificar líneas huérfanas
    SELECT COUNT(*) INTO orphan_lineas
    FROM lineas_transaccion lt
    LEFT JOIN transacciones t ON lt.transaccion_id = t.id
    WHERE t.id IS NULL;

    -- Verificar movimientos huérfanos (usando el nombre correcto de la tabla)
    SELECT COUNT(*) INTO orphan_movimientos
    FROM movimientos_producto mi
    LEFT JOIN productos p ON mi.producto_id = p.id
    WHERE p.id IS NULL;

    RAISE NOTICE '=====================================';
    RAISE NOTICE 'VERIFICACIÓN DE INTEGRIDAD:';
    RAISE NOTICE '=====================================';
    RAISE NOTICE 'Pagos huérfanos: %', orphan_pagos;
    RAISE NOTICE 'Líneas huérfanas: %', orphan_lineas;
    RAISE NOTICE 'Movimientos huérfanos: %', orphan_movimientos;

    IF orphan_pagos = 0 AND orphan_lineas = 0 AND orphan_movimientos = 0 THEN
        RAISE NOTICE '✅ INTEGRIDAD OK: No hay registros huérfanos';
    ELSE
        RAISE WARNING '❌ INTEGRIDAD COMPROMETIDA: Hay registros huérfanos';
    END IF;
END $$;

-- ===== MOSTRAR USUARIOS Y ROLES =====
SELECT
    'USUARIOS Y ROLES:' as info,
    u.username,
    COALESCE(e.nombre || ' ' || e.apellido, 'N/A') as nombre_completo,
    ur.role,
    u.active
FROM users u
LEFT JOIN empleados e ON u.empleado_cedula = e.cedula
LEFT JOIN user_roles ur ON u.id = ur.user_id
ORDER BY u.username;

-- ========================================================================================
-- FIN DE VERIFICACIÓN
-- ========================================================================================
