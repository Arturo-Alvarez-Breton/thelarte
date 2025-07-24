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

    // Cliente Methods
    async getClientes(busqueda = null, page = 0, size = 10) {
        console.log('Fetching clients with search:', busqueda);
        try {
            // Use the direct cliente endpoint instead of cajero
            const response = await fetch(`/api/clientes`);
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
            const response = await fetch(`/api/clientes/${cedula}`);
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

    async createCliente(clienteData) {
        console.log('Creating client:', clienteData);
        try {
            const response = await fetch(`/api/clientes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
            const response = await fetch(`/api/clientes/${cedula}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
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
            const response = await fetch(`/api/clientes/${cedula}`, {
                method: 'DELETE'
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

    // Producto Methods
    async createProducto(productoData) {
        console.log('Creating product:', productoData);
        try {
            const response = await fetch(`${this.baseUrl}/productos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
            const response = await fetch(`${this.baseUrl}/productos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
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
            const response = await fetch(`${this.baseUrl}/productos/${id}`, {
                method: 'DELETE'
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
            const response = await fetch(`${this.baseUrl}/unidades`);
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

            const response = await fetch(`${this.baseUrl}/productos?${queryParams.toString()}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching products for sale:', error);
            throw error;
        }
    }

    // Suplidor Methods
    async getSuplidores(busqueda = null) {
        console.log('Fetching suppliers with search:', busqueda);
        try {
            const response = await fetch('/api/suplidores');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const allSuplidores = await response.json();
            
            // Apply search filter on frontend if needed
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
            const response = await fetch(`/api/suplidores/${id}`);
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
            const response = await fetch('/api/suplidores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
            const response = await fetch(`/api/suplidores/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
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
            const response = await fetch(`/api/suplidores/${id}?logico=${logico}`, {
                method: 'DELETE'
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

}
