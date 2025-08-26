-- ========================================================================================
-- MIGRACIÓN R__01: EMPLEADOS Y USUARIOS
-- Sistema de gestión de muebles y decoración - The Larte
-- ========================================================================================

-- ===== 1. DATOS DE EMPLEADOS =====
INSERT INTO empleados (cedula, nombre, apellido, telefono, email, rol, salario, comision, fecha_contratacion, deleted) 
SELECT '001-1234567-1', 'Carlos', 'Mendoza', '809-555-1001', 'carlos.mendoza@thelarte.com', 'ADMIN', 45000.00, NULL, '2022-01-15', FALSE
WHERE NOT EXISTS (SELECT 1 FROM empleados WHERE cedula = '001-1234567-1');

INSERT INTO empleados (cedula, nombre, apellido, telefono, email, rol, salario, comision, fecha_contratacion, deleted) 
SELECT '001-1234567-2', 'Ana', 'García', '809-555-1002', 'ana.garcia@thelarte.com', 'ADMIN', 42000.00, NULL, '2022-03-20', FALSE
WHERE NOT EXISTS (SELECT 1 FROM empleados WHERE cedula = '001-1234567-2');

INSERT INTO empleados (cedula, nombre, apellido, telefono, email, rol, salario, comision, fecha_contratacion, deleted) 
SELECT '002-2345678-1', 'Edwin', 'Brito', '809-555-2001', 'edwin.brito@thelarte.com', 'COMERCIAL', 25000.00, 12.0, '2023-01-15', FALSE
WHERE NOT EXISTS (SELECT 1 FROM empleados WHERE cedula = '002-2345678-1');

INSERT INTO empleados (cedula, nombre, apellido, telefono, email, rol, salario, comision, fecha_contratacion, deleted) 
SELECT '002-2345678-2', 'Luis', 'Martínez', '809-555-2002', 'luis.martinez@thelarte.com', 'COMERCIAL', 26000.00, 15.0, '2023-02-10', FALSE
WHERE NOT EXISTS (SELECT 1 FROM empleados WHERE cedula = '002-2345678-2');

INSERT INTO empleados (cedula, nombre, apellido, telefono, email, rol, salario, comision, fecha_contratacion, deleted) 
SELECT '002-2345678-3', 'Arturo', 'Breton', '809-555-2003', 'arturo.breton@thelarte.com', 'COMERCIAL', 24000.00, 10.0, '2023-06-01', FALSE
WHERE NOT EXISTS (SELECT 1 FROM empleados WHERE cedula = '002-2345678-3');

INSERT INTO empleados (cedula, nombre, apellido, telefono, email, rol, salario, comision, fecha_contratacion, deleted) 
SELECT '002-2345678-4', 'María', 'Sánchez', '809-555-2004', 'maria.sanchez@thelarte.com', 'COMERCIAL', 23000.00, 8.0, '2023-08-15', FALSE
WHERE NOT EXISTS (SELECT 1 FROM empleados WHERE cedula = '002-2345678-4');

INSERT INTO empleados (cedula, nombre, apellido, telefono, email, rol, salario, comision, fecha_contratacion, deleted) 
SELECT '003-3456789-1', 'Juan', 'Pérez', '809-555-3001', 'juan.perez@thelarte.com', 'TI', 32000.00, NULL, '2023-03-10', FALSE
WHERE NOT EXISTS (SELECT 1 FROM empleados WHERE cedula = '003-3456789-1');

INSERT INTO empleados (cedula, nombre, apellido, telefono, email, rol, salario, comision, fecha_contratacion, deleted) 
SELECT '003-3456789-2', 'María', 'Rodríguez', '809-555-3002', 'maria.rodriguez@thelarte.com', 'TI', 28000.00, NULL, '2023-05-20', FALSE
WHERE NOT EXISTS (SELECT 1 FROM empleados WHERE cedula = '003-3456789-2');

INSERT INTO empleados (cedula, nombre, apellido, telefono, email, rol, salario, comision, fecha_contratacion, deleted) 
SELECT '004-4567890-1', 'Carla', 'Santos', '809-555-4001', 'carla.santos@thelarte.com', 'CAJERO', 18000.00, NULL, '2023-07-01', FALSE
WHERE NOT EXISTS (SELECT 1 FROM empleados WHERE cedula = '004-4567890-1');

INSERT INTO empleados (cedula, nombre, apellido, telefono, email, rol, salario, comision, fecha_contratacion, deleted) 
SELECT '004-4567890-2', 'Pedro', 'López', '809-555-4002', 'pedro.lopez@thelarte.com', 'CAJERO', 17500.00, NULL, '2023-09-15', FALSE
WHERE NOT EXISTS (SELECT 1 FROM empleados WHERE cedula = '004-4567890-2');

-- ===== 2. DATOS DE USUARIOS Y ROLES =====
INSERT INTO users (username, password, active, empleado_cedula) 
SELECT 'carlosmendoza', '$2a$10$passwordHash123', TRUE, '001-1234567-1'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'carlosmendoza');

INSERT INTO users (username, password, active, empleado_cedula) 
SELECT 'anagarcia', '$2a$10$passwordHash123', TRUE, '001-1234567-2'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'anagarcia');

INSERT INTO users (username, password, active, empleado_cedula) 
SELECT 'edwinbrito', '$2a$10$passwordHash123', TRUE, '002-2345678-1'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'edwinbrito');

INSERT INTO users (username, password, active, empleado_cedula) 
SELECT 'luismartinez', '$2a$10$passwordHash123', TRUE, '002-2345678-2'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'luismartinez');

INSERT INTO users (username, password, active, empleado_cedula) 
SELECT 'arturobreton', '$2a$10$passwordHash123', TRUE, '002-2345678-3'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'arturobreton');

