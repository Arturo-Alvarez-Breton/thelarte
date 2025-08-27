-- ========================================================================================
-- MIGRACIÓN R__02: CLIENTES
-- Sistema de gestión de muebles y decoración - The Larte
-- ========================================================================================

-- ===== DATOS DE CLIENTES =====
INSERT INTO clientes (cedula, nombre, apellido, telefono, email, direccion, fecha_registro, deleted) 
SELECT '050-1234567-1', 'Roberto', 'Fernández', '829-555-1111', 'roberto.fernandez@email.com', 'Av. Independencia #100, Santo Domingo', '2023-01-15', FALSE
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '050-1234567-1');

INSERT INTO clientes (cedula, nombre, apellido, telefono, email, direccion, fecha_registro, deleted) 
SELECT '050-1234567-2', 'Luisa', 'Gómez', '829-555-2222', 'luisa.gomez@email.com', 'Calle Duarte #55, Santiago', '2023-02-20', FALSE
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '050-1234567-2');

INSERT INTO clientes (cedula, nombre, apellido, telefono, email, direccion, fecha_registro, deleted) 
SELECT '050-1234567-3', 'José', 'Martínez', '829-555-3333', 'jose.martinez@email.com', 'Calle El Sol #10, La Vega', '2023-03-10', FALSE
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '050-1234567-3');

INSERT INTO clientes (cedula, nombre, apellido, telefono, email, direccion, fecha_registro, deleted) 
SELECT '050-1234567-4', 'María', 'López', '829-555-4444', 'maria.lopez@email.com', 'Av. 27 de Febrero #200, Santo Domingo', '2023-04-05', FALSE
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '050-1234567-4');

INSERT INTO clientes (cedula, nombre, apellido, telefono, email, direccion, fecha_registro, deleted) 
SELECT '050-1234567-5', 'Carlos', 'Hernández', '829-555-5555', 'carlos.hernandez@email.com', 'Calle Restauración #75, Santiago', '2023-05-12', FALSE
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '050-1234567-5');

INSERT INTO clientes (cedula, nombre, apellido, telefono, email, direccion, fecha_registro, deleted) 
SELECT '060-2345678-1', 'Ana', 'Vásquez', '809-555-6666', 'ana.vasquez@hotelparadiso.com', 'Av. Las Américas #500, Santo Domingo (Hotel Paraíso)', '2023-06-01', FALSE
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '060-2345678-1');

INSERT INTO clientes (cedula, nombre, apellido, telefono, email, direccion, fecha_registro, deleted) 
SELECT '060-2345678-2', 'Miguel', 'Santos', '809-555-7777', 'miguel.santos@restaurantedelmar.com', 'Calle El Conde #25, Santo Domingo (Restaurante del Mar)', '2023-07-15', FALSE
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '060-2345678-2');

INSERT INTO clientes (cedula, nombre, apellido, telefono, email, direccion, fecha_registro, deleted) 
SELECT '060-2345678-3', 'Carmen', 'Díaz', '809-555-8888', 'carmen.diaz@clinicasantamaria.com', 'Av. Abraham Lincoln #300, Santo Domingo (Clínica Santa María)', '2023-08-20', FALSE
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '060-2345678-3');

INSERT INTO clientes (cedula, nombre, apellido, telefono, email, direccion, fecha_registro, deleted) 
SELECT '070-3456789-1', 'Patricia', 'Ramírez', '849-555-9999', 'patricia.ramirez@decoracionesdr.com', 'Calle Arzobispo Meriño #150, Santo Domingo', '2023-09-10', FALSE
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '070-3456789-1');

INSERT INTO clientes (cedula, nombre, apellido, telefono, email, direccion, fecha_registro, deleted) 
SELECT '070-3456789-2', 'Ricardo', 'Alvarez', '849-555-0000', 'ricardo.alvarez@arquitectura.com', 'Plaza de la Cultura, Santo Domingo', '2023-10-05', FALSE
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '070-3456789-2');

-- ========================================================================================
-- FIN MIGRACIÓN R__02
-- Total: 10 clientes (5 residenciales, 3 comerciales, 2 de diseño)
-- ========================================================================================
