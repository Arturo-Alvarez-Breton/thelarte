-- ========================================================================================
-- MIGRACIÓN V8: CREACIÓN DE TABLA MOVIMIENTOS_PRODUCTO
-- Sistema de gestión de muebles y decoración - The Larte
-- ========================================================================================

CREATE TABLE IF NOT EXISTS movimientos_producto (
    id BIGSERIAL PRIMARY KEY,
    producto_id BIGINT,
    tipo VARCHAR(255) NOT NULL,
    tipo_simple VARCHAR(50) NOT NULL,
    cantidad INTEGER,
    motivo VARCHAR(255),
    fecha TIMESTAMP,
    id_usuario VARCHAR(255),
    FOREIGN KEY (producto_id) REFERENCES producto(id)
);

-- ========================================================================================
-- FIN MIGRACIÓN V8: MOVIMIENTOS_PRODUCTO
-- ========================================================================================
