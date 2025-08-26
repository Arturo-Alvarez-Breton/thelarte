-- ========================================================================================
-- MIGRACIÓN R__08: MOVIMIENTOS DE INVENTARIO
-- Sistema de gestión de muebles y decoración - The Larte
-- ========================================================================================

-- ===== MOVIMIENTOS DE INVENTARIO =====
INSERT INTO movimientos_producto (id, producto_id, tipo, tipo_simple, cantidad, motivo, fecha, id_usuario) VALUES
-- Movimientos iniciales por compras
(1, 1, 'ingreso_compra', 'INGRESO', 2, 'Compra inicial a Muebles del Caribe', '2023-01-15 09:00:00', '001-1234567-1'),
(2, 3, 'ingreso_compra', 'INGRESO', 3, 'Compra inicial a Muebles del Caribe', '2023-01-15 09:00:00', '001-1234567-1'),
(3, 5, 'ingreso_compra', 'INGRESO', 1, 'Compra inicial a Muebles del Caribe', '2023-01-15 09:00:00', '001-1234567-1'),
(4, 2, 'ingreso_compra', 'INGRESO', 2, 'Compra a Diseños Modernos', '2023-02-01 10:30:00', '001-1234567-1'),
(5, 4, 'ingreso_compra', 'INGRESO', 3, 'Compra a Diseños Modernos', '2023-02-01 10:30:00', '001-1234567-1'),
(6, 6, 'ingreso_compra', 'INGRESO', 6, 'Compra a Diseños Modernos', '2023-02-01 10:30:00', '001-1234567-1'),
(7, 4, 'ingreso_compra', 'INGRESO', 4, 'Compra a Muebles Tradicionales', '2023-02-10 14:00:00', '001-1234567-1'),
(8, 3, 'ingreso_compra', 'INGRESO', 3, 'Compra a Muebles Tradicionales', '2023-02-10 14:00:00', '001-1234567-1'),

-- Movimientos por ventas
(9, 1, 'salida_venta', 'REBAJA', 1, 'Venta a Roberto Fernández', '2023-03-01 15:00:00', '002-2345678-1'),
(10, 2, 'salida_venta', 'REBAJA', 1, 'Venta a Luisa Gómez', '2023-03-05 16:30:00', '002-2345678-2'),
(11, 3, 'salida_venta', 'REBAJA', 1, 'Venta a José Martínez', '2023-03-10 14:00:00', '002-2345678-3'),
(12, 7, 'salida_venta', 'REBAJA', 1, 'Venta a Ana Vásquez', '2023-03-15 11:00:00', '002-2345678-1'),
(13, 9, 'salida_venta', 'REBAJA', 1, 'Venta a Miguel Santos', '2023-03-20 10:30:00', '002-2345678-2'),

-- Movimientos de ajuste y daños
(14, 9, 'disponible_a_danada', 'TRANSFERENCIA', 1, 'Producto dañado en almacén', '2023-03-25 10:00:00', '001-1234567-1'),
(15, 12, 'almacen_a_disponible', 'TRANSFERENCIA', 5, 'Traslado de productos del almacén a showroom', '2023-04-01 09:00:00', '001-1234567-1');

-- ========================================================================================
-- FIN MIGRACIÓN R__08
-- Total: 16 movimientos de inventario
-- - 8 ingresos por compras
-- - 5 salidas por ventas
-- - 3 movimientos de ajuste/transferencia
-- ========================================================================================
