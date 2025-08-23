// src/main/resources/static/js/contabilidad/clientes.js

import { TransaccionService } from '../services/transaccionService.js';
import { TableViewManager } from '../components/tableView.js';

class ClientesManager {
    constructor() {
        this.transaccionService = new TransaccionService();
        this.clientes = [];
        this.filteredClientes = [];
        this.currentPage = 0;
        this.clientesPerPage = 15;
        this.totalPages = 1;
        this.totalClientes = 0;

        this.tableViewManager = new TableViewManager('#clientesListContainer', {
            columns: [
                { header: 'Cédula', field: 'cedula' },
                { header: 'Nombre', field: 'nombre' },
                { header: 'Apellido', field: 'apellido' },
                { header: 'Teléfono', field: 'telefono' },
                { header: 'Email', field: 'email', formatter: (value) => value || 'N/A' },
                { header: 'Provincia', field: 'direccion', formatter: (value) => value || 'N/A' }
            ],
            actions: [
                {
                    icon: 'fas fa-eye',
                    handler: 'clientesManager.verCliente',
                    className: 'text-brand-brown hover:text-brand-light-brown',
                    title: 'Ver detalles'
                },
                {
                    icon: 'fas fa-exchange-alt',
                    handler: 'clientesManager.verTransaccionesCliente',
                    className: 'text-brand-accent hover:text-brand-brown',
                    title: 'Ver transacciones'
                },
                {
                    icon: 'fas fa-edit',
                    handler: 'clientesManager.editCliente',
                    className: 'text-green-600 hover:text-green-700',
                    title: 'Editar'
                },
                {
                    icon: 'fas fa-trash-alt',
                    handler: 'clientesManager.eliminarCliente',
                    className: 'text-red-600 hover:text-red-700',
                    title: 'Eliminar'
                }
            ],
            searchFields: ['cedula', 'nombre', 'apellido', 'telefono', 'email'],
            idField: 'cedula',
            emptyIcon: 'fas fa-users'
        });

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
        document.getElementById('clientesListContainer')?.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            if (btn.classList.contains('ver-btn')) {
                const cedula = btn.dataset.cedula;
                this.verCliente(cedula);
            } else if (btn.classList.contains('edit-btn')) {
                const cedula = btn.dataset.cedula;
                this.editCliente(cedula);
            } else if (btn.classList.contains('delete-btn')) {
                const cedula = btn.dataset.cedula;
                this.eliminarCliente(cedula);
            }
        });
    }

    async loadClientes() {
        this.showLoading();
        try {
            const busqueda = document.getElementById('clientSearchInput')?.value || null;
            const allClientes = await this.transaccionService.getClientes(busqueda);
            this.totalClientes = allClientes.length;
            this.totalPages = Math.ceil(this.totalClientes / this.clientesPerPage);
            const start = this.currentPage * this.clientesPerPage;
            const end = start + this.clientesPerPage;
            this.clientes = allClientes.slice(start, end);
            this.filteredClientes = [...this.clientes];
            this.tableViewManager.setData(allClientes);
            this.renderClientes();
            this.renderPagination();
        } catch (error) {
            console.error('Error loading clients:', error);
            this.clientes = [];
            this.filteredClientes = [];
            this.totalClientes = 0;
            this.totalPages = 1;
            this.tableViewManager.setData([]);
            this.renderClientes();
            this.renderPagination();
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
                <div class="mt-4 flex flex-wrap gap-2">
                    <button 
                        data-cedula="${cliente.cedula}" 
                        class="ver-btn flex items-center gap-2 bg-brand-brown text-white px-3 py-2 rounded-lg hover:bg-brand-light-brown transition-colors shadow-sm"
                        title="Ver detalles"
                    >
                        <i class="fas fa-eye"></i> Detalles
                    </button>
                    <a 
                        href="/pages/contabilidad/transacciones.html?cedula=${cliente.cedula}"
                        class="transacciones-btn flex items-center gap-2 bg-brand-accent text-brand-brown px-3 py-2 rounded-lg hover:bg-brand-brown hover:text-white transition-colors shadow-sm"
                        title="Ver transacciones"
                    >
                        <i class="fas fa-exchange-alt"></i> Transacciones
                    </a>
                    <button 
                        data-cedula="${cliente.cedula}" 
                        class="edit-btn flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                        title="Editar cliente"
                    >
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button 
                        data-cedula="${cliente.cedula}" 
                        class="delete-btn flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                        title="Eliminar cliente"
                    >
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderPagination() {
        let pagContainer = document.getElementById('clientesPagination');
        if (!pagContainer) {
            pagContainer = document.createElement('div');
            pagContainer.id = 'clientesPagination';
            pagContainer.className = 'flex justify-center mt-6';
            document.getElementById('clientesListContainer').after(pagContainer);
        }
        if (this.totalPages <= 1) {
            pagContainer.innerHTML = '';
            return;
        }
        let html = '<nav class="inline-flex rounded-md shadow-sm" aria-label="Pagination">';
        html += `<button class="px-3 py-1 border border-gray-300 bg-white text-brand-brown rounded-l-lg hover:bg-brand-light-brown hover:text-white font-medium disabled:opacity-50" ${this.currentPage === 0 ? 'disabled' : ''} data-page="prev">&laquo;</button>`;
        for (let i = 0; i < this.totalPages; i++) {
            html += `<button class="px-3 py-1 border-t border-b border-gray-300 bg-white text-brand-brown hover:bg-brand-light-brown hover:text-white font-medium ${i === this.currentPage ? 'bg-brand-brown text-white' : ''}" data-page="${i}">${i + 1}</button>`;
        }
        html += `<button class="px-3 py-1 border border-gray-300 bg-white text-brand-brown rounded-r-lg hover:bg-brand-light-brown hover:text-white font-medium disabled:opacity-50" ${this.currentPage === this.totalPages - 1 ? 'disabled' : ''} data-page="next">&raquo;</button>`;
        html += '</nav>';
        pagContainer.innerHTML = html;
        pagContainer.querySelectorAll('button[data-page]').forEach(btn => {
            btn.onclick = (e) => {
                const val = btn.getAttribute('data-page');
                if (val === 'prev' && this.currentPage > 0) {
                    this.currentPage--;
                    this.loadClientes();
                } else if (val === 'next' && this.currentPage < this.totalPages - 1) {
                    this.currentPage++;
                    this.loadClientes();
                } else if (!isNaN(val)) {
                    const page = parseInt(val);
                    if (page !== this.currentPage) {
                        this.currentPage = page;
                        this.loadClientes();
                    }
                }
            };
        });
    }

    filterClientes() {
        const searchTerm = document.getElementById('clientSearchInput')?.value || '';
        this.tableViewManager.filterData(searchTerm);
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

    async eliminarCliente(cedula) {
        if (!confirm('¿Estás seguro de que deseas eliminar este cliente?')) return;
        try {
            await this.transaccionService.deleteCliente(cedula);
            window.showToast('Cliente eliminado exitosamente.', 'success');
            await this.loadClientes();
        } catch (error) {
            console.error('Error eliminando cliente:', error);
            window.showToast('Error al eliminar el cliente.', 'error');
        }
    }

    async handleSubmitCliente(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const clienteData = {
            nombre: formData.get('nombre'),
            apellido: formData.get('apellido'),
            cedula: formData.get('cedula'),
            telefono: formData.get('telefono'),
            email: formData.get('email'),
            direccion: formData.get('direccion')
        };
        try {
            if (this.currentCliente) {
                await this.transaccionService.updateCliente(this.currentCliente.cedula, clienteData);
                window.showToast('Cliente actualizado exitosamente.', 'success');
            } else {
                const cedulaExists = this.clientes.some(c => c.cedula === clienteData.cedula);
                if (cedulaExists) {
                    window.alert('Ya existe un cliente con este número de cédula. Por favor, verifica los datos e intenta nuevamente.');
                    return;
                }
                await this.transaccionService.createCliente(clienteData);
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

    hideLoading() {}
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
window.tableViewManager = clientesManager.tableViewManager;
window.cerrarModalCliente = () => clientesManager.cerrarModalCliente();
window.cerrarModalVerCliente = () => clientesManager.cerrarModalVerCliente();
window.editarClienteDesdeDetalle = () => clientesManager.editarClienteDesdeDetalle();
window.eliminarCliente = (cedula) => clientesManager.eliminarCliente(cedula);