-- ========================================================================================
-- MIGRACIÓN R__07: PAGOS Y CUOTAS
-- Sistema de gestión de muebles y decoración - The Larte
-- ========================================================================================

-- ===== PAGOS PARA VENTAS EN CUOTAS =====
INSERT INTO pagos (id, transaccion_id, fecha, monto, metodo_pago, estado, numero_cuota, observaciones, fecha_creacion) VALUES
-- Venta 8: Ana Vásquez - 4 cuotas
(1, 8, '2023-03-15', 25000.00, 'CHEQUE', 'COMPLETADO', 1, 'Pago inicial - 25% del total', '2023-03-15 11:00:00'),
(2, 8, '2023-04-15', 25000.00, 'CHEQUE', 'COMPLETADO', 2, 'Segunda cuota - 25% del total', '2023-04-15 09:00:00'),
(3, 8, '2023-05-15', 25000.00, 'CHEQUE', 'COMPLETADO', 3, 'Tercera cuota - 25% del total', '2023-05-15 09:00:00'),
(4, 8, '2023-06-15', 25300.00, 'CHEQUE', 'PENDIENTE', 4, 'Cuota final con intereses', '2023-06-15 09:00:00');

-- ===== ACTUALIZAR SALDO PENDIENTE =====
-- Actualizar el saldo pendiente de la transacción 8
UPDATE transacciones SET saldo_pendiente = 25300.00, monto_inicial = 25000.00 WHERE id = 8;

-- ========================================================================================
-- FIN MIGRACIÓN R__07
-- Total: 4 pagos en cuotas para 1 transacción
-- ========================================================================================
