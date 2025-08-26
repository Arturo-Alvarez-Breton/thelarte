-- Script para arreglar la secuencia de auto-incremento de la tabla movimientos_producto
-- Este script debe ejecutarse en la base de datos H2

-- Para H2, necesitamos reiniciar la secuencia basándose en el máximo ID existente
-- Primero, obtenemos el máximo ID actual en la tabla
-- Luego reiniciamos la secuencia desde el siguiente número

-- Opción 1: Si hay datos existentes en la tabla
ALTER TABLE movimientos_producto ALTER COLUMN id RESTART WITH (SELECT COALESCE(MAX(id), 0) + 1 FROM movimientos_producto);

-- Opción 2: Si la tabla está vacía o quieres reiniciar desde 1
-- ALTER TABLE movimientos_producto ALTER COLUMN id RESTART WITH 1;

-- Verificar que la secuencia se reinició correctamente
SELECT AUTO_INCREMENT FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'MOVIMIENTOS_PRODUCTO' AND COLUMN_NAME = 'ID';
