-- ========================================================================================
-- MIGRACIÓN R__05A: TRANSACCIONES DE COMPRA MASIVAS
-- Sistema de gestión de muebles y decoración - The Larte
-- ========================================================================================

-- ===== TRANSACCIONES DE COMPRA ADICIONALES (50+ transacciones) =====

-- Compras a Muebles del Caribe - Lote 2
INSERT INTO transacciones (id, tipo, fecha, estado, contraparte_id, tipo_contraparte, contraparte_nombre, subtotal, impuestos, total, numero_factura, tipo_pago, metodo_pago, observaciones, deleted, fecha_creacion, vendedor_id) VALUES
(11, 'COMPRA', '2023-07-15 09:30:00', 'COMPLETADA', 1, 'SUPLIDOR', 'Muebles del Caribe S.A.', 125000.00, 22500.00, 147500.00, 'C002-002', 'NORMAL', 'TRANSFERENCIA', 'Compra de muebles de sala adicionales', FALSE, '2023-07-15 09:30:00', NULL),
(12, 'COMPRA', '2023-08-20 10:45:00', 'COMPLETADA', 1, 'SUPLIDOR', 'Muebles del Caribe S.A.', 95000.00, 17100.00, 112100.00, 'C002-003', 'NORMAL', 'CHEQUE', 'Compra de mesas de comedor', FALSE, '2023-08-20 10:45:00', NULL),
(13, 'COMPRA', '2023-09-10 14:20:00', 'COMPLETADA', 1, 'SUPLIDOR', 'Muebles del Caribe S.A.', 78000.00, 14040.00, 92040.00, 'C002-004', 'NORMAL', 'EFECTIVO', 'Compra de muebles de dormitorio', FALSE, '2023-09-10 14:20:00', NULL),
(14, 'COMPRA', '2023-10-05 11:15:00', 'COMPLETADA', 1, 'SUPLIDOR', 'Muebles del Caribe S.A.', 65000.00, 11700.00, 76700.00, 'C002-005', 'NORMAL', 'TRANSFERENCIA', 'Compra de muebles infantiles', FALSE, '2023-10-05 11:15:00', NULL);

-- Compras a Diseños Modernos - Lote 2
INSERT INTO transacciones (id, tipo, fecha, estado, contraparte_id, tipo_contraparte, contraparte_nombre, subtotal, impuestos, total, numero_factura, tipo_pago, metodo_pago, observaciones, deleted, fecha_creacion, vendedor_id) VALUES
(15, 'COMPRA', '2023-07-25 08:45:00', 'COMPLETADA', 2, 'SUPLIDOR', 'Diseños Modernos C. por A.', 88000.00, 15840.00, 103840.00, 'C003-002', 'NORMAL', 'CHEQUE', 'Compra de mesas modernas adicionales', FALSE, '2023-07-25 08:45:00', NULL),
(16, 'COMPRA', '2023-08-30 13:30:00', 'COMPLETADA', 2, 'SUPLIDOR', 'Diseños Modernos C. por A.', 125000.00, 22500.00, 147500.00, 'C003-003', 'NORMAL', 'TRANSFERENCIA', 'Compra de sillas ergonómicas', FALSE, '2023-08-30 13:30:00', NULL),
(17, 'COMPRA', '2023-09-25 10:00:00', 'COMPLETADA', 2, 'SUPLIDOR', 'Diseños Modernos C. por A.', 95000.00, 17100.00, 112100.00, 'C003-004', 'NORMAL', 'EFECTIVO', 'Compra de escritorios modernos', FALSE, '2023-09-25 10:00:00', NULL);

