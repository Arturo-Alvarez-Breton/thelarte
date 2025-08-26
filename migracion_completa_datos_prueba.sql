-- ========================================================================================
-- MIGRACIÓN COMPLETA DE DATOS DE PRUEBA - THE LARTE
-- Sistema de gestión de muebles y decoración
--
-- Este script crea datos de prueba significativos y conectados entre sí para:
-- • Empleados con diferentes roles
-- • Clientes con información detallada
-- • Proveedores especializados
-- • Productos de diferentes categorías
-- • Transacciones de compra y venta conectadas
-- • Movimientos de inventario
-- • Sistema de pagos y cuotas
-- ========================================================================================

-- ===== LIMPIEZA DE DATOS EXISTENTES =====
DELETE FROM pagos;
DELETE FROM lineas_transaccion;
DELETE FROM transacciones;
DELETE FROM movimientos_producto;
DELETE FROM producto;
DELETE FROM suplidor_telefonos;
DELETE FROM suplidor;
DELETE FROM user_roles;
DELETE FROM users;
DELETE FROM clientes;
DELETE FROM empleados;

-- ===== 1. DATOS DE EMPLEADOS =====
INSERT INTO empleados (cedula, nombre, apellido, telefono, email, rol, salario, comision, fecha_contratacion, deleted) VALUES
-- Gerencia y Administración
('001-1234567-1', 'Carlos', 'Mendoza', '809-555-1001', 'carlos.mendoza@thelarte.com', 'ADMIN', 45000.00, NULL, '2022-01-15', FALSE),
('001-1234567-2', 'Ana', 'García', '809-555-1002', 'ana.garcia@thelarte.com', 'ADMIN', 42000.00, NULL, '2022-03-20', FALSE),

-- Equipo de Ventas (Comerciales)
('002-2345678-1', 'Edwin', 'Brito', '809-555-2001', 'edwin.brito@thelarte.com', 'COMERCIAL', 25000.00, 12.0, '2023-01-15', FALSE),
('002-2345678-2', 'Luis', 'Martínez', '809-555-2002', 'luis.martinez@thelarte.com', 'COMERCIAL', 26000.00, 15.0, '2023-02-10', FALSE),
('002-2345678-3', 'Arturo', 'Breton', '809-555-2003', 'arturo.breton@thelarte.com', 'COMERCIAL', 24000.00, 10.0, '2023-06-01', FALSE),
('002-2345678-4', 'María', 'Sánchez', '809-555-2004', 'maria.sanchez@thelarte.com', 'COMERCIAL', 23000.00, 8.0, '2023-08-15', FALSE),

-- Equipo Técnico
('003-3456789-1', 'Juan', 'Pérez', '809-555-3001', 'juan.perez@thelarte.com', 'TI', 32000.00, NULL, '2023-03-10', FALSE),
('003-3456789-2', 'María', 'Rodríguez', '809-555-3002', 'maria.rodriguez@thelarte.com', 'TI', 28000.00, NULL, '2023-05-20', FALSE),

-- Equipo de Caja y Contabilidad
('004-4567890-1', 'Carla', 'Santos', '809-555-4001', 'carla.santos@thelarte.com', 'CAJERO', 18000.00, NULL, '2023-07-01', FALSE),
('004-4567890-2', 'Pedro', 'López', '809-555-4002', 'pedro.lopez@thelarte.com', 'CAJERO', 17500.00, NULL, '2023-09-15', FALSE);

