-- Script para insertar datos de prueba después del drop de tablas User y Empleado

-- Limpiar datos existentes (en orden correcto para evitar problemas de FK)
DELETE FROM user_roles;
DELETE FROM users;
DELETE FROM empleados;

-- Reiniciar secuencias si es necesario
-- ALTER SEQUENCE users_id_seq RESTART WITH 1; -- Para PostgreSQL
-- En H2 la secuencia se reinicia automáticamente si se vacía la tabla

-- Datos de empleados (tabla correcta: empleados)
INSERT INTO empleados (cedula, nombre, apellido, telefono, email, rol, salario, comision, fecha_contratacion) VALUES
('402-2202200-1', 'Edwin', 'Brito', '809-555-1001', 'edwin.brito@thelarte.com', 'COMERCIAL', 25000.00, 10.0, '2023-01-15'),
('402-2202200-2', 'Ana', 'Garcia', '809-555-2002', 'ana.garcia@thelarte.com', 'ADMIN', 40000.00, NULL, '2022-05-20'),
('402-2202200-3', 'Juan', 'Pérez', '809-555-3003', 'juan.perez@thelarte.com', 'TI', 32000.00, NULL, '2023-03-10'),
('402-2202200-4', 'Carla', 'Santos', '809-555-4004', 'carla.santos@thelarte.com', 'CAJERO', 18000.00, NULL, '2023-07-01'),
('402-2202200-5', 'Arturo', 'Breton', '809-555-5005', 'arturo.breton@thelarte.com', 'COMERCIAL', 24000.00, 8.0, '2023-09-15'),
('402-2202200-6', 'Maria', 'Rodriguez', '809-555-6006', 'maria.rodriguez@thelarte.com', 'TI', 28000.00, NULL, '2023-02-28'),
('402-2202200-7', 'Luis', 'Martinez', '809-555-7007', 'luis.martinez@thelarte.com', 'COMERCIAL', 26000.00, 12.0, '2023-06-12');

-- Datos de usuarios con empleados relacionados
INSERT INTO users (username, password, active, empleado_cedula) VALUES
('edwinbrito', '$2a$10$VKjQKfpD8QxOv3hKv7vGx.U3f3N9XQ6GJlYHEWzE6xrKpBw7Z8G.2', true, '402-2202200-1'),
('anagarcia', '$2a$10$VKjQKfpD8QxOv3hKv7vGx.U3f3N9XQ6GJlYHEWzE6xrKpBw7Z8G.2', true, '402-2202200-2'),
('juanperez', '$2a$10$VKjQKfpD8QxOv3hKv7vGx.U3f3N9XQ6GJlYHEWzE6xrKpBw7Z8G.2', true, '402-2202200-3'),
('carlasantos', '$2a$10$VKjQKfpD8QxOv3hKv7vGx.U3f3N9XQ6GJlYHEWzE6xrKpBw7Z8G.2', true, '402-2202200-4'),
('arturob', '$2a$10$VKjQKfpD8QxOv3hKv7vGx.U3f3N9XQ6GJlYHEWzE6xrKpBw7Z8G.2', true, '402-2202200-5'),
('mariarodriguez', '$2a$10$VKjQKfpD8QxOv3hKv7vGx.U3f3N9XQ6GJlYHEWzE6xrKpBw7Z8G.2', true, '402-2202200-6'),
('luismartinez', '$2a$10$VKjQKfpD8QxOv3hKv7vGx.U3f3N9XQ6GJlYHEWzE6xrKpBw7Z8G.2', true, '402-2202200-7'),
-- Usuarios sin empleados relacionados
('adminroot', '$2a$10$VKjQKfpD8QxOv3hKv7vGx.U3f3N9XQ6GJlYHEWzE6xrKpBw7Z8G.2', true, NULL),
('testuser', '$2a$10$VKjQKfpD8QxOv3hKv7vGx.U3f3N9XQ6GJlYHEWzE6xrKpBw7Z8G.2', true, NULL);

-- Roles de usuarios (empleados)
INSERT INTO user_roles (user_id, role) VALUES
-- Edwin Brito (COMERCIAL -> VENDEDOR)
((SELECT id FROM users WHERE username = 'edwinbrito'), 'VENDEDOR'),
-- Ana Garcia (ADMIN -> GERENTE)
((SELECT id FROM users WHERE username = 'anagarcia'), 'GERENTE'),
-- Juan Pérez (TI -> TI)
((SELECT id FROM users WHERE username = 'juanperez'), 'TI'),
-- Carla Santos (CAJERO -> CONTABILIDAD)
((SELECT id FROM users WHERE username = 'carlasantos'), 'CONTABILIDAD'),
-- Arturo Breton (COMERCIAL -> VENDEDOR)
((SELECT id FROM users WHERE username = 'arturob'), 'VENDEDOR'),
-- Maria Rodriguez (TI -> TI)
((SELECT id FROM users WHERE username = 'mariarodriguez'), 'TI'),
-- Luis Martinez (COMERCIAL -> VENDEDOR)
((SELECT id FROM users WHERE username = 'luismartinez'), 'VENDEDOR'),
-- Usuarios sin empleados
((SELECT id FROM users WHERE username = 'adminroot'), 'GERENTE'),
((SELECT id FROM users WHERE username = 'testuser'), 'VENDEDOR');

-- Nota: Todas las contraseñas están encriptadas con BCrypt y corresponden a "password123"
