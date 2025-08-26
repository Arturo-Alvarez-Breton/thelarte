-- ========================================================================================
-- MIGRACIÓN V6: CREACIÓN DE TABLAS TRANSACCIONES Y LINEAS_TRANSACCION
-- Sistema de gestión de muebles y decoración - The Larte
-- ========================================================================================

CREATE TABLE IF NOT EXISTS transacciones (
    id BIGSERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,
    fecha TIMESTAMP NOT NULL,
    estado VARCHAR(50) NOT NULL,
    contraparte_id BIGINT NOT NULL,
    tipo_contraparte VARCHAR(50) NOT NULL,
    contraparte_nombre VARCHAR(255) NOT NULL,
    subtotal DECIMAL(12,2),
    impuestos DECIMAL(12,2),
    total DECIMAL(12,2) NOT NULL,
    numero_factura VARCHAR(255),
    fecha_entrega_esperada TIMESTAMP,
    fecha_entrega_real TIMESTAMP,
    condiciones_pago VARCHAR(255),
    numero_orden_compra VARCHAR(255),
    metodo_pago VARCHAR(255),
    numero_transaccion VARCHAR(255),
    vendedor_id BIGINT,
    direccion_entrega VARCHAR(500),
    observaciones TEXT,
    metadatos_pago TEXT,
    transaccion_origen_id BIGINT,
    numero_referencia VARCHAR(255),
    tipo_pago VARCHAR(50),
    monto_inicial DECIMAL(12,2),
    saldo_pendiente DECIMAL(12,2),
    fecha_creacion TIMESTAMP NOT NULL,
    fecha_actualizacion TIMESTAMP,
    deleted BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE TABLE IF NOT EXISTS lineas_transaccion (
    id BIGSERIAL PRIMARY KEY,
    transaccion_id BIGINT,
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
    observaciones VARCHAR(500),
    FOREIGN KEY (transaccion_id) REFERENCES transacciones(id)
);

-- ========================================================================================
-- FIN MIGRACIÓN V6: TRANSACCIONES Y LINEAS_TRANSACCION
-- ========================================================================================
