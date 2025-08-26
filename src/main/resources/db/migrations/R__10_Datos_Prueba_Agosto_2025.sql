-- ========================================================================================
-- MIGRACIÓN R__10: DATOS DE PRUEBA - MES COMPLETO DE AGOSTO 2025
-- Sistema de gestión de muebles y decoración - The Larte
-- ========================================================================================

-- ===== RESETEO DE SECUENCIAS PARA EVITAR CONFLICTOS DE ID =====
-- Resetear secuencia de productos
SELECT setval('producto_id_seq', COALESCE((SELECT MAX(id) FROM producto), 0) + 1, false);

-- Resetear secuencia de users
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 0) + 1, false);

-- Resetear secuencia de suplidor
SELECT setval('suplidor_id_seq', COALESCE((SELECT MAX(id) FROM suplidor), 0) + 1, false);

-- Resetear secuencia de transacciones
SELECT setval('transacciones_id_seq', COALESCE((SELECT MAX(id) FROM transacciones), 0) + 1, false);

-- Resetear secuencia de lineas_transaccion
SELECT setval('lineas_transaccion_id_seq', COALESCE((SELECT MAX(id) FROM lineas_transaccion), 0) + 1, false);

-- Resetear secuencia de pagos
SELECT setval('pagos_id_seq', COALESCE((SELECT MAX(id) FROM pagos), 0) + 1, false);

-- Resetear secuencia de usuarios_por_defecto
SELECT setval('usuarios_por_defecto_id_seq', COALESCE((SELECT MAX(id) FROM usuarios_por_defecto), 0) + 1, false);

-- ===== 1. PRODUCTOS ADICIONALES PARA PRUEBAS =====
INSERT INTO producto (codigo, nombre, tipo, descripcion, precio_compra, precio_venta, itbis, foto_url, cantidad_disponible, cantidad_almacen, cantidad_reservada, cantidad_danada, cantidad_devuelta, eliminado)
SELECT 'PROD-2025-001', 'Sofá 3 Piezas Moderno', 'Muebles', 'Sofá de 3 piezas en tela moderna, color beige', 45000.00, 65000.00, 18.0, '/images/productos/sofa-moderno.jpg', 15, 25, 0, 0, 0, FALSE
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE codigo = 'PROD-2025-001');

INSERT INTO producto (codigo, nombre, tipo, descripcion, precio_compra, precio_venta, itbis, foto_url, cantidad_disponible, cantidad_almacen, cantidad_reservada, cantidad_danada, cantidad_devuelta, eliminado)
SELECT 'PROD-2025-002', 'Mesa de Comedor 6 Sillas', 'Muebles', 'Mesa de comedor rectangular con 6 sillas en madera natural', 35000.00, 55000.00, 18.0, '/images/productos/mesa-comedor.jpg', 8, 12, 0, 0, 0, FALSE
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE codigo = 'PROD-2025-002');

INSERT INTO producto (codigo, nombre, tipo, descripcion, precio_compra, precio_venta, itbis, foto_url, cantidad_disponible, cantidad_almacen, cantidad_reservada, cantidad_danada, cantidad_devuelta, eliminado)
SELECT 'PROD-2025-003', 'Juego de Dormitorio King', 'Muebles', 'Juego de dormitorio king size: cama, 2 mesas de noche, cómoda', 75000.00, 120000.00, 18.0, '/images/productos/dormitorio-king.jpg', 5, 10, 0, 0, 0, FALSE
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE codigo = 'PROD-2025-003');

INSERT INTO producto (codigo, nombre, tipo, descripcion, precio_compra, precio_venta, itbis, foto_url, cantidad_disponible, cantidad_almacen, cantidad_reservada, cantidad_danada, cantidad_devuelta, eliminado)
SELECT 'PROD-2025-004', 'Silla Ejecutiva Ergonomica', 'Muebles', 'Silla ejecutiva ergonómica con soporte lumbar y ajustes', 12000.00, 18000.00, 18.0, '/images/productos/silla-ejecutiva.jpg', 20, 30, 0, 0, 0, FALSE
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE codigo = 'PROD-2025-004');

