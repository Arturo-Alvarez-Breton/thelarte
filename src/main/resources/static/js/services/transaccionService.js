class TransaccionService {
    constructor() {
        this.baseUrl = '/api/transacciones';
    }

    // Helper method to get auth headers
    getAuthHeaders() {
        const token = localStorage.getItem('authToken');
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    }

    async obtenerTransacciones() {
        try {
            const response = await fetch(this.baseUrl, {
                headers: this.getAuthHeaders()
            });
            if (!response.ok) {
                throw new Error('Error al obtener transacciones');
            }
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    async obtenerTransaccionPorId(id) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                headers: this.getAuthHeaders()
            });
            if (!response.ok) {
                throw new Error('Error al obtener transacción');
            }
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    async crearTransaccion(transaccion) {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(transaccion)
            });
            if (!response.ok) {
                throw new Error('Error al crear transacción');
            }
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    async actualizarTransaccion(id, transaccion) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(transaccion)
            });
            if (!response.ok) {
                throw new Error('Error al actualizar transacción');
            }
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    async eliminarTransaccion(id) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });
            if (!response.ok) {
                throw new Error('Error al eliminar transacción');
            }
            return true;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    async obtenerProductos() {
        try {
            const response = await fetch('/api/productos');
            if (!response.ok) {
                throw new Error('Error al obtener productos');
            }
            const productos = await response.json();
            console.log("Productos obtenidos del API:", productos); // Debug log
            return productos;
        } catch (error) {
            console.error('Error al obtener productos:', error);
            // Return test data in case of error for development
            console.log("Retornando datos de prueba para desarrollo");
            return [
                {id: 1, nombre: "Mesa de Roble", precio: 12500, cantidadDisponible: 5},
                {id: 2, nombre: "Silla Clásica", precio: 4500, cantidadDisponible: 12},
                {id: 3, nombre: "Sofá de Cuero", precio: 35000, cantidadDisponible: 2},
                {id: 4, nombre: "Lámpara de Pie", precio: 2800, cantidadDisponible: 8},
                {id: 5, nombre: "Cuadro Abstracto", precio: 3500, cantidadDisponible: 0}
            ];
        }
    }

    async obtenerSuplidores() {
        try {
            const response = await fetch('/api/suplidores');
            if (!response.ok) {
                throw new Error('Error al obtener suplidores');
            }
            const suplidores = await response.json();
            console.log("Suplidores obtenidos del API:", suplidores);
            
            // Log the structure of the first supplier if available
            if (suplidores.length > 0) {
                console.log("Estructura del primer suplidor:", Object.keys(suplidores[0]));
                console.log("Primer suplidor completo:", suplidores[0]);
            }
            
            return suplidores;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    async obtenerClientes() {
        try {
            const response = await fetch('/api/clientes');
            if (!response.ok) {
                throw new Error('Error al obtener clientes');
            }
            const clientes = await response.json();
            console.log("Clientes obtenidos del API:", clientes);
            
            // Log the structure of the first client if available
            if (clientes.length > 0) {
                console.log("Estructura del primer cliente:", Object.keys(clientes[0]));
                console.log("Primer cliente completo:", clientes[0]);
            }
            
            return clientes;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    async obtenerEmpleados() {
        try {
            const response = await fetch('/api/empleados');
            if (!response.ok) {
                throw new Error('Error al obtener empleados');
            }
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    async canEditTransaction(id) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}/can-edit`, {
                headers: this.getAuthHeaders()
            });
            if (!response.ok) {
                throw new Error('Error al verificar si la transacción puede ser editada');
            }
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    obtenerEstadosEditables() {
        return ['PENDIENTE', 'CONFIRMADA'];
    }

    formatearFecha(fecha) {
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatearMoneda(monto) {
        if (!monto && monto !== 0) return 'RD$ 0,00';
        
        // Usar formateo manual para asegurar el formato dominicano correcto
        const numero = Math.abs(monto);
        const partes = numero.toFixed(2).split('.');
        const entero = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        const decimal = partes[1];
        
        return `RD$ ${entero},${decimal}`;
    }

    obtenerEstadoColor(estado) {
        const colores = {
            'PENDIENTE': 'warning',
            'CONFIRMADA': 'info',
            'COMPLETADA': 'success',
            'CANCELADA': 'danger',
            'FACTURADA': 'primary',
            'RECIBIDA': 'success',
            'PAGADA': 'success',
            'ENTREGADA': 'success',
            'COBRADA': 'success'
        };
        return colores[estado] || 'secondary';
    }

    obtenerTipoIcon(tipo) {
        const iconos = {
            'COMPRA': 'fas fa-shopping-cart',
            'VENTA': 'fas fa-cash-register',
            'DEVOLUCION_COMPRA': 'fas fa-undo',
            'DEVOLUCION_VENTA': 'fas fa-undo-alt'
        };
        return iconos[tipo] || 'fas fa-file';
    }
}

window.TransaccionService = TransaccionService;