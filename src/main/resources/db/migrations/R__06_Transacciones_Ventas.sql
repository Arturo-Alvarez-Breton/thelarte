-- ========================================================================================
-- MIGRACIÓN R__06: TRANSACCIONES DE VENTAS
-- Sistema de gestión de muebles y decoración - The Larte
-- ========================================================================================

-- ===== LIMPIEZA DE DATOS EXISTENTES =====
DELETE FROM pagos WHERE transaccion_id IN (SELECT id FROM transacciones WHERE tipo = 'VENTA');
DELETE FROM lineas_transaccion WHERE transaccion_id IN (SELECT id FROM transacciones WHERE tipo = 'VENTA');
DELETE FROM transacciones WHERE tipo = 'VENTA';

-- ===== TRANSACCIONES DE VENTA =====
INSERT INTO transacciones (id, tipo, fecha, estado, contraparte_id, tipo_contraparte, contraparte_nombre, subtotal, impuestos, total, numero_factura, tipo_pago, metodo_pago, observaciones, deleted, fecha_creacion, vendedor_id, direccion_entrega) VALUES
(5, 'VENTA', '2023-03-01 15:00:00', 'COMPLETADA', 5, 'CLIENTE', 'Roberto Fernández', 45000.00, 8100.00, 53100.00, 'V001-001', 'NORMAL', 'EFECTIVO', 'Venta de sofá 3 plazas', FALSE, '2023-03-01 15:00:00', 2, 'Av. 27 de Febrero #123, Santo Domingo'),
(6, 'VENTA', '2023-03-05 16:30:00', 'COMPLETADA', 6, 'CLIENTE', 'Luisa Gómez', 32000.00, 5760.00, 37760.00, 'V001-002', 'NORMAL', 'TARJETA', 'Venta de sofá 2 plazas', FALSE, '2023-03-05 16:30:00', 3, 'Calle Las Damas #456, Santo Domingo'),
(7, 'VENTA', '2023-03-10 14:00:00', 'COMPLETADA', 7, 'CLIENTE', 'José Martínez', 15000.00, 2700.00, 17700.00, 'V001-003', 'NORMAL', 'TRANSFERENCIA', 'Venta de mesa de centro', FALSE, '2023-03-10 14:00:00', 4, 'Av. George Washington #789, Santo Domingo'),
(8, 'VENTA', '2023-03-15 11:00:00', 'COMPLETADA', 8, 'CLIENTE', 'Ana Vásquez', 85000.00, 15300.00, 100300.00, 'V001-004', 'NORMAL', 'CHEQUE', 'Venta de juego de comedor', FALSE, '2023-03-15 11:00:00', 2, 'Calle El Conde #321, Santo Domingo'),
(9, 'VENTA', '2023-03-20 10:30:00', 'COMPLETADA', 9, 'CLIENTE', 'Miguel Santos', 28000.00, 5040.00, 33040.00, 'V001-005', 'NORMAL', 'EFECTIVO', 'Venta de armario', FALSE, '2023-03-20 10:30:00', 3, 'Av. Independencia #654, Santo Domingo');

-- ===== LÍNEAS DE LAS VENTAS =====
INSERT INTO lineas_transaccion (id, transaccion_id, producto_id, producto_nombre, cantidad, precio_unitario, subtotal, impuesto_porcentaje, impuesto_monto, total) VALUES
(62, 5, 1, 'Sofá 3 plazas Moderno', 1, 45000.00, 45000.00, 18.0, 8100.00, 53100.00),
(63, 6, 2, 'Sofá 2 plazas Clásico', 1, 32000.00, 32000.00, 18.0, 5760.00, 37760.00),
(64, 7, 3, 'Mesa de Centro Rectangular', 1, 15000.00, 15000.00, 18.0, 2700.00, 17700.00),
(65, 8, 7, 'Juego de Comedor 4 plazas', 1, 85000.00, 85000.00, 18.0, 15300.00, 100300.00),
(66, 9, 9, 'Armario 3 puertas', 1, 28000.00, 28000.00, 18.0, 5040.00, 33040.00);

-- ========================================================================================
-- FIN MIGRACIÓN R__06
-- Total: 5 transacciones de venta, 5 líneas de transacción
-- ========================================================================================