INSERT INTO producto (codigo, nombre, tipo, descripcion, precio_compra, precio_venta, itbis, foto_url, cantidad_disponible, cantidad_almacen, cantidad_reservada, cantidad_danada, cantidad_devuelta, eliminado)
SELECT 'PROD-2025-005', 'Lámpara de Pie Moderna', 'Decoración', 'Lámpara de pie con base metálica y pantalla de tela', 8500.00, 12500.00, 18.0, '/images/productos/lampara-pie.jpg', 12, 18, 0, 0, 0, FALSE
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE codigo = 'PROD-2025-005');

-- ===== 2. CLIENTES ADICIONALES PARA AGOSTO 2025 =====
INSERT INTO clientes (cedula, nombre, apellido, telefono, email, direccion, fecha_registro, deleted)
SELECT '001-2025-001', 'María', 'Fernández', '809-555-2001', 'maria.fernandez@email.com', 'Av. Independencia #123, Santo Domingo', '2025-01-15', FALSE
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '001-2025-001');

INSERT INTO clientes (cedula, nombre, apellido, telefono, email, direccion, fecha_registro, deleted)
SELECT '001-2025-002', 'José', 'Ramírez', '809-555-2002', 'jose.ramirez@email.com', 'Calle Las Mercedes #456, Santiago', '2025-02-20', FALSE
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '001-2025-002');

INSERT INTO clientes (cedula, nombre, apellido, telefono, email, direccion, fecha_registro, deleted)
SELECT '001-2025-003', 'Ana', 'Torres', '809-555-2003', 'ana.torres@email.com', 'Plaza de la Cultura, Santo Domingo', '2025-03-10', FALSE
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '001-2025-003');

INSERT INTO clientes (cedula, nombre, apellido, telefono, email, direccion, fecha_registro, deleted)
SELECT '001-2025-004', 'Carlos', 'Mendoza', '809-555-2004', 'carlos.mendoza@email.com', 'Zona Colonial, Santo Domingo', '2025-04-05', FALSE
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '001-2025-004');

INSERT INTO clientes (cedula, nombre, apellido, telefono, email, direccion, fecha_registro, deleted)
SELECT '001-2025-005', 'Laura', 'Guzmán', '809-555-2005', 'laura.guzman@email.com', 'Bella Vista, Santo Domingo', '2025-05-12', FALSE
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '001-2025-005');

-- ===== 3. PROVEEDORES ADICIONALES =====
INSERT INTO suplidor (nombre, email, ciudad, direccion, rnc, activo, pais)
SELECT 'Muebles del Caribe S.A.', 'ventas@mueblescaribe.com', 'Santo Domingo', 'Zona Industrial, Santo Domingo', '001-2025-SUP-001', TRUE, 'República Dominicana'
WHERE NOT EXISTS (SELECT 1 FROM suplidor WHERE rnc = '001-2025-SUP-001');

INSERT INTO suplidor (nombre, email, ciudad, direccion, rnc, activo, pais)
SELECT 'Decoraciones Premium SRL', 'info@decoracionespremium.com', 'Santo Domingo', 'Av. Abraham Lincoln, Santo Domingo', '001-2025-SUP-002', TRUE, 'República Dominicana'
WHERE NOT EXISTS (SELECT 1 FROM suplidor WHERE rnc = '001-2025-SUP-002');

-- ===== 4. TRANSACCIONES DE AGOSTO 2025 =====
-- Usar números de transacción fijos para evitar conflictos
-- COMP-2025-0001, COMP-2025-0002, VENT-2025-0001, etc.;

