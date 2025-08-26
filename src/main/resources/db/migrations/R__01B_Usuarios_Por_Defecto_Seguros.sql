-- ========================================================================================
-- MIGRACIÓN R__01B: USUARIOS POR DEFECTO CON CONTRASEÑAS SEGURAS
-- Sistema de gestión de muebles y decoración - The Larte
-- ========================================================================================

-- ===== ACTUALIZACIÓN DE CONTRASEÑAS CON HASHES BCrypt REALES =====
-- Contraseña por defecto para todos los usuarios: "1234"

-- Actualizar contraseñas con hashes BCrypt seguros
UPDATE users SET password = '$2b$12$pZIXs.5Wk8LEuHV9g7BsZ.gaAZwftBCQDVwWtzG5ZS9q5h7AFzWqu' WHERE username = 'carlosmendoza';
UPDATE users SET password = '$2b$12$pZIXs.5Wk8LEuHV9g7BsZ.gaAZwftBCQDVwWtzG5ZS9q5h7AFzWqu' WHERE username = 'anagarcia';
UPDATE users SET password = '$2b$12$pZIXs.5Wk8LEuHV9g7BsZ.gaAZwftBCQDVwWtzG5ZS9q5h7AFzWqu' WHERE username = 'edwinbrito';
UPDATE users SET password = '$2b$12$pZIXs.5Wk8LEuHV9g7BsZ.gaAZwftBCQDVwWtzG5ZS9q5h7AFzWqu' WHERE username = 'luismartinez';
UPDATE users SET password = '$2b$12$pZIXs.5Wk8LEuHV9g7BsZ.gaAZwftBCQDVwWtzG5ZS9q5h7AFzWqu' WHERE username = 'arturobreton';
UPDATE users SET password = '$2b$12$pZIXs.5Wk8LEuHV9g7BsZ.gaAZwftBCQDVwWtzG5ZS9q5h7AFzWqu' WHERE username = 'mariasanchez';
UPDATE users SET password = '$2b$12$pZIXs.5Wk8LEuHV9g7BsZ.gaAZwftBCQDVwWtzG5ZS9q5h7AFzWqu' WHERE username = 'juanperez';
UPDATE users SET password = '$2b$12$pZIXs.5Wk8LEuHV9g7BsZ.gaAZwftBCQDVwWtzG5ZS9q5h7AFzWqu' WHERE username = 'mariarodriguez';
UPDATE users SET password = '$2b$12$pZIXs.5Wk8LEuHV9g7BsZ.gaAZwftBCQDVwWtzG5ZS9q5h7AFzWqu' WHERE username = 'carlasantos';
UPDATE users SET password = '$2b$12$pZIXs.5Wk8LEuHV9g7BsZ.gaAZwftBCQDVwWtzG5ZS9q5h7AFzWqu' WHERE username = 'pedrolopez';
UPDATE users SET password = '$2b$12$pZIXs.5Wk8LEuHV9g7BsZ.gaAZwftBCQDVwWtzG5ZS9q5h7AFzWqu' WHERE username = 'adminroot';
UPDATE users SET password = '$2b$12$pZIXs.5Wk8LEuHV9g7BsZ.gaAZwftBCQDVwWtzG5ZS9q5h7AFzWqu' WHERE username = 'testuser';

-- ===== USUARIOS ADICIONALES POR DEFECTO =====

-- Usuario administrador genérico
INSERT INTO users (username, password, active, empleado_cedula)
SELECT 'admin', '$2b$12$pZIXs.5Wk8LEuHV9g7BsZ.gaAZwftBCQDVwWtzG5ZS9q5h7AFzWqu', TRUE, NULL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');

INSERT INTO user_roles (user_id, role)
SELECT (SELECT id FROM users WHERE username = 'admin'), 'GERENTE'
WHERE NOT EXISTS (SELECT 1 FROM user_roles ur JOIN users u ON ur.user_id = u.id WHERE u.username = 'admin' AND ur.role = 'GERENTE');

-- Usuario supervisor
INSERT INTO users (username, password, active, empleado_cedula)
SELECT 'supervisor', '$2b$12$pZIXs.5Wk8LEuHV9g7BsZ.gaAZwftBCQDVwWtzG5ZS9q5h7AFzWqu', TRUE, NULL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'supervisor');

