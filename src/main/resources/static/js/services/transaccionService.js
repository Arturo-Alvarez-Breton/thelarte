export class TransaccionService {
    constructor() {
        this.baseUrl = '/api'; // Base URL for the API
    }

    // --- Helper para obtener el token ---
    getAuthToken() {
        return localStorage.getItem('authToken');
    }

    async obtenerTransacciones(filters = {}) {
        console.log('Fetching transactions with filters:', filters);
        try {
            // Check if filters are provided
            const hasFilters = filters.tipo || filters.estado || filters.busqueda || filters.page !== undefined || filters.size !== undefined;
            
            let endpoint = `${this.baseUrl}/transacciones`;
            if (hasFilters) {
                endpoint = `${this.baseUrl}/transacciones/filtered`;
            }
            
            const queryParams = new URLSearchParams(filters).toString();
            const authToken = this.getAuthToken();
            const response = await fetch(`${endpoint}?${queryParams}`, {
                headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
            });
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
            const authToken = this.getAuthToken();
            const response = await fetch(`${this.baseUrl}/transacciones/${id}`, {
                headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
            });
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
            const authToken = this.getAuthToken();
            const response = await fetch(`${this.baseUrl}/transacciones`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authToken && { 'Authorization': `Bearer ${authToken}` })
                },
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
            const authToken = this.getAuthToken();
            const response = await fetch(`${this.baseUrl}/transacciones/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authToken && { 'Authorization': `Bearer ${authToken}` })
                },
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
            const authToken = this.getAuthToken();
            const response = await fetch(`${this.baseUrl}/transacciones/${id}`, {
                method: 'DELETE',
                headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
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
            const authToken = this.getAuthToken();
            const response = await fetch(`${this.baseUrl}/clientes/${cedula}`, {
                headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
            });
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
            const authToken = this.getAuthToken();
            const response = await fetch(`${this.baseUrl}/productos/codigo/${codigo}`, {
                headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
            });
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
            const authToken = this.getAuthToken();
            const response = await fetch(`${this.baseUrl}/dashboard`, {
                headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
            });
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
            const authToken = this.getAuthToken();
            const response = await fetch(`${this.baseUrl}/reportes/ventas-dia${queryParams}`, {
                headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
            });
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
            const authToken = this.getAuthToken();
            const response = await fetch(`${this.baseUrl}/reportes/productos-mas-vendidos?${queryParams}`, {
                headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
            });
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
            const authToken = this.getAuthToken();
            const response = await fetch(`${this.baseUrl}/configuracion`, {
                headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
            });
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
            const authToken = this.getAuthToken();
            const response = await fetch(`${this.baseUrl}/configuracion`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authToken && { 'Authorization': `Bearer ${authToken}` })
                },
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

    // Cliente Methods
    async getClientes(busqueda = null, page = 0, size = 10) {
        console.log('Fetching clients with search:', busqueda);
        try {
            const authToken = this.getAuthToken();
            // Usar el endpoint /todos para obtener TODOS los clientes (activos y eliminados)
            const response = await fetch(`/api/clientes/todos`, {
                headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const allClientes = await response.json();

            // Apply search filter on frontend if needed
            let filteredClientes = allClientes;
            if (busqueda) {
                const searchTerm = busqueda.toLowerCase();
                filteredClientes = allClientes.filter(cliente =>
                    cliente.nombre.toLowerCase().includes(searchTerm) ||
                    cliente.apellido.toLowerCase().includes(searchTerm) ||
                    cliente.cedula.toLowerCase().includes(searchTerm) ||
                    (cliente.email && cliente.email.toLowerCase().includes(searchTerm))
                );
            }

            return filteredClientes;
        } catch (error) {
            console.error('Error fetching clients:', error);
            throw error;
        }
    }

    async getClienteByCedula(cedula) {
        console.log('Fetching client by cedula:', cedula);
        try {
            const authToken = this.getAuthToken();
            const response = await fetch(`/api/clientes/${cedula}`, {
                headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
            });
            if (!response.ok) {
                if (response.status === 404) return null;
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching client by cedula:', error);
            throw error;
        }
    }
    // Añadir este método en TransaccionService.js
    async registrarPago(datosPago) {
        const url = `/api/transacciones/${datosPago.transaccionId}/pagos`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datosPago)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al registrar el pago');
        }

        return await response.json();
    }

    async createCliente(clienteData) {
        console.log('Creating client:', clienteData);
        try {
            const authToken = this.getAuthToken();
            const response = await fetch(`/api/clientes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authToken && { 'Authorization': `Bearer ${authToken}` })
                },
                body: JSON.stringify(clienteData)
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error creating client:', error);
            throw error;
        }
    }

    async updateCliente(cedula, clienteData) {
        console.log('Updating client:', cedula, clienteData);
        try {
            const authToken = this.getAuthToken();
            const response = await fetch(`/api/clientes/${cedula}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authToken && { 'Authorization': `Bearer ${authToken}` })
                },
                body: JSON.stringify(clienteData)
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error updating client:', error);
            throw error;
        }
    }

    async deleteCliente(cedula) {
        console.log('Deleting client:', cedula);
        try {
            const authToken = this.getAuthToken();
            const response = await fetch(`/api/clientes/${cedula}`, {
                method: 'DELETE',
                headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            return { success: true };
        } catch (error) {
            console.error('Error deleting client:', error);
            throw error;
        }
    }

    async restaurarCliente(cedula) {
        console.log('Restoring client with cedula:', cedula);
        try {
            const authToken = this.getAuthToken();
            const response = await fetch(`/api/clientes/${cedula}/restaurar`, {
                method: 'POST',
                headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return { success: true };
        } catch (error) {
            console.error('Error restoring client:', error);
            throw error;
        }
    }

    // Producto Methods
    async createProducto(productoData) {
        console.log('Creating product:', productoData);
        try {
            const authToken = this.getAuthToken();
            const response = await fetch(`${this.baseUrl}/productos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authToken && { 'Authorization': `Bearer ${authToken}` })
                },
                body: JSON.stringify(productoData)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    }

    async updateProducto(id, productoData) {
        console.log('Updating product:', id, productoData);
        try {
            const authToken = this.getAuthToken();
            const response = await fetch(`${this.baseUrl}/productos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authToken && { 'Authorization': `Bearer ${authToken}` })
                },
                body: JSON.stringify(productoData)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    }

    async deleteProducto(id) {
        console.log('Deleting product:', id);
        try {
            const authToken = this.getAuthToken();
            const response = await fetch(`${this.baseUrl}/productos/${id}`, {
                method: 'DELETE',
                headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return { success: true };
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    }

    async getUnidades() {
        console.log('Fetching units');
        try {
            const authToken = this.getAuthToken();
            const response = await fetch(`${this.baseUrl}/unidades`, {
                headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching units:', error);
            throw error;
        }
    }

    async getProductosParaVenta(busqueda = null, categoria = null, page = 0, size = 100) {
        console.log('Fetching products for sale with search:', busqueda);
        try {
            const queryParams = new URLSearchParams();
            if (busqueda) queryParams.append('busqueda', busqueda);
            if (categoria) queryParams.append('categoria', categoria);
            queryParams.append('page', page);
            queryParams.append('size', size);

            const authToken = this.getAuthToken();
            const response = await fetch(`${this.baseUrl}/productos?${queryParams.toString()}`, {
                headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching products for sale:', error);
            throw error;
        }
    }

    // En transaccionService.js
    async createDevolucion(payload) {
        try {
            const authToken = this.getAuthToken();
            const response = await fetch('/api/transacciones', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authToken && { 'Authorization': `Bearer ${authToken}` })
                },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error('Error al procesar la devolución');
            return await response.json();
        } catch (error) {
            console.error('Error en createDevolucion:', error);
            throw error;
        }
    }

    async getTransacciones(filters = {}) {
        try {
            let url = '/api/transacciones?';
            if (filters.tipo) url += `tipo=${encodeURIComponent(filters.tipo)}&`;
            if (filters.estado) url += `estado=${encodeURIComponent(filters.estado)}&`;
            if (filters.busqueda) url += `busqueda=${encodeURIComponent(filters.busqueda)}&`;
            if (url.endsWith('&')) url = url.slice(0, -1);

            const authToken = this.getAuthToken();
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authToken && { 'Authorization': `Bearer ${authToken}` })
                }
            });

            if (!response.ok) {
                throw new Error('Error al obtener transacciones');
            }

            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error en getTransacciones:', error);
            window.showToast('Error cargando transacciones', 'error');
            return [];
        }
    }

    // Suplidor Methods
    async getSuplidores(busqueda = null) {
        console.log('Fetching suppliers with search:', busqueda);
        try {
            const authToken = this.getAuthToken();
            const response = await fetch('/api/suplidores', {
                headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const allSuplidores = await response.json();

            let filteredSuplidores = allSuplidores;
            if (busqueda) {
                const searchTerm = busqueda.toLowerCase();
                filteredSuplidores = allSuplidores.filter(suplidor =>
                    suplidor.nombre.toLowerCase().includes(searchTerm) ||
                    (suplidor.rnc && suplidor.rnc.toLowerCase().includes(searchTerm)) ||
                    (suplidor.ciudad && suplidor.ciudad.toLowerCase().includes(searchTerm))
                );
            }

            return filteredSuplidores;
        } catch (error) {
            console.error('Error fetching suppliers:', error);
            throw error;
        }
    }

    async getSuplidorById(id) {
        console.log('Fetching supplier by ID:', id);
        try {
            const authToken = this.getAuthToken();
            const response = await fetch(`/api/suplidores/${id}`, {
                headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
            });
            if (!response.ok) {
                if (response.status === 404) return null;
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching supplier by ID:', error);
            throw error;
        }
    }

    async createSuplidor(suplidorData) {
        console.log('Creating supplier:', suplidorData);
        try {
            const authToken = this.getAuthToken();
            const response = await fetch('/api/suplidores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authToken && { 'Authorization': `Bearer ${authToken}` })
                },
                body: JSON.stringify(suplidorData)
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error creating supplier:', error);
            throw error;
        }
    }

    async updateSuplidor(id, suplidorData) {
        console.log('Updating supplier:', id, suplidorData);
        try {
            const authToken = this.getAuthToken();
            const response = await fetch(`/api/suplidores/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authToken && { 'Authorization': `Bearer ${authToken}` })
                },
                body: JSON.stringify(suplidorData)
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error updating supplier:', error);
            throw error;
        }
    }

    async deleteSuplidor(id, logico = true) {
        console.log('Deleting supplier:', id, 'logical:', logico);
        try {
            const authToken = this.getAuthToken();
            const response = await fetch(`/api/suplidores/${id}?logico=${logico}`, {
                method: 'DELETE',
                headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            return { success: true };
        } catch (error) {
            console.error('Error deleting supplier:', error);
            throw error;
        }
    }

    async cambiarEstadoTransaccion(id, nuevoEstado) {
        // Cambia el estado en el backend usando el endpoint correcto
        try {
            const authToken = this.getAuthToken();
            const response = await fetch(`${this.baseUrl}/transacciones/${id}/estado?estado=${encodeURIComponent(nuevoEstado)}`, {
                method: "PUT",
                headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error changing transaction state:', error);
            throw error;
        }
    }
}