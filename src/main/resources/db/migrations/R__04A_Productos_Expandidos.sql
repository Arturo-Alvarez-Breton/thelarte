-- ========================================================================================
-- MIGRACIÓN R__04A: PRODUCTOS EXPANDIDOS (Datos masivos)
-- Sistema de gestión de muebles y decoración - The Larte
-- ========================================================================================

-- ===== PRODUCTOS ADICIONALES (200+ productos) =====

-- ===== MUEBLES DE SALA ADICIONALES =====
INSERT INTO producto (id, nombre, tipo, descripcion, itbis, precio_compra, precio_venta, foto_url, cantidad_disponible, cantidad_almacen, cantidad_reservada, cantidad_danada, cantidad_devuelta, estado, eliminado, fecha_creacion) VALUES
(16, 'Sofá Chester Premium', 'Muebles', 'Sofá Chester de 3 plazas en cuero genuino color marrón', 18.0, 45000.00, 85000.00, '/uploads/muebles/sofa-chester.jpg', 4, 2, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-01-20 10:00:00'),
(17, 'Sofá Seccional Moderno', 'Muebles', 'Sofá seccional modular 5 piezas en tela gris', 18.0, 65000.00, 120000.00, '/uploads/muebles/sofa-seccional.jpg', 2, 1, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-02-01 10:00:00'),
(18, 'Sillón Reclinable', 'Muebles', 'Sillón reclinable individual en cuero negro', 18.0, 15000.00, 28000.00, '/uploads/muebles/sillon-reclinable.jpg', 8, 3, 1, 0, 0, 'DISPONIBLE', FALSE, '2023-02-15 10:00:00'),
(19, 'Sillón Voltaire', 'Muebles', 'Sillón Voltaire tapizado en tela damasco', 18.0, 12000.00, 22000.00, '/uploads/muebles/sillon-voltaire.jpg', 6, 2, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-03-01 10:00:00'),
(20, 'Puff Cuadrado', 'Muebles', 'Puff cuadrado tapizado en tela moderna', 18.0, 3000.00, 6500.00, '/uploads/muebles/puff-cuadrado.jpg', 12, 5, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-03-15 10:00:00'),
(21, 'Puff Redondo', 'Muebles', 'Puff redondo con estructura en hierro', 18.0, 3500.00, 7500.00, '/uploads/muebles/puff-redondo.jpg', 10, 4, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-04-01 10:00:00'),
(22, 'Mesa de Centro Rectangular Cristal', 'Muebles', 'Mesa de centro rectangular con tapa de cristal', 18.0, 12000.00, 22000.00, '/uploads/muebles/mesa-centro-cristal.jpg', 5, 2, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-04-15 10:00:00'),
(23, 'Mesa de Centro Redonda Madera', 'Muebles', 'Mesa de centro redonda en madera maciza', 18.0, 10000.00, 18500.00, '/uploads/muebles/mesa-centro-redonda-madera.jpg', 7, 3, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-05-01 10:00:00'),
(24, 'Mesa Lateral', 'Muebles', 'Mesa lateral auxiliar en estilo moderno', 18.0, 4500.00, 9500.00, '/uploads/muebles/mesa-lateral.jpg', 15, 6, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-05-15 10:00:00'),
(25, 'Estante para TV', 'Muebles', 'Estante para TV de 2.5m en madera melamina', 18.0, 8000.00, 15000.00, '/uploads/muebles/estante-tv.jpg', 6, 2, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-06-01 10:00:00');

-- ===== MUEBLES DE COMEDOR ADICIONALES =====
INSERT INTO producto (id, nombre, tipo, descripcion, itbis, precio_compra, precio_venta, foto_url, cantidad_disponible, cantidad_almacen, cantidad_reservada, cantidad_danada, cantidad_devuelta, estado, eliminado, fecha_creacion) VALUES
(26, 'Mesa de Comedor 8 plazas', 'Muebles', 'Mesa de comedor extensible para 8 plazas en roble', 18.0, 55000.00, 105000.00, '/uploads/muebles/mesa-comedor-8.jpg', 2, 1, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-01-25 10:00:00'),
(27, 'Mesa de Comedor Redonda', 'Muebles', 'Mesa de comedor redonda para 6 plazas', 18.0, 40000.00, 75000.00, '/uploads/muebles/mesa-comedor-redonda.jpg', 3, 1, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-02-10 10:00:00'),
(28, 'Mesa de Comedor Cuadrada', 'Muebles', 'Mesa de comedor cuadrada para 4 plazas', 18.0, 25000.00, 48000.00, '/uploads/muebles/mesa-comedor-cuadrada.jpg', 4, 2, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-03-01 10:00:00'),
(29, 'Silla de Comedor con Brazos', 'Muebles', 'Silla de comedor con brazos tapizada', 18.0, 4500.00, 9500.00, '/uploads/muebles/silla-comedor-brazos.jpg', 20, 8, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-03-15 10:00:00'),
(30, 'Silla de Comedor sin Brazos', 'Muebles', 'Silla de comedor sin brazos estilo nórdico', 18.0, 3200.00, 6800.00, '/uploads/muebles/silla-comedor-sin-brazos.jpg', 30, 12, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-04-01 10:00:00'),
(31, 'Juego de Comedor 6 plazas', 'Muebles', 'Juego completo: mesa + 6 sillas en roble', 18.0, 65000.00, 125000.00, '/uploads/muebles/juego-comedor-6.jpg', 1, 0, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-04-15 10:00:00'),
(32, 'Juego de Comedor 8 plazas', 'Muebles', 'Juego completo: mesa + 8 sillas extensible', 18.0, 80000.00, 155000.00, '/uploads/muebles/juego-comedor-8.jpg', 1, 0, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-05-01 10:00:00'),
(33, 'Buffet 2 puertas', 'Muebles', 'Buffet de comedor de 2 puertas en madera', 18.0, 25000.00, 48000.00, '/uploads/muebles/buffet-2puertas.jpg', 4, 2, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-05-15 10:00:00'),
(34, 'Buffet 3 puertas', 'Muebles', 'Buffet de comedor de 3 puertas con cajones', 18.0, 32000.00, 62000.00, '/uploads/muebles/buffet-3puertas.jpg', 3, 1, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-06-01 10:00:00'),
(35, 'Vitrina 2 niveles', 'Muebles', 'Vitrina de comedor de 2 niveles con puertas de cristal', 18.0, 35000.00, 68000.00, '/uploads/muebles/vitrina-2n.jpg', 2, 1, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-06-15 10:00:00');

-- ===== MUEBLES DE DORMITORIO ADICIONALES =====
INSERT INTO producto (id, nombre, tipo, descripcion, itbis, precio_compra, precio_venta, foto_url, cantidad_disponible, cantidad_almacen, cantidad_reservada, cantidad_danada, cantidad_devuelta, estado, eliminado, fecha_creacion) VALUES
(36, 'Cama King Size Rústica', 'Muebles', 'Cama king size estilo rústico con cabecero alto', 18.0, 35000.00, 65000.00, '/uploads/muebles/cama-king-rustica.jpg', 3, 1, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-02-20 10:00:00'),
(37, 'Cama Queen Size Moderna', 'Muebles', 'Cama queen size con diseño minimalista', 18.0, 25000.00, 46000.00, '/uploads/muebles/cama-queen-moderna.jpg', 5, 2, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-03-05 10:00:00'),
(38, 'Cama Individual Juvenil', 'Muebles', 'Cama individual para adolescentes', 18.0, 15000.00, 28000.00, '/uploads/muebles/cama-individual.jpg', 8, 3, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-03-20 10:00:00'),
(39, 'Armario 4 puertas', 'Muebles', 'Armario walk-in de 4 puertas con espejo', 18.0, 20000.00, 38000.00, '/uploads/muebles/armario-4puertas.jpg', 5, 2, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-04-01 10:00:00'),
(40, 'Armario 2 puertas', 'Muebles', 'Armario básico de 2 puertas en blanco', 18.0, 12000.00, 23000.00, '/uploads/muebles/armario-2puertas.jpg', 10, 4, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-04-15 10:00:00'),
(41, 'Cómoda 6 cajones', 'Muebles', 'Cómoda de 6 cajones con diseño elegante', 18.0, 15000.00, 28000.00, '/uploads/muebles/comoda-6cajones.jpg', 6, 2, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-05-01 10:00:00'),
(42, 'Cómoda 4 cajones', 'Muebles', 'Cómoda de 4 cajones compacta', 18.0, 10000.00, 18500.00, '/uploads/muebles/comoda-4cajones.jpg', 12, 5, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-05-15 10:00:00'),
(43, 'Velador 2 cajones', 'Muebles', 'Velador de noche con 2 cajones', 18.0, 5000.00, 9500.00, '/uploads/muebles/velador-2cajones.jpg', 18, 8, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-06-01 10:00:00'),
(44, 'Velador 3 cajones', 'Muebles', 'Velador de noche con 3 cajones', 18.0, 6500.00, 12500.00, '/uploads/muebles/velador-3cajones.jpg', 15, 6, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-06-15 10:00:00'),
(45, 'Espejo de Pared Decorativo', 'Decoración', 'Espejo decorativo para pared en marco dorado', 18.0, 3000.00, 6500.00, '/uploads/decoracion/espejo-pared.jpg', 20, 10, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-07-01 10:00:00');

-- ===== DECORACIÓN Y ACCESORIOS ADICIONALES =====
INSERT INTO producto (id, nombre, tipo, descripcion, itbis, precio_compra, precio_venta, foto_url, cantidad_disponible, cantidad_almacen, cantidad_reservada, cantidad_danada, cantidad_devuelta, estado, eliminado, fecha_creacion) VALUES
(46, 'Lámpara de Pie Moderna', 'Decoración', 'Lámpara de pie con base en metal negro', 18.0, 4500.00, 9500.00, '/uploads/decoracion/lampara-pie.jpg', 12, 5, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-02-25 10:00:00'),
(47, 'Lámpara de Pie Clásica', 'Decoración', 'Lámpara de pie estilo clásico con pantalla', 18.0, 3500.00, 7500.00, '/uploads/decoracion/lampara-pie-clasica.jpg', 8, 3, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-03-10 10:00:00'),
(48, 'Espejo Redondo', 'Decoración', 'Espejo decorativo redondo con marco plateado', 18.0, 2500.00, 5500.00, '/uploads/decoracion/espejo-redondo.jpg', 15, 7, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-03-25 10:00:00'),
(49, 'Espejo Rectangular', 'Decoración', 'Espejo rectangular moderno sin marco', 18.0, 2000.00, 4500.00, '/uploads/decoracion/espejo-rectangular.jpg', 18, 8, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-04-10 10:00:00'),
(50, 'Jarrón de Cerámica Grande', 'Decoración', 'Jarrón de cerámica grande para arreglos florales', 18.0, 1800.00, 3800.00, '/uploads/decoracion/jarron-grande.jpg', 25, 12, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-04-25 10:00:00'),
(51, 'Jarrón de Vidrio', 'Decoración', 'Jarrón de vidrio transparente mediano', 18.0, 1200.00, 2800.00, '/uploads/decoracion/jarron-vidrio.jpg', 30, 15, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-05-10 10:00:00'),
(52, 'Centro de Mesa', 'Decoración', 'Centro de mesa decorativo con velas', 18.0, 800.00, 1800.00, '/uploads/decoracion/centro-mesa.jpg', 40, 20, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-05-25 10:00:00'),
(53, 'Portarretratos', 'Decoración', 'Portarretratos familiar en marco de plata', 18.0, 600.00, 1500.00, '/uploads/decoracion/portarretratos.jpg', 35, 18, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-06-10 10:00:00'),
(54, 'Reloj de Pared', 'Decoración', 'Reloj de pared decorativo vintage', 18.0, 1500.00, 3200.00, '/uploads/decoracion/reloj-pared.jpg', 10, 5, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-06-25 10:00:00'),
(55, 'Cuadro Decorativo', 'Decoración', 'Cuadro abstracto para pared', 18.0, 1200.00, 2800.00, '/uploads/decoracion/cuadro-decorativo.jpg', 22, 10, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-07-10 10:00:00');

-- ===== TELAS Y TAPICERÍA ADICIONALES =====
INSERT INTO producto (id, nombre, tipo, descripcion, itbis, precio_compra, precio_venta, foto_url, cantidad_disponible, cantidad_almacen, cantidad_reservada, cantidad_danada, cantidad_devuelta, estado, eliminado, fecha_creacion) VALUES
(56, 'Tela para Cortinas Floral', 'Telas', 'Tela para cortinas con estampado floral', 18.0, 1200.00, 2600.00, '/uploads/telas/tela-cortinas-floral.jpg', 80, 40, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-03-01 10:00:00'),
(57, 'Tela para Cortinas Lisa', 'Telas', 'Tela para cortinas color beige lisa', 18.0, 900.00, 2000.00, '/uploads/telas/tela-cortinas-lisa.jpg', 100, 50, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-03-15 10:00:00'),
(58, 'Cortinas Romanas', 'Telas', 'Cortinas romanas color blanco', 18.0, 2200.00, 4800.00, '/uploads/telas/cortinas-romanas.jpg', 25, 12, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-04-01 10:00:00'),
(59, 'Cortinas Paneles', 'Telas', 'Cortinas en paneles individuales', 18.0, 1800.00, 3800.00, '/uploads/telas/cortinas-paneles.jpg', 30, 15, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-04-15 10:00:00'),
(60, 'Funda para Sofa', 'Telas', 'Funda protectora para sofá 3 plazas', 18.0, 1500.00, 3200.00, '/uploads/telas/funda-sofa.jpg', 45, 20, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-05-01 10:00:00'),
(61, 'Funda para Silla', 'Telas', 'Funda protectora para silla de comedor', 18.0, 400.00, 900.00, '/uploads/telas/funda-silla.jpg', 120, 60, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-05-15 10:00:00'),
(62, 'Alfombra 2x3', 'Decoración', 'Alfombra rectangular 2x3 metros', 18.0, 3500.00, 7500.00, '/uploads/decoracion/alfombra-2x3.jpg', 15, 8, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-06-01 10:00:00'),
(63, 'Alfombra Redonda', 'Decoración', 'Alfombra redonda 2 metros de diámetro', 18.0, 2800.00, 5800.00, '/uploads/decoracion/alfombra-redonda.jpg', 12, 6, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-06-15 10:00:00'),
(64, 'Cojín Decorativo Grande', 'Decoración', 'Cojín decorativo 50x50cm', 18.0, 600.00, 1400.00, '/uploads/decoracion/cojin-grande.jpg', 60, 30, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-07-01 10:00:00'),
(65, 'Cojín Decorativo Mediano', 'Decoración', 'Cojín decorativo 40x40cm', 18.0, 450.00, 1000.00, '/uploads/decoracion/cojin-mediano.jpg', 80, 40, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-07-15 10:00:00');

-- ===== MUEBLES DE OFICINA =====
INSERT INTO producto (id, nombre, tipo, descripcion, itbis, precio_compra, precio_venta, foto_url, cantidad_disponible, cantidad_almacen, cantidad_reservada, cantidad_danada, cantidad_devuelta, estado, eliminado, fecha_creacion) VALUES
(66, 'Escritorio Ejecutivo', 'Muebles', 'Escritorio ejecutivo en madera maciza', 18.0, 25000.00, 48000.00, '/uploads/muebles/escritorio-ejecutivo.jpg', 5, 2, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-01-30 10:00:00'),
(67, 'Escritorio de Trabajo', 'Muebles', 'Escritorio moderno para home office', 18.0, 15000.00, 28500.00, '/uploads/muebles/escritorio-trabajo.jpg', 8, 3, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-02-10 10:00:00'),
(68, 'Silla de Oficina Ergonómica', 'Muebles', 'Silla de oficina con soporte lumbar', 18.0, 8000.00, 15500.00, '/uploads/muebles/silla-oficina-ergonomica.jpg', 12, 5, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-02-25 10:00:00'),
(69, 'Silla de Oficina Básica', 'Muebles', 'Silla de oficina con respaldo alto', 18.0, 4500.00, 8500.00, '/uploads/muebles/silla-oficina-basica.jpg', 20, 10, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-03-10 10:00:00'),
(70, 'Estante para Oficina', 'Muebles', 'Estante metálico de 5 niveles', 18.0, 6500.00, 12500.00, '/uploads/muebles/estante-oficina.jpg', 10, 4, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-03-25 10:00:00');

-- ===== MUEBLES DE JARDÍN =====
INSERT INTO producto (id, nombre, tipo, descripcion, itbis, precio_compra, precio_venta, foto_url, cantidad_disponible, cantidad_almacen, cantidad_reservada, cantidad_danada, cantidad_devuelta, estado, eliminado, fecha_creacion) VALUES
(71, 'Mesa de Jardín Redonda', 'Muebles', 'Mesa de jardín redonda para 4 personas', 18.0, 8500.00, 16500.00, '/uploads/muebles/mesa-jardin-redonda.jpg', 6, 2, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-04-01 10:00:00'),
(72, 'Mesa de Jardín Rectangular', 'Muebles', 'Mesa de jardín rectangular para 6 personas', 18.0, 12000.00, 23500.00, '/uploads/muebles/mesa-jardin-rectangular.jpg', 4, 1, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-04-15 10:00:00'),
(73, 'Silla de Jardín Plegable', 'Muebles', 'Silla de jardín plegable con almohadón', 18.0, 2500.00, 5500.00, '/uploads/muebles/silla-jardin-plegable.jpg', 25, 12, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-05-01 10:00:00'),
(74, 'Sofa de Jardín', 'Muebles', 'Sofá de jardín para exterior 3 plazas', 18.0, 15000.00, 28500.00, '/uploads/muebles/sofa-jardin.jpg', 3, 1, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-05-15 10:00:00'),
(75, 'Hamaca de Jardín', 'Muebles', 'Hamaca de jardín con soporte de madera', 18.0, 5500.00, 11000.00, '/uploads/muebles/hamaca-jardin.jpg', 8, 3, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-06-01 10:00:00');

-- ===== PRODUCTOS INFANTILES =====
INSERT INTO producto (id, nombre, tipo, descripcion, itbis, precio_compra, precio_venta, foto_url, cantidad_disponible, cantidad_almacen, cantidad_reservada, cantidad_danada, cantidad_devuelta, estado, eliminado, fecha_creacion) VALUES
(76, 'Cama Individual Infantil', 'Muebles', 'Cama individual con diseño infantil', 18.0, 12000.00, 22500.00, '/uploads/muebles/cama-infantil.jpg', 10, 4, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-02-01 10:00:00'),
(77, 'Armario Infantil', 'Muebles', 'Armario pequeño para habitación infantil', 18.0, 8000.00, 15000.00, '/uploads/muebles/armario-infantil.jpg', 12, 5, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-02-15 10:00:00'),
(78, 'Escritorio Infantil', 'Muebles', 'Escritorio pequeño para estudio infantil', 18.0, 6500.00, 12500.00, '/uploads/muebles/escritorio-infantil.jpg', 15, 7, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-03-01 10:00:00'),
(79, 'Silla Infantil', 'Muebles', 'Silla pequeña para escritorio infantil', 18.0, 2500.00, 5500.00, '/uploads/muebles/silla-infantil.jpg', 20, 10, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-03-15 10:00:00'),
(80, 'Estante Infantil', 'Muebles', 'Estante pequeño para habitación infantil', 18.0, 3500.00, 7500.00, '/uploads/muebles/estante-infantil.jpg', 18, 8, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-04-01 10:00:00');

-- ===== PRODUCTOS COMPLEMENTARIOS =====
INSERT INTO producto (id, nombre, tipo, descripcion, itbis, precio_compra, precio_venta, foto_url, cantidad_disponible, cantidad_almacen, cantidad_reservada, cantidad_danada, cantidad_devuelta, estado, eliminado, fecha_creacion) VALUES
(81, 'Maceta Decorativa Grande', 'Decoración', 'Maceta decorativa de cerámica grande', 18.0, 800.00, 1800.00, '/uploads/decoracion/maceta-grande.jpg', 40, 20, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-01-10 10:00:00'),
(82, 'Maceta Decorativa Mediana', 'Decoración', 'Maceta decorativa de cerámica mediana', 18.0, 500.00, 1200.00, '/uploads/decoracion/maceta-mediana.jpg', 60, 30, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-01-20 10:00:00'),
(83, 'Planta Artificial Grande', 'Decoración', 'Planta artificial decorativa grande', 18.0, 1500.00, 3200.00, '/uploads/decoracion/planta-artificial.jpg', 25, 12, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-02-01 10:00:00'),
(84, 'Florero de Mesa', 'Decoración', 'Florero pequeño para mesa auxiliar', 18.0, 400.00, 900.00, '/uploads/decoracion/florero-mesa.jpg', 45, 22, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-02-10 10:00:00'),
(85, 'Set de Velas', 'Decoración', 'Set de 3 velas decorativas aromáticas', 18.0, 600.00, 1400.00, '/uploads/decoracion/set-velas.jpg', 50, 25, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-02-20 10:00:00'),
(86, 'Porta Revistas', 'Decoración', 'Porta revistas decorativo para sala', 18.0, 800.00, 1800.00, '/uploads/decoracion/porta-revistas.jpg', 15, 8, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-03-01 10:00:00'),
(87, 'Cesta de Mimbre', 'Decoración', 'Cesta de mimbre decorativa', 18.0, 450.00, 1000.00, '/uploads/decoracion/cesta-mimbre.jpg', 35, 18, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-03-10 10:00:00'),
(88, 'Reloj de Mesa', 'Decoración', 'Reloj decorativo para mesa', 18.0, 350.00, 800.00, '/uploads/decoracion/reloj-mesa.jpg', 28, 14, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-03-20 10:00:00'),
(89, 'Adorno Navideño', 'Decoración', 'Adorno decorativo navideño', 18.0, 200.00, 500.00, '/uploads/decoracion/adorno-navideno.jpg', 100, 50, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-04-01 10:00:00'),
(90, 'Guirnalda Luminosa', 'Decoración', 'Guirnalda luminosa para decoración', 18.0, 600.00, 1400.00, '/uploads/decoracion/guirnalda-luminosa.jpg', 30, 15, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-04-10 10:00:00'),
(91, 'Marco de Foto Grande', 'Decoración', 'Marco de foto familiar grande', 18.0, 400.00, 900.00, '/uploads/decoracion/marco-foto-grande.jpg', 40, 20, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-04-20 10:00:00'),
(92, 'Marco de Foto Mediano', 'Decoración', 'Marco de foto mediano elegante', 18.0, 250.00, 600.00, '/uploads/decoracion/marco-foto-mediano.jpg', 55, 28, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-05-01 10:00:00'),
(93, 'Set de Ollas Decorativas', 'Decoración', 'Set de 3 ollas decorativas de cobre', 18.0, 800.00, 1800.00, '/uploads/decoracion/set-ollas.jpg', 20, 10, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-05-10 10:00:00'),
(94, 'Bandeja Decorativa', 'Decoración', 'Bandeja decorativa de metal', 18.0, 300.00, 700.00, '/uploads/decoracion/bandeja-decorativa.jpg', 42, 21, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-05-20 10:00:00'),
(95, 'Salvamanteles', 'Decoración', 'Set de 6 salvamanteles decorativos', 18.0, 150.00, 400.00, '/uploads/decoracion/salvamanteles.jpg', 80, 40, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-06-01 10:00:00');

-- ===== PRODUCTOS ESPECIALES =====
INSERT INTO producto (id, nombre, tipo, descripcion, itbis, precio_compra, precio_venta, foto_url, cantidad_disponible, cantidad_almacen, cantidad_reservada, cantidad_danada, cantidad_devuelta, estado, eliminado, fecha_creacion) VALUES
(96, 'Biblioteca 4 Estantes', 'Muebles', 'Biblioteca de 4 estantes en madera maciza', 18.0, 18000.00, 35000.00, '/uploads/muebles/biblioteca-4estantes.jpg', 6, 2, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-01-15 10:00:00'),
(97, 'Biblioteca 6 Estantes', 'Muebles', 'Biblioteca de 6 estantes alta', 18.0, 25000.00, 48000.00, '/uploads/muebles/biblioteca-6estantes.jpg', 4, 1, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-02-01 10:00:00'),
(98, 'Perchero de Pared', 'Muebles', 'Perchero de pared con 5 ganchos', 18.0, 1200.00, 2800.00, '/uploads/muebles/perchero-pared.jpg', 25, 12, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-02-15 10:00:00'),
(99, 'Perchero de Pie', 'Muebles', 'Perchero de pie con paraguero incluido', 18.0, 4500.00, 9500.00, '/uploads/muebles/perchero-pie.jpg', 10, 4, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-03-01 10:00:00'),
(100, 'Espejo de Cuerpo Completo', 'Decoración', 'Espejo de cuerpo completo con marco', 18.0, 6500.00, 13500.00, '/uploads/decoracion/espejo-cuerpo-completo.jpg', 8, 3, 0, 0, 0, 'DISPONIBLE', FALSE, '2023-03-15 10:00:00');

-- ========================================================================================
-- FIN MIGRACIÓN R__04A
-- Total adicional: 85 productos (haciendo un total de 100 productos)
-- Categorías incluidas:
-- • Muebles de sala: 15 productos
-- • Muebles de comedor: 10 productos
-- • Muebles de dormitorio: 10 productos
-- • Decoración: 35 productos
-- • Telas: 10 productos
-- • Muebles de oficina: 5 productos
-- • Muebles de jardín: 5 productos
-- • Muebles infantiles: 5 productos
-- • Productos complementarios: 5 productos
-- ========================================================================================
