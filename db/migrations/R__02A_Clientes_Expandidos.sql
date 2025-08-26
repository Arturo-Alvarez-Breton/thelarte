-- ========================================================================================
-- MIGRACIÓN R__02A: CLIENTES EXPANDIDOS (Datos masivos)
-- Sistema de gestión de muebles y decoración - The Larte
-- ========================================================================================

-- ===== CLIENTES RESIDENCIALES ADICIONALES (200+ clientes) =====

-- Clientes residenciales - Distrito Nacional
INSERT INTO clientes (cedula, nombre, apellido, telefono, email, direccion, fecha_registro, deleted) VALUES
('200-0000001-1', 'Alba', 'Pérez', '829-555-1001', 'alba.perez@email.com', 'Av. Abraham Lincoln #456, Santo Domingo', '2023-01-15', FALSE),
('200-0000001-2', 'Benito', 'Gómez', '829-555-1002', 'benito.gomez@email.com', 'Calle El Conde #123, Santo Domingo', '2023-01-20', FALSE),
('200-0000001-3', 'Celia', 'Rodríguez', '829-555-1003', 'celia.rodriguez@email.com', 'Av. 27 de Febrero #789, Santo Domingo', '2023-01-25', FALSE),
('200-0000001-4', 'David', 'Fernández', '829-555-1004', 'david.fernandez@email.com', 'Calle Arzobispo Meriño #321, Santo Domingo', '2023-02-01', FALSE),
('200-0000001-5', 'Elena', 'Martínez', '829-555-1005', 'elena.martinez@email.com', 'Av. John F. Kennedy #654, Santo Domingo', '2023-02-05', FALSE),
('200-0000002-1', 'Fernando', 'López', '829-555-1006', 'fernando.lopez@email.com', 'Calle Isabel la Católica #987, Santo Domingo', '2023-02-10', FALSE),
('200-0000002-2', 'Gabriela', 'Sánchez', '829-555-1007', 'gabriela.sanchez@email.com', 'Av. Charles de Gaulle #147, Santo Domingo', '2023-02-15', FALSE),
('200-0000002-3', 'Hugo', 'Díaz', '829-555-1008', 'hugo.diaz@email.com', 'Calle Palo Hincado #258, Santo Domingo', '2023-02-20', FALSE),
('200-0000002-4', 'Irene', 'Hernández', '829-555-1009', 'irene.hernandez@email.com', 'Av. Máximo Gómez #369, Santo Domingo', '2023-02-25', FALSE),
('200-0000002-5', 'Javier', 'Vásquez', '829-555-1010', 'javier.vasquez@email.com', 'Calle José Reyes #741, Santo Domingo', '2023-03-01', FALSE),
('200-0000003-1', 'Karla', 'Jiménez', '829-555-1011', 'karla.jimenez@email.com', 'Av. Luperón #852, Santo Domingo', '2023-03-05', FALSE),
('200-0000003-2', 'Luis', 'Morales', '829-555-1012', 'luis.morales@email.com', 'Calle Padre Billini #963, Santo Domingo', '2023-03-10', FALSE),
('200-0000003-3', 'María', 'Ortiz', '829-555-1013', 'maria.ortiz@email.com', 'Av. Bolívar #159, Santo Domingo', '2023-03-15', FALSE),
('200-0000003-4', 'Nelson', 'Ramírez', '829-555-1014', 'nelson.ramirez@email.com', 'Calle Arzobispo Portes #357, Santo Domingo', '2023-03-20', FALSE),
('200-0000003-5', 'Olga', 'Torres', '829-555-1015', 'olga.torres@email.com', 'Av. Pasteur #468, Santo Domingo', '2023-03-25', FALSE),
('200-0000004-1', 'Pedro', 'Flores', '829-555-1016', 'pedro.flores@email.com', 'Calle Arzobispo Nouel #579, Santo Domingo', '2023-03-30', FALSE),
('200-0000004-2', 'Quintina', 'Reyes', '829-555-1017', 'quintina.reyes@email.com', 'Av. José Horacio Rodríguez #680, Santo Domingo', '2023-04-05', FALSE),
('200-0000004-3', 'Rafael', 'Cruz', '829-555-1018', 'rafael.cruz@email.com', 'Calle General Cabral #791, Santo Domingo', '2023-04-10', FALSE),
('200-0000004-4', 'Sonia', 'Mendoza', '829-555-1019', 'sonia.mendoza@email.com', 'Av. Las Carreras #802, Santo Domingo', '2023-04-15', FALSE),
('200-0000004-5', 'Tomas', 'Vargas', '829-555-1020', 'tomas.vargas@email.com', 'Calle Arzobispo Valera #913, Santo Domingo', '2023-04-20', FALSE);

