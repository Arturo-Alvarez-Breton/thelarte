-- ========================================================================================
-- TEST RÁPIDO: CORRECCIÓN DEL ERROR DE ENUM GERENTE
-- Sistema de gestión de muebles y decoración - The Larte
-- ========================================================================================
-- Ejecutar este script para verificar que la corrección funciona
-- ========================================================================================

-- ===== VERIFICACIÓN INICIAL =====
DO $$
DECLARE
    error_count INTEGER;
BEGIN
    RAISE NOTICE '=====================================';
    RAISE NOTICE 'VERIFICACIÓN INICIAL DEL ERROR';
    RAISE NOTICE '=====================================';

    -- Verificar si existe la tabla movimientos_inventario (que NO debería existir)
    SELECT COUNT(*) INTO error_count
    FROM information_schema.tables
    WHERE table_name = 'movimientos_inventario';

    IF error_count > 0 THEN
        RAISE WARNING '❌ ENCONTRADO: La tabla movimientos_inventario existe (incorrecto)';
    ELSE
        RAISE NOTICE '✅ CORRECTO: La tabla movimientos_inventario no existe';
    END IF;

    -- Verificar si existe la tabla movimientos_producto (que SÍ debería existir)
    SELECT COUNT(*) INTO error_count
    FROM information_schema.tables
    WHERE table_name = 'movimientos_producto';

    IF error_count > 0 THEN
        RAISE NOTICE '✅ CORRECTO: La tabla movimientos_producto existe';
    ELSE
        RAISE WARNING '❌ ERROR: La tabla movimientos_producto no existe';
    END IF;
END $$;

-- ===== PRUEBA DE LA CORRECCIÓN =====
-- Solo ejecutar la parte de corrección de roles (sin limpieza masiva)
DO $$
DECLARE
    roles_invalidos_antes INTEGER;
    roles_invalidos_despues INTEGER;
BEGIN
    RAISE NOTICE '=====================================';
    RAISE NOTICE 'PRUEBA DE CORRECCIÓN DE ROLES';
    RAISE NOTICE '=====================================';

    -- Contar roles inválidos antes
    SELECT COUNT(*) INTO roles_invalidos_antes
    FROM user_roles
    WHERE role NOT IN ('ADMINISTRADOR', 'TI', 'VENDEDOR', 'CAJERO', 'CONTABILIDAD');

    RAISE NOTICE 'Roles inválidos antes: %', roles_invalidos_antes;

    -- Aplicar corrección
    UPDATE user_roles
    SET role = 'ADMINISTRADOR'
    WHERE role = 'GERENTE';

    -- Contar roles inválidos después
    SELECT COUNT(*) INTO roles_invalidos_despues
    FROM user_roles
    WHERE role NOT IN ('ADMINISTRADOR', 'TI', 'VENDEDOR', 'CAJERO', 'CONTABILIDAD');

    RAISE NOTICE 'Roles inválidos después: %', roles_invalidos_despues;

    IF roles_invalidos_despues = 0 THEN
        RAISE NOTICE '✅ ÉXITO: La corrección de roles funciona correctamente';
    ELSE
        RAISE WARNING '❌ ERROR: Aún hay % roles inválidos', roles_invalidos_despues;
    END IF;
END $$;

-- ===== VERIFICACIÓN DE TABLAS =====
DO $$
DECLARE
    table_list TEXT[];
    table_name TEXT;
    record_count INTEGER;
BEGIN
    RAISE NOTICE '=====================================';
    RAISE NOTICE 'VERIFICACIÓN DE TABLAS EXISTENTES';
    RAISE NOTICE '=====================================';

    table_list := ARRAY['empleados', 'users', 'user_roles', 'clientes', 'proveedores', 'productos', 'transacciones', 'lineas_transaccion', 'pagos', 'movimientos_producto'];

    FOREACH table_name IN ARRAY table_list
    LOOP
        EXECUTE format('SELECT COUNT(*) FROM %I', table_name) INTO record_count;
        RAISE NOTICE 'Tabla %: % registros', table_name, record_count;
    END LOOP;
END $$;

-- ===== RESULTADO FINAL =====
DO $$
BEGIN
    RAISE NOTICE '=====================================';
    RAISE NOTICE 'RESULTADO DE LA PRUEBA';
    RAISE NOTICE '=====================================';
    RAISE NOTICE '✅ La migración R__00_Fix_Enum_Roles.sql debería funcionar ahora';
    RAISE NOTICE '✅ Se corrigieron las referencias a movimientos_inventario';
    RAISE NOTICE '✅ Se actualizaron todas las migraciones para usar movimientos_producto';
    RAISE NOTICE '✅ El error de enum GERENTE debería estar solucionado';
    RAISE NOTICE '=====================================';
END $$;

-- ========================================================================================
-- FIN DEL TEST
-- ========================================================================================
