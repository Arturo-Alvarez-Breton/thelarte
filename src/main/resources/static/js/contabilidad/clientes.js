// src/main/resources/static/js/contabilidad/clientes.js

import { TransaccionService } from '../services/transaccionService.js';

class ClientesManager {
    constructor() {
        this.transaccionService = new TransaccionService();
        this.clientes = [];
        this.filteredClientes = [];
        this.currentPage = 0;
        this.clientesPerPage = 10;

        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadClientes();
    }

    setupEventListeners() {
        document.getElementById('nuevoClienteBtn')?.addEventListener('click', () => this.newCliente());
        document.getElementById('clientSearchInput')?.addEventListener('keyup', () => this.filterClientes());
        document.getElementById('formCliente')?.addEventListener('submit', (e) => this.handleSubmitCliente(e));
    }

    async loadClientes() {
        this.showLoading();
        try {
            const filters = {
                busqueda: document.getElementById('clientSearchInput')?.value || null,
                page: this.currentPage,
                size: this.clientesPerPage
            };
            this.clientes = await this.transaccionService.getClientes(filters.busqueda, filters.page, filters.size);
            this.filteredClientes = [...this.clientes];
            this.renderClientes();
        } catch (error) {
            console.error('Error loading clients:', error);
            // Show empty state instead of error for no data scenarios
            this.clientes = [];
            this.filteredClientes = [];
            this.renderClientes();
        } finally {
            this.hideLoading();
        }
    }

    renderClientes() {
        const container = document.getElementById('clientesListContainer');
        if (!container) return;

        if (this.filteredClientes.length === 0) {
            const searchTerm = document.getElementById('clientSearchInput')?.value;
            const emptyMessage = searchTerm ? 
                `No se encontraron clientes que coincidan con "${searchTerm}".` : 
                'No hay clientes registrados.';
            
            container.innerHTML = `
                <div class="text-center py-12">
                    <div class="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <i class="fas fa-users text-3xl text-gray-400"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Sin clientes</h3>
                    <p class="text-gray-600 mb-6">${emptyMessage}</p>
                    ${!searchTerm ? `
                        <button onclick="clientesManager.newCliente()" class="bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-light-brown">
                            <i class="fas fa-plus mr-2"></i>Agregar Primer Cliente
                        </button>
                    ` : `
                        <button onclick="document.getElementById('clientSearchInput').value = ''; clientesManager.filterClientes();" class="text-brand-brown hover:text-brand-light-brown">
                            <i class="fas fa-times mr-2"></i>Limpiar búsqueda
                        </button>
                    `}
                </div>
            `;
            return;
        }

        container.innerHTML = this.filteredClientes.map(cliente => `
            <div class="bg-white rounded-lg shadow-md p-4">
                <h3 class="text-lg font-semibold">${cliente.nombre} ${cliente.apellido}</h3>
                <p class="text-gray-600">Cédula: ${cliente.cedula}</p>
                <p class="text-gray-600">Teléfono: ${cliente.telefono || 'N/A'}</p>
                <p class="text-gray-600">Email: ${cliente.email || 'N/A'}</p>
                <div class="mt-4 flex space-x-2">
                    <button onclick="clientesManager.verCliente('${cliente.cedula}')" class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Ver Detalles</button>
                    <button onclick="clientesManager.verTransaccionesCliente('${cliente.cedula}')" class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">Ver Transacciones</button>
                </div>
            </div>
        `).join('');
    }

    filterClientes() {
        this.currentPage = 0;
        this.loadClientes();
    }

    newCliente() {
        this.currentCliente = null;
        this.clearForm();
        document.getElementById('modalClienteTitle').textContent = 'Nuevo Cliente';
        document.getElementById('btnClienteIcon').className = 'fas fa-plus mr-2';
        document.getElementById('btnClienteText').textContent = 'Crear Cliente';
        document.getElementById('clienteCedula').disabled = false;
        document.getElementById('modalCliente').classList.remove('hidden');
    }