-- ===== COMPRAS DEL MES =====
-- Compra 1: 5 de agosto, 2025
INSERT INTO transacciones (tipo, fecha, estado, contraparte_id, tipo_contraparte, contraparte_nombre, numero_factura, numero_transaccion, subtotal, impuestos, total, observaciones, fecha_creacion, fecha_actualizacion, deleted)
VALUES ('COMPRA', '2025-08-05 09:30:00', 'COMPLETADA', (SELECT s.id FROM suplidor s WHERE s.rnc = '001-2025-SUP-001'), 'SUPLIDOR', 'Muebles del Caribe S.A.', 'F-2025-0805-001', 'COMP-2025-0001', 225000.00, 40500.00, 265500.00, 'Compra de muebles para reposición de inventario', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, FALSE);

-- Líneas para la compra 1
INSERT INTO lineas_transaccion (transaccion_id, producto_id, producto_nombre, cantidad, precio_unitario, subtotal, impuesto_porcentaje, impuesto_monto, total)
SELECT
    (SELECT t.id FROM transacciones t WHERE t.numero_transaccion = 'COMP-2025-0001'),
    p.id, p.nombre, 5, p.precio_compra, (5 * p.precio_compra), p.itbis, (5 * p.precio_compra * p.itbis / 100), (5 * p.precio_compra * (1 + p.itbis / 100))
FROM producto p WHERE p.codigo = 'PROD-2025-001';

INSERT INTO lineas_transaccion (transaccion_id, producto_id, producto_nombre, cantidad, precio_unitario, subtotal, impuesto_porcentaje, impuesto_monto, total)
SELECT
    (SELECT t.id FROM transacciones t WHERE t.numero_transaccion = 'COMP-2025-0001'),
    p.id, p.nombre, 3, p.precio_compra, (3 * p.precio_compra), p.itbis, (3 * p.precio_compra * p.itbis / 100), (3 * p.precio_compra * (1 + p.itbis / 100))
FROM producto p WHERE p.codigo = 'PROD-2025-002';

-- Compra 2: 15 de agosto, 2025
INSERT INTO transacciones (tipo, fecha, estado, contraparte_id, tipo_contraparte, contraparte_nombre, numero_factura, numero_transaccion, subtotal, impuestos, total, observaciones, fecha_creacion, fecha_actualizacion, deleted)
VALUES ('COMPRA', '2025-08-15 14:20:00', 'COMPLETADA', (SELECT s.id FROM suplidor s WHERE s.rnc = '001-2025-SUP-002'), 'SUPLIDOR', 'Decoraciones Premium SRL', 'F-2025-0815-002', 'COMP-2025-0002', 76500.00, 13770.00, 90270.00, 'Compra de artículos de decoración', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, FALSE);

INSERT INTO lineas_transaccion (transaccion_id, producto_id, producto_nombre, cantidad, precio_unitario, subtotal, impuesto_porcentaje, impuesto_monto, total)
SELECT
    (SELECT t.id FROM transacciones t WHERE t.numero_transaccion = 'COMP-2025-0002'),
    p.id, p.nombre, 10, p.precio_compra, (10 * p.precio_compra), p.itbis, (10 * p.precio_compra * p.itbis / 100), (10 * p.precio_compra * (1 + p.itbis / 100))
FROM producto p WHERE p.codigo = 'PROD-2025-005';

-- ===== VENTAS DEL MES =====
-- Venta 1: 8 de agosto, 2025
INSERT INTO transacciones (tipo, fecha, estado, contraparte_id, tipo_contraparte, contraparte_nombre, numero_factura, numero_transaccion, subtotal, impuestos, total, vendedor_id, observaciones, fecha_creacion, fecha_actualizacion, deleted)
VALUES ('VENTA', '2025-08-08 11:15:00', 'COMPLETADA', 1001, 'CLIENTE', 'María Fernández', 'V-2025-0808-001', 'VENT-2025-0001', 125000.00, 22500.00, 147500.00, (SELECT u.id FROM users u WHERE u.username = 'edwinbrito'), 'Venta de sofá y lámpara', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, FALSE);

