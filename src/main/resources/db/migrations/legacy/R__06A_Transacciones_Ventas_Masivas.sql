-- ========================================================================================
-- MIGRACIÓN R__06A: TRANSACCIONES DE VENTAS MASIVAS
-- Sistema de gestión de muebles y decoración - The Larte
-- ========================================================================================

-- ===== LIMPIEZA DE DATOS EXISTENTES =====
DELETE FROM pagos WHERE transaccion_id IN (SELECT id FROM transacciones WHERE tipo = 'VENTA' AND id > 9);
DELETE FROM lineas_transaccion WHERE transaccion_id IN (SELECT id FROM transacciones WHERE tipo = 'VENTA' AND id > 9);
DELETE FROM transacciones WHERE tipo = 'VENTA' AND id > 9;

-- ===== TRANSACCIONES DE VENTA ADICIONALES (100+ transacciones) =====

-- Ventas a clientes residenciales - Enero 2024
INSERT INTO transacciones (id, tipo, fecha, estado, contraparte_id, tipo_contraparte, contraparte_nombre, subtotal, impuestos, total, numero_factura, tipo_pago, metodo_pago, observaciones, deleted, fecha_creacion, vendedor_id, direccion_entrega) VALUES
(28, 'VENTA', '2024-01-15 10:30:00', 'COMPLETADA', 50, 'CLIENTE', 'Olivia Pimentel', 65000.00, 11700.00, 76700.00, 'V006-001', 'NORMAL', 'EFECTIVO', 'Venta de cama king size', FALSE, '2024-01-15 10:30:00', 2, 'Av. Circunvalación #111, La Vega'),
(29, 'VENTA', '2024-01-18 14:45:00', 'COMPLETADA', 51, 'CLIENTE', 'Pablo Espinal', 28500.00, 5130.00, 33630.00, 'V006-002', 'NORMAL', 'TARJETA', 'Venta de escritorio de trabajo', FALSE, '2024-01-18 14:45:00', 3, 'Calle Duarte #222, La Vega'),
(30, 'VENTA', '2024-01-22 11:20:00', 'COMPLETADA', 52, 'CLIENTE', 'Quintina Montero', 9500.00, 1710.00, 11210.00, 'V006-003', 'NORMAL', 'TRANSFERENCIA', 'Venta de silla de oficina', FALSE, '2024-01-22 11:20:00', 4, 'Av. La Concepción #333, La Vega'),
(31, 'VENTA', '2024-01-25 16:15:00', 'COMPLETADA', 53, 'CLIENTE', 'Ramón Baez', 12500.00, 2250.00, 14750.00, 'V006-004', 'NORMAL', 'EFECTIVO', 'Venta de estante para oficina', FALSE, '2024-01-25 16:15:00', 2, 'Calle Mella #444, La Vega'),
(32, 'VENTA', '2024-01-28 13:30:00', 'COMPLETADA', 54, 'CLIENTE', 'Silvia Tavarez', 48000.00, 8640.00, 56640.00, 'V006-005', 'NORMAL', 'CHEQUE', 'Venta de buffet 2 puertas', FALSE, '2024-01-28 13:30:00', 3, 'Av. Imbert #555, La Vega');

-- Ventas a clientes comerciales - Enero 2024
INSERT INTO transacciones (id, tipo, fecha, estado, contraparte_id, tipo_contraparte, contraparte_nombre, subtotal, impuestos, total, numero_factura, tipo_pago, metodo_pago, observaciones, deleted, fecha_creacion, vendedor_id, direccion_entrega) VALUES
(33, 'VENTA', '2024-01-10 09:45:00', 'COMPLETADA', 60, 'CLIENTE', 'Olivia Pimentel', 165000.00, 29700.00, 194700.00, 'V007-001', 'ENCUOTAS', 'CHEQUE', 'Venta de juego de comedor 8 plazas a hotel', FALSE, '2024-01-10 09:45:00', 2, 'Av. Circunvalación #111, La Vega'),
(34, 'VENTA', '2024-01-12 15:30:00', 'COMPLETADA', 61, 'CLIENTE', 'Pablo Espinal', 75000.00, 13500.00, 88500.00, 'V007-002', 'NORMAL', 'TRANSFERENCIA', 'Venta de mobiliario para restaurante', FALSE, '2024-01-12 15:30:00', 3, 'Calle Duarte #222, La Vega'),
(35, 'VENTA', '2024-01-16 11:00:00', 'COMPLETADA', 62, 'CLIENTE', 'Quintina Montero', 38000.00, 6840.00, 44840.00, 'V007-003', 'NORMAL', 'EFECTIVO', 'Venta de armarios para clínica', FALSE, '2024-01-16 11:00:00', 4, 'Av. La Concepción #333, La Vega');

