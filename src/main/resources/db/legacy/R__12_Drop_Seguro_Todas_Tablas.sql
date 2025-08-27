-- ========================================================================================
-- MIGRACIÓN R__12: DROP SEGURO DE TODAS LAS TABLAS
-- Sistema de gestión de muebles y decoración - The Larte
-- ========================================================================================

-- ===== DROP SEGURO CON VERIFICACIONES =====

-- Deshabilitar restricciones de clave foránea temporalmente
SET CONSTRAINTS ALL DEFERRED;

-- Función auxiliar para verificar si una tabla existe
CREATE OR REPLACE FUNCTION table_exists(table_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = table_name
    );
END;
$$ LANGUAGE plpgsql;

-- ===== ELIMINACIÓN SEGURA DE DATOS =====

-- 1. Eliminar datos de tablas dependientes primero
DO $$
BEGIN
    IF table_exists('pagos') THEN
        RAISE NOTICE 'Eliminando datos de pagos...';
        DELETE FROM pagos;
    END IF;
END $$;

DO $$
BEGIN
    IF table_exists('lineas_transaccion') THEN
        RAISE NOTICE 'Eliminando datos de lineas_transaccion...';
        DELETE FROM lineas_transaccion;
    END IF;
END $$;

DO $$
BEGIN
    IF table_exists('transacciones') THEN
        RAISE NOTICE 'Eliminando datos de transacciones...';
        DELETE FROM transacciones;
    END IF;
END $$;

DO $$
BEGIN
    IF table_exists('movimientos_producto') THEN
        RAISE NOTICE 'Eliminando datos de movimientos_producto...';
        DELETE FROM movimientos_producto;
    END IF;
END $$;

DO $$
BEGIN
    IF table_exists('devoluciones') THEN
        RAISE NOTICE 'Eliminando datos de devoluciones...';
        DELETE FROM devoluciones;
    END IF;
END $$;

DO $$
BEGIN
    IF table_exists('user_roles') THEN
        RAISE NOTICE 'Eliminando datos de user_roles...';
        DELETE FROM user_roles;
    END IF;
END $$;

-- 2. Eliminar datos de tablas principales
DO $$
BEGIN
    IF table_exists('users') THEN
        RAISE NOTICE 'Eliminando datos de users...';
        DELETE FROM users;
    END IF;
END $$;

DO $$
BEGIN
    IF table_exists('productos') THEN
        RAISE NOTICE 'Eliminando datos de productos...';
        DELETE FROM productos;
    END IF;
END $$;

DO $$
BEGIN
    IF table_exists('clientes') THEN
        RAISE NOTICE 'Eliminando datos de clientes...';
        DELETE FROM clientes;
    END IF;
END $$;

DO $$
BEGIN
    IF table_exists('proveedores') THEN
        RAISE NOTICE 'Eliminando datos de proveedores...';
        DELETE FROM proveedores;
    END IF;
END $$;

DO $$
BEGIN
    IF table_exists('empleados') THEN
        RAISE NOTICE 'Eliminando datos de empleados...';
        DELETE FROM empleados;
    END IF;
END $$;

-- ===== VERIFICACIÓN FINAL =====
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('empleados', 'users', 'user_roles', 'clientes', 'proveedores',
                       'productos', 'transacciones', 'lineas_transaccion', 'pagos',
                       'movimientos_producto', 'devoluciones');

    RAISE NOTICE 'Tablas encontradas: %', table_count;
    RAISE NOTICE 'Drop seguro completado. Las tablas están vacías y listas para recreación.';
END $$;

-- Rehabilitar restricciones
SET CONSTRAINTS ALL IMMEDIATE;

-- ========================================================================================
-- FIN MIGRACIÓN R__12
-- ========================================================================================