INSERT INTO users (username, password, active, empleado_cedula) 
SELECT 'mariasanchez', '$2a$10$passwordHash123', TRUE, '002-2345678-4'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'mariasanchez');

INSERT INTO users (username, password, active, empleado_cedula) 
SELECT 'juanperez', '$2a$10$passwordHash123', TRUE, '003-3456789-1'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'juanperez');

INSERT INTO users (username, password, active, empleado_cedula) 
SELECT 'mariarodriguez', '$2a$10$passwordHash123', TRUE, '003-3456789-2'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'mariarodriguez');

INSERT INTO users (username, password, active, empleado_cedula) 
SELECT 'carlasantos', '$2a$10$passwordHash123', TRUE, '004-4567890-1'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'carlasantos');

INSERT INTO users (username, password, active, empleado_cedula) 
SELECT 'pedrolopez', '$2a$10$passwordHash123', TRUE, '004-4567890-2'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'pedrolopez');

INSERT INTO users (username, password, active, empleado_cedula) 
SELECT 'adminroot', '$2a$10$passwordHash123', TRUE, NULL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'adminroot');

INSERT INTO users (username, password, active, empleado_cedula) 
SELECT 'testuser', '$2a$10$passwordHash123', TRUE, NULL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'testuser');

-- Asignación de roles
INSERT INTO user_roles (user_id, role) 
SELECT (SELECT id FROM users WHERE username = 'carlosmendoza'), 'GERENTE'
WHERE NOT EXISTS (SELECT 1 FROM user_roles ur JOIN users u ON ur.user_id = u.id WHERE u.username = 'carlosmendoza' AND ur.role = 'GERENTE');

INSERT INTO user_roles (user_id, role) 
SELECT (SELECT id FROM users WHERE username = 'anagarcia'), 'GERENTE'
WHERE NOT EXISTS (SELECT 1 FROM user_roles ur JOIN users u ON ur.user_id = u.id WHERE u.username = 'anagarcia' AND ur.role = 'GERENTE');

INSERT INTO user_roles (user_id, role) 
SELECT (SELECT id FROM users WHERE username = 'adminroot'), 'GERENTE'
WHERE NOT EXISTS (SELECT 1 FROM user_roles ur JOIN users u ON ur.user_id = u.id WHERE u.username = 'adminroot' AND ur.role = 'GERENTE');

INSERT INTO user_roles (user_id, role) 
SELECT (SELECT id FROM users WHERE username = 'edwinbrito'), 'VENDEDOR'
WHERE NOT EXISTS (SELECT 1 FROM user_roles ur JOIN users u ON ur.user_id = u.id WHERE u.username = 'edwinbrito' AND ur.role = 'VENDEDOR');

INSERT INTO user_roles (user_id, role) 
SELECT (SELECT id FROM users WHERE username = 'luismartinez'), 'VENDEDOR'
WHERE NOT EXISTS (SELECT 1 FROM user_roles ur JOIN users u ON ur.user_id = u.id WHERE u.username = 'luismartinez' AND ur.role = 'VENDEDOR');

INSERT INTO user_roles (user_id, role) 
SELECT (SELECT id FROM users WHERE username = 'arturobreton'), 'VENDEDOR'
WHERE NOT EXISTS (SELECT 1 FROM user_roles ur JOIN users u ON ur.user_id = u.id WHERE u.username = 'arturobreton' AND ur.role = 'VENDEDOR');

INSERT INTO user_roles (user_id, role) 
SELECT (SELECT id FROM users WHERE username = 'mariasanchez'), 'VENDEDOR'
WHERE NOT EXISTS (SELECT 1 FROM user_roles ur JOIN users u ON ur.user_id = u.id WHERE u.username = 'mariasanchez' AND ur.role = 'VENDEDOR');

INSERT INTO user_roles (user_id, role) 
SELECT (SELECT id FROM users WHERE username = 'testuser'), 'VENDEDOR'
WHERE NOT EXISTS (SELECT 1 FROM user_roles ur JOIN users u ON ur.user_id = u.id WHERE u.username = 'testuser' AND ur.role = 'VENDEDOR');

INSERT INTO user_roles (user_id, role) 
SELECT (SELECT id FROM users WHERE username = 'juanperez'), 'TI'
WHERE NOT EXISTS (SELECT 1 FROM user_roles ur JOIN users u ON ur.user_id = u.id WHERE u.username = 'juanperez' AND ur.role = 'TI');

INSERT INTO user_roles (user_id, role) 
SELECT (SELECT id FROM users WHERE username = 'mariarodriguez'), 'TI'
WHERE NOT EXISTS (SELECT 1 FROM user_roles ur JOIN users u ON ur.user_id = u.id WHERE u.username = 'mariarodriguez' AND ur.role = 'TI');

INSERT INTO user_roles (user_id, role) 
SELECT (SELECT id FROM users WHERE username = 'carlasantos'), 'CONTABILIDAD'
WHERE NOT EXISTS (SELECT 1 FROM user_roles ur JOIN users u ON ur.user_id = u.id WHERE u.username = 'carlasantos' AND ur.role = 'CONTABILIDAD');

INSERT INTO user_roles (user_id, role) 
SELECT (SELECT id FROM users WHERE username = 'pedrolopez'), 'CONTABILIDAD'
WHERE NOT EXISTS (SELECT 1 FROM user_roles ur JOIN users u ON ur.user_id = u.id WHERE u.username = 'pedrolopez' AND ur.role = 'CONTABILIDAD');

-- ========================================================================================
-- FIN MIGRACIÓN R__01
-- Total: 10 empleados, 12 usuarios, roles asignados
-- ========================================================================================
