#!/bin/bash

# ========================================================================================
# SCRIPT DE EJECUCIÓN DE MIGRACIONES - THE LARTE
# ========================================================================================

# Configuración de la base de datos
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"5432"}
DB_NAME=${DB_NAME:-"thelarte"}
DB_USER=${DB_USER:-"thelarte"}
DB_PASSWORD=${DB_PASSWORD:-"password"}

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Función para verificar si PostgreSQL está disponible
check_postgres() {
    if ! command -v psql &> /dev/null; then
        log_error "PostgreSQL client (psql) no está instalado"
        exit 1
    fi
}

# Función para verificar conexión a la base de datos
check_connection() {
    log_info "Verificando conexión a la base de datos..."
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" &> /dev/null; then
        log_success "Conexión a la base de datos exitosa"
        return 0
    else
        log_error "No se puede conectar a la base de datos"
        log_info "Verifica que:"
        log_info "  - La base de datos '$DB_NAME' existe"
        log_info "  - El usuario '$DB_USER' tiene permisos"
        log_info "  - El servidor PostgreSQL esté ejecutándose en $DB_HOST:$DB_PORT"
        exit 1
    fi
}

# Función para ejecutar una migración
run_migration() {
    local migration_file="$1"
    local migration_name="$2"

    if [ ! -f "$migration_file" ]; then
        log_error "Archivo de migración no encontrado: $migration_file"
        return 1
    fi

    log_info "Ejecutando migración: $migration_name"

    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$migration_file" 2>&1; then
        log_success "Migración completada: $migration_name"
        return 0
    else
        log_error "Error ejecutando migración: $migration_name"
        return 1
    fi
}

# Función para mostrar ayuda
show_help() {
    cat << EOF
Uso: $0 [OPCIONES]

Script para ejecutar las migraciones de base de datos de The Larte

OPCIONES:
    -h, --help              Mostrar esta ayuda
    -H, --host HOST         Host de la base de datos (default: localhost)
    -P, --port PORT         Puerto de la base de datos (default: 5432)
    -d, --database DB       Nombre de la base de datos (default: thelarte)
    -u, --user USER         Usuario de la base de datos (default: thelarte)
    -p, --password PASS     Contraseña de la base de datos (default: password)
    --dry-run               Solo mostrar lo que se ejecutaría, sin ejecutar

EJEMPLOS:
    $0                                              # Ejecutar con configuración por defecto
    $0 -H 192.168.1.100 -P 5433 -d mi_base         # Con configuración personalizada
    $0 --dry-run                                    # Ver qué se ejecutaría

VARIABLES DE ENTORNO:
    DB_HOST         Host de la base de datos
    DB_PORT         Puerto de la base de datos
    DB_NAME         Nombre de la base de datos
    DB_USER         Usuario de la base de datos
    DB_PASSWORD     Contraseña de la base de datos

EOF
}

# Función para dry run
dry_run() {
    log_info "DRY RUN - Mostrando migraciones que se ejecutarían:"
    echo

    local migrations=(
        "R__01_Empleados_y_Usuarios.sql:Empleados y usuarios del sistema"
        "R__01A_Empleados_Expandidos.sql:Empleados adicionales (masivos)"
        "R__02_Clientes.sql:Clientes residenciales y comerciales"
        "R__02A_Clientes_Expandidos.sql:Clientes adicionales (masivos)"
        "R__03_Proveedores.sql:Proveedores y teléfonos"
        "R__04_Productos.sql:Catálogo de productos"
        "R__04A_Productos_Expandidos.sql:Productos adicionales (masivos)"
        "R__05_Transacciones_Compras.sql:Transacciones de compra"
        "R__05A_Transacciones_Compras_Masivas.sql:Compras adicionales (masivas)"
        "R__06_Transacciones_Ventas.sql:Transacciones de venta"
        "R__06A_Transacciones_Ventas_Masivas.sql:Ventas adicionales (masivas)"
        "R__07_Pagos_Cuotas.sql:Sistema de pagos en cuotas"
        "R__08_Movimientos_Inventario.sql:Movimientos de inventario"
        "R__09_Devoluciones.sql:Transacciones de devolución"
    )

    for migration in "${migrations[@]}"; do
        local file="${migration%%:*}"
        local desc="${migration#*:}"
        if [ -f "$file" ]; then
            log_info "✓ $file - $desc"
        else
            log_warning "✗ $file - $desc (ARCHIVO NO ENCONTRADO)"
        fi
    done

    echo
    log_info "Para ejecutar realmente las migraciones, quita la opción --dry-run"
}

