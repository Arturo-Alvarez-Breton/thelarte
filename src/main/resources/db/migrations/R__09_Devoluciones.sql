-- ========================================================================================
-- MIGRACIÓN R__09: TRANSACCIONES DE DEVOLUCIÓN
-- Sistema de gestión de muebles y decoración - The Larte
-- ========================================================================================

-- ===== LIMPIEZA DE DATOS EXISTENTES =====
DELETE FROM lineas_transaccion WHERE transaccion_id IN (SELECT id FROM transacciones WHERE tipo = 'DEVOLUCION_VENTA');
DELETE FROM movimientos_producto WHERE tipo = 'ingreso_devolucion';
DELETE FROM transacciones WHERE tipo = 'DEVOLUCION_VENTA';

-- ===== TRANSACCIÓN DE DEVOLUCIÓN =====
INSERT INTO transacciones (id, tipo, fecha, estado, contraparte_id, tipo_contraparte, contraparte_nombre, subtotal, impuestos, total, numero_factura, tipo_pago, metodo_pago, observaciones, deleted, fecha_creacion, transaccion_origen_id) VALUES
(10, 'DEVOLUCION_VENTA', '2023-04-05 14:00:00', 'COMPLETADA', 3, 'CLIENTE', 'José Martínez', 15000.00, 2700.00, 17700.00, 'DV001-001', 'NORMAL', 'EFECTIVO', 'Devolución de mesa de centro - cliente insatisfecho', FALSE, '2023-04-05 14:00:00', 7);

-- ===== LÍNEA DE LA DEVOLUCIÓN =====
INSERT INTO lineas_transaccion (id, transaccion_id, producto_id, producto_nombre, cantidad, precio_unitario, subtotal, impuesto_porcentaje, impuesto_monto, total) VALUES
(98, 10, 3, 'Mesa de Centro Rectangular', 1, 15000.00, 15000.00, 18.0, 2700.00, 17700.00);

-- ===== MOVIMIENTO POR DEVOLUCIÓN =====
INSERT INTO movimientos_producto (id, producto_id, tipo, tipo_simple, cantidad, motivo, fecha, id_usuario) VALUES
(17, 3, 'ingreso_devolucion', 'INGRESO', 1, 'Devolución de José Martínez', '2023-04-05 14:00:00', '002-2345678-3');

-- ========================================================================================
-- FIN MIGRACIÓN R__09
-- Total: 1 transacción de devolución, 1 línea, 1 movimiento de inventario
-- ========================================================================================
