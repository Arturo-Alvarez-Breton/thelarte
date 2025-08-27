-- ========================================================================================
-- MIGRACIÓN R__01C: CORREGIR TODAS LAS CONTRASEÑAS
-- Sistema de gestión de muebles y decoración - The Larte
-- ========================================================================================

-- ===== CORRECCIÓN DE TODAS LAS CONTRASEÑAS =====
-- Contraseña por defecto para todos los usuarios: "1234"
-- Hash BCrypt correcto: $2b$12$pZIXs.5Wk8LEuHV9g7BsZ.gaAZwftBCQDVwWtzG5ZS9q5h7AFzWqu

-- Actualizar TODAS las contraseñas con el hash BCrypt correcto
UPDATE users SET password = '$2b$12$pZIXs.5Wk8LEuHV9g7BsZ.gaAZwftBCQDVwWtzG5ZS9q5h7AFzWqu';

-- ========================================================================================
-- INFORMACIÓN DE ACCESO ACTUALIZADA
-- ========================================================================================
-- Contraseña por defecto para TODOS los usuarios: "1234"
--
-- Todos los usuarios del sistema ahora usan la contraseña: 1234
-- Hash BCrypt verificado: $2b$12$pZIXs.5Wk8LEuHV9g7BsZ.gaAZwftBCQDVwWtzG5ZS9q5h7AFzWqu
--
-- ========================================================================================
-- FIN MIGRACIÓN R__01C
-- ========================================================================================
