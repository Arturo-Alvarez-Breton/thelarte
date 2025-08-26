-- ========================================================================================
-- MIGRACIÓN R__13: RECREAR DATOS REDUCIDOS Y BIEN FORMATEADOS
-- Sistema de gestión de muebles y decoración - The Larte
-- ========================================================================================

-- ===== 1. EMPLEADOS (5 empleados básicos) =====
INSERT INTO empleados (cedula, nombre, apellido, telefono, email, rol, salario, comision, fecha_contratacion, deleted) VALUES
('001-0000000-1', 'Carlos', 'Mendoza', '809-555-1001', 'carlos.mendoza@thelarte.com', 'ADMINISTRADOR', 45000.00, NULL, '2022-01-15', FALSE),
('001-0000000-2', 'Ana', 'García', '809-555-1002', 'ana.garcia@thelarte.com', 'ADMINISTRADOR', 42000.00, NULL, '2022-03-20', FALSE),
('002-0000000-1', 'María', 'Sánchez', '809-555-2001', 'maria.sanchez@thelarte.com', 'VENDEDOR', 25000.00, 10.0, '2023-01-15', FALSE),
('003-0000000-1', 'Juan', 'Pérez', '809-555-3001', 'juan.perez@thelarte.com', 'TI', 32000.00, NULL, '2023-03-10', FALSE),
('004-0000000-1', 'Carla', 'Santos', '809-555-4001', 'carla.santos@thelarte.com', 'CONTABILIDAD', 18000.00, NULL, '2023-07-01', FALSE);

-- ===== 2. USUARIOS Y ROLES =====
-- Contraseña hasheada para "1234"
INSERT INTO users (username, password, active, empleado_cedula) VALUES
('carlosmendoza', '$2a$10$passwordHash123', TRUE, '001-0000000-1'),
('anagarcia', '$2a$10$passwordHash123', TRUE, '001-0000000-2'),
('mariasanchez', '$2a$10$passwordHash123', TRUE, '002-0000000-1'),
('juanperez', '$2a$10$passwordHash123', TRUE, '003-0000000-1'),
('carlasantos', '$2a$10$passwordHash123', TRUE, '004-0000000-1'),
('adminroot', '$2a$10$passwordHash123', TRUE, NULL);

-- Asignación de roles
INSERT INTO user_roles (user_id, role) VALUES
(1, 'ADMINISTRADOR'), (2, 'ADMINISTRADOR'), (3, 'VENDEDOR'),
(4, 'TI'), (5, 'CONTABILIDAD'), (6, 'ADMINISTRADOR');

-- ===== 3. PROVEEDORES (3 proveedores) =====
INSERT INTO proveedores (id, nombre, telefono, email, direccion, tipo_proveedor, activo) VALUES
(1, 'Muebles del Caribe', '809-555-5001', 'contacto@mueblescaribe.com', 'Santo Domingo, Rep. Dom.', 'MUEBLERIA', TRUE),
(2, 'Diseños Modernos', '809-555-5002', 'ventas@disenosmod.com', 'Santiago, Rep. Dom.', 'MUEBLERIA', TRUE),
(3, 'Decoraciones Elegantes', '809-555-5003', 'info@decoraciones.com', 'La Romana, Rep. Dom.', 'DECORACION', TRUE);

-- ===== 4. PRODUCTOS (8 productos) =====
INSERT INTO productos (id, nombre, descripcion, precio_compra, precio_venta, stock, stock_minimo, categoria, proveedor_id, activo) VALUES
(1, 'Sofá 3 plazas Moderno', 'Sofá moderno de 3 plazas en tela gris', 25000.00, 35000.00, 5, 2, 'SOFAS', 1, TRUE),
(2, 'Mesa de Centro Rectangular', 'Mesa de centro rectangular en madera', 8000.00, 12000.00, 8, 3, 'MESAS', 1, TRUE),
(3, 'Silla de Comedor Premium', 'Silla de comedor con tapizado premium', 3500.00, 5500.00, 12, 4, 'SILLAS', 2, TRUE),
(4, 'Mesa de Centro Redonda', 'Mesa de centro redonda de vidrio', 6000.00, 9000.00, 6, 2, 'MESAS', 2, TRUE),
(5, 'Tela para Sofá Premium', 'Tela premium para tapizado de sofás', 800.00, 1200.00, 25, 5, 'TELAS', 3, TRUE),
(6, 'Cortinas Modernas', 'Cortinas modernas para salón', 1500.00, 2200.00, 15, 3, 'CORTINAS', 3, TRUE),
(7, 'Mesa de Comedor 6 plazas', 'Mesa de comedor extensible 6 plazas', 35000.00, 50000.00, 3, 1, 'MESAS', 1, TRUE),
(8, 'Sofá 2 plazas Clásico', 'Sofá clásico de 2 plazas en cuero', 18000.00, 28000.00, 4, 2, 'SOFAS', 2, TRUE);

