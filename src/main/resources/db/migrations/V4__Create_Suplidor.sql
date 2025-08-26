-- ========================================================================================
-- MIGRACIÓN V4: CREACIÓN DE TABLAS SUPLIDOR Y SUPLIDOR_TELEFONOS
-- Sistema de gestión de muebles y decoración - The Larte
-- ========================================================================================

CREATE TABLE IF NOT EXISTS suplidor (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255),
    ciudad VARCHAR(255),
    pais VARCHAR(255),
    direccion VARCHAR(255),
    email VARCHAR(255),
    rnc VARCHAR(255),
    ncf VARCHAR(255),
    longitud DOUBLE PRECISION,
    latitud DOUBLE PRECISION,
    activo BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE TABLE IF NOT EXISTS suplidor_telefonos (
    suplidor_id BIGINT NOT NULL,
    telefonos VARCHAR(255),
    FOREIGN KEY (suplidor_id) REFERENCES suplidor(id)
);

-- ========================================================================================
-- FIN MIGRACIÓN V4: SUPLIDOR Y SUPLIDOR_TELEFONOS
-- ========================================================================================