-- Compras a Muebles Tradicionales - Lote 2
INSERT INTO transacciones (id, tipo, fecha, estado, contraparte_id, tipo_contraparte, contraparte_nombre, subtotal, impuestos, total, numero_factura, tipo_pago, metodo_pago, observaciones, deleted, fecha_creacion, vendedor_id) VALUES
(18, 'COMPRA', '2023-08-05 15:45:00', 'COMPLETADA', 3, 'SUPLIDOR', 'Muebles Tradicionales S.R.L.', 72000.00, 12960.00, 84960.00, 'C004-002', 'NORMAL', 'TRANSFERENCIA', 'Compra de muebles tradicionales adicionales', FALSE, '2023-08-05 15:45:00', NULL),
(19, 'COMPRA', '2023-09-15 12:30:00', 'COMPLETADA', 3, 'SUPLIDOR', 'Muebles Tradicionales S.R.L.', 65000.00, 11700.00, 76700.00, 'C004-003', 'NORMAL', 'CHEQUE', 'Compra de buffets tradicionales', FALSE, '2023-09-15 12:30:00', NULL);

-- Compras a Telas Dominicanas - Lote 2
INSERT INTO transacciones (id, tipo, fecha, estado, contraparte_id, tipo_contraparte, contraparte_nombre, subtotal, impuestos, total, numero_factura, tipo_pago, metodo_pago, observaciones, deleted, fecha_creacion, vendedor_id) VALUES
(20, 'COMPRA', '2023-07-20 09:15:00', 'COMPLETADA', 4, 'SUPLIDOR', 'Telas Dominicanas S.A.', 35000.00, 6300.00, 41300.00, 'C005-002', 'NORMAL', 'TRANSFERENCIA', 'Compra de telas adicionales para tapicería', FALSE, '2023-07-20 09:15:00', NULL),
(21, 'COMPRA', '2023-08-25 14:00:00', 'COMPLETADA', 4, 'SUPLIDOR', 'Telas Dominicanas S.A.', 28000.00, 5040.00, 33040.00, 'C005-003', 'NORMAL', 'EFECTIVO', 'Compra de cortinas personalizadas', FALSE, '2023-08-25 14:00:00', NULL),
(22, 'COMPRA', '2023-09-30 11:45:00', 'COMPLETADA', 4, 'SUPLIDOR', 'Telas Dominicanas S.A.', 45000.00, 8100.00, 53100.00, 'C005-004', 'NORMAL', 'CHEQUE', 'Compra de fundas para muebles', FALSE, '2023-09-30 11:45:00', NULL);

-- Compras a Decoraciones y Accesorios - Nuevos proveedores
INSERT INTO transacciones (id, tipo, fecha, estado, contraparte_id, tipo_contraparte, contraparte_nombre, subtotal, impuestos, total, numero_factura, tipo_pago, metodo_pago, observaciones, deleted, fecha_creacion, vendedor_id) VALUES
(23, 'COMPRA', '2023-08-10 10:30:00', 'COMPLETADA', 6, 'SUPLIDOR', 'Decoraciones y Accesorios C.A.', 25000.00, 4500.00, 29500.00, 'C006-001', 'NORMAL', 'TRANSFERENCIA', 'Compra de artículos de decoración', FALSE, '2023-08-10 10:30:00', NULL),
(24, 'COMPRA', '2023-09-05 15:15:00', 'COMPLETADA', 6, 'SUPLIDOR', 'Decoraciones y Accesorios C.A.', 18000.00, 3240.00, 21240.00, 'C006-002', 'NORMAL', 'EFECTIVO', 'Compra de lámparas decorativas', FALSE, '2023-09-05 15:15:00', NULL),
(25, 'COMPRA', '2023-10-12 13:45:00', 'COMPLETADA', 6, 'SUPLIDOR', 'Decoraciones y Accesorios C.A.', 32000.00, 5760.00, 37760.00, 'C006-003', 'NORMAL', 'CHEQUE', 'Compra de espejos y jarrones', FALSE, '2023-10-12 13:45:00', NULL);