# Procesar argumentos
DRY_RUN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -H|--host)
            DB_HOST="$2"
            shift 2
            ;;
        -P|--port)
            DB_PORT="$2"
            shift 2
            ;;
        -d|--database)
            DB_NAME="$2"
            shift 2
            ;;
        -u|--user)
            DB_USER="$2"
            shift 2
            ;;
        -p|--password)
            DB_PASSWORD="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        *)
            log_error "Opción desconocida: $1"
            echo
            show_help
            exit 1
            ;;
    esac
done

# Mostrar configuración
echo "=================================================================================="
log_info "CONFIGURACIÓN DE EJECUCIÓN"
echo "=================================================================================="
log_info "Host: $DB_HOST:$DB_PORT"
log_info "Base de datos: $DB_NAME"
log_info "Usuario: $DB_USER"
log_info "Dry Run: $DRY_RUN"
echo "=================================================================================="
echo

# Dry run
if [ "$DRY_RUN" = true ]; then
    dry_run
    exit 0
fi

# Verificaciones previas
check_postgres
check_connection

# Ejecutar migraciones
log_info "Iniciando ejecución de migraciones..."
echo

MIGRATIONS=(
    "R__01_Empleados_y_Usuarios.sql:Empleados y usuarios del sistema"
    "R__01A_Empleados_Expandidos.sql:Empleados adicionales (masivos)"
    "R__02_Clientes.sql:Clientes residenciales y comerciales"
    "R__02A_Clientes_Expandidos.sql:Clientes adicionales (masivos)"
    "R__03_Proveedores.sql:Proveedores y teléfonos"
    "R__04_Productos.sql:Catálogo de productos"
    "R__04A_Productos_Expandidos.sql:Productos adicionales (masivos)"
    "R__05_Transacciones_Compras.sql:Transacciones de compra"
    "R__05A_Transacciones_Compras_Masivas.sql:Compras adicionales (masivas)"
    "R__06_Transacciones_Ventas.sql:Transacciones de venta"
    "R__06A_Transacciones_Ventas_Masivas.sql:Ventas adicionales (masivas)"
    "R__07_Pagos_Cuotas.sql:Sistema de pagos en cuotas"
    "R__08_Movimientos_Inventario.sql:Movimientos de inventario"
    "R__09_Devoluciones.sql:Transacciones de devolución"
)

SUCCESS_COUNT=0
ERROR_COUNT=0

for migration in "${MIGRATIONS[@]}"; do
    file="${migration%%:*}"
    desc="${migration#*:}"

    if run_migration "$file" "$desc"; then
        ((SUCCESS_COUNT++))
    else
        ((ERROR_COUNT++))
        log_error "Falló la migración: $desc"
        log_warning "Deteniendo ejecución por error. Revisa el archivo $file"
        break
    fi

    echo
done

# Resumen final
echo "=================================================================================="
log_info "RESUMEN DE EJECUCIÓN"
echo "=================================================================================="
log_success "Migraciones exitosas: $SUCCESS_COUNT"
if [ $ERROR_COUNT -gt 0 ]; then
    log_error "Migraciones fallidas: $ERROR_COUNT"
    log_warning "Algunas migraciones fallaron. Revisa los errores arriba."
    exit 1
else
    log_success "¡Todas las migraciones se ejecutaron correctamente!"
    echo
    log_info "Siguientes pasos recomendados:"
    log_info "1. Verifica los datos con: SELECT COUNT(*) FROM empleados, clientes, producto, transacciones;"
    log_info "2. Revisa las consultas del archivo ejecutar_migraciones.sql"
    log_info "3. Ejecuta la aplicación para probar la funcionalidad"
fi
echo "=================================================================================="