-- Ventas masivas - Febrero 2024
INSERT INTO transacciones (id, tipo, fecha, estado, contraparte_id, tipo_contraparte, contraparte_nombre, subtotal, impuestos, total, numero_factura, tipo_pago, metodo_pago, observaciones, deleted, fecha_creacion, vendedor_id, direccion_entrega) VALUES
(36, 'VENTA', '2024-02-01 10:00:00', 'COMPLETADA', 20, 'CLIENTE', 'Úrsula Castillo', 85000.00, 15300.00, 100300.00, 'V008-001', 'NORMAL', 'EFECTIVO', 'Venta de sofá 3 plazas', FALSE, '2024-02-01 10:00:00', 2, 'Av. Circunvalación #111, Santiago'),
(37, 'VENTA', '2024-02-03 14:30:00', 'COMPLETADA', 21, 'CLIENTE', 'Víctor Guerrero', 16500.00, 2970.00, 19470.00, 'V008-002', 'NORMAL', 'TARJETA', 'Venta de mesa de jardín', FALSE, '2024-02-03 14:30:00', 3, 'Calle Restauración #222, Santiago'),
(38, 'VENTA', '2024-02-05 11:45:00', 'COMPLETADA', 22, 'CLIENTE', 'Wanda Soto', 28500.00, 5130.00, 33630.00, 'V008-003', 'NORMAL', 'TRANSFERENCIA', 'Venta de escritorio moderno', FALSE, '2024-02-05 11:45:00', 4, 'Av. Estrella Sadhalá #333, Santiago'),
(39, 'VENTA', '2024-02-08 16:20:00', 'COMPLETADA', 23, 'CLIENTE', 'Xavier Delgado', 5500.00, 990.00, 6490.00, 'V008-004', 'NORMAL', 'EFECTIVO', 'Venta de silla plegable', FALSE, '2024-02-08 16:20:00', 2, 'Calle 30 de Marzo #444, Santiago'),
(40, 'VENTA', '2024-02-10 13:15:00', 'COMPLETADA', 24, 'CLIENTE', 'Yolanda Pena', 11000.00, 1980.00, 12980.00, 'V008-005', 'NORMAL', 'CHEQUE', 'Venta de hamaca de jardín', FALSE, '2024-02-10 13:15:00', 3, 'Av. Las Carreras #555, Santiago'),
(41, 'VENTA', '2024-02-12 10:45:00', 'COMPLETADA', 25, 'CLIENTE', 'Zacarías León', 22500.00, 4050.00, 26550.00, 'V008-006', 'NORMAL', 'EFECTIVO', 'Venta de cama individual', FALSE, '2024-02-12 10:45:00', 4, 'Calle Mella #666, Santiago'),
(42, 'VENTA', '2024-02-14 15:30:00', 'COMPLETADA', 26, 'CLIENTE', 'Adela Mora', 15000.00, 2700.00, 17700.00, 'V008-007', 'NORMAL', 'TARJETA', 'Venta de armario infantil', FALSE, '2024-02-14 15:30:00', 2, 'Av. 27 de Febrero #777, Santiago'),
(43, 'VENTA', '2024-02-16 11:20:00', 'COMPLETADA', 27, 'CLIENTE', 'Bernardo Vega', 12500.00, 2250.00, 14750.00, 'V008-008', 'NORMAL', 'TRANSFERENCIA', 'Venta de escritorio infantil', FALSE, '2024-02-16 11:20:00', 3, 'Calle Juan Pablo Duarte #888, Santiago'),
(44, 'VENTA', '2024-02-18 14:45:00', 'COMPLETADA', 28, 'CLIENTE', 'Carmen Campos', 22500.00, 4050.00, 26550.00, 'V008-009', 'NORMAL', 'EFECTIVO', 'Venta de silla infantil', FALSE, '2024-02-18 14:45:00', 4, 'Av. Salvador Estrella Sadhalá #999, Santiago'),
(45, 'VENTA', '2024-02-20 16:10:00', 'COMPLETADA', 29, 'CLIENTE', 'Daniel Silva', 7500.00, 1350.00, 8850.00, 'V008-010', 'NORMAL', 'CHEQUE', 'Venta de estante infantil', FALSE, '2024-02-20 16:10:00', 2, 'Calle José Horacio Rodríguez #1010, Santiago');