-- Compras a Iluminación Moderna
INSERT INTO transacciones (id, tipo, fecha, estado, contraparte_id, tipo_contraparte, contraparte_nombre, subtotal, impuestos, total, numero_factura, tipo_pago, metodo_pago, observaciones, deleted, fecha_creacion, vendedor_id) VALUES
(26, 'COMPRA', '2023-08-15 11:20:00', 'COMPLETADA', 7, 'SUPLIDOR', 'Iluminación Moderna S.R.L.', 15000.00, 2700.00, 17700.00, 'C007-001', 'NORMAL', 'TRANSFERENCIA', 'Compra de lámparas de pie y mesa', FALSE, '2023-08-15 11:20:00', NULL),
(27, 'COMPRA', '2023-09-20 16:30:00', 'COMPLETADA', 7, 'SUPLIDOR', 'Iluminación Moderna S.R.L.', 22000.00, 3960.00, 25960.00, 'C007-002', 'NORMAL', 'CHEQUE', 'Compra de guirnaldas luminosas', FALSE, '2023-09-20 16:30:00', NULL);

-- ===== LÍNEAS DE LAS COMPRAS ADICIONALES =====

-- Líneas para compra 11 (Muebles del Caribe - Lote 2)
INSERT INTO lineas_transaccion (id, transaccion_id, producto_id, producto_nombre, cantidad, precio_unitario, subtotal, impuesto_porcentaje, impuesto_monto, total) VALUES
(11, 11, 16, 'Sofá Chester Premium', 3, 45000.00, 135000.00, 18.0, 24300.00, 159300.00),
(12, 11, 18, 'Sillón Reclinable', 2, 15000.00, 30000.00, 18.0, 5400.00, 35400.00),
(13, 11, 20, 'Puff Cuadrado', 5, 3000.00, 15000.00, 18.0, 2700.00, 17700.00);

-- Líneas para compra 12
INSERT INTO lineas_transaccion (id, transaccion_id, producto_id, producto_nombre, cantidad, precio_unitario, subtotal, impuesto_porcentaje, impuesto_monto, total) VALUES
(14, 12, 26, 'Mesa de Comedor 8 plazas', 1, 55000.00, 55000.00, 18.0, 9900.00, 64900.00),
(15, 12, 27, 'Mesa de Comedor Redonda', 2, 40000.00, 80000.00, 18.0, 14400.00, 94400.00),
(16, 12, 29, 'Silla de Comedor con Brazos', 8, 4500.00, 36000.00, 18.0, 6480.00, 42480.00);

-- Líneas para compra 13
INSERT INTO lineas_transaccion (id, transaccion_id, producto_id, producto_nombre, cantidad, precio_unitario, subtotal, impuesto_porcentaje, impuesto_monto, total) VALUES
(17, 13, 36, 'Cama King Size Rústica', 2, 35000.00, 70000.00, 18.0, 12600.00, 82600.00),
(18, 13, 39, 'Armario 4 puertas', 2, 20000.00, 40000.00, 18.0, 7200.00, 47200.00),
(19, 13, 41, 'Cómoda 6 cajones', 3, 15000.00, 45000.00, 18.0, 8100.00, 53100.00);

-- Líneas para compra 14
INSERT INTO lineas_transaccion (id, transaccion_id, producto_id, producto_nombre, cantidad, precio_unitario, subtotal, impuesto_porcentaje, impuesto_monto, total) VALUES
(20, 14, 76, 'Cama Individual Infantil', 5, 12000.00, 60000.00, 18.0, 10800.00, 70800.00),
(21, 14, 77, 'Armario Infantil', 3, 8000.00, 24000.00, 18.0, 4320.00, 28320.00),
(22, 14, 78, 'Escritorio Infantil', 4, 6500.00, 26000.00, 18.0, 4680.00, 30680.00);

-- Líneas para compra 15 (Diseños Modernos - Lote 2)
INSERT INTO lineas_transaccion (id, transaccion_id, producto_id, producto_nombre, cantidad, precio_unitario, subtotal, impuesto_porcentaje, impuesto_monto, total) VALUES
(23, 15, 22, 'Mesa de Centro Rectangular Cristal', 4, 12000.00, 48000.00, 18.0, 8640.00, 56640.00),
(24, 15, 23, 'Mesa de Centro Redonda Madera', 6, 10000.00, 60000.00, 18.0, 10800.00, 70800.00),
(25, 15, 24, 'Mesa Lateral', 8, 4500.00, 36000.00, 18.0, 6480.00, 42480.00);

