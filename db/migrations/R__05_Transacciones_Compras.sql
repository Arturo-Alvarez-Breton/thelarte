-- ========================================================================================
-- MIGRACIÓN R__05: TRANSACCIONES DE COMPRA
-- Sistema de gestión de muebles y decoración - The Larte
-- ========================================================================================

-- ===== TRANSACCIONES DE COMPRA =====
-- Compra inicial de muebles a Muebles del Caribe
INSERT INTO transacciones (id, tipo, fecha, estado, contraparte_id, tipo_contraparte, contraparte_nombre, subtotal, impuestos, total, numero_factura, tipo_pago, metodo_pago, observaciones, deleted, fecha_creacion, vendedor_id) VALUES
(1, 'COMPRA', '2023-01-15 09:00:00', 'COMPLETADA', 1, 'SUPLIDOR', 'Muebles del Caribe S.A.', 105000.00, 18900.00, 123900.00, 'C001-001', 'NORMAL', 'TRANSFERENCIA', 'Compra inicial de muebles para showroom', FALSE, '2023-01-15 09:00:00', NULL),
(2, 'COMPRA', '2023-02-01 10:30:00', 'COMPLETADA', 2, 'SUPLIDOR', 'Diseños Modernos C. por A.', 75000.00, 13500.00, 88500.00, 'C002-001', 'NORMAL', 'CHEQUE', 'Compra de sofás y mesas modernas', FALSE, '2023-02-01 10:30:00', NULL),
(3, 'COMPRA', '2023-02-10 14:00:00', 'COMPLETADA', 3, 'SUPLIDOR', 'Muebles Tradicionales S.R.L.', 48000.00, 8640.00, 56640.00, 'C003-001', 'NORMAL', 'EFECTIVO', 'Compra de mesas tradicionales', FALSE, '2023-02-10 14:00:00', NULL),
(4, 'COMPRA', '2023-02-20 11:15:00', 'COMPLETADA', 4, 'SUPLIDOR', 'Telas Dominicanas S.A.', 25000.00, 4500.00, 29500.00, 'C004-001', 'NORMAL', 'TRANSFERENCIA', 'Compra de telas para tapicería', FALSE, '2023-02-20 11:15:00', NULL);

-- ===== LÍNEAS DE LAS COMPRAS =====
INSERT INTO lineas_transaccion (id, transaccion_id, producto_id, producto_nombre, cantidad, precio_unitario, subtotal, impuesto_porcentaje, impuesto_monto, total) VALUES
-- Compra 1: Muebles del Caribe
(1, 1, 1, 'Sofá 3 plazas Moderno', 2, 25000.00, 50000.00, 18.0, 9000.00, 59000.00),
(2, 1, 3, 'Mesa de Centro Rectangular', 3, 8000.00, 24000.00, 18.0, 4320.00, 28320.00),
(3, 1, 5, 'Mesa de Comedor 6 plazas', 1, 35000.00, 35000.00, 18.0, 6300.00, 41300.00),

-- Compra 2: Diseños Modernos
(4, 2, 2, 'Sofá 2 plazas Clásico', 2, 18000.00, 36000.00, 18.0, 6480.00, 42480.00),
(5, 2, 4, 'Mesa de Centro Redonda', 3, 6000.00, 18000.00, 18.0, 3240.00, 21240.00),
(6, 2, 6, 'Silla de Comedor Premium', 6, 3500.00, 21000.00, 18.0, 3780.00, 24780.00),

-- Compra 3: Muebles Tradicionales
(7, 3, 4, 'Mesa de Centro Redonda', 4, 6000.00, 24000.00, 18.0, 4320.00, 28320.00),
(8, 3, 3, 'Mesa de Centro Rectangular', 3, 8000.00, 24000.00, 18.0, 4320.00, 28320.00),

-- Compra 4: Telas Dominicanas
(9, 4, 14, 'Tela para Sofá Premium', 25, 800.00, 20000.00, 18.0, 3600.00, 23600.00),
(10, 4, 15, 'Cortinas Modernas', 5, 1500.00, 5000.00, 18.0, 900.00, 5900.00);

-- ========================================================================================
-- FIN MIGRACIÓN R__05
-- Total: 4 transacciones de compra, 10 líneas de transacción
-- ========================================================================================