-- ===== 5. CLIENTES (5 clientes) =====
INSERT INTO clientes (id, cedula_rnc, nombre, apellido, telefono, email, direccion, tipo_cliente, limite_credito, activo) VALUES
(1, '001-1111111-1', 'Pedro', 'Martínez', '809-666-1001', 'pedro@email.com', 'Santo Domingo', 'REGULAR', 50000.00, TRUE),
(2, '001-2222222-2', 'María', 'López', '809-666-1002', 'maria@email.com', 'Santiago', 'REGULAR', 30000.00, TRUE),
(3, '001-3333333-3', 'Juan', 'Rodríguez', '809-666-1003', 'juan@email.com', 'La Vega', 'VIP', 100000.00, TRUE),
(4, '001-4444444-4', 'Ana', 'Gómez', '809-666-1004', 'ana@email.com', 'San Cristóbal', 'REGULAR', 25000.00, TRUE),
(5, '001-5555555-5', 'Carlos', 'Fernández', '809-666-1005', 'carlos@email.com', 'Puerto Plata', 'REGULAR', 40000.00, TRUE);

-- ===== 6. TRANSACCIONES DE COMPRA (2 compras) =====
INSERT INTO transacciones (id, tipo, fecha, estado, contraparte_id, tipo_contraparte, contraparte_nombre, subtotal, impuestos, total, numero_factura, tipo_pago, metodo_pago, observaciones, deleted, fecha_creacion) VALUES
(1, 'COMPRA', '2025-01-15 09:00:00', 'COMPLETADA', 1, 'PROVEEDOR', 'Muebles del Caribe', 33000.00, 5940.00, 38940.00, 'C001-001', 'NORMAL', 'TRANSFERENCIA', 'Compra inicial de muebles', FALSE, '2025-01-15 09:00:00'),
(2, 'COMPRA', '2025-01-20 14:30:00', 'COMPLETADA', 2, 'PROVEEDOR', 'Diseños Modernos', 23000.00, 4140.00, 27140.00, 'C001-002', 'NORMAL', 'CHEQUE', 'Compra de mesas y sillas', FALSE, '2025-01-20 14:30:00');

-- ===== 7. LÍNEAS DE COMPRA =====
INSERT INTO lineas_transaccion (id, transaccion_id, producto_id, producto_nombre, cantidad, precio_unitario, subtotal, impuesto_porcentaje, impuesto_monto, total) VALUES
(1, 1, 1, 'Sofá 3 plazas Moderno', 2, 25000.00, 50000.00, 18.0, 9000.00, 59000.00),
(2, 1, 2, 'Mesa de Centro Rectangular', 1, 8000.00, 8000.00, 18.0, 1440.00, 9440.00),
(3, 2, 3, 'Silla de Comedor Premium', 4, 3500.00, 14000.00, 18.0, 2520.00, 16520.00),
(4, 2, 4, 'Mesa de Centro Redonda', 2, 6000.00, 12000.00, 18.0, 2160.00, 14160.00);

-- ===== 8. TRANSACCIONES DE VENTA (2 ventas) =====
INSERT INTO transacciones (id, tipo, fecha, estado, contraparte_id, tipo_contraparte, contraparte_nombre, subtotal, impuestos, total, numero_factura, tipo_pago, metodo_pago, observaciones, deleted, fecha_creacion) VALUES
(3, 'VENTA', '2025-01-16 10:00:00', 'COMPLETADA', 1, 'CLIENTE', 'Pedro Martínez', 47000.00, 8460.00, 55460.00, 'V001-001', 'NORMAL', 'EFECTIVO', 'Venta de sofá y mesa', FALSE, '2025-01-16 10:00:00'),
(4, 'VENTA', '2025-01-22 15:45:00', 'COMPLETADA', 2, 'CLIENTE', 'María López', 22000.00, 3960.00, 25960.00, 'V001-002', 'NORMAL', 'TARJETA', 'Venta de sillas', FALSE, '2025-01-22 15:45:00');

