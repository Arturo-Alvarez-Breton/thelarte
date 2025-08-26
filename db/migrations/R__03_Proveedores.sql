-- ========================================================================================
-- MIGRACIÓN R__03: PROVEEDORES
-- Sistema de gestión de muebles y decoración - The Larte
-- ========================================================================================

-- ===== DATOS DE PROVEEDORES =====
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

-- ===== TELÉFONOS DE PROVEEDORES =====
INSERT INTO suplidor_telefonos (suplidor_id, telefonos) VALUES
(1, '809-555-1000'), (1, '809-555-1001'),
(2, '809-555-2000'),
(3, '809-555-3000'), (3, '829-555-3001'),
(4, '809-555-4000'), (4, '809-555-4001'),
(5, '809-555-5000'),
(6, '809-555-6000'),
(7, '809-555-7000'), (7, '829-555-7001');

-- ========================================================================================
-- FIN MIGRACIÓN R__03
-- Total: 7 proveedores con 11 teléfonos de contacto
-- ========================================================================================
