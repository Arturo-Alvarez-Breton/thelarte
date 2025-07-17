-- V3__create_devoluciones.sql

-- Add deleted column to transacciones table
ALTER TABLE transacciones 
ADD COLUMN deleted BOOLEAN NOT NULL DEFAULT false;

-- Create transacciones_devolucion table
CREATE TABLE transacciones_devolucion (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    transaccion_id BIGINT NOT NULL,
    suplidor_id BIGINT NOT NULL,
    suplidor_nombre VARCHAR(255) NOT NULL,
    fecha_devolucion TIMESTAMP NOT NULL,
    motivo_devolucion VARCHAR(500),
    estado_devolucion VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE',
    observaciones VARCHAR(1000),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NULL,
    
    FOREIGN KEY (transaccion_id) REFERENCES transacciones(id)
);

-- Add transaccion_devolucion_id column to lineas_transaccion table
ALTER TABLE lineas_transaccion 
ADD COLUMN transaccion_devolucion_id BIGINT NULL;

-- Add foreign key constraint for transaccion_devolucion_id
ALTER TABLE lineas_transaccion 
ADD CONSTRAINT fk_lineas_transaccion_devolucion 
FOREIGN KEY (transaccion_devolucion_id) REFERENCES transacciones_devolucion(id);

-- Create indexes for better performance
CREATE INDEX idx_transacciones_deleted ON transacciones(deleted);
CREATE INDEX idx_transacciones_devolucion_transaccion_id ON transacciones_devolucion(transaccion_id);
CREATE INDEX idx_transacciones_devolucion_suplidor_id ON transacciones_devolucion(suplidor_id);
CREATE INDEX idx_transacciones_devolucion_estado ON transacciones_devolucion(estado_devolucion);
CREATE INDEX idx_lineas_transaccion_devolucion_id ON lineas_transaccion(transaccion_devolucion_id);