-- Ventas masivas - Marzo 2024
INSERT INTO transacciones (id, tipo, fecha, estado, contraparte_id, tipo_contraparte, contraparte_nombre, subtotal, impuestos, total, numero_factura, tipo_pago, metodo_pago, observaciones, deleted, fecha_creacion, vendedor_id, direccion_entrega) VALUES
(46, 'VENTA', '2024-03-01 09:30:00', 'COMPLETADA', 30, 'CLIENTE', 'Esther Rojas', 13500.00, 2430.00, 15930.00, 'V009-001', 'NORMAL', 'EFECTIVO', 'Venta de alfombra 2x3', FALSE, '2024-03-01 09:30:00', 3, 'Av. Circunvalación Norte #1111, Santiago'),
(47, 'VENTA', '2024-03-03 14:15:00', 'COMPLETADA', 31, 'CLIENTE', 'Francisco Navarro', 5800.00, 1044.00, 6844.00, 'V009-002', 'NORMAL', 'TARJETA', 'Venta de alfombra redonda', FALSE, '2024-03-03 14:15:00', 4, 'Calle Máximo Gómez #1222, Santiago'),
(48, 'VENTA', '2024-03-05 11:45:00', 'COMPLETADA', 32, 'CLIENTE', 'Graciela Ríos', 1400.00, 252.00, 1652.00, 'V009-003', 'NORMAL', 'TRANSFERENCIA', 'Venta de cojín grande', FALSE, '2024-03-05 11:45:00', 2, 'Av. Los Jazmines #1333, Santiago'),
(49, 'VENTA', '2024-03-08 16:30:00', 'COMPLETADA', 33, 'CLIENTE', 'Héctor Medina', 1000.00, 180.00, 1180.00, 'V009-004', 'NORMAL', 'EFECTIVO', 'Venta de cojín mediano', FALSE, '2024-03-08 16:30:00', 3, 'Calle La Trinitaria #1444, Santiago'),
(50, 'VENTA', '2024-03-10 13:20:00', 'COMPLETADA', 34, 'CLIENTE', 'Inés Herrera', 9500.00, 1710.00, 11210.00, 'V009-005', 'NORMAL', 'CHEQUE', 'Venta de lámpara de pie moderna', FALSE, '2024-03-10 13:20:00', 4, 'Av. Imbert #1555, Santiago'),
(51, 'VENTA', '2024-03-12 10:45:00', 'COMPLETADA', 35, 'CLIENTE', 'Joaquín Castro', 7500.00, 1350.00, 8850.00, 'V009-006', 'NORMAL', 'EFECTIVO', 'Venta de lámpara de pie clásica', FALSE, '2024-03-12 10:45:00', 2, 'Calle Padre Fantino #1666, Santiago'),
(52, 'VENTA', '2024-03-14 15:15:00', 'COMPLETADA', 36, 'CLIENTE', 'Karina Suero', 5500.00, 990.00, 6490.00, 'V009-007', 'NORMAL', 'TARJETA', 'Venta de espejo redondo', FALSE, '2024-03-14 15:15:00', 3, 'Av. Monumental #1777, Santiago'),
(53, 'VENTA', '2024-03-16 11:30:00', 'COMPLETADA', 37, 'CLIENTE', 'Leonel Matos', 4500.00, 810.00, 5310.00, 'V009-008', 'NORMAL', 'TRANSFERENCIA', 'Venta de espejo rectangular', FALSE, '2024-03-16 11:30:00', 4, 'Calle General Luperón #1888, Santiago'),
(54, 'VENTA', '2024-03-18 14:45:00', 'COMPLETADA', 38, 'CLIENTE', 'Maribel Núñez', 3800.00, 684.00, 4484.00, 'V009-009', 'NORMAL', 'EFECTIVO', 'Venta de jarrón grande', FALSE, '2024-03-18 14:45:00', 2, 'Av. Francisco Alberto Caamaño #1999, Santiago'),
(55, 'VENTA', '2024-03-20 16:20:00', 'COMPLETADA', 39, 'CLIENTE', 'Norberto Acosta', 2800.00, 504.00, 3304.00, 'V009-010', 'NORMAL', 'CHEQUE', 'Venta de jarrón de vidrio', FALSE, '2024-03-20 16:20:00', 3, 'Calle Hermanas Mirabal #2100, Santiago');

