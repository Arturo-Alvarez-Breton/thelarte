-- ========================================================================================
-- MIGRACIÓN V2: CREACIÓN DE TABLA CLIENTES
-- Sistema de gestión de muebles y decoración - The Larte
-- ========================================================================================

CREATE TABLE IF NOT EXISTS clientes (
    cedula VARCHAR(20) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    telefono VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    direccion VARCHAR(255),
    fecha_registro DATE,
    deleted BOOLEAN DEFAULT FALSE NOT NULL,
    PRIMARY KEY (cedula)
);

-- ========================================================================================
-- FIN MIGRACIÓN V2: CLIENTES
-- ========================================================================================