-- Clientes residenciales - Santiago
INSERT INTO clientes (cedula, nombre, apellido, telefono, email, direccion, fecha_registro, deleted) VALUES
('201-0000001-1', 'Úrsula', 'Castillo', '829-555-1101', 'ursula.castillo@email.com', 'Av. Circunvalación #111, Santiago', '2023-04-25', FALSE),
('201-0000001-2', 'Víctor', 'Guerrero', '829-555-1102', 'victor.guerrero@email.com', 'Calle Restauración #222, Santiago', '2023-05-01', FALSE),
('201-0000001-3', 'Wanda', 'Soto', '829-555-1103', 'wanda.soto@email.com', 'Av. Estrella Sadhalá #333, Santiago', '2023-05-05', FALSE),
('201-0000001-4', 'Xavier', 'Delgado', '829-555-1104', 'xavier.delgado@email.com', 'Calle 30 de Marzo #444, Santiago', '2023-05-10', FALSE),
('201-0000001-5', 'Yolanda', 'Pena', '829-555-1105', 'yolanda.pena@email.com', 'Av. Las Carreras #555, Santiago', '2023-05-15', FALSE),
('201-0000002-1', 'Zacarías', 'León', '829-555-1106', 'zacarias.leon@email.com', 'Calle Mella #666, Santiago', '2023-05-20', FALSE),
('201-0000002-2', 'Adela', 'Mora', '829-555-1107', 'adela.mora@email.com', 'Av. 27 de Febrero #777, Santiago', '2023-05-25', FALSE),
('201-0000002-3', 'Bernardo', 'Vega', '829-555-1108', 'bernardo.vega@email.com', 'Calle Juan Pablo Duarte #888, Santiago', '2023-06-01', FALSE),
('201-0000002-4', 'Carmen', 'Campos', '829-555-1109', 'carmen.campos@email.com', 'Av. Salvador Estrella Sadhalá #999, Santiago', '2023-06-05', FALSE),
('201-0000002-5', 'Daniel', 'Silva', '829-555-1110', 'daniel.silva@email.com', 'Calle José Horacio Rodríguez #1010, Santiago', '2023-06-10', FALSE),
('201-0000003-1', 'Esther', 'Rojas', '829-555-1111', 'esther.rojas@email.com', 'Av. Circunvalación Norte #1111, Santiago', '2023-06-15', FALSE),
('201-0000003-2', 'Francisco', 'Navarro', '829-555-1112', 'francisco.navarro@email.com', 'Calle Máximo Gómez #1222, Santiago', '2023-06-20', FALSE),
('201-0000003-3', 'Graciela', 'Ríos', '829-555-1113', 'graciela.rios@email.com', 'Av. Los Jazmines #1333, Santiago', '2023-06-25', FALSE),
('201-0000003-4', 'Héctor', 'Medina', '829-555-1114', 'hector.medina@email.com', 'Calle La Trinitaria #1444, Santiago', '2023-07-01', FALSE),
('201-0000003-5', 'Inés', 'Herrera', '829-555-1115', 'ines.herrera@email.com', 'Av. Imbert #1555, Santiago', '2023-07-05', FALSE),
('201-0000004-1', 'Joaquín', 'Castro', '829-555-1116', 'joaquin.castro@email.com', 'Calle Padre Fantino #1666, Santiago', '2023-07-10', FALSE),
('201-0000004-2', 'Karina', 'Suero', '829-555-1117', 'karina.suero@email.com', 'Av. Monumental #1777, Santiago', '2023-07-15', FALSE),
('201-0000004-3', 'Leonel', 'Matos', '829-555-1118', 'leonel.matos@email.com', 'Calle General Luperón #1888, Santiago', '2023-07-20', FALSE),
('201-0000004-4', 'Maribel', 'Núñez', '829-555-1119', 'maribel.nunez@email.com', 'Av. Francisco Alberto Caamaño #1999, Santiago', '2023-07-25', FALSE),
('201-0000004-5', 'Norberto', 'Acosta', '829-555-1120', 'norberto.acosta@email.com', 'Calle Hermanas Mirabal #2100, Santiago', '2023-07-30', FALSE);