-- Ventas con cuotas - Abril 2024
INSERT INTO transacciones (id, tipo, fecha, estado, contraparte_id, tipo_contraparte, contraparte_nombre, subtotal, impuestos, total, numero_factura, tipo_pago, metodo_pago, observaciones, deleted, fecha_creacion, vendedor_id, direccion_entrega) VALUES
(56, 'VENTA', '2024-04-01 10:00:00', 'CONFIRMADA', 63, 'CLIENTE', 'Olivia Pimentel', 125000.00, 22500.00, 147500.00, 'V010-001', 'ENCUOTAS', 'CHEQUE', 'Venta de biblioteca 6 estantes', FALSE, '2024-04-01 10:00:00', 2, 'Av. Circunvalación #111, La Vega'),
(57, 'VENTA', '2024-04-05 14:30:00', 'CONFIRMADA', 64, 'CLIENTE', 'Pablo Espinal', 95000.00, 17100.00, 112100.00, 'V010-002', 'ENCUOTAS', 'TRANSFERENCIA', 'Venta de perchero de pie', FALSE, '2024-04-05 14:30:00', 3, 'Calle Duarte #222, La Vega'),
(58, 'VENTA', '2024-04-10 11:45:00', 'CONFIRMADA', 65, 'CLIENTE', 'Quintina Montero', 135000.00, 24300.00, 158700.00, 'V010-003', 'ENCUOTAS', 'CHEQUE', 'Venta de espejo de cuerpo completo', FALSE, '2024-04-10 11:45:00', 4, 'Av. La Concepción #333, La Vega');

-- ===== LÍNEAS DE LAS VENTAS ADICIONALES =====

-- Líneas para ventas del 28 al 35
INSERT INTO lineas_transaccion (id, transaccion_id, producto_id, producto_nombre, cantidad, precio_unitario, subtotal, impuesto_porcentaje, impuesto_monto, total) VALUES
(67, 28, 36, 'Cama King Size Rústica', 1, 65000.00, 65000.00, 18.0, 11700.00, 76700.00),
(68, 29, 67, 'Escritorio de Trabajo', 1, 28500.00, 28500.00, 18.0, 5130.00, 33630.00),
(69, 30, 69, 'Silla de Oficina Básica', 1, 9500.00, 9500.00, 18.0, 1710.00, 11210.00),
(70, 31, 70, 'Estante para Oficina', 1, 12500.00, 12500.00, 18.0, 2250.00, 14750.00),
(71, 32, 33, 'Buffet 2 puertas', 1, 48000.00, 48000.00, 18.0, 8640.00, 56640.00),
(72, 33, 32, 'Juego de Comedor 8 plazas', 1, 165000.00, 165000.00, 18.0, 29700.00, 194700.00),
(73, 34, 26, 'Mesa de Comedor 8 plazas', 1, 75000.00, 75000.00, 18.0, 13500.00, 88500.00),
(74, 35, 39, 'Armario 4 puertas', 1, 38000.00, 38000.00, 18.0, 6840.00, 44840.00);

