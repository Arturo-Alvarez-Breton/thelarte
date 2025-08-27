-- ===================================================================
-- SCRIPT DE ACTUALIZACIÓN DE BASE DE DATOS - ROLES ACTUALIZADOS
-- ===================================================================
-- Este script actualiza los roles existentes para usar los nuevos valores:
-- ADMINISTRADOR, TI, VENDEDOR, CAJERO, CONTABILIDAD
--
-- Fecha: 2025-01-25
-- Descripción: Migración de roles antiguos a los nuevos roles del sistema
-- ===================================================================

-- Activar transacciones para poder hacer rollback en caso de error
SET autocommit = false;
BEGIN;

-- ===================================================================
-- PASO 1: ACTUALIZAR ENUM DE EMPLEADOS
-- ===================================================================

-- Primero, agregar los nuevos valores al enum existente
ALTER TABLE "PUBLIC"."EMPLEADOS"
ALTER COLUMN "ROL" TYPE VARCHAR(255);

-- Actualizar los datos existentes para mapear a los nuevos roles
UPDATE "PUBLIC"."EMPLEADOS"
SET "ROL" = CASE
    WHEN "ROL" = 'ADMIN' THEN 'ADMINISTRADOR'
    WHEN "ROL" = 'CAJERO' THEN 'CAJERO'
    WHEN "ROL" = 'COMERCIAL' THEN 'VENDEDOR'
    WHEN "ROL" = 'TI' THEN 'TI'
    ELSE 'VENDEDOR' -- valor por defecto para cualquier rol no reconocido
END;

-- Recrear el enum con los nuevos valores
ALTER TABLE "PUBLIC"."EMPLEADOS"
ALTER COLUMN "ROL" TYPE ENUM('ADMINISTRADOR', 'TI', 'VENDEDOR', 'CAJERO', 'CONTABILIDAD')
USING "ROL"::VARCHAR;

-- ===================================================================
-- PASO 2: ACTUALIZAR ENUM DE USER_ROLES
-- ===================================================================

-- Cambiar temporalmente a VARCHAR para poder manipular los datos
ALTER TABLE "PUBLIC"."USER_ROLES"
ALTER COLUMN "ROLE" TYPE VARCHAR(255);

-- Actualizar los datos existentes para mapear a los nuevos roles
UPDATE "PUBLIC"."USER_ROLES"
SET "ROLE" = CASE
    WHEN "ROLE" = 'GERENTE' THEN 'ADMINISTRADOR'
    WHEN "ROLE" = 'TI' THEN 'TI'
    WHEN "ROLE" = 'VENDEDOR' THEN 'VENDEDOR'
    WHEN "ROLE" = 'CONTABILIDAD' THEN 'CONTABILIDAD'
    ELSE 'VENDEDOR' -- valor por defecto para cualquier rol no reconocido
END;

-- Recrear el enum con los nuevos valores
ALTER TABLE "PUBLIC"."USER_ROLES"
ALTER COLUMN "ROLE" TYPE ENUM('ADMINISTRADOR', 'TI', 'VENDEDOR', 'CAJERO', 'CONTABILIDAD')
USING "ROLE"::VARCHAR;

-- ===================================================================
-- PASO 3: SINCRONIZAR ROLES ENTRE EMPLEADOS Y USUARIOS
-- ===================================================================

-- Actualizar los roles de los usuarios para que coincidan con los roles de sus empleados asociados
UPDATE "PUBLIC"."USER_ROLES" ur
SET "ROLE" = (
    SELECT CASE
        WHEN e."ROL" = 'ADMINISTRADOR' THEN 'ADMINISTRADOR'
        WHEN e."ROL" = 'TI' THEN 'TI'
        WHEN e."ROL" = 'VENDEDOR' THEN 'VENDEDOR'
        WHEN e."ROL" = 'CAJERO' THEN 'CAJERO'
        WHEN e."ROL" = 'CONTABILIDAD' THEN 'CONTABILIDAD'
        ELSE 'VENDEDOR'
    END
    FROM "PUBLIC"."EMPLEADOS" e
    INNER JOIN "PUBLIC"."USERS" u ON u."EMPLEADO_CEDULA" = e."CEDULA"
    WHERE u."ID" = ur."USER_ID"
);

-- ===================================================================
-- PASO 4: VERIFICACIONES Y VALIDACIONES
-- ===================================================================

-- Verificar que todos los empleados tienen roles válidos
SELECT 'Empleados con roles inválidos:' as verificacion;
SELECT "CEDULA", "NOMBRE", "APELLIDO", "ROL"
FROM "PUBLIC"."EMPLEADOS"
WHERE "ROL" NOT IN ('ADMINISTRADOR', 'TI', 'VENDEDOR', 'CAJERO', 'CONTABILIDAD');

-- Verificar que todos los user_roles tienen roles válidos
SELECT 'User_roles con roles inválidos:' as verificacion;
SELECT ur."USER_ID", u."USERNAME", ur."ROLE"
FROM "PUBLIC"."USER_ROLES" ur
INNER JOIN "PUBLIC"."USERS" u ON u."ID" = ur."USER_ID"
WHERE ur."ROLE" NOT IN ('ADMINISTRADOR', 'TI', 'VENDEDOR', 'CAJERO', 'CONTABILIDAD');