-- Líneas para compra 16
INSERT INTO lineas_transaccion (id, transaccion_id, producto_id, producto_nombre, cantidad, precio_unitario, subtotal, impuesto_porcentaje, impuesto_monto, total) VALUES
(26, 16, 68, 'Silla de Oficina Ergonómica', 10, 8000.00, 80000.00, 18.0, 14400.00, 94400.00),
(27, 16, 69, 'Silla de Oficina Básica', 15, 4500.00, 67500.00, 18.0, 12150.00, 79650.00),
(28, 16, 67, 'Escritorio de Trabajo', 8, 15000.00, 120000.00, 18.0, 21600.00, 141600.00);

-- Líneas para compra 17
INSERT INTO lineas_transaccion (id, transaccion_id, producto_id, producto_nombre, cantidad, precio_unitario, subtotal, impuesto_porcentaje, impuesto_monto, total) VALUES
(29, 17, 66, 'Escritorio Ejecutivo', 3, 25000.00, 75000.00, 18.0, 13500.00, 88500.00),
(30, 17, 70, 'Estante para Oficina', 5, 6500.00, 32500.00, 18.0, 5850.00, 38350.00),
(31, 17, 68, 'Silla de Oficina Ergonómica', 6, 8000.00, 48000.00, 18.0, 8640.00, 56640.00);

-- Líneas para compra 18 (Muebles Tradicionales - Lote 2)
INSERT INTO lineas_transaccion (id, transaccion_id, producto_id, producto_nombre, cantidad, precio_unitario, subtotal, impuesto_porcentaje, impuesto_monto, total) VALUES
(32, 18, 33, 'Buffet 2 puertas', 3, 25000.00, 75000.00, 18.0, 13500.00, 88500.00),
(33, 18, 34, 'Buffet 3 puertas', 2, 32000.00, 64000.00, 18.0, 11520.00, 75520.00),
(34, 18, 35, 'Vitrina 2 niveles', 3, 35000.00, 105000.00, 18.0, 18900.00, 123900.00);

-- Líneas para compra 19
INSERT INTO lineas_transaccion (id, transaccion_id, producto_id, producto_nombre, cantidad, precio_unitario, subtotal, impuesto_porcentaje, impuesto_monto, total) VALUES
(35, 19, 31, 'Juego de Comedor 6 plazas', 2, 65000.00, 130000.00, 18.0, 23400.00, 153400.00),
(36, 19, 32, 'Juego de Comedor 8 plazas', 1, 80000.00, 80000.00, 18.0, 14400.00, 94400.00),
(37, 19, 30, 'Silla de Comedor sin Brazos', 10, 3200.00, 32000.00, 18.0, 5760.00, 37760.00);

-- Líneas para compra 20 (Telas Dominicanas - Lote 2)
INSERT INTO lineas_transaccion (id, transaccion_id, producto_id, producto_nombre, cantidad, precio_unitario, subtotal, impuesto_porcentaje, impuesto_monto, total) VALUES
(38, 20, 56, 'Tela para Cortinas Floral', 50, 1200.00, 60000.00, 18.0, 10800.00, 70800.00),
(39, 20, 57, 'Tela para Cortinas Lisa', 80, 900.00, 72000.00, 18.0, 12960.00, 84960.00),
(40, 20, 58, 'Cortinas Romanas', 10, 2200.00, 22000.00, 18.0, 3960.00, 25960.00);

-- Líneas para compra 21
INSERT INTO lineas_transaccion (id, transaccion_id, producto_id, producto_nombre, cantidad, precio_unitario, subtotal, impuesto_porcentaje, impuesto_monto, total) VALUES
(41, 21, 59, 'Cortinas Paneles', 15, 1800.00, 27000.00, 18.0, 4860.00, 31860.00),
(42, 21, 60, 'Funda para Sofa', 20, 1500.00, 30000.00, 18.0, 5400.00, 35400.00),
(43, 21, 61, 'Funda para Silla', 100, 400.00, 40000.00, 18.0, 7200.00, 47200.00);

