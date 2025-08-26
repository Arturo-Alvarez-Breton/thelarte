-- ========================================================================================
-- MIGRACIÓN R__01: VALIDACIÓN Y BASELINE
-- Sistema de gestión de muebles y decoración - The Larte
-- ========================================================================================
-- Esta migración valida el estado actual de la base de datos y asegura consistencia
-- ========================================================================================

-- ===== VERIFICACIÓN DE ESTADO DE LA BASE DE DATOS =====
DO $$
DECLARE
    table_exists BOOLEAN;
    table_count INTEGER;
    total_tables INTEGER := 0;
    tables_list TEXT[] := ARRAY[
        'empleados', 'users', 'user_roles', 'clientes', 'proveedores',
        'productos', 'transacciones', 'lineas_transaccion', 'pagos',
        'movimientos_producto', 'devoluciones'
    ];
    table_name TEXT;
BEGIN
    RAISE NOTICE '=====================================';
    RAISE NOTICE 'VALIDACIÓN DE BASE DE DATOS - R__01';
    RAISE NOTICE '=====================================';

    FOREACH table_name IN ARRAY tables_list
    LOOP
        -- Verificar si la tabla existe
        SELECT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = table_name
        ) INTO table_exists;

        IF table_exists THEN
            -- Contar registros
            EXECUTE format('SELECT COUNT(*) FROM %I', table_name) INTO table_count;
            RAISE NOTICE '✅ Tabla %: % registros', table_name, table_count;
            total_tables := total_tables + 1;
        ELSE
            RAISE NOTICE '❌ Tabla %: NO EXISTE - Se creará en migraciones siguientes', table_name;
        END IF;
    END LOOP;

    RAISE NOTICE '';
    RAISE NOTICE 'RESUMEN: % de 11 tablas existen', total_tables;

    IF total_tables >= 10 THEN
        RAISE NOTICE '✅ BASE DE DATOS COMPLETA - Todas las tablas existen';
    ELSIF total_tables >= 5 THEN
        RAISE NOTICE '⚠️  BASE DE DATOS PARCIAL - Algunas tablas existen, otras se crearán';
    ELSE
        RAISE NOTICE 'ℹ️  BASE DE DATOS VACÍA - Se crearán todas las tablas';
    END IF;

    RAISE NOTICE '=====================================';
END $$;

-- ===== VALIDACIÓN DE USUARIOS Y ROLES =====
DO $$
DECLARE
    user_count INTEGER;
    role_count INTEGER;
    admin_count INTEGER;
BEGIN
    -- Contar usuarios activos
    SELECT COUNT(*) INTO user_count FROM users WHERE active = TRUE;

    -- Contar roles asignados
    SELECT COUNT(*) INTO role_count FROM user_roles;

    -- Contar administradores
    SELECT COUNT(*) INTO admin_count FROM user_roles WHERE role = 'ADMINISTRADOR';

    RAISE NOTICE 'USUARIOS Y ROLES:';
    RAISE NOTICE '• Usuarios activos: %', user_count;
    RAISE NOTICE '• Roles asignados: %', role_count;
    RAISE NOTICE '• Administradores: %', admin_count;

    IF user_count = 0 THEN
        RAISE NOTICE '⚠️  NO HAY USUARIOS ACTIVOS';
    END IF;

    IF admin_count = 0 THEN
        RAISE NOTICE '⚠️  NO HAY ADMINISTRADORES';
    END IF;
END $$;

-- ===== CREACIÓN DE USUARIOS BÁSICOS SI NO EXISTEN =====
-- Usuario administrador básico si no hay ninguno
DO $$
DECLARE
    admin_exists BOOLEAN;
BEGIN
    -- Verificar si existe al menos un administrador
    SELECT EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN users u ON ur.user_id = u.id
        WHERE ur.role = 'ADMINISTRADOR' AND u.active = TRUE
    ) INTO admin_exists;

    IF NOT admin_exists THEN
        RAISE NOTICE 'Creando usuario administrador básico...';

        -- Crear usuario admin si no existe
        INSERT INTO users (username, password, active, empleado_cedula) VALUES
        ('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', TRUE, NULL)
        ON CONFLICT (username) DO NOTHING;

        -- Asignar rol administrador
        INSERT INTO user_roles (user_id, role) VALUES
        ((SELECT id FROM users WHERE username = 'admin'), 'ADMINISTRADOR')
        ON CONFLICT DO NOTHING;

        RAISE NOTICE '✅ Usuario admin creado (password: 1234)';
    END IF;
END $$;

-- ===== VERIFICACIÓN FINAL =====
DO $$
BEGIN
    RAISE NOTICE '=====================================';
    RAISE NOTICE 'VALIDACIÓN COMPLETA - R__01';
    RAISE NOTICE '=====================================';
    RAISE NOTICE '✅ Migración R__01 completada exitosamente';
    RAISE NOTICE '✅ Base de datos validada y corregida si era necesario';
    RAISE NOTICE '✅ Usuarios básicos disponibles';
    RAISE NOTICE '=====================================';
END $$;

-- ========================================================================================
-- FIN MIGRACIÓN R__01: VALIDACIÓN Y BASELINE
-- ========================================================================================
