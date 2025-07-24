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
            window.showToast('Error al cargar los clientes.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    renderClientes() {
        const container = document.getElementById('clientesListContainer');
        if (!container) return;

        if (this.filteredClientes.length === 0) {
            container.innerHTML = '<p class="text-gray-600">No hay clientes disponibles.</p>';
            return;
        }

        container.innerHTML = this.filteredClientes.map(cliente => `
            <div class="bg-white rounded-lg shadow-md p-4">
                <h3 class="text-lg font-semibold">${cliente.nombre} ${cliente.apellido}</h3>
                <p class="text-gray-600">Cédula: ${cliente.cedula}</p>
                <p class="text-gray-600">Teléfono: ${cliente.telefono || 'N/A'}</p>
                <p class="text-gray-600">Email: ${cliente.email || 'N/A'}</p>
                <div class="mt-4 flex space-x-2">
                    <button onclick="clientesManager.editCliente('${cliente.cedula}')" class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Editar</button>
                    <button onclick="clientesManager.deleteCliente('${cliente.cedula}')" class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Eliminar</button>
                </div>
            </div>
        `).join('');
    }

    filterClientes() {
        this.currentPage = 0;
        this.loadClientes();
    }

    newCliente() {
        window.showToast('Funcionalidad para añadir nuevo cliente en desarrollo.', 'info');
    }

    editCliente(cedula) {
        window.showToast(`Funcionalidad para editar cliente ${cedula} en desarrollo.`, 'info');
    }

    async deleteCliente(cedula) {
        if (confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
            try {
                // Assuming a deleteClient method exists in TransaccionService or a new ClienteService
                // await this.transaccionService.deleteClient(cedula);
                window.showToast('Cliente eliminado exitosamente (simulado).', 'success');
                this.loadClientes();
            } catch (error) {
                console.error('Error deleting client:', error);
                window.showToast('Error al eliminar el cliente.', 'error');
            }
        }
    }

    showLoading() {
        document.getElementById('clientesListContainer').innerHTML = '<div class="flex items-center justify-center py-12"><div class="animate-spin h-8 w-8 border-4 border-brand-brown border-t-transparent rounded-full"></div></div>';
    }

    hideLoading() {
        // No specific hide loading for now, as content replaces spinner
    }
}

const clientesManager = new ClientesManager();
window.clientesManager = clientesManager;
