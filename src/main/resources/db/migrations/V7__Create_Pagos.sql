-- ========================================================================================
-- MIGRACIÓN V7: CREACIÓN DE TABLA PAGOS
-- Sistema de gestión de muebles y decoración - The Larte
-- ========================================================================================

CREATE TABLE IF NOT EXISTS pagos (
    id BIGSERIAL PRIMARY KEY,
    transaccion_id BIGINT NOT NULL,
    fecha DATE NOT NULL,
    monto DECIMAL(12,2) NOT NULL,
    metodo_pago VARCHAR(255) NOT NULL,
    estado VARCHAR(50) NOT NULL,
    numero_cuota INTEGER,
    observaciones VARCHAR(500),
    fecha_creacion TIMESTAMP NOT NULL,
    fecha_actualizacion TIMESTAMP,
    FOREIGN KEY (transaccion_id) REFERENCES transacciones(id)
);

-- ========================================================================================
-- FIN MIGRACIÓN V7: PAGOS
-- ========================================================================================