INSERT INTO lineas_transaccion (transaccion_id, producto_id, producto_nombre, cantidad, precio_unitario, subtotal, impuesto_porcentaje, impuesto_monto, total)
SELECT
    (SELECT t.id FROM transacciones t WHERE t.numero_transaccion = 'VENT-2025-0001'),
    p.id, p.nombre, 1, p.precio_venta, p.precio_venta, p.itbis, (p.precio_venta * p.itbis / 100), (p.precio_venta * (1 + p.itbis / 100))
FROM producto p WHERE p.codigo = 'PROD-2025-001';

INSERT INTO lineas_transaccion (transaccion_id, producto_id, producto_nombre, cantidad, precio_unitario, subtotal, impuesto_porcentaje, impuesto_monto, total)
SELECT
    (SELECT t.id FROM transacciones t WHERE t.numero_transaccion = 'VENT-2025-0001'),
    p.id, p.nombre, 2, p.precio_venta, (2 * p.precio_venta), p.itbis, (2 * p.precio_venta * p.itbis / 100), (2 * p.precio_venta * (1 + p.itbis / 100))
FROM producto p WHERE p.codigo = 'PROD-2025-005';

-- Venta 2: 12 de agosto, 2025
INSERT INTO transacciones (tipo, fecha, estado, contraparte_id, tipo_contraparte, contraparte_nombre, numero_factura, numero_transaccion, subtotal, impuestos, total, vendedor_id, observaciones, fecha_creacion, fecha_actualizacion, deleted)
VALUES ('VENTA', '2025-08-12 16:45:00', 'COMPLETADA', 1002, 'CLIENTE', 'José Ramírez', 'V-2025-0812-002', 'VENT-2025-0002', 55000.00, 9900.00, 64900.00, (SELECT u.id FROM users u WHERE u.username = 'luismartinez'), 'Venta de mesa de comedor', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, FALSE);

INSERT INTO lineas_transaccion (transaccion_id, producto_id, producto_nombre, cantidad, precio_unitario, subtotal, impuesto_porcentaje, impuesto_monto, total)
SELECT
    (SELECT t.id FROM transacciones t WHERE t.numero_transaccion = 'VENT-2025-0002'),
    p.id, p.nombre, 1, p.precio_venta, p.precio_venta, p.itbis, (p.precio_venta * p.itbis / 100), (p.precio_venta * (1 + p.itbis / 100))
FROM producto p WHERE p.codigo = 'PROD-2025-002';

-- Venta 3: 20 de agosto, 2025 - Venta en cuotas
INSERT INTO transacciones (tipo, fecha, estado, contraparte_id, tipo_contraparte, contraparte_nombre, numero_factura, numero_transaccion, subtotal, impuestos, total, vendedor_id, tipo_pago, monto_inicial, saldo_pendiente, observaciones, fecha_creacion, fecha_actualizacion, deleted)
VALUES ('VENTA', '2025-08-20 10:30:00', 'ENTREGADA', 1003, 'CLIENTE', 'Ana Torres', 'V-2025-0820-003', 'VENT-2025-0003', 120000.00, 21600.00, 141600.00, (SELECT u.id FROM users u WHERE u.username = 'arturobreton'), 'ENCUOTAS', 30000.00, 111600.00, 'Juego de dormitorio king size', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, FALSE);

INSERT INTO lineas_transaccion (transaccion_id, producto_id, producto_nombre, cantidad, precio_unitario, subtotal, impuesto_porcentaje, impuesto_monto, total)
SELECT
    (SELECT t.id FROM transacciones t WHERE t.numero_transaccion = 'VENT-2025-0003'),
    p.id, p.nombre, 1, p.precio_venta, p.precio_venta, p.itbis, (p.precio_venta * p.itbis / 100), (p.precio_venta * (1 + p.itbis / 100))
