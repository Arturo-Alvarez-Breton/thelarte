# Migraciones de Base de Datos - The Larte

Este directorio contiene las migraciones de base de datos para el sistema de gestión de muebles y decoración **The Larte**.

## 📁 Estructura de Migraciones

Las migraciones siguen el formato de **Flyway** con el prefijo `R__` seguido de un número secuencial:

```
db/migrations/
├── README.md                           # Este archivo
├── ejecutar_migraciones.sql            # Script para ejecutar todas las migraciones
├── run_migrations.sh                   # Script bash para automatizar el proceso
├── R__01_Empleados_y_Usuarios.sql      # Empleados y usuarios del sistema
├── R__01A_Empleados_Expandidos.sql     # Empleados adicionales (masivos)
├── R__02_Clientes.sql                  # Clientes residenciales y comerciales
├── R__02A_Clientes_Expandidos.sql      # Clientes adicionales (masivos)
├── R__03_Proveedores.sql               # Proveedores y teléfonos
├── R__04_Productos.sql                 # Catálogo de productos
├── R__04A_Productos_Expandidos.sql     # Productos adicionales (masivos)
├── R__05_Transacciones_Compras.sql     # Transacciones de compra
├── R__05A_Transacciones_Compras_Masivas.sql  # Compras adicionales (masivas)
├── R__06_Transacciones_Ventas.sql      # Transacciones de venta
├── R__06A_Transacciones_Ventas_Masivas.sql   # Ventas adicionales (masivas)
├── R__07_Pagos_Cuotas.sql              # Sistema de pagos en cuotas
├── R__08_Movimientos_Inventario.sql    # Movimientos de inventario
└── R__09_Devoluciones.sql              # Transacciones de devolución
```

## 🚀 Cómo Ejecutar las Migraciones

### Opción 1: Flyway Automático con Docker (RECOMENDADO)
```bash
# Ejecutar todas las migraciones automáticamente
docker-compose up flyway

# O ejecutar todo el stack (base de datos + migraciones + aplicación)
docker-compose up

# Para desarrollo con reinicio automático
docker-compose up --build
```

### Opción 2: Script Automatizado
```bash
# Hacer el script ejecutable
chmod +x run_migrations.sh

# Ejecutar todas las migraciones
./run_migrations.sh

# Opciones del script
./run_migrations.sh --help          # Ver ayuda
./run_migrations.sh --dry-run       # Ver qué se ejecutaría
./run_migrations.sh -H localhost -P 5432 -d thelarte
```

### Opción 3: Ejecutar individualmente
```bash
# Conectar a la base de datos y ejecutar cada archivo en orden
psql -U usuario -d thelarte -f R__01_Empleados_y_Usuarios.sql
psql -U usuario -d thelarte -f R__01A_Empleados_Expandidos.sql
psql -U usuario -d thelarte -f R__02_Clientes.sql
# ... continuar con los demás archivos
```

### Opción 4: Script PostgreSQL Completo
```bash
# Ejecutar todas las migraciones con el script completo
psql -U usuario -d thelarte -f ejecutar_migraciones.sql
```

### Opción 5: Con Docker Compose (Base de datos existente)
```bash
# Si tienes la base de datos ejecutándose en Docker
docker-compose exec db psql -U thelarte -d thelarte -f /app/db/migrations/ejecutar_migraciones.sql
```

## 📊 Resumen de Datos

### Entidades Principales
- **175 Empleados** con diferentes roles (Admin, Comercial, TI, Cajero)
- **175 Usuarios** del sistema con roles asignados
- **130 Clientes** (80 residenciales, 40 comerciales, 10 de diseño)
- **7 Proveedores** especializados en diferentes productos
- **100 Productos** en múltiples categorías

### Transacciones y Movimientos
- **40 Transacciones de Compra** con 112 líneas
- **67 Transacciones de Venta** con 97 líneas
- **10+ Pagos en Cuotas** para ventas a crédito
- **16+ Movimientos de Inventario**
- **1 Transacción de Devolución**

### Categorías de Productos
- **Muebles de Sala**: 15 productos (Sofás, Mesas, Sillas)
- **Muebles de Comedor**: 10 productos (Mesas, Sillas, Buffets)
- **Muebles de Dormitorio**: 10 productos (Camas, Armarios, Cómodas)
- **Decoración**: 35 productos (Lámparas, Espejos, Jarrones)
- **Telas**: 10 productos (Cortinas, Fundas, Alfombras)
- **Muebles de Oficina**: 5 productos (Escritorios, Sillas)
- **Muebles de Jardín**: 5 productos (Mesas, Sillas, Hamacas)
- **Muebles Infantiles**: 5 productos (Camas, Armarios)
- **Productos Complementarios**: 5 productos (Adornos, Marcos)

### Escenario Realista
Los datos representan un negocio realista de muebles y decoración con:
- **3 Zonas de Ventas**: Norte, Este, Sur con equipos regionales
- **Múltiples Canales**: Residencial, Hoteles, Restaurantes, Oficinas
- **Inventario Completo**: Con productos disponibles, reservados y dañados
- **Sistema de Pagos**: Efectivo, Tarjetas, Transferencias, Cuotas
- **Movimientos de Stock**: Ingresos, Salidas, Transferencias, Devoluciones

## 🔗 Relaciones de Datos

Los datos están completamente conectados y representan un escenario realista:

