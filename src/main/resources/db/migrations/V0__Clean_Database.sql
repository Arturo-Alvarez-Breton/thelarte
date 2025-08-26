-- ========================================================================================
-- MIGRACIÓN V0: VALIDACIÓN INICIAL DE BASE DE DATOS
-- Sistema de gestión de muebles y decoración - The Larte
-- ========================================================================================
-- Esta migración valida el estado inicial y NO ELIMINA NADA
-- Solo verifica la estructura existente para asegurar compatibilidad
-- ========================================================================================

-- ===== VERIFICACIÓN DE ESTRUCTURA EXISTENTE =====
DO $$
DECLARE
    table_name TEXT;
    table_exists BOOLEAN;
    record_count INTEGER;
    tables_to_check TEXT[] := ARRAY[
        'empleados', 'users', 'user_roles', 'clientes', 'proveedores',
        'productos', 'transacciones', 'lineas_transaccion', 'pagos',
        'movimientos_producto', 'devoluciones'
    ];
BEGIN
    RAISE NOTICE '=====================================';
    RAISE NOTICE 'VALIDACIÓN INICIAL V0';
    RAISE NOTICE '=====================================';

    FOREACH table_name IN ARRAY tables_to_check
    LOOP
        -- Verificar si la tabla existe
        SELECT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = table_name
        ) INTO table_exists;

        IF table_exists THEN
            -- Contar registros en la tabla
            EXECUTE format('SELECT COUNT(*) FROM %I', table_name) INTO record_count;
            RAISE NOTICE '✅ Tabla % existe con % registros', table_name, record_count;
        ELSE
            RAISE NOTICE 'ℹ️  Tabla % no existe (se creará)', table_name;
        END IF;
    END LOOP;

    RAISE NOTICE '=====================================';
    RAISE NOTICE '✅ VALIDACIÓN COMPLETA - Listo para migraciones';
    RAISE NOTICE '=====================================';
END $$;

-- ========================================================================================
-- FIN MIGRACIÓN V0: VALIDACIÓN INICIAL
-- ========================================================================================