-- ===== 2. DATOS DE USUARIOS Y ROLES =====
INSERT INTO users (username, password, active, empleado_cedula) VALUES
-- Usuarios de empleados
('carlosmendoza', '$2a$10$passwordHash123', TRUE, '001-1234567-1'),
('anagarcia', '$2a$10$passwordHash123', TRUE, '001-1234567-2'),
('edwinbrito', '$2a$10$passwordHash123', TRUE, '002-2345678-1'),
('luismartinez', '$2a$10$passwordHash123', TRUE, '002-2345678-2'),
('arturobreton', '$2a$10$passwordHash123', TRUE, '002-2345678-3'),
('mariasanchez', '$2a$10$passwordHash123', TRUE, '002-2345678-4'),
('juanperez', '$2a$10$passwordHash123', TRUE, '003-3456789-1'),
('mariarodriguez', '$2a$10$passwordHash123', TRUE, '003-3456789-2'),
('carlasantos', '$2a$10$passwordHash123', TRUE, '004-4567890-1'),
('pedrolopez', '$2a$10$passwordHash123', TRUE, '004-4567890-2'),
-- Usuarios administrativos sin empleados
('adminroot', '$2a$10$passwordHash123', TRUE, NULL),
('testuser', '$2a$10$passwordHash123', TRUE, NULL);

-- Asignación de roles
INSERT INTO user_roles (user_id, role) VALUES
-- Gerentes
((SELECT id FROM users WHERE username = 'carlosmendoza'), 'GERENTE'),
((SELECT id FROM users WHERE username = 'anagarcia'), 'GERENTE'),
((SELECT id FROM users WHERE username = 'adminroot'), 'GERENTE'),

-- Vendedores
((SELECT id FROM users WHERE username = 'edwinbrito'), 'VENDEDOR'),
((SELECT id FROM users WHERE username = 'luismartinez'), 'VENDEDOR'),
((SELECT id FROM users WHERE username = 'arturobreton'), 'VENDEDOR'),
((SELECT id FROM users WHERE username = 'mariasanchez'), 'VENDEDOR'),
((SELECT id FROM users WHERE username = 'testuser'), 'VENDEDOR'),

-- TI
((SELECT id FROM users WHERE username = 'juanperez'), 'TI'),
((SELECT id FROM users WHERE username = 'mariarodriguez'), 'TI'),

-- Contabilidad
((SELECT id FROM users WHERE username = 'carlasantos'), 'CONTABILIDAD'),
((SELECT id FROM users WHERE username = 'pedrolopez'), 'CONTABILIDAD');

-- ===== 3. DATOS DE CLIENTES =====
INSERT INTO clientes (cedula, nombre, apellido, telefono, email, direccion, fecha_registro, deleted) VALUES
-- Clientes residenciales
('050-1234567-1', 'Roberto', 'Fernández', '829-555-1111', 'roberto.fernandez@email.com', 'Av. Independencia #100, Santo Domingo', '2023-01-15', FALSE),
('050-1234567-2', 'Luisa', 'Gómez', '829-555-2222', 'luisa.gomez@email.com', 'Calle Duarte #55, Santiago', '2023-02-20', FALSE),
('050-1234567-3', 'José', 'Martínez', '829-555-3333', 'jose.martinez@email.com', 'Calle El Sol #10, La Vega', '2023-03-10', FALSE),
('050-1234567-4', 'María', 'López', '829-555-4444', 'maria.lopez@email.com', 'Av. 27 de Febrero #200, Santo Domingo', '2023-04-05', FALSE),
('050-1234567-5', 'Carlos', 'Hernández', '829-555-5555', 'carlos.hernandez@email.com', 'Calle Restauración #75, Santiago', '2023-05-12', FALSE),

-- Clientes comerciales
('060-2345678-1', 'Ana', 'Vásquez', '809-555-6666', 'ana.vasquez@hotelparadiso.com', 'Av. Las Américas #500, Santo Domingo (Hotel Paraíso)', '2023-06-01', FALSE),
('060-2345678-2', 'Miguel', 'Santos', '809-555-7777', 'miguel.santos@restaurantedelmar.com', 'Calle El Conde #25, Santo Domingo (Restaurante del Mar)', '2023-07-15', FALSE),
('060-2345678-3', 'Carmen', 'Díaz', '809-555-8888', 'carmen.diaz@clinicasantamaria.com', 'Av. Abraham Lincoln #300, Santo Domingo (Clínica Santa María)', '2023-08-20', FALSE),

