-- ========================================================================================
-- MIGRACIÓN V0: LIMPIEZA COMPLETA DE BASE DE DATOS
-- Sistema de gestión de muebles y decoración - The Larte
-- ========================================================================================

-- Eliminar tablas en orden inverso a las dependencias
DROP TABLE IF EXISTS movimientos_producto CASCADE;
DROP TABLE IF EXISTS pagos CASCADE;
DROP TABLE IF EXISTS lineas_transaccion CASCADE;
DROP TABLE IF EXISTS transacciones CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS proveedores CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS empleados CASCADE;
DROP TABLE IF EXISTS devoluciones CASCADE;

-- Eliminar secuencias
DROP SEQUENCE IF EXISTS movimientos_producto_id_seq;
DROP SEQUENCE IF EXISTS pagos_id_seq;
DROP SEQUENCE IF EXISTS lineas_transaccion_id_seq;
DROP SEQUENCE IF EXISTS transacciones_id_seq;
DROP SEQUENCE IF EXISTS productos_id_seq;
DROP SEQUENCE IF EXISTS proveedores_id_seq;
DROP SEQUENCE IF EXISTS clientes_id_seq;
DROP SEQUENCE IF EXISTS users_id_seq;
DROP SEQUENCE IF EXISTS user_roles_id_seq;
DROP SEQUENCE IF EXISTS empleados_id_seq;
DROP SEQUENCE IF EXISTS devoluciones_id_seq;

-- Eliminar funciones
DROP FUNCTION IF EXISTS table_exists(TEXT);

-- ========================================================================================
-- FIN MIGRACIÓN V0: LIMPIEZA COMPLETA
-- ========================================================================================