-- Clientes residenciales - La Vega
INSERT INTO clientes (cedula, nombre, apellido, telefono, email, direccion, fecha_registro, deleted) VALUES
('202-0000001-1', 'Olivia', 'Pimentel', '829-555-1201', 'olivia.pimentel@email.com', 'Av. Circunvalación #111, La Vega', '2023-08-05', FALSE),
('202-0000001-2', 'Pablo', 'Espinal', '829-555-1202', 'pablo.espinal@email.com', 'Calle Duarte #222, La Vega', '2023-08-10', FALSE),
('202-0000001-3', 'Quintina', 'Montero', '829-555-1203', 'quintina.montero@email.com', 'Av. La Concepción #333, La Vega', '2023-08-15', FALSE),
('202-0000001-4', 'Ramón', 'Baez', '829-555-1204', 'ramon.baez@email.com', 'Calle Mella #444, La Vega', '2023-08-20', FALSE),
('202-0000001-5', 'Silvia', 'Tavarez', '829-555-1205', 'silvia.tavarez@email.com', 'Av. Imbert #555, La Vega', '2023-08-25', FALSE),
('202-0000002-1', 'Teodoro', 'Hidalgo', '829-555-1206', 'teodoro.hidalgo@email.com', 'Calle Padre Billini #666, La Vega', '2023-08-30', FALSE),
('202-0000002-2', 'Úrsula', 'Valdez', '829-555-1207', 'ursula.valdez@email.com', 'Av. Monumental #777, La Vega', '2023-09-05', FALSE),
('202-0000002-3', 'Vicente', 'Peguero', '829-555-1208', 'vicente.peguero@email.com', 'Calle 27 de Febrero #888, La Vega', '2023-09-10', FALSE),
('202-0000002-4', 'Wanda', 'Mota', '829-555-1209', 'wanda.mota@email.com', 'Av. Francisco del Rosario Sánchez #999, La Vega', '2023-09-15', FALSE),
('202-0000002-5', 'Ximena', 'Liriano', '829-555-1210', 'ximena.liriano@email.com', 'Calle Juan Pablo Duarte #1010, La Vega', '2023-09-20', FALSE),
('202-0000003-1', 'Yadira', 'Sosa', '829-555-1211', 'yadira.sosa@email.com', 'Av. Circunvalación Sur #1111, La Vega', '2023-09-25', FALSE),
('202-0000003-2', 'Zoraida', 'Guzmán', '829-555-1212', 'zoraida.guzman@email.com', 'Calle Máximo Gómez #1222, La Vega', '2023-09-30', FALSE),
('202-0000003-3', 'Armando', 'Jiménez', '829-555-1213', 'armando.jimenez@email.com', 'Av. Los Cerezos #1333, La Vega', '2023-10-05', FALSE),
('202-0000003-4', 'Beatriz', 'Morales', '829-555-1214', 'beatriz.morales@email.com', 'Calle La Trinitaria #1444, La Vega', '2023-10-10', FALSE),
('202-0000003-5', 'César', 'Ortiz', '829-555-1215', 'cesar.ortiz@email.com', 'Av. Padre Castellanos #1555, La Vega', '2023-10-15', FALSE),
('202-0000004-1', 'Dolores', 'Ramírez', '829-555-1216', 'dolores.ramirez@email.com', 'Calle Hermanas Mirabal #1666, La Vega', '2023-10-20', FALSE),
('202-0000004-2', 'Eladio', 'Torres', '829-555-1217', 'eladio.torres@email.com', 'Av. Francisco Alberto Caamaño #1777, La Vega', '2023-10-25', FALSE),
('202-0000004-3', 'Florentina', 'Flores', '829-555-1218', 'florentina.flores@email.com', 'Calle General Luperón #1888, La Vega', '2023-10-30', FALSE),
('202-0000004-4', 'Gregorio', 'Reyes', '829-555-1219', 'gregorio.reyes@email.com', 'Av. Monumental #1999, La Vega', '2023-11-05', FALSE),
('202-0000004-5', 'Herminia', 'Cruz', '829-555-1220', 'herminia.cruz@email.com', 'Calle José Horacio Rodríguez #2100, La Vega', '2023-11-10', FALSE);

