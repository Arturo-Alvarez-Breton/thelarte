-- ========================================================================================
-- MIGRACIÓN R__11: USUARIOS ADMINS Y DIFERENTES ROLES
-- Sistema de gestión de muebles y decoración - The Larte
-- ========================================================================================

-- ===== USUARIOS ADMINISTRADORES SOLICITADOS =====
-- Contraseña: "1234" - Hash BCrypt: $2b$12$pZIXs.5Wk8LEuHV9g7BsZ.gaAZwftBCQDVwWtzG5ZS9q5h7AFzWqu

-- Usuario admin edwinb
INSERT INTO users (username, password, active, empleado_cedula)
SELECT 'edwinb', '$2b$12$pZIXs.5Wk8LEuHV9g7BsZ.gaAZwftBCQDVwWtzG5ZS9q5h7AFzWqu', TRUE, NULL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'edwinb');

INSERT INTO user_roles (user_id, role)
SELECT (SELECT id FROM users WHERE username = 'edwinb'), 'ADMINISTRADOR'
WHERE NOT EXISTS (SELECT 1 FROM user_roles ur JOIN users u ON ur.user_id = u.id WHERE u.username = 'edwinb' AND ur.role = 'ADMINISTRADOR');

-- Usuario admin jeanp
INSERT INTO users (username, password, active, empleado_cedula)
SELECT 'jeanp', '$2b$12$pZIXs.5Wk8LEuHV9g7BsZ.gaAZwftBCQDVwWtzG5ZS9q5h7AFzWqu', TRUE, NULL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'jeanp');

INSERT INTO user_roles (user_id, role)
SELECT (SELECT id FROM users WHERE username = 'jeanp'), 'ADMINISTRADOR'
WHERE NOT EXISTS (SELECT 1 FROM user_roles ur JOIN users u ON ur.user_id = u.id WHERE u.username = 'jeanp' AND ur.role = 'ADMINISTRADOR');

-- Usuario admin arturob
INSERT INTO users (username, password, active, empleado_cedula)
SELECT 'arturob', '$2b$12$pZIXs.5Wk8LEuHV9g7BsZ.gaAZwftBCQDVwWtzG5ZS9q5h7AFzWqu', TRUE, NULL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'arturob');

INSERT INTO user_roles (user_id, role)
SELECT (SELECT id FROM users WHERE username = 'arturob'), 'ADMINISTRADOR'
WHERE NOT EXISTS (SELECT 1 FROM user_roles ur JOIN users u ON ur.user_id = u.id WHERE u.username = 'arturob' AND ur.role = 'ADMINISTRADOR');

-- ===== USUARIOS CON DIFERENTES ROLES =====

-- Usuario TI - maria.ti
INSERT INTO users (username, password, active, empleado_cedula)
SELECT 'maria.ti', '$2b$12$pZIXs.5Wk8LEuHV9g7BsZ.gaAZwftBCQDVwWtzG5ZS9q5h7AFzWqu', TRUE, NULL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'maria.ti');

INSERT INTO user_roles (user_id, role)
SELECT (SELECT id FROM users WHERE username = 'maria.ti'), 'TI'
WHERE NOT EXISTS (SELECT 1 FROM user_roles ur JOIN users u ON ur.user_id = u.id WHERE u.username = 'maria.ti' AND ur.role = 'TI');

-- Usuario VENDEDOR - carlos.vendedor
INSERT INTO users (username, password, active, empleado_cedula)
SELECT 'carlos.vendedor', '$2b$12$pZIXs.5Wk8LEuHV9g7BsZ.gaAZwftBCQDVwWtzG5ZS9q5h7AFzWqu', TRUE, NULL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'carlos.vendedor');

INSERT INTO user_roles (user_id, role)
SELECT (SELECT id FROM users WHERE username = 'carlos.vendedor'), 'VENDEDOR'
WHERE NOT EXISTS (SELECT 1 FROM user_roles ur JOIN users u ON ur.user_id = u.id WHERE u.username = 'carlos.vendedor' AND ur.role = 'VENDEDOR');

-- Usuario CAJERO - ana.cajero
INSERT INTO users (username, password, active, empleado_cedula)
SELECT 'ana.cajero', '$2b$12$pZIXs.5Wk8LEuHV9g7BsZ.gaAZwftBCQDVwWtzG5ZS9q5h7AFzWqu', TRUE, NULL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'ana.cajero');

INSERT INTO user_roles (user_id, role)
SELECT (SELECT id FROM users WHERE username = 'ana.cajero'), 'CAJERO'
WHERE NOT EXISTS (SELECT 1 FROM user_roles ur JOIN users u ON ur.user_id = u.id WHERE u.username = 'ana.cajero' AND ur.role = 'CAJERO');

-- Usuario CONTABILIDAD - luis.contabilidad
INSERT INTO users (username, password, active, empleado_cedula)
SELECT 'luis.contabilidad', '$2b$12$pZIXs.5Wk8LEuHV9g7BsZ.gaAZwftBCQDVwWtzG5ZS9q5h7AFzWqu', TRUE, NULL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'luis.contabilidad');

