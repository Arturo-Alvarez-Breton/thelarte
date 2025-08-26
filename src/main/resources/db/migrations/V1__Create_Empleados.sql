-- ========================================================================================
-- MIGRACIÓN V1: CREACIÓN DE TABLA EMPLEADOS
-- Sistema de gestión de muebles y decoración - The Larte
-- ========================================================================================

CREATE TABLE IF NOT EXISTS empleados (
    cedula VARCHAR(20) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    telefono VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    rol VARCHAR(20) NOT NULL,
    salario FLOAT NOT NULL,
    comision FLOAT,
    fecha_contratacion DATE NOT NULL,
    deleted BOOLEAN DEFAULT FALSE NOT NULL,
    PRIMARY KEY (cedula)
);

-- ========================================================================================
-- FIN MIGRACIÓN V1: EMPLEADOS
-- ========================================================================================
