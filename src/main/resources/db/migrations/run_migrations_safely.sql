-- ========================================================================================
-- SCRIPT DE EJECUCIÓN SEGURA DE MIGRACIONES
-- Sistema de gestión de muebles y decoración - The Larte
-- ========================================================================================
-- Este script ejecuta las migraciones principales de manera segura
-- Compatible con bases de datos existentes (NO ELIMINA DATOS)
-- ========================================================================================

-- ===== VERIFICACIÓN PREVIA =====
DO $$
BEGIN
    RAISE NOTICE '=====================================';
    RAISE NOTICE 'INICIANDO MIGRACIONES SEGURAS';
    RAISE NOTICE '=====================================';
    RAISE NOTICE 'Este script es compatible con BD existentes';
    RAISE NOTICE 'NO se eliminarán datos existentes';
    RAISE NOTICE '=====================================';
END $$;

-- ===== EJECUTAR MIGRACIONES EN ORDEN =====

-- 1. V0 - Validación inicial (NO elimina nada)
\i V0__Clean_Database.sql

-- 2. R__01 - Validación y baseline
\i R__01_Baseline_Validation.sql

-- 3. V1-V9 - Creación de tablas (IF NOT EXISTS)
\i V1__Create_Empleados.sql
\i V2__Create_Clientes.sql
\i V3__Create_Users.sql
\i V4__Create_Suplidor.sql
\i V5__Create_Producto.sql
\i V6__Create_Transacciones.sql
\i V7__Create_Pagos.sql
\i V8__Create_Movimientos.sql
\i V9__Create_Devoluciones.sql

-- 4. R__15 - Usuarios por defecto
\i R__15_Usuarios_Por_Defecto_Roles.sql

-- ===== VERIFICACIÓN FINAL =====
DO $$
DECLARE
    total_tables INTEGER;
    total_users INTEGER;
    admin_count INTEGER;
BEGIN
    RAISE NOTICE '=====================================';
    RAISE NOTICE 'VERIFICACIÓN FINAL DE MIGRACIONES';
    RAISE NOTICE '=====================================';

    -- Contar tablas
    SELECT COUNT(*) INTO total_tables
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('empleados', 'users', 'user_roles', 'clientes', 'proveedores', 'productos', 'transacciones', 'lineas_transaccion', 'pagos', 'movimientos_producto', 'devoluciones');

    -- Contar usuarios
    SELECT COUNT(*) INTO total_users FROM users WHERE active = TRUE;
    SELECT COUNT(*) INTO admin_count FROM user_roles WHERE role = 'ADMINISTRADOR';

    RAISE NOTICE 'RESULTADOS:';
    RAISE NOTICE '• Tablas existentes: %', total_tables;
    RAISE NOTICE '• Usuarios activos: %', total_users;
    RAISE NOTICE '• Administradores: %', admin_count;

    RAISE NOTICE '';
    RAISE NOTICE 'USUARIOS ADMINISTRADORES DISPONIBLES:';
    RAISE NOTICE '• edwinb / 1234';
    RAISE NOTICE '• jeanp / 1234';
    RAISE NOTICE '• arturob / 1234';

    RAISE NOTICE '';
    RAISE NOTICE '✅ MIGRACIONES COMPLETADAS EXITOSAMENTE';
    RAISE NOTICE '✅ Base de datos lista para usar';
    RAISE NOTICE '=====================================';
END $$;

-- ========================================================================================
-- FIN DEL SCRIPT DE EJECUCIÓN SEGURA
-- ========================================================================================
