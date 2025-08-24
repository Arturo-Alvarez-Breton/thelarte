-- V1: Create base tables for TheLarte application
-- This migration creates all the essential database tables based on JPA entities

-- Users table for authentication
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    empleado_cedula VARCHAR(50)
);

-- User roles table (collection table for User.roles)
CREATE TABLE user_roles (
    user_id BIGINT REFERENCES users(id),
    role VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, role)
);

-- Products table
CREATE TABLE producto (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(255) UNIQUE NOT NULL,
    nombre VARCHAR(255),
    tipo VARCHAR(255),
    descripcion TEXT,
    itbis REAL,
    precio_compra DECIMAL(12,2),
    precio_venta DECIMAL(12,2),
    foto_url VARCHAR(500),
    eliminado BOOLEAN DEFAULT false,
    estado VARCHAR(50) DEFAULT 'DISPONIBLE',
    cantidad_disponible INTEGER DEFAULT 0,
    cantidad_reservada INTEGER DEFAULT 0,
    cantidad_danada INTEGER DEFAULT 0,
    cantidad_devuelta INTEGER DEFAULT 0,
    cantidad_almacen INTEGER DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP
);

-- Movements table for inventory
CREATE TABLE movimiento (
    id BIGSERIAL PRIMARY KEY,
    producto_id BIGINT NOT NULL REFERENCES producto(id),
    tipo_movimiento VARCHAR(50) NOT NULL,
    cantidad INTEGER NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    descripcion TEXT,
    precio_unitario DECIMAL(12,2),
    documento_referencia VARCHAR(255)
);

-- Suppliers table
CREATE TABLE suplidor (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(255),
    direccion TEXT,
    contacto_principal VARCHAR(255),
    notas TEXT,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP
);

-- Clients table
CREATE TABLE cliente (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    cedula VARCHAR(20) UNIQUE,
    telefono VARCHAR(20),
    email VARCHAR(255),
    direccion TEXT,
    fecha_nacimiento DATE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,
    activo BOOLEAN DEFAULT true
);

-- Employees table
CREATE TABLE empleado (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(255),
    direccion TEXT,
    cargo VARCHAR(100),
    salario DECIMAL(12,2),
    fecha_contratacion DATE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,
    activo BOOLEAN DEFAULT true
);

-- Transactions table
CREATE TABLE transacciones (
    id BIGSERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE',
    contraparte_id BIGINT NOT NULL,
    tipo_contraparte VARCHAR(50) NOT NULL,
    contraparte_nombre VARCHAR(255) NOT NULL,
    subtotal DECIMAL(12,2),
    impuestos DECIMAL(12,2),
    total DECIMAL(12,2) NOT NULL,
    numero_factura VARCHAR(50),
    fecha_entrega_esperada TIMESTAMP,
    fecha_entrega_real TIMESTAMP,
    condiciones_pago VARCHAR(255),
    numero_orden_compra VARCHAR(100),
    metodo_pago VARCHAR(100),
    numero_transaccion VARCHAR(100),
    vendedor_id BIGINT,
    direccion_entrega VARCHAR(500),
    observaciones VARCHAR(1000),
    metadatos_pago TEXT,
    transaccion_origen_id BIGINT,
    numero_referencia VARCHAR(100),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,
    deleted BOOLEAN DEFAULT false
);

-- Transaction lines table
CREATE TABLE lineas_transaccion (
    id BIGSERIAL PRIMARY KEY,
    transaccion_id BIGINT REFERENCES transacciones(id),
    producto_id BIGINT NOT NULL,
    producto_nombre VARCHAR(255) NOT NULL,
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    impuesto_porcentaje DECIMAL(5,2),
    impuesto_monto DECIMAL(12,2),
    total DECIMAL(12,2) NOT NULL,
    descuento_porcentaje DECIMAL(5,2),
    descuento_monto DECIMAL(12,2),
    observaciones VARCHAR(500)
);

-- Create basic indexes for performance
CREATE INDEX idx_transacciones_fecha ON transacciones(fecha);
CREATE INDEX idx_transacciones_contraparte ON transacciones(contraparte_id, tipo_contraparte);
CREATE INDEX idx_lineas_transaccion_producto ON lineas_transaccion(producto_id);
CREATE INDEX idx_lineas_transaccion_transaccion ON lineas_transaccion(transaccion_id);
CREATE INDEX idx_movimiento_producto ON movimiento(producto_id);
CREATE INDEX idx_producto_codigo ON producto(codigo);
CREATE INDEX idx_users_username ON users(username);