-- ===== 9. LÍNEAS DE VENTA =====
INSERT INTO lineas_transaccion (id, transaccion_id, producto_id, producto_nombre, cantidad, precio_unitario, subtotal, impuesto_porcentaje, impuesto_monto, total) VALUES
(5, 3, 1, 'Sofá 3 plazas Moderno', 1, 35000.00, 35000.00, 18.0, 6300.00, 41300.00),
(6, 3, 2, 'Mesa de Centro Rectangular', 1, 12000.00, 12000.00, 18.0, 2160.00, 14160.00),
(7, 4, 3, 'Silla de Comedor Premium', 2, 5500.00, 11000.00, 18.0, 1980.00, 12980.00),
(8, 4, 4, 'Mesa de Centro Redonda', 2, 9000.00, 18000.00, 18.0, 3240.00, 21240.00);

-- ===== 10. PAGOS =====
INSERT INTO pagos (id, transaccion_id, fecha_pago, monto, metodo_pago, numero_referencia, estado, observaciones) VALUES
(1, 1, '2025-01-15 09:00:00', 38940.00, 'TRANSFERENCIA', 'TRF-001', 'COMPLETADO', 'Pago compra muebles'),
(2, 2, '2025-01-20 14:30:00', 27140.00, 'CHEQUE', 'CHQ-001', 'COMPLETADO', 'Pago compra mesas y sillas'),
(3, 3, '2025-01-16 10:00:00', 55460.00, 'EFECTIVO', 'EF-001', 'COMPLETADO', 'Pago venta sofá y mesa'),
(4, 4, '2025-01-22 15:45:00', 25960.00, 'TARJETA', 'TDC-001', 'COMPLETADO', 'Pago venta sillas');

-- ===== 11. MOVIMIENTOS DE PRODUCTO =====
INSERT INTO movimientos_producto (id, producto_id, tipo, cantidad, fecha, id_usuario, motivo, numero_referencia) VALUES
(1, 1, 'ENTRADA', 2, '2025-01-15 09:00:00', 1, 'COMPRA', 'C001-001'),
(2, 2, 'ENTRADA', 1, '2025-01-15 09:00:00', 1, 'COMPRA', 'C001-001'),
(3, 3, 'ENTRADA', 4, '2025-01-20 14:30:00', 1, 'COMPRA', 'C001-002'),
(4, 4, 'ENTRADA', 2, '2025-01-20 14:30:00', 1, 'COMPRA', 'C001-002'),
(5, 1, 'SALIDA', 1, '2025-01-16 10:00:00', 1, 'VENTA', 'V001-001'),
(6, 2, 'SALIDA', 1, '2025-01-16 10:00:00', 1, 'VENTA', 'V001-001'),
(7, 3, 'SALIDA', 2, '2025-01-22 15:45:00', 1, 'VENTA', 'V001-002'),
(8, 4, 'SALIDA', 2, '2025-01-22 15:45:00', 1, 'VENTA', 'V001-002');

-- ===== 12. VERIFICACIÓN FINAL =====
DO $$
DECLARE
    empleados_count INTEGER;
    usuarios_count INTEGER;
    productos_count INTEGER;
    transacciones_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO empleados_count FROM empleados;
    SELECT COUNT(*) INTO usuarios_count FROM users;
    SELECT COUNT(*) INTO productos_count FROM productos;
    SELECT COUNT(*) INTO transacciones_count FROM transacciones;

    RAISE NOTICE '=== VERIFICACIÓN DE DATOS RECREADOS ===';
    RAISE NOTICE 'Empleados: %', empleados_count;
    RAISE NOTICE 'Usuarios: %', usuarios_count;
    RAISE NOTICE 'Productos: %', productos_count;
    RAISE NOTICE 'Transacciones: %', transacciones_count;
    RAISE NOTICE '=====================================';
END $$;

-- ========================================================================================
-- FIN MIGRACIÓN R__13
-- Total: 5 empleados, 6 usuarios, 3 proveedores, 8 productos, 5 clientes, 4 transacciones
-- ========================================================================================