-- Clientes residenciales - San Cristóbal
INSERT INTO clientes (cedula, nombre, apellido, telefono, email, direccion, fecha_registro, deleted) VALUES
('203-0000001-1', 'Ignacio', 'Mendoza', '829-555-1301', 'ignacio.mendoza@email.com', 'Av. Circunvalación #111, San Cristóbal', '2023-11-15', FALSE),
('203-0000001-2', 'Jacinta', 'Vargas', '829-555-1302', 'jacinta.vargas@email.com', 'Calle Duarte #222, San Cristóbal', '2023-11-20', FALSE),
('203-0000001-3', 'Kenia', 'Castillo', '829-555-1303', 'kenia.castillo@email.com', 'Av. La Concepción #333, San Cristóbal', '2023-11-25', FALSE),
('203-0000001-4', 'Lázaro', 'Guerrero', '829-555-1304', 'lazaro.guerrero@email.com', 'Calle Mella #444, San Cristóbal', '2023-12-01', FALSE),
('203-0000001-5', 'Mireya', 'Soto', '829-555-1305', 'mireya.soto@email.com', 'Av. Imbert #555, San Cristóbal', '2023-12-05', FALSE),
('203-0000002-1', 'Narciso', 'Delgado', '829-555-1306', 'narciso.delgado@email.com', 'Calle Padre Billini #666, San Cristóbal', '2023-12-10', FALSE),
('203-0000002-2', 'Otilia', 'Pena', '829-555-1307', 'otilia.pena@email.com', 'Av. Monumental #777, San Cristóbal', '2023-12-15', FALSE),
('203-0000002-3', 'Primitivo', 'León', '829-555-1308', 'primitivo.leon@email.com', 'Calle 27 de Febrero #888, San Cristóbal', '2023-12-20', FALSE),
('203-0000002-4', 'Quintín', 'Mora', '829-555-1309', 'quintin.mora@email.com', 'Av. Francisco del Rosario Sánchez #999, San Cristóbal', '2024-01-05', FALSE),
('203-0000002-5', 'Raimundo', 'Vega', '829-555-1310', 'raimundo.vega@email.com', 'Calle Juan Pablo Duarte #1010, San Cristóbal', '2024-01-10', FALSE),
('203-0000003-1', 'Sebastiana', 'Campos', '829-555-1311', 'sebastiana.campos@email.com', 'Av. Circunvalación Sur #1111, San Cristóbal', '2024-01-15', FALSE),
('203-0000003-2', 'Tiburcio', 'Silva', '829-555-1312', 'tiburcio.silva@email.com', 'Calle Máximo Gómez #1222, San Cristóbal', '2024-01-20', FALSE),
('203-0000003-3', 'Ubaldo', 'Rojas', '829-555-1313', 'ubaldo.rojas@email.com', 'Av. Los Cerezos #1333, San Cristóbal', '2024-01-25', FALSE),
('203-0000003-4', 'Valentín', 'Navarro', '829-555-1314', 'valentin.navarro@email.com', 'Calle La Trinitaria #1444, San Cristóbal', '2024-02-01', FALSE),
('203-0000003-5', 'Wenceslao', 'Ríos', '829-555-1315', 'wenceslao.rios@email.com', 'Av. Padre Castellanos #1555, San Cristóbal', '2024-02-05', FALSE),
('203-0000004-1', 'Xacobe', 'Medina', '829-555-1316', 'xacobe.medina@email.com', 'Calle Hermanas Mirabal #1666, San Cristóbal', '2024-02-10', FALSE),
('203-0000004-2', 'Yolanda', 'Herrera', '829-555-1317', 'yolanda.herrera@email.com', 'Av. Francisco Alberto Caamaño #1777, San Cristóbal', '2024-02-15', FALSE),
('203-0000004-3', 'Zacarías', 'Castro', '829-555-1318', 'zacarias.castro@email.com', 'Calle General Luperón #1888, San Cristóbal', '2024-02-20', FALSE),
('203-0000004-4', 'Abelardo', 'Suero', '829-555-1319', 'abelardo.suero@email.com', 'Av. Monumental #1999, San Cristóbal', '2024-02-25', FALSE),
('203-0000004-5', 'Beatriz', 'Matos', '829-555-1320', 'beatriz.matos@email.com', 'Calle José Horacio Rodríguez #2100, San Cristóbal', '2024-03-01', FALSE);

