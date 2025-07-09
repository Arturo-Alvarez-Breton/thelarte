class TransaccionService {
    constructor() {
        this.baseUrl = '/api/transacciones';
    }

    async obtenerTransacciones() {
        try {
            const response = await fetch(this.baseUrl);
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
            const response = await fetch(`${this.baseUrl}/${id}`);
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
                headers: {
                    'Content-Type': 'application/json',
                },
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
                headers: {
                    'Content-Type': 'application/json',
                },
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
                method: 'DELETE'
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
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    async obtenerSuplidores() {
        try {
            const response = await fetch('/api/suplidores');
            if (!response.ok) {
                throw new Error('Error al obtener suplidores');
            }
            return await response.json();
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
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
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
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP'
        }).format(monto);
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