-- Clientes de decoración y diseño
('070-3456789-1', 'Patricia', 'Ramírez', '849-555-9999', 'patricia.ramirez@decoracionesdr.com', 'Calle Arzobispo Meriño #150, Santo Domingo', '2023-09-10', FALSE),
('070-3456789-2', 'Ricardo', 'Alvarez', '849-555-0000', 'ricardo.alvarez@arquitectura.com', 'Plaza de la Cultura, Santo Domingo', '2023-10-05', FALSE);

-- ===== 4. DATOS DE PROVEEDORES =====
INSERT INTO suplidor (id, nombre, email, ciudad, direccion, rnc, activo, pais) VALUES
-- Proveedores de Muebles
(1, 'Muebles del Caribe S.A.', 'ventas@mueblesdelcaribe.com', 'Santo Domingo', 'Av. Charles de Gaulle #50, Zona Industrial', '1-23-45678-9', TRUE, 'República Dominicana'),
(2, 'Diseños Modernos C. por A.', 'info@disenosmodernos.com', 'Santiago', 'Calle 30 de Marzo #200, Santiago', '1-34-56789-0', TRUE, 'República Dominicana'),
(3, 'Muebles Tradicionales S.R.L.', 'contacto@mueblestradicionales.com', 'La Vega', 'Carretera Moca #100, La Vega', '1-45-67890-1', TRUE, 'República Dominicana'),

-- Proveedores de Telas y Tapicería
(4, 'Telas Dominicanas S.A.', 'ventas@telasdominicanas.com', 'Santo Domingo', 'Av. John F. Kennedy #300, Santo Domingo', '1-56-78901-2', TRUE, 'República Dominicana'),
(5, 'Tapicería del Este', 'info@tapiceriadeleste.com', 'Higüey', 'Calle Principal #75, Higüey', '1-67-89012-3', TRUE, 'República Dominicana'),

-- Proveedores de Accesorios
(6, 'Decoraciones y Accesorios C.A.', 'ventas@decoraciones.com', 'Santiago', 'Av. Estrella Sadhalá #400, Santiago', '1-78-90123-4', TRUE, 'República Dominicana'),
(7, 'Iluminación Moderna S.R.L.', 'contacto@iluminacionmoderna.com', 'Santo Domingo', 'Calle Isabel la Católica #125, Santo Domingo', '1-89-01234-5', TRUE, 'República Dominicana');

-- Teléfonos de proveedores
INSERT INTO suplidor_telefonos (suplidor_id, telefonos) VALUES
(1, '809-555-1000'), (1, '809-555-1001'),
(2, '809-555-2000'),
(3, '809-555-3000'), (3, '829-555-3001'),
(4, '809-555-4000'), (4, '809-555-4001'),
(5, '809-555-5000'),
(6, '809-555-6000'),
(7, '809-555-7000'), (7, '829-555-7001');

