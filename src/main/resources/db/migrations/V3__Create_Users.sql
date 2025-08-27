-- ========================================================================================
-- MIGRACIÓN V3: CREACIÓN DE TABLAS USERS Y USER_ROLES
-- Sistema de gestión de muebles y decoración - The Larte
-- ========================================================================================

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL,
    empleado_cedula VARCHAR(255) UNIQUE
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ========================================================================================
-- FIN MIGRACIÓN V3: USERS Y USER_ROLES
-- ========================================================================================
