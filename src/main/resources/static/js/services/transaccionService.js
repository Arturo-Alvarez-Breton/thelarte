// src/main/resources/static/js/services/transaccionService.js

export class TransaccionService {
    constructor() {
        this.baseUrl = '/api/cajero'; // Base URL for the API
    }

    async obtenerTransacciones(filters = {}) {
        console.log('Fetching transactions with filters:', filters);
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const response = await fetch(`${this.baseUrl}/transacciones?${queryParams}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching transactions:', error);
            throw error; // Re-throw to be handled by the caller
        }
    }

    async obtenerTransaccionPorId(id) {
        console.log('Fetching transaction by ID:', id);
        try {
            const response = await fetch(`${this.baseUrl}/transacciones/${id}`);
            if (!response.ok) {
                if (response.status === 404) return null; // Transaction not found
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching transaction by ID:', error);
            throw error;
        }
    }

    async crearTransaccion(transactionData) {
        console.log('Creating transaction:', transactionData);
        try {
            const response = await fetch(`${this.baseUrl}/transacciones`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(transactionData)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error creating transaction:', error);
            throw error;
        }
    }

    async actualizarTransaccion(id, transactionData) {
        console.log('Updating transaction:', id, transactionData);
        try {
            const response = await fetch(`${this.baseUrl}/transacciones/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(transactionData)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error updating transaction:', error);
            throw error;
        }
    }

    async eliminarTransaccion(id) {
        console.log('Deleting transaction:', id);
        try {
            const response = await fetch(`${this.baseUrl}/transacciones/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return { success: true };
        } catch (error) {
            console.error('Error deleting transaction:', error);
            throw error;
        }
    }

    async getClienteByCedula(cedula) {
        console.log('Fetching client by cedula:', cedula);
        try {
            const response = await fetch(`${this.baseUrl}/clientes/${cedula}`);
            if (!response.ok) {
                if (response.status === 404) return null; // Client not found
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching client by cedula:', error);
            throw error;
        }
    }

    async getProductoByCodigo(codigo) {
        console.log('Fetching product by code:', codigo);
        try {
            const response = await fetch(`${this.baseUrl}/productos/codigo/${codigo}`);
            if (!response.ok) {
                if (response.status === 404) return null; // Product not found
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching product by code:', error);
            throw error;
        }
    }

    async getDashboardData() {
        console.log('Fetching dashboard data');
        try {
            const response = await fetch(`${this.baseUrl}/dashboard`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    }

    async getReporteVentasDelDia(fecha) {
        console.log('Fetching daily sales report for:', fecha);
        try {
            const queryParams = fecha ? `?fecha=${fecha}` : '';
            const response = await fetch(`${this.baseUrl}/reportes/ventas-dia${queryParams}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching daily sales report:', error);
            throw error;
        }
    }

    async getProductosMasVendidos(fechaDesde, fechaHasta, limite) {
        console.log('Fetching top selling products');
        try {
            const queryParams = new URLSearchParams({
                ...(fechaDesde && { fechaDesde }),
                ...(fechaHasta && { fechaHasta }),
                ...(limite && { limite })
            }).toString();
            const response = await fetch(`${this.baseUrl}/reportes/productos-mas-vendidos?${queryParams}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching top selling products:', error);
            throw error;
        }
    }

    async getConfiguracionCaja() {
        console.log('Fetching cash register configuration');
        try {
            const response = await fetch(`${this.baseUrl}/configuracion`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching cash register configuration:', error);
            throw error;
        }
    }

    async actualizarConfiguracionCaja(configuracion) {
        console.log('Updating cash register configuration:', configuracion);
        try {
            const response = await fetch(`${this.baseUrl}/configuracion`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(configuracion)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return { success: true };
        } catch (error) {
            console.error('Error updating cash register configuration:', error);
            throw error;
        }
    }
}
