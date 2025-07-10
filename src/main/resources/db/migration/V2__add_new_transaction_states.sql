-- Migration to add new transaction states
-- This migration adds new transaction states for better purchase and sales tracking

-- Note: Since we're using JPA with EnumType.STRING, the database will automatically
-- accept the new enum values when they are used. This migration is for documentation
-- and to ensure database consistency.

-- Add indexes for better performance with the new states
CREATE INDEX IF NOT EXISTS idx_transaccion_tipo_estado ON transacciones(tipo, estado);
CREATE INDEX IF NOT EXISTS idx_transaccion_estado_fecha ON transacciones(estado, fecha);
CREATE INDEX IF NOT EXISTS idx_transaccion_contraparte_estado ON transacciones(contraparte_id, tipo_contraparte, estado);

-- Add comments to document the new states
COMMENT ON COLUMN transacciones.estado IS 'Estado de la transacción: PENDIENTE, CONFIRMADA, COMPLETADA, CANCELADA, FACTURADA, RECIBIDA (compras), PAGADA (compras), ENTREGADA (ventas), COBRADA (ventas)';

-- The following states have been added to the EstadoTransaccion enum:
-- RECIBIDA    - Para compras: mercancía recibida
-- PAGADA      - Para compras: pago completado al suplidor  
-- ENTREGADA   - Para ventas: producto entregado al cliente
-- COBRADA     - Para ventas: pago recibido del cliente