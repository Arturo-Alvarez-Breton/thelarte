-- ========================================================================================
-- MIGRACIÓN V5: CREACIÓN DE TABLA PRODUCTO
-- Sistema de gestión de muebles y decoración - The Larte
-- ========================================================================================

CREATE TABLE IF NOT EXISTS producto (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(255),
    nombre VARCHAR(255),
    tipo VARCHAR(255),
    descripcion TEXT,
    itbis FLOAT,
    precio_compra DECIMAL(12,2),
    precio_venta DECIMAL(12,2),
    foto_url VARCHAR(255),
    eliminado BOOLEAN DEFAULT FALSE,
    estado VARCHAR(50),
    cantidad_disponible INTEGER,
    cantidad_reservada INTEGER,
    cantidad_danada INTEGER,
    cantidad_devuelta INTEGER,
    cantidad_almacen INTEGER,
    fecha_creacion TIMESTAMP,
    fecha_actualizacion TIMESTAMP
);

-- ========================================================================================
-- FIN MIGRACIÓN V5: PRODUCTO
-- ========================================================================================
