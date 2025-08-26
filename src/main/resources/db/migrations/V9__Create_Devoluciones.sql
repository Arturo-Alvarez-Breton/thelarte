-- ========================================================================================
-- MIGRACIÓN V9: CREACIÓN DE TABLAS DEVOLUCIONES Y LINEAS_DEVOLUCION
-- Sistema de gestión de muebles y decoración - The Larte
-- ========================================================================================

CREATE TABLE IF NOT EXISTS devoluciones (
    id BIGSERIAL PRIMARY KEY,
    transaccion_id BIGINT NOT NULL,
    fecha_devolucion TIMESTAMP NOT NULL,
    motivo VARCHAR(500),
    estado VARCHAR(50) NOT NULL,
    FOREIGN KEY (transaccion_id) REFERENCES transacciones(id)
);

CREATE TABLE IF NOT EXISTS lineas_devolucion (
    id BIGSERIAL PRIMARY KEY,
    devolucion_id BIGINT NOT NULL,
    producto_id BIGINT NOT NULL,
    cantidad_devuelta INTEGER NOT NULL,
    motivo VARCHAR(500),
    FOREIGN KEY (devolucion_id) REFERENCES devoluciones(id)
);

-- ========================================================================================
-- FIN MIGRACIÓN V9: DEVOLUCIONES Y LINEAS_DEVOLUCION
-- ========================================================================================
