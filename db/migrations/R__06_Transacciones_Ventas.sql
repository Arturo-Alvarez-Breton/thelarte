-- ========================================================================================
-- MIGRACIÓN R__06: TRANSACCIONES DE VENTA
-- Sistema de gestión de muebles y decoración - The Larte
-- ========================================================================================

-- ===== TRANSACCIONES DE VENTA =====
-- Ventas a clientes residenciales
INSERT INTO transacciones (id, tipo, fecha, estado, contraparte_id, tipo_contraparte, contraparte_nombre, subtotal, impuestos, total, numero_factura, tipo_pago, metodo_pago, observaciones, deleted, fecha_creacion, vendedor_id, direccion_entrega) VALUES
(5, 'VENTA', '2023-03-01 15:00:00', 'COMPLETADA', 1, 'CLIENTE', 'Roberto Fernández', 45000.00, 8100.00, 53100.00, 'V001-001', 'NORMAL', 'EFECTIVO', 'Venta de sofá para sala', FALSE, '2023-03-01 15:00:00', 2, 'Av. Independencia #100, Santo Domingo'),
(6, 'VENTA', '2023-03-05 16:30:00', 'COMPLETADA', 2, 'CLIENTE', 'Luisa Gómez', 32000.00, 5760.00, 37760.00, 'V002-001', 'NORMAL', 'TARJETA', 'Venta de sofá clásico', FALSE, '2023-03-05 16:30:00', 3, 'Calle Duarte #55, Santiago'),
(7, 'VENTA', '2023-03-10 14:00:00', 'COMPLETADA', 3, 'CLIENTE', 'José Martínez', 15000.00, 2700.00, 17700.00, 'V003-001', 'NORMAL', 'TRANSFERENCIA', 'Venta de mesa de centro', FALSE, '2023-03-10 14:00:00', 4, 'Calle El Sol #10, La Vega'),

-- Venta a cliente comercial con pago en cuotas
(8, 'VENTA', '2023-03-15 11:00:00', 'CONFIRMADA', 6, 'CLIENTE', 'Ana Vásquez', 85000.00, 15300.00, 100300.00, 'V004-001', 'ENCUOTAS', 'CHEQUE', 'Venta de juego de comedor para hotel', FALSE, '2023-03-15 11:00:00', 2, 'Av. Las Américas #500, Santo Domingo (Hotel Paraíso)'),
(9, 'VENTA', '2023-03-20 10:30:00', 'COMPLETADA', 7, 'CLIENTE', 'Miguel Santos', 28000.00, 5040.00, 33040.00, 'V005-001', 'NORMAL', 'EFECTIVO', 'Venta de armario para restaurante', FALSE, '2023-03-20 10:30:00', 3, 'Calle El Conde #25, Santo Domingo (Restaurante del Mar)');

-- ===== LÍNEAS DE LAS VENTAS =====
INSERT INTO lineas_transaccion (id, transaccion_id, producto_id, producto_nombre, cantidad, precio_unitario, subtotal, impuesto_porcentaje, impuesto_monto, total) VALUES
-- Venta 5: Roberto Fernández
(11, 5, 1, 'Sofá 3 plazas Moderno', 1, 45000.00, 45000.00, 18.0, 8100.00, 53100.00),

-- Venta 6: Luisa Gómez
(12, 6, 2, 'Sofá 2 plazas Clásico', 1, 32000.00, 32000.00, 18.0, 5760.00, 37760.00),

-- Venta 7: José Martínez
(13, 7, 3, 'Mesa de Centro Rectangular', 1, 15000.00, 15000.00, 18.0, 2700.00, 17700.00),

-- Venta 8: Ana Vásquez (Hotel Paraíso)
(14, 8, 7, 'Juego de Comedor 4 plazas', 1, 85000.00, 85000.00, 18.0, 15300.00, 100300.00),

-- Venta 9: Miguel Santos
(15, 9, 9, 'Armario 3 puertas', 1, 28000.00, 28000.00, 18.0, 5040.00, 33040.00);

-- ========================================================================================
-- FIN MIGRACIÓN R__06
-- Total: 5 transacciones de venta, 5 líneas de transacción
-- ========================================================================================
