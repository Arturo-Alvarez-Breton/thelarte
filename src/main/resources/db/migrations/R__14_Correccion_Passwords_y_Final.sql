-- ========================================================================================
-- MIGRACIÓN R__14: CORRECCIÓN DE CONTRASEÑAS Y VERIFICACIÓN FINAL
-- Sistema de gestión de muebles y decoración - The Larte
-- ========================================================================================

-- ===== CORRECCIÓN DE CONTRASEÑAS =====
-- Actualizar contraseñas con hash bcrypt real para "1234"
UPDATE users SET password = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' WHERE username IN ('carlosmendoza', 'anagarcia', 'mariasanchez', 'juanperez', 'carlasantos', 'adminroot');

-- ===== VERIFICACIÓN DE INTEGRIDAD DE DATOS =====
DO $$
DECLARE
    total_empleados INTEGER;
    total_usuarios INTEGER;
    total_roles INTEGER;
    total_productos INTEGER;
    total_clientes INTEGER;
    total_proveedores INTEGER;
    total_transacciones INTEGER;
    total_pagos INTEGER;
    total_movimientos INTEGER;
BEGIN
    -- Contar registros
    SELECT COUNT(*) INTO total_empleados FROM empleados WHERE deleted = FALSE;
    SELECT COUNT(*) INTO total_usuarios FROM users WHERE active = TRUE;
    SELECT COUNT(*) INTO total_roles FROM user_roles;
    SELECT COUNT(*) INTO total_productos FROM productos WHERE activo = TRUE;
    SELECT COUNT(*) INTO total_clientes FROM clientes WHERE activo = TRUE;
    SELECT COUNT(*) INTO total_proveedores FROM proveedores WHERE activo = TRUE;
    SELECT COUNT(*) INTO total_transacciones FROM transacciones WHERE deleted = FALSE;
    SELECT COUNT(*) INTO total_pagos FROM pagos;
    SELECT COUNT(*) INTO total_movimientos FROM movimientos_inventario;

    -- Mostrar resultados
    RAISE NOTICE '=====================================';
    RAISE NOTICE 'VERIFICACIÓN FINAL DE DATOS';
    RAISE NOTICE '=====================================';
    RAISE NOTICE 'Empleados activos: %', total_empleados;
    RAISE NOTICE 'Usuarios activos: %', total_usuarios;
    RAISE NOTICE 'Roles asignados: %', total_roles;
    RAISE NOTICE 'Productos activos: %', total_productos;
    RAISE NOTICE 'Clientes activos: %', total_clientes;
    RAISE NOTICE 'Proveedores activos: %', total_proveedores;
    RAISE NOTICE 'Transacciones: %', total_transacciones;
    RAISE NOTICE 'Pagos registrados: %', total_pagos;
    RAISE NOTICE 'Movimientos de inventario: %', total_movimientos;
    RAISE NOTICE '=====================================';

    -- Verificaciones de consistencia
    IF total_usuarios > total_empleados + 1 THEN -- +1 para adminroot
        RAISE WARNING 'ALERTA: Hay más usuarios que empleados';
    END IF;

    IF total_roles < total_usuarios THEN
        RAISE WARNING 'ALERTA: Algunos usuarios no tienen roles asignados';
    END IF;

    -- Verificar roles válidos
    IF EXISTS (SELECT 1 FROM user_roles WHERE role NOT IN ('ADMINISTRADOR', 'TI', 'VENDEDOR', 'CAJERO', 'CONTABILIDAD')) THEN
        RAISE EXCEPTION 'ERROR: Existen roles inválidos en user_roles';
    END IF;

    RAISE NOTICE '✅ Verificación completada exitosamente';
END $$;

-- ===== USUARIOS DE PRUEBA PARA TESTING =====
-- Insertar usuario de prueba si no existe
INSERT INTO users (username, password, active, empleado_cedula)
SELECT 'testuser', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', TRUE, NULL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'testuser');

-- Asignar rol de prueba
INSERT INTO user_roles (user_id, role)
SELECT (SELECT id FROM users WHERE username = 'testuser'), 'VENDEDOR'
WHERE NOT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN users u ON ur.user_id = u.id
    WHERE u.username = 'testuser'
);

-- ===== RESETEAR SECUENCIAS A VALORES CORRECTOS =====
SELECT setval('empleados_id_seq', COALESCE((SELECT MAX(id) FROM empleados), 1));
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1));
SELECT setval('user_roles_id_seq', COALESCE((SELECT MAX(id) FROM user_roles), 1));
SELECT setval('productos_id_seq', COALESCE((SELECT MAX(id) FROM productos), 1));
SELECT setval('clientes_id_seq', COALESCE((SELECT MAX(id) FROM clientes), 1));
SELECT setval('proveedores_id_seq', COALESCE((SELECT MAX(id) FROM proveedores), 1));
SELECT setval('transacciones_id_seq', COALESCE((SELECT MAX(id) FROM transacciones), 1));
SELECT setval('lineas_transaccion_id_seq', COALESCE((SELECT MAX(id) FROM lineas_transaccion), 1));
SELECT setval('pagos_id_seq', COALESCE((SELECT MAX(id) FROM pagos), 1));
SELECT setval('movimientos_inventario_id_seq', COALESCE((SELECT MAX(id) FROM movimientos_inventario), 1));

-- ===== MOSTRAR USUARIOS Y CONTRASEÑAS PARA TESTING =====
DO $$
BEGIN
    RAISE NOTICE '=====================================';
    RAISE NOTICE 'USUARIOS DE PRUEBA DISPONIBLES:';
    RAISE NOTICE '=====================================';
    RAISE NOTICE 'Usuario: carlosmendoza | Contraseña: 1234 | Rol: ADMINISTRADOR';
    RAISE NOTICE 'Usuario: anagarcia | Contraseña: 1234 | Rol: ADMINISTRADOR';
    RAISE NOTICE 'Usuario: mariasanchez | Contraseña: 1234 | Rol: VENDEDOR';
    RAISE NOTICE 'Usuario: juanperez | Contraseña: 1234 | Rol: TI';
    RAISE NOTICE 'Usuario: carlasantos | Contraseña: 1234 | Rol: CONTABILIDAD';
    RAISE NOTICE 'Usuario: adminroot | Contraseña: 1234 | Rol: ADMINISTRADOR';
    RAISE NOTICE 'Usuario: testuser | Contraseña: 1234 | Rol: VENDEDOR';
    RAISE NOTICE '=====================================';
END $$;

-- ========================================================================================
-- FIN MIGRACIÓN R__14
-- ========================================================================================