FROM producto p WHERE p.codigo = 'PROD-2025-003';

-- Venta 4: 25 de agosto, 2025
INSERT INTO transacciones (tipo, fecha, estado, contraparte_id, tipo_contraparte, contraparte_nombre, numero_factura, numero_transaccion, subtotal, impuestos, total, vendedor_id, observaciones, fecha_creacion, fecha_actualizacion, deleted)
VALUES ('VENTA', '2025-08-25 13:20:00', 'COMPLETADA', 1004, 'CLIENTE', 'Carlos Mendoza', 'V-2025-0825-004', 'VENT-2025-0004', 36000.00, 6480.00, 42480.00, (SELECT u.id FROM users u WHERE u.username = 'mariasanchez'), 'Venta de sillas ejecutivas', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, FALSE);

INSERT INTO lineas_transaccion (transaccion_id, producto_id, producto_nombre, cantidad, precio_unitario, subtotal, impuesto_porcentaje, impuesto_monto, total)
SELECT
    (SELECT t.id FROM transacciones t WHERE t.numero_transaccion = 'VENT-2025-0004'),
    p.id, p.nombre, 2, p.precio_venta, (2 * p.precio_venta), p.itbis, (2 * p.precio_venta * p.itbis / 100), (2 * p.precio_venta * (1 + p.itbis / 100))
FROM producto p WHERE p.codigo = 'PROD-2025-004';

-- Venta 5: 30 de agosto, 2025
INSERT INTO transacciones (tipo, fecha, estado, contraparte_id, tipo_contraparte, contraparte_nombre, numero_factura, numero_transaccion, subtotal, impuestos, total, vendedor_id, observaciones, fecha_creacion, fecha_actualizacion, deleted)
VALUES ('VENTA', '2025-08-30 15:10:00', 'COMPLETADA', 1005, 'CLIENTE', 'Laura Guzmán', 'V-2025-0830-005', 'VENT-2025-0005', 25000.00, 4500.00, 29500.00, (SELECT u.id FROM users u WHERE u.username = 'edwinbrito'), 'Venta de lámparas', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, FALSE);

INSERT INTO lineas_transaccion (transaccion_id, producto_id, producto_nombre, cantidad, precio_unitario, subtotal, impuesto_porcentaje, impuesto_monto, total)
SELECT
    (SELECT t.id FROM transacciones t WHERE t.numero_transaccion = 'VENT-2025-0005'),
    p.id, p.nombre, 2, p.precio_venta, (2 * p.precio_venta), p.itbis, (2 * p.precio_venta * p.itbis / 100), (2 * p.precio_venta * (1 + p.itbis / 100))
FROM producto p WHERE p.codigo = 'PROD-2025-005';

-- ===== PAGOS PARA VENTA EN CUOTAS =====
-- Pago inicial (ya registrado en la transacción)
INSERT INTO pagos (transaccion_id, fecha, monto, metodo_pago, estado, observaciones, numero_cuota, fecha_creacion, fecha_actualizacion)
SELECT
    (SELECT t.id FROM transacciones t WHERE t.numero_factura = 'V-2025-0820-003'),
    '2025-08-20', 30000.00, 'EFECTIVO', 'COMPLETADO', 'Pago inicial', 0,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP;

-- Pago segunda cuota
INSERT INTO pagos (transaccion_id, fecha, monto, metodo_pago, estado, observaciones, numero_cuota, fecha_creacion, fecha_actualizacion)
SELECT
    (SELECT t.id FROM transacciones t WHERE t.numero_factura = 'V-2025-0820-003'),
    '2025-08-25', 25000.00, 'TRANSFERENCIA', 'COMPLETADO', 'Segunda cuota', 1,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP;

