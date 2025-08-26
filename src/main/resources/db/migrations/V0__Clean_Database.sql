-- ========================================================================================
-- MIGRACIÓN V0: LIMPIEZA COMPLETA DE BASE DE DATOS
-- Sistema de gestión de muebles y decoración - The Larte
-- ========================================================================================
-- Esta migración debe ejecutarse PRIMERO para limpiar cualquier residuo
-- antes de crear las tablas con la estructura actual
-- ========================================================================================

-- Deshabilitar restricciones de foreign key temporalmente
SET CONSTRAINTS ALL DEFERRED;

-- ===== LIMPIEZA DE TABLAS =====
-- Eliminar tablas en orden inverso a las dependencias

DO $$
DECLARE
    table_name TEXT;
    tables_to_drop TEXT[] := ARRAY[
        'movimientos_producto',
        'pagos',
        'lineas_transaccion',
        'transacciones',
        'productos',
        'proveedores',
        'clientes',
        'user_roles',
        'users',
        'empleados',
        'devoluciones'
    ];
BEGIN
    FOREACH table_name IN ARRAY tables_to_drop
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = table_name) THEN
            EXECUTE format('DROP TABLE IF EXISTS %I CASCADE', table_name);
            RAISE NOTICE 'Eliminada tabla: %', table_name;
        ELSE
            RAISE NOTICE 'Tabla % no existe, saltando...', table_name;
        END IF;
    END LOOP;
END $$;

-- ===== LIMPIEZA DE SECUENCIAS =====
DO $$
DECLARE
    seq_name TEXT;
    sequences_to_drop TEXT[] := ARRAY[
        'movimientos_producto_id_seq',
        'pagos_id_seq',
        'lineas_transaccion_id_seq',
        'transacciones_id_seq',
        'productos_id_seq',
        'proveedores_id_seq',
        'clientes_id_seq',
        'users_id_seq',
        'user_roles_id_seq',
        'empleados_id_seq',
        'devoluciones_id_seq'
    ];
BEGIN
    FOREACH seq_name IN ARRAY sequences_to_drop
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = seq_name) THEN
            EXECUTE format('DROP SEQUENCE IF EXISTS %I', seq_name);
            RAISE NOTICE 'Eliminada secuencia: %', seq_name;
        ELSE
            RAISE NOTICE 'Secuencia % no existe, saltando...', seq_name;
        END IF;
    END LOOP;
END $$;

-- ===== LIMPIEZA DE ÍNDICES =====
DO $$
DECLARE
    index_record RECORD;
BEGIN
    FOR index_record IN
        SELECT indexname, tablename
        FROM pg_indexes
        WHERE schemaname = 'public'
        AND indexname NOT LIKE 'pg_%'
        AND tablename IN ('empleados', 'users', 'user_roles', 'clientes', 'proveedores', 'productos', 'transacciones', 'lineas_transaccion', 'pagos', 'movimientos_producto', 'devoluciones')
    LOOP
        EXECUTE format('DROP INDEX IF EXISTS %I', index_record.indexname);
        RAISE NOTICE 'Eliminado índice: %', index_record.indexname;
    END LOOP;
END $$;

-- ===== LIMPIEZA DE FUNCIONES =====
DROP FUNCTION IF EXISTS table_exists(TEXT);

-- Rehabilitar restricciones
SET CONSTRAINTS ALL IMMEDIATE;

-- ===== VERIFICACIÓN FINAL =====
DO $$
DECLARE
    remaining_tables INTEGER;
    remaining_sequences INTEGER;
BEGIN
    -- Contar tablas restantes
    SELECT COUNT(*) INTO remaining_tables
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('empleados', 'users', 'user_roles', 'clientes', 'proveedores', 'productos', 'transacciones', 'lineas_transaccion', 'pagos', 'movimientos_producto', 'devoluciones');

    -- Contar secuencias restantes
    SELECT COUNT(*) INTO remaining_sequences
    FROM information_schema.sequences
    WHERE sequence_schema = 'public'
    AND sequence_name IN ('empleados_id_seq', 'users_id_seq', 'user_roles_id_seq', 'clientes_id_seq', 'proveedores_id_seq', 'productos_id_seq', 'transacciones_id_seq', 'lineas_transaccion_id_seq', 'pagos_id_seq', 'movimientos_producto_id_seq', 'devoluciones_id_seq');

    RAISE NOTICE '=====================================';
    RAISE NOTICE 'VERIFICACIÓN DE LIMPIEZA V0';
    RAISE NOTICE '=====================================';
    RAISE NOTICE 'Tablas restantes: %', remaining_tables;
    RAISE NOTICE 'Secuencias restantes: %', remaining_sequences;

    IF remaining_tables = 0 AND remaining_sequences = 0 THEN
        RAISE NOTICE '✅ LIMPIEZA COMPLETA: Base de datos lista para migraciones';
    ELSE
        RAISE WARNING '⚠️  ATENCIÓN: Quedan % tablas y % secuencias', remaining_tables, remaining_sequences;
    END IF;

    RAISE NOTICE '=====================================';
END $$;

-- ========================================================================================
-- FIN MIGRACIÓN V0: LIMPIEZA COMPLETA
-- ========================================================================================