-- Mostrar estadísticas de distribución de roles
SELECT 'Distribución de roles en empleados:' as estadisticas;
SELECT "ROL", COUNT(*) as cantidad
FROM "PUBLIC"."EMPLEADOS"
WHERE "DELETED" = FALSE
GROUP BY "ROL"
ORDER BY cantidad DESC;

SELECT 'Distribución de roles en usuarios:' as estadisticas;
SELECT ur."ROLE", COUNT(*) as cantidad
FROM "PUBLIC"."USER_ROLES" ur
INNER JOIN "PUBLIC"."USERS" u ON u."ID" = ur."USER_ID"
WHERE u."ACTIVE" = TRUE
GROUP BY ur."ROLE"
ORDER BY cantidad DESC;

-- ===================================================================
-- PASO 5: CREAR USUARIOS PARA EMPLEADOS SIN USUARIO ASOCIADO
-- ===================================================================

-- Verificar empleados sin usuario asociado
SELECT 'Empleados sin usuario asociado:' as info;
SELECT e."CEDULA", e."NOMBRE", e."APELLIDO", e."ROL"
FROM "PUBLIC"."EMPLEADOS" e
LEFT JOIN "PUBLIC"."USERS" u ON u."EMPLEADO_CEDULA" = e."CEDULA"
WHERE u."ID" IS NULL AND e."DELETED" = FALSE;

-- Insertar usuarios automáticamente para empleados sin usuario
-- (Nota: Las contraseñas deben cambiarse después de la migración)
INSERT INTO "PUBLIC"."USERS" ("USERNAME", "PASSWORD", "ACTIVE", "EMPLEADO_CEDULA")
SELECT
    LOWER(CONCAT(e."NOMBRE", e."APELLIDO")), -- username = nombrapellido en minúsculas
    '$2a$10$defaultpasswordhash', -- hash de contraseña temporal
    TRUE,
    e."CEDULA"
FROM "PUBLIC"."EMPLEADOS" e
LEFT JOIN "PUBLIC"."USERS" u ON u."EMPLEADO_CEDULA" = e."CEDULA"
WHERE u."ID" IS NULL AND e."DELETED" = FALSE;

-- Insertar roles para los nuevos usuarios creados
INSERT INTO "PUBLIC"."USER_ROLES" ("USER_ID", "ROLE")
SELECT
    u."ID",
    e."ROL"
FROM "PUBLIC"."EMPLEADOS" e
INNER JOIN "PUBLIC"."USERS" u ON u."EMPLEADO_CEDULA" = e."CEDULA"
LEFT JOIN "PUBLIC"."USER_ROLES" ur ON ur."USER_ID" = u."ID"
WHERE ur."USER_ID" IS NULL AND e."DELETED" = FALSE;

-- ===================================================================
-- PASO 6: VALIDACIÓN FINAL
-- ===================================================================

-- Contar registros antes y después
SELECT 'Resumen de la migración:' as resumen;
SELECT
    (SELECT COUNT(*) FROM "PUBLIC"."EMPLEADOS" WHERE "DELETED" = FALSE) as empleados_activos,
    (SELECT COUNT(*) FROM "PUBLIC"."USERS" WHERE "ACTIVE" = TRUE) as usuarios_activos,
    (SELECT COUNT(*) FROM "PUBLIC"."USER_ROLES") as roles_asignados;

-- Verificar consistencia entre empleados y usuarios
SELECT 'Inconsistencias empleado-usuario:' as inconsistencias;
SELECT
    e."CEDULA",
    e."NOMBRE",
    e."ROL" as rol_empleado,
    ur."ROLE" as rol_usuario
FROM "PUBLIC"."EMPLEADOS" e
INNER JOIN "PUBLIC"."USERS" u ON u."EMPLEADO_CEDULA" = e."CEDULA"
INNER JOIN "PUBLIC"."USER_ROLES" ur ON ur."USER_ID" = u."ID"
WHERE e."ROL" != ur."ROLE" AND e."DELETED" = FALSE AND u."ACTIVE" = TRUE;

-- ===================================================================
-- CONFIRMACIÓN DE TRANSACCIÓN
-- ===================================================================

-- Si todo está correcto, confirmar los cambios
COMMIT;

-- En caso de error, ejecutar: ROLLBACK;

-- ===================================================================
-- NOTAS POST-MIGRACIÓN
-- ===================================================================

/*
ACCIONES REQUERIDAS DESPUÉS DE EJECUTAR ESTE SCRIPT:

1. CAMBIAR CONTRASEÑAS TEMPORALES:
   - Los usuarios creados automáticamente tienen contraseñas temporales
   - Notificar a los empleados para que cambien sus contraseñas

2. VERIFICAR ROLES:
   - Revisar que los roles asignados son correctos
   - Ajustar manualmente si es necesario

3. ACTUALIZAR APLICACIÓN:
   - Asegurar que el frontend use los nuevos roles
   - Verificar que todas las validaciones funcionen

4. TESTING:
   - Probar login con diferentes roles
   - Verificar permisos y funcionalidades

5. BACKUP:
   - Hacer backup de la base de datos actualizada
   - Documentar los cambios realizados
*/
