-- ========================================================================================
-- SCRIPT DE TESTING RÁPIDO - DATOS MÍNIMOS PARA DESARROLLO
-- Sistema de gestión de muebles y decoración - The Larte
--
-- Este script crea datos mínimos para testing y desarrollo rápido
-- Incluye corrección de enums y usuarios de prueba
-- ========================================================================================

-- ===== 1. CORRECCIÓN DE ERRORES =====
\i R__00_Fix_Enum_Roles.sql

-- ===== 2. DATOS MÍNIMOS =====

-- Empleados básicos
INSERT INTO empleados (cedula, nombre, apellido, telefono, email, rol, salario, fecha_contratacion, deleted) VALUES
('001-0000000-1', 'Carlos', 'Mendoza', '809-555-1001', 'carlos.mendoza@thelarte.com', 'ADMINISTRADOR', 45000.00, '2022-01-15', FALSE),
('002-0000000-1', 'María', 'Sánchez', '809-555-2001', 'maria.sanchez@thelarte.com', 'VENDEDOR', 25000.00, '2023-01-15', FALSE)
ON CONFLICT (cedula) DO NOTHING;

-- Usuarios básicos
INSERT INTO users (username, password, active, empleado_cedula) VALUES
('carlosmendoza', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', TRUE, '001-0000000-1'),
('mariasanchez', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', TRUE, '002-0000000-1'),
('adminroot', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', TRUE, NULL)
ON CONFLICT (username) DO NOTHING;

-- Roles
INSERT INTO user_roles (user_id, role) VALUES
((SELECT id FROM users WHERE username = 'carlosmendoza'), 'ADMINISTRADOR'),
((SELECT id FROM users WHERE username = 'mariasanchez'), 'VENDEDOR'),
((SELECT id FROM users WHERE username = 'adminroot'), 'ADMINISTRADOR')
ON CONFLICT DO NOTHING;

-- Productos básicos
INSERT INTO productos (id, nombre, precio_compra, precio_venta, stock, stock_minimo, categoria, activo) VALUES
(1, 'Sofá 3 plazas', 25000.00, 35000.00, 5, 2, 'SOFAS', TRUE),
(2, 'Mesa de Centro', 8000.00, 12000.00, 8, 3, 'MESAS', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Clientes básicos
INSERT INTO clientes (id, nombre, apellido, email, tipo_cliente, limite_credito, activo) VALUES
(1, 'Pedro', 'Martínez', 'pedro@email.com', 'REGULAR', 50000.00, TRUE),
(2, 'María', 'López', 'maria@email.com', 'REGULAR', 30000.00, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Proveedores básicos
INSERT INTO proveedores (id, nombre, email, tipo_proveedor, activo) VALUES
(1, 'Muebles del Caribe', 'contacto@mueblescaribe.com', 'MUEBLERIA', TRUE)
ON CONFLICT (id) DO NOTHING;

-- ===== 3. VERIFICACIÓN =====
DO $$
BEGIN
    RAISE NOTICE '=====================================';
    RAISE NOTICE 'TESTING RÁPIDO COMPLETADO';
    RAISE NOTICE '=====================================';
    RAISE NOTICE 'Empleados: %', (SELECT COUNT(*) FROM empleados WHERE deleted = FALSE);
    RAISE NOTICE 'Usuarios: %', (SELECT COUNT(*) FROM users WHERE active = TRUE);
    RAISE NOTICE 'Productos: %', (SELECT COUNT(*) FROM productos WHERE activo = TRUE);
    RAISE NOTICE '=====================================';
    RAISE NOTICE 'USUARIOS DISPONIBLES:';
    RAISE NOTICE 'adminroot / 1234 (ADMINISTRADOR)';
    RAISE NOTICE 'carlosmendoza / 1234 (ADMINISTRADOR)';
    RAISE NOTICE 'mariasanchez / 1234 (VENDEDOR)';
    RAISE NOTICE '=====================================';
END $$;

-- ========================================================================================
-- FIN SCRIPT DE TESTING RÁPIDO
-- ========================================================================================