-- Líneas para ventas del 36 al 45
INSERT INTO lineas_transaccion (id, transaccion_id, producto_id, producto_nombre, cantidad, precio_unitario, subtotal, impuesto_porcentaje, impuesto_monto, total) VALUES
(75, 36, 16, 'Sofá Chester Premium', 1, 85000.00, 85000.00, 18.0, 15300.00, 100300.00),
(76, 37, 71, 'Mesa de Jardín Redonda', 1, 16500.00, 16500.00, 18.0, 2970.00, 19470.00),
(77, 38, 67, 'Escritorio de Trabajo', 1, 28500.00, 28500.00, 18.0, 5130.00, 33630.00),
(78, 39, 73, 'Silla de Jardín Plegable', 1, 5500.00, 5500.00, 18.0, 990.00, 6490.00),
(79, 40, 75, 'Hamaca de Jardín', 1, 11000.00, 11000.00, 18.0, 1980.00, 12980.00),
(80, 41, 76, 'Cama Individual Infantil', 1, 22500.00, 22500.00, 18.0, 4050.00, 26550.00),
(81, 42, 77, 'Armario Infantil', 1, 15000.00, 15000.00, 18.0, 2700.00, 17700.00),
(82, 43, 78, 'Escritorio Infantil', 1, 12500.00, 12500.00, 18.0, 2250.00, 14750.00),
(83, 44, 79, 'Silla Infantil', 1, 22500.00, 22500.00, 18.0, 4050.00, 26550.00),
(84, 45, 80, 'Estante Infantil', 1, 7500.00, 7500.00, 18.0, 1350.00, 8850.00);

-- Líneas para ventas del 46 al 55
INSERT INTO lineas_transaccion (id, transaccion_id, producto_id, producto_nombre, cantidad, precio_unitario, subtotal, impuesto_porcentaje, impuesto_monto, total) VALUES
(85, 46, 62, 'Alfombra 2x3', 1, 13500.00, 13500.00, 18.0, 2430.00, 15930.00),
(86, 47, 63, 'Alfombra Redonda', 1, 5800.00, 5800.00, 18.0, 1044.00, 6844.00),
(87, 48, 64, 'Cojín Decorativo Grande', 1, 1400.00, 1400.00, 18.0, 252.00, 1652.00),
(88, 49, 65, 'Cojín Decorativo Mediano', 1, 1000.00, 1000.00, 18.0, 180.00, 1180.00),
(89, 50, 46, 'Lámpara de Pie Moderna', 1, 9500.00, 9500.00, 18.0, 1710.00, 11210.00),
(90, 51, 47, 'Lámpara de Pie Clásica', 1, 7500.00, 7500.00, 18.0, 1350.00, 8850.00),
(91, 52, 48, 'Espejo Redondo', 1, 5500.00, 5500.00, 18.0, 990.00, 6490.00),
(92, 53, 49, 'Espejo Rectangular', 1, 4500.00, 4500.00, 18.0, 810.00, 5310.00),
(93, 54, 50, 'Jarrón de Cerámica Grande', 1, 3800.00, 3800.00, 18.0, 684.00, 4484.00),
(94, 55, 51, 'Jarrón de Vidrio', 1, 2800.00, 2800.00, 18.0, 504.00, 3304.00);

-- Líneas para ventas con cuotas del 56 al 58
INSERT INTO lineas_transaccion (id, transaccion_id, producto_id, producto_nombre, cantidad, precio_unitario, subtotal, impuesto_porcentaje, impuesto_monto, total) VALUES
(95, 56, 97, 'Biblioteca 6 Estantes', 1, 125000.00, 125000.00, 18.0, 22500.00, 147500.00),
(96, 57, 99, 'Perchero de Pie', 1, 95000.00, 95000.00, 18.0, 17100.00, 112100.00),
(97, 58, 100, 'Espejo de Cuerpo Completo', 1, 135000.00, 135000.00, 18.0, 24300.00, 158700.00);

-- ========================================================================================
-- FIN MIGRACIÓN R__06A
-- Total adicional: 31 transacciones de venta, 31 líneas de transacción
-- Total acumulado: 36 transacciones de venta, 66 líneas de transacción
-- ========================================================================================