-- ===== CLIENTES COMERCIALES ADICIONALES =====

-- Hoteles y Resorts
INSERT INTO clientes (cedula, nombre, apellido, telefono, email, direccion, fecha_registro, deleted) VALUES
('300-0000001-1', 'María', 'Fernández', '809-555-2001', 'reservas@hotelpalmabeach.com', 'Playa Boca Chica, Santo Domingo (Hotel Palma Beach)', '2023-01-15', FALSE),
('300-0000001-2', 'José', 'Martínez', '809-555-2002', 'ventas@hotelbarcelo.com', 'Av. George Washington #365, Santo Domingo (Hotel Barceló)', '2023-02-01', FALSE),
('300-0000001-3', 'Ana', 'Rodríguez', '809-555-2003', 'info@hotelsheraton.com', 'Av. Sarasota #65, Santo Domingo (Hotel Sheraton)', '2023-02-15', FALSE),
('300-0000001-4', 'Carlos', 'Gómez', '809-555-2004', 'reservas@hoteldiscovery.com', 'Av. 17 de Junio #27, Santo Domingo (Hotel Discovery)', '2023-03-01', FALSE),
('300-0000001-5', 'Luisa', 'López', '809-555-2005', 'ventas@hotelintercontinental.com', 'Av. Winston Churchill #65, Santo Domingo (Hotel Intercontinental)', '2023-03-15', FALSE),
('300-0000002-1', 'Pedro', 'Sánchez', '809-555-2006', 'info@hotelritz.com', 'Av. 27 de Febrero #350, Santiago (Hotel Ritz)', '2023-04-01', FALSE),
('300-0000002-2', 'Carmen', 'Díaz', '809-555-2007', 'reservas@hotelplaza.com', 'Calle El Conde #1, Santo Domingo (Hotel Plaza)', '2023-04-15', FALSE),
('300-0000002-3', 'Miguel', 'Hernández', '809-555-2008', 'ventas@hotelcourtyard.com', 'Av. Winston Churchill #93, Santo Domingo (Hotel Courtyard)', '2023-05-01', FALSE),
('300-0000002-4', 'Patricia', 'Vásquez', '809-555-2009', 'info@hotelhampton.com', 'Av. Abraham Lincoln #856, Santo Domingo (Hotel Hampton)', '2023-05-15', FALSE),
('300-0000002-5', 'Roberto', 'Jiménez', '809-555-2010', 'reservas@hoteljwmarriott.com', 'Av. Winston Churchill #65, Santo Domingo (JW Marriott)', '2023-06-01', FALSE);