INSERT INTO user_roles (user_id, role)
SELECT (SELECT id FROM users WHERE username = 'supervisor'), 'VENDEDOR'
WHERE NOT EXISTS (SELECT 1 FROM user_roles ur JOIN users u ON ur.user_id = u.id WHERE u.username = 'supervisor' AND ur.role = 'VENDEDOR');

INSERT INTO user_roles (user_id, role)
SELECT (SELECT id FROM users WHERE username = 'supervisor'), 'CONTABILIDAD'
WHERE NOT EXISTS (SELECT 1 FROM user_roles ur JOIN users u ON ur.user_id = u.id WHERE u.username = 'supervisor' AND ur.role = 'CONTABILIDAD');

-- Usuario cajero
INSERT INTO users (username, password, active, empleado_cedula)
SELECT 'cajero', '$2b$12$pZIXs.5Wk8LEuHV9g7BsZ.gaAZwftBCQDVwWtzG5ZS9q5h7AFzWqu', TRUE, NULL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'cajero');

INSERT INTO user_roles (user_id, role)
SELECT (SELECT id FROM users WHERE username = 'cajero'), 'CONTABILIDAD'
WHERE NOT EXISTS (SELECT 1 FROM user_roles ur JOIN users u ON ur.user_id = u.id WHERE u.username = 'cajero' AND ur.role = 'CONTABILIDAD');

-- ===== TABLA DE REFERENCIA DE USUARIOS POR DEFECTO =====
-- Crear tabla para documentar usuarios por defecto
CREATE TABLE IF NOT EXISTS usuarios_por_defecto (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    rol_principal VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar información de usuarios por defecto
INSERT INTO usuarios_por_defecto (username, descripcion, rol_principal) VALUES
('admin', 'Usuario administrador principal', 'GERENTE'),
('adminroot', 'Usuario administrador root', 'GERENTE'),
('supervisor', 'Usuario supervisor con múltiples roles', 'VENDEDOR'),
('cajero', 'Usuario para operaciones de caja', 'CONTABILIDAD'),
('carlosmendoza', 'Gerente Carlos Mendoza', 'GERENTE'),
('anagarcia', 'Gerente Ana García', 'GERENTE'),
('edwinbrito', 'Vendedor Edwin Brito', 'VENDEDOR'),
('luismartinez', 'Vendedor Luis Martínez', 'VENDEDOR'),
('arturobreton', 'Vendedor Arturo Breton', 'VENDEDOR'),
('mariasanchez', 'Vendedor María Sánchez', 'VENDEDOR'),
('juanperez', 'Desarrollador Juan Pérez', 'TI'),
('mariarodriguez', 'Desarrollador María Rodríguez', 'TI'),
('carlasantos', 'Contador Carla Santos', 'CONTABILIDAD'),
('pedrolopez', 'Contador Pedro López', 'CONTABILIDAD'),
('testuser', 'Usuario para pruebas', 'VENDEDOR')
ON CONFLICT (username) DO NOTHING;

-- ========================================================================================
-- INFORMACIÓN DE ACCESO
-- ========================================================================================
-- Contraseña por defecto para todos los usuarios: "1234"
--
-- Usuarios principales:
-- - admin / 1234 (Administrador principal)
-- - adminroot / 1234 (Administrador root)
-- - supervisor / 1234 (Supervisor con múltiples roles)
-- - cajero / 1234 (Usuario de caja)
--
-- Usuarios de empleados:
-- - carlosmendoza / 1234 (Gerente)
-- - anagarcia / 1234 (Gerente)
-- - edwinbrito / 1234 (Vendedor)
-- - luismartinez / 1234 (Vendedor)
-- - arturobreton / 1234 (Vendedor)
-- - mariasanchez / 1234 (Vendedor)
-- - juanperez / 1234 (TI)
-- - mariarodriguez / 1234 (TI)
-- - carlasantos / 1234 (Contabilidad)
-- - pedrolopez / 1234 (Contabilidad)
-- - testuser / 1234 (Usuario de pruebas)
--
-- ========================================================================================
-- FIN MIGRACIÓN R__01B
-- ========================================================================================