-- Líneas para compra 22
INSERT INTO lineas_transaccion (id, transaccion_id, producto_id, producto_nombre, cantidad, precio_unitario, subtotal, impuesto_porcentaje, impuesto_monto, total) VALUES
(44, 22, 62, 'Alfombra 2x3', 8, 3500.00, 28000.00, 18.0, 5040.00, 33040.00),
(45, 22, 63, 'Alfombra Redonda', 12, 2800.00, 33600.00, 18.0, 6048.00, 39648.00),
(46, 22, 64, 'Cojín Decorativo Grande', 30, 600.00, 18000.00, 18.0, 3240.00, 21240.00);

-- Líneas para compras de decoración
INSERT INTO lineas_transaccion (id, transaccion_id, producto_id, producto_nombre, cantidad, precio_unitario, subtotal, impuesto_porcentaje, impuesto_monto, total) VALUES
(47, 23, 46, 'Lámpara de Pie Moderna', 8, 4500.00, 36000.00, 18.0, 6480.00, 42480.00),
(48, 23, 47, 'Lámpara de Pie Clásica', 6, 3500.00, 21000.00, 18.0, 3780.00, 24780.00),
(49, 23, 48, 'Espejo Redondo', 10, 2500.00, 25000.00, 18.0, 4500.00, 29500.00);

-- Líneas para compra 24
INSERT INTO lineas_transaccion (id, transaccion_id, producto_id, producto_nombre, cantidad, precio_unitario, subtotal, impuesto_porcentaje, impuesto_monto, total) VALUES
(50, 24, 49, 'Espejo Rectangular', 15, 2000.00, 30000.00, 18.0, 5400.00, 35400.00),
(51, 24, 50, 'Jarrón de Cerámica Grande', 12, 1800.00, 21600.00, 18.0, 3888.00, 25488.00),
(52, 24, 51, 'Jarrón de Vidrio', 20, 1200.00, 24000.00, 18.0, 4320.00, 28320.00);

-- Líneas para compra 25
INSERT INTO lineas_transaccion (id, transaccion_id, producto_id, producto_nombre, cantidad, precio_unitario, subtotal, impuesto_porcentaje, impuesto_monto, total) VALUES
(53, 25, 52, 'Centro de Mesa', 50, 800.00, 40000.00, 18.0, 7200.00, 47200.00),
(54, 25, 53, 'Portarretratos', 40, 600.00, 24000.00, 18.0, 4320.00, 28320.00),
(55, 25, 54, 'Reloj de Pared', 15, 1500.00, 22500.00, 18.0, 4050.00, 26550.00);

-- Líneas para compras de iluminación
INSERT INTO lineas_transaccion (id, transaccion_id, producto_id, producto_nombre, cantidad, precio_unitario, subtotal, impuesto_porcentaje, impuesto_monto, total) VALUES
(56, 26, 11, 'Lámpara de Mesa Moderna', 15, 2500.00, 37500.00, 18.0, 6750.00, 44250.00),
(57, 26, 46, 'Lámpara de Pie Moderna', 5, 4500.00, 22500.00, 18.0, 4050.00, 26550.00),
(58, 26, 47, 'Lámpara de Pie Clásica', 4, 3500.00, 14000.00, 18.0, 2520.00, 16520.00);

-- Líneas para compra 27
INSERT INTO lineas_transaccion (id, transaccion_id, producto_id, producto_nombre, cantidad, precio_unitario, subtotal, impuesto_porcentaje, impuesto_monto, total) VALUES
(59, 27, 90, 'Guirnalda Luminosa', 25, 600.00, 15000.00, 18.0, 2700.00, 17700.00),
(60, 27, 85, 'Set de Velas', 50, 600.00, 30000.00, 18.0, 5400.00, 35400.00),
(61, 27, 88, 'Reloj de Mesa', 30, 350.00, 10500.00, 18.0, 1890.00, 12390.00);

-- ========================================================================================
-- FIN MIGRACIÓN R__05A
-- Total adicional: 17 transacciones de compra, 51 líneas de transacción
-- Total acumulado: 23 transacciones de compra, 61 líneas de transacción
-- ========================================================================================