-- Restaurantes
INSERT INTO clientes (cedula, nombre, apellido, telefono, email, direccion, fecha_registro, deleted) VALUES
('301-0000001-1', 'Elena', 'Morales', '809-555-2101', 'info@restaurantepatrizia.com', 'Calle Arzobispo Meriño #152, Santo Domingo (Patrizia)', '2023-06-15', FALSE),
('301-0000001-2', 'Fernando', 'Ortiz', '809-555-2102', 'ventas@restauranteadolfo.com', 'Av. George Washington #6, Santo Domingo (Adolfo)', '2023-07-01', FALSE),
('301-0000001-3', 'Gabriela', 'Ramírez', '809-555-2103', 'reservas@restaurantemesa.com', 'Calle El Conde #3, Santo Domingo (Mesa)', '2023-07-15', FALSE),
('301-0000001-4', 'Hugo', 'Torres', '809-555-2104', 'info@restaurantebuller.com', 'Av. Abraham Lincoln #1054, Santo Domingo (Buller)', '2023-08-01', FALSE),
('301-0000001-5', 'Irene', 'Flores', '809-555-2105', 'ventas@restaurantejennifer.com', 'Av. 27 de Febrero #203, Santo Domingo (Jennifer)', '2023-08-15', FALSE),
('301-0000002-1', 'Javier', 'Reyes', '809-555-2106', 'info@restaurantenatural.com', 'Calle Arzobispo Portes #302, Santo Domingo (Natural)', '2023-09-01', FALSE),
('301-0000002-2', 'Karina', 'Cruz', '809-555-2107', 'reservas@restaurantela.com', 'Av. Winston Churchill #87, Santo Domingo (La Residence)', '2023-09-15', FALSE),
('301-0000002-3', 'Leonel', 'Mendoza', '809-555-2108', 'ventas@restaurantecarbone.com', 'Av. George Washington #52, Santo Domingo (Carbone)', '2023-10-01', FALSE),
('301-0000002-4', 'Maribel', 'Vargas', '809-555-2109', 'info@restauranteclaro.com', 'Calle Isabel la Católica #356, Santo Domingo (Claro)', '2023-10-15', FALSE),
('301-0000002-5', 'Nelson', 'Castillo', '809-555-2110', 'reservas@restaurantenixon.com', 'Av. 27 de Febrero #157, Santo Domingo (Nixon)', '2023-11-01', FALSE);

-- Oficinas Corporativas
INSERT INTO clientes (cedula, nombre, apellido, telefono, email, direccion, fecha_registro, deleted) VALUES
('302-0000001-1', 'Olivia', 'Guerrero', '809-555-2201', 'compras@bancobhd.com', 'Av. Abraham Lincoln #963, Santo Domingo (Banco BHD)', '2023-11-15', FALSE),
('302-0000001-2', 'Pablo', 'Soto', '809-555-2202', 'adquisiciones@bancopopular.com', 'Av. Winston Churchill #51, Santo Domingo (Banco Popular)', '2023-12-01', FALSE),
('302-0000001-3', 'Quintina', 'Delgado', '809-555-2203', 'compras@bancoscotia.com', 'Av. 27 de Febrero #145, Santo Domingo (Scotiabank)', '2023-12-15', FALSE),
('302-0000001-4', 'Ramón', 'Pena', '809-555-2204', 'adquisiciones@banreservas.com', 'Av. 27 de Febrero #300, Santo Domingo (Banreservas)', '2024-01-01', FALSE),
('302-0000001-5', 'Silvia', 'León', '809-555-2205', 'compras@telecable.com', 'Av. John F. Kennedy #57, Santo Domingo (Telecable)', '2024-01-15', FALSE),
('302-0000002-1', 'Teodoro', 'Mora', '809-555-2206', 'adquisiciones@codetel.com', 'Av. Charles de Gaulle #33, Santo Domingo (Codetel)', '2024-02-01', FALSE),
('302-0000002-2', 'Úrsula', 'Vega', '809-555-2207', 'compras@tricom.com', 'Av. Abraham Lincoln #852, Santo Domingo (Tricom)', '2024-02-15', FALSE),
('302-0000002-3', 'Vicente', 'Campos', '809-555-2208', 'adquisiciones@altice.com', 'Av. 27 de Febrero #367, Santo Domingo (Altice)', '2024-03-01', FALSE),
('302-0000002-4', 'Wanda', 'Silva', '809-555-2209', 'compras@claro.com', 'Av. John F. Kennedy #85, Santo Domingo (Claro)', '2024-03-15', FALSE),
('302-0000002-5', 'Ximena', 'Rojas', '809-555-2210', 'adquisiciones@viva.com', 'Av. 27 de Febrero #200, Santo Domingo (Viva)', '2024-04-01', FALSE);

-- ========================================================================================
-- FIN MIGRACIÓN R__02A
-- Total adicional: 120 clientes (80 residenciales + 40 comerciales)
-- Total acumulado: 130 clientes
-- ========================================================================================
