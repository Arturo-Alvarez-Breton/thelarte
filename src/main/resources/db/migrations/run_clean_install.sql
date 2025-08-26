-- ========================================================================================
-- SCRIPT DE INSTALACIÓN LIMPIA COMPLETA
-- Sistema de gestión de muebles y decoración - The Larte
-- ========================================================================================
-- 🚨 ADVERTENCIA CRÍTICA: ESTE SCRIPT ELIMINA TODOS LOS DATOS
--
-- Este script ejecuta una instalación completamente limpia:
-- 1. Elimina TODAS las tablas y datos existentes
-- 2. Crea la estructura desde cero
-- 3. Crea usuarios por defecto
-- 4. Verifica la instalación
--
-- ⚠️  USE CON EXTREMA PRECAUCIÓN - HAGA BACKUP ANTES
-- ========================================================================================

-- ===== CONFIRMACIÓN DE EJECUCIÓN =====
DO $$
BEGIN
    RAISE NOTICE '=====================================';
    RAISE NOTICE '🚨 INSTALACIÓN LIMPIA COMPLETA';
    RAISE NOTICE '=====================================';
    RAISE NOTICE '⚠️  ADVERTENCIA CRÍTICA:';
    RAISE NOTICE '⚠️  Este script ELIMINARÁ TODOS LOS DATOS';
    RAISE NOTICE '⚠️  Se perderán todos los registros existentes';
    RAISE NOTICE '⚠️  Asegúrese de tener un backup actual';
    RAISE NOTICE '';
    RAISE NOTICE 'Proceso:';
    RAISE NOTICE '1. 🗑️  Eliminar todas las tablas y datos';
    RAISE NOTICE '2. 🏗️  Crear estructura desde cero';
    RAISE NOTICE '3. 👥 Crear usuarios por defecto';
    RAISE NOTICE '4. ✅ Verificar instalación';
    RAISE NOTICE '';
    RAISE NOTICE 'Continuando con la instalación limpia...';
    RAISE NOTICE '=====================================';
END $$;

-- ===== EJECUTAR MIGRACIONES EN ORDEN =====

-- 1. V0 - LIMPIEZA COMPLETA (ELIMINA TODO)
\i V0__Clean_Database.sql

-- 2. R__01 - Validación post-limpieza
\i R__01_Baseline_Validation.sql

-- 3. V1-V9 - Creación de tablas desde cero
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

-- ===== VERIFICACIÓN FINAL COMPLETA =====
DO $$
DECLARE
    total_tables INTEGER;
    total_users INTEGER;
    admin_count INTEGER;
    table_list TEXT;
BEGIN
    RAISE NOTICE '=====================================';
    RAISE NOTICE 'VERIFICACIÓN FINAL - INSTALACIÓN COMPLETA';
    RAISE NOTICE '=====================================';

    -- Contar tablas
    SELECT COUNT(*) INTO total_tables
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('empleados', 'users', 'user_roles', 'clientes', 'proveedores', 'productos', 'transacciones', 'lineas_transaccion', 'pagos', 'movimientos_producto', 'devoluciones');

    -- Contar usuarios
    SELECT COUNT(*) INTO total_users FROM users WHERE active = TRUE;
    SELECT COUNT(*) INTO admin_count FROM user_roles WHERE role = 'ADMINISTRADOR';

    -- Lista de tablas creadas
    SELECT STRING_AGG(table_name, ', ') INTO table_list
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('empleados', 'users', 'user_roles', 'clientes', 'proveedores', 'productos', 'transacciones', 'lineas_transaccion', 'pagos', 'movimientos_producto', 'devoluciones');

    RAISE NOTICE 'RESULTADOS DE LA INSTALACIÓN:';
    RAISE NOTICE '• ✅ Tablas creadas: %', total_tables;
    RAISE NOTICE '• ✅ Usuarios activos: %', total_users;
    RAISE NOTICE '• ✅ Administradores: %', admin_count;
    RAISE NOTICE '';
    RAISE NOTICE 'TABLAS CREADAS:';
    RAISE NOTICE '%', table_list;
    RAISE NOTICE '';
    RAISE NOTICE 'USUARIOS ADMINISTRADORES:';
    RAISE NOTICE '• edwinb / 1234 (ADMINISTRADOR)';
    RAISE NOTICE '• jeanp / 1234 (ADMINISTRADOR)';
    RAISE NOTICE '• arturob / 1234 (ADMINISTRADOR)';
    RAISE NOTICE '';
    RAISE NOTICE 'USUARIOS DE PRUEBA POR ROL:';
    RAISE NOTICE '• test_ti / 1234 (TI)';
    RAISE NOTICE '• test_vendedor / 1234 (VENDEDOR)';
    RAISE NOTICE '• test_cajero / 1234 (CAJERO)';
    RAISE NOTICE '• test_contabilidad / 1234 (CONTABILIDAD)';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 INSTALACIÓN COMPLETA EXITOSA';
    RAISE NOTICE '🎉 Base de datos lista para usar';
    RAISE NOTICE '=====================================';
END $$;

-- ========================================================================================
-- FIN DEL SCRIPT DE INSTALACIÓN LIMPIA
-- ========================================================================================