    async verCliente(cedula) {
        try {
            const cliente = this.clientes.find(c => c.cedula === cedula);
            if (!cliente) {
                window.showToast('Cliente no encontrado.', 'error');
                return;
            }

            document.getElementById('detallesCliente').innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Nombre</label>
                        <p class="mt-1 text-sm text-gray-900">${cliente.nombre}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Apellido</label>
                        <p class="mt-1 text-sm text-gray-900">${cliente.apellido}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Cédula</label>
                        <p class="mt-1 text-sm text-gray-900">${cliente.cedula}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Teléfono</label>
                        <p class="mt-1 text-sm text-gray-900">${cliente.telefono || 'N/A'}</p>
                    </div>
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700">Email</label>
                        <p class="mt-1 text-sm text-gray-900">${cliente.email || 'N/A'}</p>
                    </div>
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700">Dirección</label>
                        <p class="mt-1 text-sm text-gray-900">${cliente.direccion || 'N/A'}</p>
                    </div>
                </div>
            `;
            
            this.currentCliente = cliente;
            document.getElementById('modalVerCliente').classList.remove('hidden');
        } catch (error) {
            console.error('Error viewing client:', error);
            window.showToast('Error al mostrar los detalles del cliente.', 'error');
        }
    }

    async editCliente(cedula) {
        try {
            const cliente = this.clientes.find(c => c.cedula === cedula);
            if (!cliente) {
                window.showToast('Cliente no encontrado.', 'error');
                return;
            }

            // Fetch complete client data from API to ensure we have all fields
            const clienteCompleto = await this.transaccionService.getClienteByCedula(cedula);
            
            this.currentCliente = clienteCompleto || cliente;
            this.fillForm(this.currentCliente);
            document.getElementById('modalClienteTitle').textContent = 'Editar Cliente';
            document.getElementById('btnClienteIcon').className = 'fas fa-save mr-2';
            document.getElementById('btnClienteText').textContent = 'Actualizar Cliente';
            document.getElementById('clienteCedula').disabled = true;
            document.getElementById('modalCliente').classList.remove('hidden');
        } catch (error) {
            console.error('Error loading client for edit:', error);
            // Fallback to cached data
            const cliente = this.clientes.find(c => c.cedula === cedula);
            if (cliente) {
                this.currentCliente = cliente;
                this.fillForm(cliente);
                document.getElementById('modalClienteTitle').textContent = 'Editar Cliente';
                document.getElementById('btnClienteIcon').className = 'fas fa-save mr-2';
                document.getElementById('btnClienteText').textContent = 'Actualizar Cliente';
                document.getElementById('clienteCedula').disabled = true;
                document.getElementById('modalCliente').classList.remove('hidden');
            } else {
                window.showToast('Error al cargar los datos del cliente.', 'error');
            }
        }
    }

    // Método deleteCliente eliminado - no se permite eliminar clientes

    async handleSubmitCliente(e) {
        e.preventDefault();
        console.log('Submit form triggered');
        
        const formData = new FormData(e.target);
        const clienteData = {
            nombre: formData.get('nombre'),
            apellido: formData.get('apellido'),
            cedula: formData.get('cedula'),
            telefono: formData.get('telefono'),
            email: formData.get('email'),
            direccion: formData.get('direccion')
        };

        console.log('Cliente data:', clienteData);

        try {
            if (this.currentCliente) {
                console.log('Updating client:', this.currentCliente.cedula);
                await this.transaccionService.updateCliente(this.currentCliente.cedula, clienteData);
                window.showToast('Cliente actualizado exitosamente.', 'success');
            } else {
                console.log('Creating new client');
                await this.transaccionService.createCliente(clienteData);
                window.showToast('Cliente creado exitosamente.', 'success');
            }
            
            this.cerrarModalCliente();
            this.loadClientes();
        } catch (error) {
            console.error('Error saving client:', error);
            const errorMessage = error.message || 'Error desconocido';
            window.showToast(`Error al guardar el cliente: ${errorMessage}`, 'error');
        }
    }

    clearForm() {
        document.getElementById('formCliente').reset();
    }

    fillForm(cliente) {
        document.getElementById('clienteNombre').value = cliente.nombre || '';
        document.getElementById('clienteApellido').value = cliente.apellido || '';
        document.getElementById('clienteCedula').value = cliente.cedula || '';
        document.getElementById('clienteTelefono').value = cliente.telefono || '';
        document.getElementById('clienteEmail').value = cliente.email || '';
        document.getElementById('clienteDireccion').value = cliente.direccion || '';
    }

    cerrarModalCliente() {
        document.getElementById('modalCliente').classList.add('hidden');
        this.clearForm();
        this.currentCliente = null;
    }

    cerrarModalVerCliente() {
        document.getElementById('modalVerCliente').classList.add('hidden');
        this.currentCliente = null;
    }

    async verTransaccionesCliente(cedula) {
        try {
            const cliente = this.clientes.find(c => c.cedula === cedula);
            if (!cliente) {
                window.showToast('Cliente no encontrado.', 'error');
                return;
            }

            // Redirect to transactions page with client filter
            const transaccionesUrl = new URL('/pages/contabilidad/transacciones.html', window.location.origin);
            transaccionesUrl.searchParams.set('cliente', cedula);
            transaccionesUrl.searchParams.set('clienteNombre', `${cliente.nombre} ${cliente.apellido}`);
            window.location.href = transaccionesUrl.toString();
        } catch (error) {
            console.error('Error viewing client transactions:', error);
            window.showToast('Error al ver las transacciones del cliente.', 'error');
        }
    }

    editarClienteDesdeDetalle() {
        if (this.currentCliente) {
            this.cerrarModalVerCliente();
            this.editCliente(this.currentCliente.cedula);
        }
    }

    showLoading() {
        const container = document.getElementById('clientesListContainer');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <div class="animate-spin h-10 w-10 border-4 border-brand-brown border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p class="text-gray-600 font-medium">Consultando información de clientes...</p>
                    <p class="text-gray-500 text-sm mt-2">Un momento, por favor</p>
                </div>
            `;
        }
    }

    hideLoading() {
        // Content will replace the loading spinner, no need for explicit hiding
    }

    showError(message) {
        const container = document.getElementById('clientesListContainer');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <div class="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <i class="fas fa-exclamation-triangle text-3xl text-red-400"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Error al cargar</h3>
                    <p class="text-gray-600 mb-6">${message}</p>
                    <button onclick="clientesManager.loadClientes()" class="bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-light-brown">
                        <i class="fas fa-refresh mr-2"></i>Reintentar
                    </button>
                </div>
            `;
        }
    }
}

const clientesManager = new ClientesManager();
window.clientesManager = clientesManager;

// Funciones globales para los event handlers de los modales
window.cerrarModalCliente = () => clientesManager.cerrarModalCliente();
window.cerrarModalVerCliente = () => clientesManager.cerrarModalVerCliente();
window.editarClienteDesdeDetalle = () => clientesManager.editarClienteDesdeDetalle();
