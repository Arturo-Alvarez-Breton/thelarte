-- ========================================================================================
-- MIGRACIÓN R__15: USUARIOS POR DEFECTO Y ROLES DEL SISTEMA
-- Sistema de gestión de muebles y decoración - The Larte
-- ========================================================================================
-- Crea usuarios por defecto y usuarios de prueba para todos los roles del sistema
-- ========================================================================================

-- ===== USUARIOS ADMINISTRADORES POR DEFECTO =====
-- Contraseña hasheada para "1234": $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

-- Usuario: edwinb (ADMINISTRADOR)
INSERT INTO users (username, password, active, empleado_cedula) VALUES
('edwinb', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', TRUE, NULL)
ON CONFLICT (username) DO NOTHING;

INSERT INTO user_roles (user_id, role) VALUES
((SELECT id FROM users WHERE username = 'edwinb'), 'ADMINISTRADOR')
ON CONFLICT DO NOTHING;

-- Usuario: jeanp (ADMINISTRADOR)
INSERT INTO users (username, password, active, empleado_cedula) VALUES
('jeanp', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', TRUE, NULL)
ON CONFLICT (username) DO NOTHING;

INSERT INTO user_roles (user_id, role) VALUES
((SELECT id FROM users WHERE username = 'jeanp'), 'ADMINISTRADOR')
ON CONFLICT DO NOTHING;

-- Usuario: arturob (ADMINISTRADOR)
INSERT INTO users (username, password, active, empleado_cedula) VALUES
('arturob', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', TRUE, NULL)
ON CONFLICT (username) DO NOTHING;

INSERT INTO user_roles (user_id, role) VALUES
((SELECT id FROM users WHERE username = 'arturob'), 'ADMINISTRADOR')
ON CONFLICT DO NOTHING;

-- ===== USUARIOS DE PRUEBA PARA CADA ROL DEL SISTEMA =====

-- Usuario de prueba TI
INSERT INTO users (username, password, active, empleado_cedula) VALUES
('test_ti', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', TRUE, NULL)
ON CONFLICT (username) DO NOTHING;

INSERT INTO user_roles (user_id, role) VALUES
((SELECT id FROM users WHERE username = 'test_ti'), 'TI')
ON CONFLICT DO NOTHING;

-- Usuario de prueba VENDEDOR
INSERT INTO users (username, password, active, empleado_cedula) VALUES
('test_vendedor', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', TRUE, NULL)
ON CONFLICT (username) DO NOTHING;

INSERT INTO user_roles (user_id, role) VALUES
((SELECT id FROM users WHERE username = 'test_vendedor'), 'VENDEDOR')
ON CONFLICT DO NOTHING;

-- Usuario de prueba CAJERO
INSERT INTO users (username, password, active, empleado_cedula) VALUES
('test_cajero', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', TRUE, NULL)
ON CONFLICT (username) DO NOTHING;

INSERT INTO user_roles (user_id, role) VALUES
((SELECT id FROM users WHERE username = 'test_cajero'), 'CAJERO')
ON CONFLICT DO NOTHING;

-- Usuario de prueba CONTABILIDAD
INSERT INTO users (username, password, active, empleado_cedula) VALUES
('test_contabilidad', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', TRUE, NULL)
ON CONFLICT (username) DO NOTHING;

INSERT INTO user_roles (user_id, role) VALUES
((SELECT id FROM users WHERE username = 'test_contabilidad'), 'CONTABILIDAD')
ON CONFLICT DO NOTHING;

-- ===== EMPLEADOS BÁSICOS PARA LOS USUARIOS DE PRUEBA =====

-- Empleado para test_ti
INSERT INTO empleados (cedula, nombre, apellido, telefono, email, rol, salario, fecha_contratacion, deleted) VALUES
('TI-001-TEST', 'Test', 'Tecnico', '809-555-0100', 'test.ti@thelarte.com', 'TI', 35000.00, '2024-01-01', FALSE)
ON CONFLICT (cedula) DO NOTHING;

UPDATE users SET empleado_cedula = 'TI-001-TEST' WHERE username = 'test_ti' AND empleado_cedula IS NULL;

-- Empleado para test_vendedor
INSERT INTO empleados (cedula, nombre, apellido, telefono, email, rol, salario, comision, fecha_contratacion, deleted) VALUES
('VEN-001-TEST', 'Test', 'Vendedor', '809-555-0200', 'test.vendedor@thelarte.com', 'VENDEDOR', 25000.00, 10.0, '2024-01-01', FALSE)
ON CONFLICT (cedula) DO NOTHING;

UPDATE users SET empleado_cedula = 'VEN-001-TEST' WHERE username = 'test_vendedor' AND empleado_cedula IS NULL;

-- Empleado para test_cajero
INSERT INTO empleados (cedula, nombre, apellido, telefono, email, rol, salario, fecha_contratacion, deleted) VALUES
('CAJ-001-TEST', 'Test', 'Cajero', '809-555-0300', 'test.cajero@thelarte.com', 'CAJERO', 18000.00, '2024-01-01', FALSE)
ON CONFLICT (cedula) DO NOTHING;

UPDATE users SET empleado_cedula = 'CAJ-001-TEST' WHERE username = 'test_cajero' AND empleado_cedula IS NULL;

-- Empleado para test_contabilidad
INSERT INTO empleados (cedula, nombre, apellido, telefono, email, rol, salario, fecha_contratacion, deleted) VALUES
('CONT-001-TEST', 'Test', 'Contador', '809-555-0400', 'test.contabilidad@thelarte.com', 'CONTABILIDAD', 22000.00, '2024-01-01', FALSE)
ON CONFLICT (cedula) DO NOTHING;

UPDATE users SET empleado_cedula = 'CONT-001-TEST' WHERE username = 'test_contabilidad' AND empleado_cedula IS NULL;

-- ===== VERIFICACIÓN FINAL =====
DO $$
DECLARE
    total_usuarios INTEGER;
    total_roles INTEGER;
    usuarios_admin INTEGER;
BEGIN
    -- Contar usuarios y roles
    SELECT COUNT(*) INTO total_usuarios FROM users WHERE active = TRUE;
    SELECT COUNT(*) INTO total_roles FROM user_roles;
    SELECT COUNT(*) INTO usuarios_admin FROM user_roles WHERE role = 'ADMINISTRADOR';

    RAISE NOTICE '=====================================';
    RAISE NOTICE 'USUARIOS CREADOS - MIGRACIÓN R__15';
    RAISE NOTICE '=====================================';
    RAISE NOTICE 'Total usuarios activos: %', total_usuarios;
    RAISE NOTICE 'Total roles asignados: %', total_roles;
    RAISE NOTICE 'Usuarios administradores: %', usuarios_admin;
    RAISE NOTICE '';
    RAISE NOTICE 'USUARIOS ADMINISTRADORES:';
    RAISE NOTICE 'edwinb / 1234 (ADMINISTRADOR)';
    RAISE NOTICE 'jeanp / 1234 (ADMINISTRADOR)';
    RAISE NOTICE 'arturob / 1234 (ADMINISTRADOR)';
    RAISE NOTICE '';
    RAISE NOTICE 'USUARIOS DE PRUEBA POR ROL:';
    RAISE NOTICE 'test_ti / 1234 (TI)';
    RAISE NOTICE 'test_vendedor / 1234 (VENDEDOR)';
    RAISE NOTICE 'test_cajero / 1234 (CAJERO)';
    RAISE NOTICE 'test_contabilidad / 1234 (CONTABILIDAD)';
    RAISE NOTICE '=====================================';
END $$;

-- ========================================================================================
-- FIN MIGRACIÓN R__15: USUARIOS POR DEFECTO Y ROLES DEL SISTEMA
-- ========================================================================================
