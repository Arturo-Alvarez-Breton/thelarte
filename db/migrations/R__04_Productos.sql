-- ========================================================================================
-- MIGRACIÓN R__04: PRODUCTOS
-- Sistema de gestión de muebles y decoración - The Larte
-- ========================================================================================

-- ===== DATOS DE PRODUCTOS =====
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

-- ========================================================================================
-- FIN MIGRACIÓN R__04
-- Total: 15 productos en 4 categorías principales
-- ========================================================================================