1. **Empleados → Usuarios**: Cada empleado tiene su usuario correspondiente
2. **Proveedores → Compras**: Las transacciones de compra están vinculadas a proveedores
3. **Productos → Líneas de Transacción**: Cada línea referencia un producto específico
4. **Clientes → Ventas**: Las transacciones de venta están vinculadas a clientes
5. **Transacciones → Pagos**: Sistema de pagos en cuotas para ventas a crédito
6. **Productos → Movimientos**: Control completo del inventario

## 🐳 Flyway y Docker

El proyecto está configurado para usar **Flyway** con Docker para automatizar las migraciones:

### Configuración en docker-compose.dev.yml
```yaml
# Flyway Database Migrations
flyway:
  image: flyway/flyway:9-alpine
  depends_on:
    postgres:
      condition: service_healthy
  environment:
    FLYWAY_URL: jdbc:postgresql://postgres:5432/thelarte
    FLYWAY_USER: thelarte_user
    FLYWAY_PASSWORD: thelarte123
  volumes:
    - ./db/migrations:/flyway/sql
  command: -connectRetries=60 migrate
```

### Beneficios de Flyway con Docker
- ✅ **Automatización Completa**: Las migraciones se ejecutan automáticamente al iniciar los contenedores
- ✅ **Versionado**: Flyway mantiene el historial de migraciones ejecutadas
- ✅ **Idempotente**: Las migraciones ya ejecutadas no se vuelven a ejecutar
- ✅ **Control de Cambios**: Fácil seguimiento de cambios en el esquema y datos
- ✅ **Integración Continua**: Perfecto para pipelines de CI/CD

### Comandos Útiles
```bash
# Ejecutar solo las migraciones
docker-compose up flyway

# Ver logs de las migraciones
docker-compose logs flyway

# Ejecutar todo el stack
docker-compose up

# Reconstruir y ejecutar
docker-compose up --build
```

## ⚠️ Notas Importantes

1. **Orden de Ejecución**: Las migraciones deben ejecutarse en orden numérico (R__01, R__01A, R__02, etc.)
2. **Dependencias**: Cada migración depende de las anteriores
3. **Datos de Prueba**: Todos los datos son ficticios pero realistas
4. **Integridad**: Los datos mantienen la integridad referencial
5. **Flyway**: Una vez ejecutadas las migraciones con Flyway, no se pueden modificar sin crear nuevas versiones

## 🧪 Verificación

Después de ejecutar las migraciones, puedes verificar con:

```sql
-- Contar registros en cada tabla principal
SELECT
    'Empleados' as tabla, COUNT(*) as total FROM empleados
UNION ALL
SELECT 'Usuarios', COUNT(*) FROM users
UNION ALL
SELECT 'Clientes', COUNT(*) FROM clientes
UNION ALL
SELECT 'Proveedores', COUNT(*) FROM suplidor
UNION ALL
SELECT 'Productos', COUNT(*) FROM producto
UNION ALL
SELECT 'Transacciones', COUNT(*) FROM transacciones
UNION ALL
SELECT 'Líneas Transacción', COUNT(*) FROM lineas_transaccion
UNION ALL
SELECT 'Pagos', COUNT(*) FROM pagos
UNION ALL
SELECT 'Movimientos Inventario', COUNT(*) FROM movimientos_producto
ORDER BY total DESC;

-- Verificar integridad de datos
SELECT
    t.tipo,
    t.estado,
    COUNT(*) as cantidad_transacciones,
    COUNT(lt.id) as lineas_transaccion,
    SUM(t.total) as total_monto
FROM transacciones t
LEFT JOIN lineas_transaccion lt ON t.id = lt.transaccion_id
GROUP BY t.tipo, t.estado
ORDER BY t.tipo, t.estado;

-- Verificar productos por categoría
SELECT
    CASE
        WHEN tipo LIKE '%Muebles%' THEN 'Muebles'
        WHEN tipo = 'Decoración' THEN 'Decoración'
        WHEN tipo = 'Telas' THEN 'Telas'
        ELSE 'Otros'
    END as categoria,
    COUNT(*) as productos,
    AVG(precio_venta) as precio_promedio,
    SUM(cantidad_disponible) as stock_total
FROM producto
GROUP BY
    CASE
        WHEN tipo LIKE '%Muebles%' THEN 'Muebles'
        WHEN tipo = 'Decoración' THEN 'Decoración'
        WHEN tipo = 'Telas' THEN 'Telas'
        ELSE 'Otros'
    END
ORDER BY productos DESC;

-- Verificar empleados por rol
SELECT
    rol,
    COUNT(*) as cantidad,
    AVG(salario) as salario_promedio,
    SUM(CASE WHEN comision IS NOT NULL THEN 1 ELSE 0 END) as con_comision
FROM empleados
GROUP BY rol
ORDER BY cantidad DESC;

-- Verificar ventas por mes
SELECT
    DATE_TRUNC('month', fecha) as mes,
    COUNT(*) as transacciones,
    SUM(total) as total_ventas,
    AVG(total) as promedio_venta
FROM transacciones
WHERE tipo = 'VENTA'
GROUP BY DATE_TRUNC('month', fecha)
ORDER BY mes;
```

## 🔄 Mantenimiento

Para agregar nuevas migraciones:
1. Crear archivo con formato `R__XX_Descripcion.sql`
2. Aumentar el número secuencial
3. Agregar al script de ejecución
4. Actualizar este README