-- Pago tercera cuota
INSERT INTO pagos (transaccion_id, fecha, monto, metodo_pago, estado, observaciones, numero_cuota, fecha_creacion, fecha_actualizacion)
SELECT
    (SELECT t.id FROM transacciones t WHERE t.numero_factura = 'V-2025-0820-003'),
    '2025-08-30', 20000.00, 'TARJETA', 'COMPLETADO', 'Tercera cuota', 2,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP;

-- Actualizar saldo pendiente después de los pagos
UPDATE transacciones
SET saldo_pendiente = 141600.00 - 30000.00 - 25000.00 - 20000.00
WHERE numero_factura = 'V-2025-0820-003';

-- ===== DEVOLUCIONES =====
-- Devolución 1: 28 de agosto, 2025
INSERT INTO transacciones (tipo, fecha, estado, contraparte_id, tipo_contraparte, contraparte_nombre, numero_factura, numero_transaccion, subtotal, impuestos, total, transaccion_origen_id, observaciones, fecha_creacion, fecha_actualizacion, deleted)
VALUES ('DEVOLUCION_VENTA', '2025-08-28 12:00:00', 'COMPLETADA',
    1001, 'CLIENTE', 'María Fernández',
    'DV-2025-0828-001', 'DEV-2025-0001', 12500.00, 2250.00, 14750.00,
    (SELECT t.id FROM transacciones t WHERE t.numero_factura = 'V-2025-0808-001'),
    'Devolución de una lámpara por defecto de fábrica', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, FALSE);

INSERT INTO lineas_transaccion (transaccion_id, producto_id, producto_nombre, cantidad, precio_unitario, subtotal, impuesto_porcentaje, impuesto_monto, total)
SELECT
    (SELECT t.id FROM transacciones t WHERE t.numero_transaccion = 'DEV-2025-0001'),
    p.id, p.nombre, 1, p.precio_venta, p.precio_venta, p.itbis, (p.precio_venta * p.itbis / 100), (p.precio_venta * (1 + p.itbis / 100))
FROM producto p WHERE p.codigo = 'PROD-2025-005';

-- ===== ACTUALIZACIÓN DE INVENTARIO =====
-- Actualizar inventario después de todas las transacciones
UPDATE producto
SET cantidad_disponible = cantidad_disponible - (
    SELECT COALESCE(SUM(lt.cantidad), 0)
    FROM lineas_transaccion lt
    JOIN transacciones t ON lt.transaccion_id = t.id
    WHERE lt.producto_id = producto.id
    AND t.tipo = 'VENTA'
    AND t.estado IN ('COMPLETADA', 'ENTREGADA', 'COBRADA', 'FACTURADA')
    AND DATE(t.fecha) >= '2025-08-01'
    AND DATE(t.fecha) <= '2025-08-31'
)
WHERE EXISTS (
    SELECT 1 FROM lineas_transaccion lt
    JOIN transacciones t ON lt.transaccion_id = t.id
    WHERE lt.producto_id = producto.id
    AND t.tipo = 'VENTA'
    AND t.estado IN ('COMPLETADA', 'ENTREGADA', 'COBRADA', 'FACTURADA')
    AND DATE(t.fecha) >= '2025-08-01'
    AND DATE(t.fecha) <= '2025-08-31'
);

-- ========================================================================================
-- RESUMEN DE DATOS CREADOS PARA AGOSTO 2025
-- ========================================================================================
-- Productos nuevos: 5
-- Clientes nuevos: 5
-- Proveedores nuevos: 2
-- Transacciones:
--   - Compras: 2 (5 y 15 de agosto)
--   - Ventas: 5 (8, 12, 20, 25, 30 de agosto)
--   - Devoluciones: 1 (28 de agosto)
--   - Pagos: 3 cuotas para venta en cuotas
--
-- Total ventas del mes: ~RD$ 405,480.00
-- Total compras del mes: ~RD$ 355,770.00
-- Utilidad estimada: ~RD$ 49,710.00
--
-- ========================================================================================
-- FIN MIGRACIÓN R__10
-- ========================================================================================