INSERT INTO user_roles (user_id, role)
SELECT (SELECT id FROM users WHERE username = 'luis.contabilidad'), 'CONTABILIDAD'
WHERE NOT EXISTS (SELECT 1 FROM user_roles ur JOIN users u ON ur.user_id = u.id WHERE u.username = 'luis.contabilidad' AND ur.role = 'CONTABILIDAD');

-- ===== USUARIOS CON MÚLTIPLES ROLES =====

-- Usuario con roles TI y VENDEDOR - pedro.multirole
INSERT INTO users (username, password, active, empleado_cedula)
SELECT 'pedro.multirole', '$2b$12$pZIXs.5Wk8LEuHV9g7BsZ.gaAZwftBCQDVwWtzG5ZS9q5h7AFzWqu', TRUE, NULL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'pedro.multirole');

INSERT INTO user_roles (user_id, role)
SELECT (SELECT id FROM users WHERE username = 'pedro.multirole'), 'TI'
WHERE NOT EXISTS (SELECT 1 FROM user_roles ur JOIN users u ON ur.user_id = u.id WHERE u.username = 'pedro.multirole' AND ur.role = 'TI');

INSERT INTO user_roles (user_id, role)
SELECT (SELECT id FROM users WHERE username = 'pedro.multirole'), 'VENDEDOR'
WHERE NOT EXISTS (SELECT 1 FROM user_roles ur JOIN users u ON ur.user_id = u.id WHERE u.username = 'pedro.multirole' AND ur.role = 'VENDEDOR');

-- Usuario con roles CAJERO y CONTABILIDAD - rosa.finanzas
INSERT INTO users (username, password, active, empleado_cedula)
SELECT 'rosa.finanzas', '$2b$12$pZIXs.5Wk8LEuHV9g7BsZ.gaAZwftBCQDVwWtzG5ZS9q5h7AFzWqu', TRUE, NULL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'rosa.finanzas');

INSERT INTO user_roles (user_id, role)
SELECT (SELECT id FROM users WHERE username = 'rosa.finanzas'), 'CAJERO'
WHERE NOT EXISTS (SELECT 1 FROM user_roles ur JOIN users u ON ur.user_id = u.id WHERE u.username = 'rosa.finanzas' AND ur.role = 'CAJERO');

INSERT INTO user_roles (user_id, role)
SELECT (SELECT id FROM users WHERE username = 'rosa.finanzas'), 'CONTABILIDAD'
WHERE NOT EXISTS (SELECT 1 FROM user_roles ur JOIN users u ON ur.user_id = u.id WHERE u.username = 'rosa.finanzas' AND ur.role = 'CONTABILIDAD');

-- ===== ACTUALIZACIÓN DE LA TABLA DE REFERENCIA =====

-- Insertar información de los nuevos usuarios en la tabla de referencia
INSERT INTO usuarios_por_defecto (username, descripcion, rol_principal) VALUES
('edwinb', 'Usuario administrador Edwin B', 'ADMINISTRADOR'),
('jeanp', 'Usuario administrador Jean P', 'ADMINISTRADOR'),
('arturob', 'Usuario administrador Arturo B', 'ADMINISTRADOR'),
('maria.ti', 'Usuario de Tecnología de la Información', 'TI'),
('carlos.vendedor', 'Usuario vendedor', 'VENDEDOR'),
('ana.cajero', 'Usuario cajero', 'CAJERO'),
('luis.contabilidad', 'Usuario de contabilidad', 'CONTABILIDAD'),
('pedro.multirole', 'Usuario con múltiples roles (TI + VENDEDOR)', 'TI'),
('rosa.finanzas', 'Usuario de finanzas (CAJERO + CONTABILIDAD)', 'CAJERO')
ON CONFLICT (username) DO NOTHING;

-- ========================================================================================
-- INFORMACIÓN DE ACCESO - NUEVOS USUARIOS
-- ========================================================================================
-- Contraseña para todos los usuarios: "1234"
--
-- Usuarios Administradores:
-- - edwinb / 1234 (Administrador)
-- - jeanp / 1234 (Administrador)
-- - arturob / 1234 (Administrador)
--
-- Usuarios con Roles Específicos:
-- - maria.ti / 1234 (TI)
-- - carlos.vendedor / 1234 (Vendedor)
-- - ana.cajero / 1234 (Cajero)
-- - luis.contabilidad / 1234 (Contabilidad)
--
-- Usuarios con Múltiples Roles:
-- - pedro.multirole / 1234 (TI + Vendedor)
-- - rosa.finanzas / 1234 (Cajero + Contabilidad)
--
-- ========================================================================================
-- FIN MIGRACIÓN R__11: USUARIOS ADMINS Y DIFERENTES ROLES
-- ========================================================================================
