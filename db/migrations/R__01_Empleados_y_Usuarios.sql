-- ========================================================================================
-- MIGRACIÓN R__01: EMPLEADOS Y USUARIOS
-- Sistema de gestión de muebles y decoración - The Larte
-- ========================================================================================

-- ===== 1. DATOS DE EMPLEADOS =====
INSERT INTO empleados (cedula, nombre, apellido, telefono, email, rol, salario, comision, fecha_contratacion, deleted) VALUES
-- Gerencia y Administración
('001-1234567-1', 'Carlos', 'Mendoza', '809-555-1001', 'carlos.mendoza@thelarte.com', 'ADMIN', 45000.00, NULL, '2022-01-15', FALSE),
('001-1234567-2', 'Ana', 'García', '809-555-1002', 'ana.garcia@thelarte.com', 'ADMIN', 42000.00, NULL, '2022-03-20', FALSE),

-- Equipo de Ventas (Comerciales)
('002-2345678-1', 'Edwin', 'Brito', '809-555-2001', 'edwin.brito@thelarte.com', 'COMERCIAL', 25000.00, 12.0, '2023-01-15', FALSE),
('002-2345678-2', 'Luis', 'Martínez', '809-555-2002', 'luis.martinez@thelarte.com', 'COMERCIAL', 26000.00, 15.0, '2023-02-10', FALSE),
('002-2345678-3', 'Arturo', 'Breton', '809-555-2003', 'arturo.breton@thelarte.com', 'COMERCIAL', 24000.00, 10.0, '2023-06-01', FALSE),
('002-2345678-4', 'María', 'Sánchez', '809-555-2004', 'maria.sanchez@thelarte.com', 'COMERCIAL', 23000.00, 8.0, '2023-08-15', FALSE),

-- Equipo Técnico
('003-3456789-1', 'Juan', 'Pérez', '809-555-3001', 'juan.perez@thelarte.com', 'TI', 32000.00, NULL, '2023-03-10', FALSE),
('003-3456789-2', 'María', 'Rodríguez', '809-555-3002', 'maria.rodriguez@thelarte.com', 'TI', 28000.00, NULL, '2023-05-20', FALSE),

-- Equipo de Caja y Contabilidad
('004-4567890-1', 'Carla', 'Santos', '809-555-4001', 'carla.santos@thelarte.com', 'CAJERO', 18000.00, NULL, '2023-07-01', FALSE),
('004-4567890-2', 'Pedro', 'López', '809-555-4002', 'pedro.lopez@thelarte.com', 'CAJERO', 17500.00, NULL, '2023-09-15', FALSE);

-- ===== 2. DATOS DE USUARIOS Y ROLES =====
INSERT INTO users (username, password, active, empleado_cedula) VALUES
-- Usuarios de empleados
('carlosmendoza', '$2a$10$passwordHash123', TRUE, '001-1234567-1'),
('anagarcia', '$2a$10$passwordHash123', TRUE, '001-1234567-2'),
('edwinbrito', '$2a$10$passwordHash123', TRUE, '002-2345678-1'),
('luismartinez', '$2a$10$passwordHash123', TRUE, '002-2345678-2'),
('arturobreton', '$2a$10$passwordHash123', TRUE, '002-2345678-3'),
('mariasanchez', '$2a$10$passwordHash123', TRUE, '002-2345678-4'),
('juanperez', '$2a$10$passwordHash123', TRUE, '003-3456789-1'),
('mariarodriguez', '$2a$10$passwordHash123', TRUE, '003-3456789-2'),
('carlasantos', '$2a$10$passwordHash123', TRUE, '004-4567890-1'),
('pedrolopez', '$2a$10$passwordHash123', TRUE, '004-4567890-2'),
-- Usuarios administrativos sin empleados
('adminroot', '$2a$10$passwordHash123', TRUE, NULL),
('testuser', '$2a$10$passwordHash123', TRUE, NULL);

-- Asignación de roles
INSERT INTO user_roles (user_id, role) VALUES
-- Gerentes
((SELECT id FROM users WHERE username = 'carlosmendoza'), 'GERENTE'),
((SELECT id FROM users WHERE username = 'anagarcia'), 'GERENTE'),
((SELECT id FROM users WHERE username = 'adminroot'), 'GERENTE'),

-- Vendedores
((SELECT id FROM users WHERE username = 'edwinbrito'), 'VENDEDOR'),
((SELECT id FROM users WHERE username = 'luismartinez'), 'VENDEDOR'),
((SELECT id FROM users WHERE username = 'arturobreton'), 'VENDEDOR'),
((SELECT id FROM users WHERE username = 'mariasanchez'), 'VENDEDOR'),
((SELECT id FROM users WHERE username = 'testuser'), 'VENDEDOR'),

-- TI
((SELECT id FROM users WHERE username = 'juanperez'), 'TI'),
((SELECT id FROM users WHERE username = 'mariarodriguez'), 'TI'),

-- Contabilidad
((SELECT id FROM users WHERE username = 'carlasantos'), 'CONTABILIDAD'),
((SELECT id FROM users WHERE username = 'pedrolopez'), 'CONTABILIDAD');

-- ========================================================================================
-- FIN MIGRACIÓN R__01
-- Total: 10 empleados, 12 usuarios, roles asignados
-- ========================================================================================