-- ===== 5. DATOS DE PRODUCTOS =====
INSERT INTO producto (id, nombre, tipo, descripcion, itbis, precio_compra, precio_venta, foto_url, cantidad_disponible, cantidad_almacen, cantidad_reservada, cantidad_danada, cantidad_devuelta, estado, eliminado, fecha_creacion) VALUES
-- MUEBLES DE SALA
(1, 'Sofá 3 plazas Moderno', 'Muebles', 'Sofá de 3 plazas en tela beige, diseño moderno y elegante', 18.0, 25000.00, 45000.00, '/uploads/muebles/sofa-moderno.jpg', 8, 2, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-01-15 10:00:00'),
(2, 'Sofá 2 plazas Clásico', 'Muebles', 'Sofá de 2 plazas estilo clásico en cuero marrón', 18.0, 18000.00, 32000.00, '/uploads/muebles/sofa-clasico.jpg', 5, 1, 1, 0, 0, 'DISPONIBLE', FALSE, '2023-02-01 10:00:00'),
(3, 'Mesa de Centro Rectangular', 'Muebles', 'Mesa de centro rectangular en madera maciza', 18.0, 8000.00, 15000.00, '/uploads/muebles/mesa-centro.jpg', 12, 3, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-01-20 10:00:00'),
(4, 'Mesa de Centro Redonda', 'Muebles', 'Mesa de centro redonda con base en hierro forjado', 18.0, 6000.00, 12000.00, '/uploads/muebles/mesa-centro-redonda.jpg', 6, 2, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-02-10 10:00:00'),

-- MUEBLES DE COMEDOR
(5, 'Mesa de Comedor 6 plazas', 'Muebles', 'Mesa de comedor extensible para 6 plazas en madera caoba', 18.0, 35000.00, 65000.00, '/uploads/muebles/mesa-comedor.jpg', 3, 1, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-01-25 10:00:00'),
(6, 'Silla de Comedor Premium', 'Muebles', 'Silla de comedor tapizada en tela azul marino', 18.0, 3500.00, 7500.00, '/uploads/muebles/silla-comedor.jpg', 24, 6, 2, 0, 0, 'DISPONIBLE', FALSE, '2023-02-05 10:00:00'),
(7, 'Juego de Comedor 4 plazas', 'Muebles', 'Juego completo: mesa + 4 sillas en estilo moderno', 18.0, 45000.00, 85000.00, '/uploads/muebles/juego-comedor.jpg', 2, 0, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-03-01 10:00:00'),

-- MUEBLES DE DORMITORIO
(8, 'Cama King Size Moderna', 'Muebles', 'Cama king size con cabecero tapizado', 18.0, 28000.00, 52000.00, '/uploads/muebles/cama-king.jpg', 4, 1, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-02-15 10:00:00'),
(9, 'Armario 3 puertas', 'Muebles', 'Armario de 3 puertas en madera melamina blanca', 18.0, 15000.00, 28000.00, '/uploads/muebles/armario-3puertas.jpg', 7, 2, 0, 1, 0, 'DISPONIBLE', FALSE, '2023-01-30 10:00:00'),
(10, 'Cómoda 5 cajones', 'Muebles', 'Cómoda de 5 cajones en estilo rústico', 18.0, 12000.00, 22000.00, '/uploads/muebles/comoda.jpg', 9, 3, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-03-05 10:00:00'),

-- DECORACIÓN Y ACCESORIOS
(11, 'Lámpara de Mesa Moderna', 'Decoración', 'Lámpara de mesa con base en cerámica blanca', 18.0, 2500.00, 5500.00, '/uploads/decoracion/lampara-mesa.jpg', 15, 5, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-02-20 10:00:00'),
(12, 'Espejo Decorativo Grande', 'Decoración', 'Espejo decorativo con marco dorado', 18.0, 4000.00, 8500.00, '/uploads/decoracion/espejo-decorativo.jpg', 8, 2, 1, 0, 0, 'DISPONIBLE', FALSE, '2023-03-10 10:00:00'),
(13, 'Jarrón de Cerámica', 'Decoración', 'Jarrón de cerámica artesanal mediano', 18.0, 1200.00, 2800.00, '/uploads/decoracion/jarron-ceramica.jpg', 20, 8, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-01-10 10:00:00'),

-- TELAS Y TAPICERÍA
(14, 'Tela para Sofá Premium', 'Telas', 'Tela resistente para tapicería de sofás, color beige', 18.0, 800.00, 1800.00, '/uploads/telas/tela-sofa.jpg', 50, 20, 5, 0, 0, 'DISPONIBLE', FALSE, '2023-02-25 10:00:00'),
(15, 'Cortinas Modernas', 'Telas', 'Cortinas roller modernas color gris', 18.0, 1500.00, 3200.00, '/uploads/telas/cortinas.jpg', 30, 10, 2, 0, 0, 'DISPONIBLE', FALSE, '2023-03-15 10:00:00');

-- ===== 6. TRANSACCIONES DE COMPRA =====
-- Compra inicial de muebles a Muebles del Caribe
INSERT INTO transacciones (id, tipo, fecha, estado, contraparte_id, tipo_contraparte, contraparte_nombre, subtotal, impuestos, total, numero_factura, tipo_pago, metodo_pago, observaciones, deleted, fecha_creacion, vendedor_id) VALUES
(1, 'COMPRA', '2023-01-15 09:00:00', 'COMPLETADA', 1, 'SUPLIDOR', 'Muebles del Caribe S.A.', 105000.00, 18900.00, 123900.00, 'C001-001', 'NORMAL', 'TRANSFERENCIA', 'Compra inicial de muebles para showroom', FALSE, '2023-01-15 09:00:00', NULL),
(2, 'COMPRA', '2023-02-01 10:30:00', 'COMPLETADA', 2, 'SUPLIDOR', 'Diseños Modernos C. por A.', 75000.00, 13500.00, 88500.00, 'C002-001', 'NORMAL', 'CHEQUE', 'Compra de sofás y mesas modernas', FALSE, '2023-02-01 10:30:00', NULL),
(3, 'COMPRA', '2023-02-10 14:00:00', 'COMPLETADA', 3, 'SUPLIDOR', 'Muebles Tradicionales S.R.L.', 48000.00, 8640.00, 56640.00, 'C003-001', 'NORMAL', 'EFECTIVO', 'Compra de mesas tradicionales', FALSE, '2023-02-10 14:00:00', NULL),
(4, 'COMPRA', '2023-02-20 11:15:00', 'COMPLETADA', 4, 'SUPLIDOR', 'Telas Dominicanas S.A.', 25000.00, 4500.00, 29500.00, 'C004-001', 'NORMAL', 'TRANSFERENCIA', 'Compra de telas para tapicería', FALSE, '2023-02-20 11:15:00', NULL);

-- Líneas de las compras
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

-- ===== 7. TRANSACCIONES DE VENTA =====
-- Ventas a clientes residenciales
INSERT INTO transacciones (id, tipo, fecha, estado, contraparte_id, tipo_contraparte, contraparte_nombre, subtotal, impuestos, total, numero_factura, tipo_pago, metodo_pago, observaciones, deleted, fecha_creacion, vendedor_id, direccion_entrega) VALUES
(5, 'VENTA', '2023-03-01 15:00:00', 'COMPLETADA', 1, 'CLIENTE', 'Roberto Fernández', 45000.00, 8100.00, 53100.00, 'V001-001', 'NORMAL', 'EFECTIVO', 'Venta de sofá para sala', FALSE, '2023-03-01 15:00:00', 2, 'Av. Independencia #100, Santo Domingo'),
(6, 'VENTA', '2023-03-05 16:30:00', 'COMPLETADA', 2, 'CLIENTE', 'Luisa Gómez', 32000.00, 5760.00, 37760.00, 'V002-001', 'NORMAL', 'TARJETA', 'Venta de sofá clásico', FALSE, '2023-03-05 16:30:00', 3, 'Calle Duarte #55, Santiago'),
(7, 'VENTA', '2023-03-10 14:00:00', 'COMPLETADA', 3, 'CLIENTE', 'José Martínez', 15000.00, 2700.00, 17700.00, 'V003-001', 'NORMAL', 'TRANSFERENCIA', 'Venta de mesa de centro', FALSE, '2023-03-10 14:00:00', 4, 'Calle El Sol #10, La Vega'),

-- Venta a cliente comercial con pago en cuotas
(8, 'VENTA', '2023-03-15 11:00:00', 'CONFIRMADA', 6, 'CLIENTE', 'Ana Vásquez', 85000.00, 15300.00, 100300.00, 'V004-001', 'ENCUOTAS', 'CHEQUE', 'Venta de juego de comedor para hotel', FALSE, '2023-03-15 11:00:00', 2, 'Av. Las Américas #500, Santo Domingo (Hotel Paraíso)'),
(9, 'VENTA', '2023-03-20 10:30:00', 'COMPLETADA', 7, 'CLIENTE', 'Miguel Santos', 28000.00, 5040.00, 33040.00, 'V005-001', 'NORMAL', 'EFECTIVO', 'Venta de armario para restaurante', FALSE, '2023-03-20 10:30:00', 3, 'Calle El Conde #25, Santo Domingo (Restaurante del Mar)');

-- Líneas de las ventas
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

-- ===== 8. PAGOS PARA VENTAS EN CUOTAS =====
INSERT INTO pagos (id, transaccion_id, fecha, monto, metodo_pago, estado, numero_cuota, observaciones, fecha_creacion) VALUES
-- Venta 8: Ana Vásquez - 3 cuotas
(1, 8, '2023-03-15', 25000.00, 'CHEQUE', 'COMPLETADO', 1, 'Pago inicial - 25% del total', '2023-03-15 11:00:00'),
(2, 8, '2023-04-15', 25000.00, 'CHEQUE', 'COMPLETADO', 2, 'Segunda cuota - 25% del total', '2023-04-15 09:00:00'),
(3, 8, '2023-05-15', 25000.00, 'CHEQUE', 'COMPLETADO', 3, 'Tercera cuota - 25% del total', '2023-05-15 09:00:00'),
(4, 8, '2023-06-15', 25300.00, 'CHEQUE', 'PENDIENTE', 4, 'Cuota final con intereses', '2023-06-15 09:00:00');

-- Actualizar el saldo pendiente de la transacción 8
UPDATE transacciones SET saldo_pendiente = 25300.00, monto_inicial = 25000.00 WHERE id = 8;

-- ===== 9. MOVIMIENTOS DE INVENTARIO =====
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

-- ===== 10. TRANSACCIÓN DE DEVOLUCIÓN =====
INSERT INTO transacciones (id, tipo, fecha, estado, contraparte_id, tipo_contraparte, contraparte_nombre, subtotal, impuestos, total, numero_factura, tipo_pago, metodo_pago, observaciones, deleted, fecha_creacion, transaccion_origen_id) VALUES
(10, 'DEVOLUCION_VENTA', '2023-04-05 14:00:00', 'COMPLETADA', 3, 'CLIENTE', 'José Martínez', 15000.00, 2700.00, 17700.00, 'DV001-001', 'NORMAL', 'EFECTIVO', 'Devolución de mesa de centro - cliente insatisfecho', FALSE, '2023-04-05 14:00:00', 7);

INSERT INTO lineas_transaccion (id, transaccion_id, producto_id, producto_nombre, cantidad, precio_unitario, subtotal, impuesto_porcentaje, impuesto_monto, total) VALUES
(16, 10, 3, 'Mesa de Centro Rectangular', 1, 15000.00, 15000.00, 18.0, 2700.00, 17700.00);

-- Movimiento por devolución
INSERT INTO movimientos_producto (id, producto_id, tipo, tipo_simple, cantidad, motivo, fecha, id_usuario) VALUES
(16, 3, 'ingreso_devolucion', 'INGRESO', 1, 'Devolución de José Martínez', '2023-04-05 14:00:00', '002-2345678-3');

-- ========================================================================================
-- RESUMEN DE DATOS CREADOS:
-- • 10 empleados con diferentes roles
-- • 10 usuarios del sistema
-- • 10 clientes (residenciales y comerciales)
-- • 7 proveedores con especialidades
-- • 15 productos de diferentes categorías
-- • 10 transacciones (4 compras, 5 ventas, 1 devolución)
-- • 16 líneas de transacción
-- • 4 pagos en cuotas
-- • 16 movimientos de inventario
--
-- Los datos están completamente conectados y representan un escenario realista
-- de un negocio de muebles y decoración.
-- ========================================================================================
