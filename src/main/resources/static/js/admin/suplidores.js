// src/main/resources/static/js/contabilidad/suplidores.js

import { TransaccionService } from '../services/transaccionService.js';

class SuplidoresManager {
    constructor() {
        this.transaccionService = new TransaccionService();
        this.suplidores = [];
        this.filteredSuplidores = [];
        this.currentPage = 0;
        this.suplidoresPerPage = 10;
        this.currentSuplidor = null;

        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadSuplidores();
    }

    setupEventListeners() {
        document.getElementById('nuevoSuplidorBtn')?.addEventListener('click', () => this.newSuplidor());
        document.getElementById('suplidorSearchInput')?.addEventListener('input', () => this.filterSuplidores());
        document.getElementById('formSuplidor')?.addEventListener('submit', (e) => this.handleSubmitSuplidor(e));
        document.getElementById('suplidoresListContainer')?.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            if (btn.classList.contains('ver-btn')) {
                const id = btn.dataset.id;
                this.verSuplidor(id);
            } else if (btn.classList.contains('edit-btn')) {
                const id = btn.dataset.id;
                this.editSuplidor(id);
            } else if (btn.classList.contains('delete-btn')) {
                const id = btn.dataset.id;
                this.deleteSuplidor(id);
            }
        });
        document.getElementById('btnEditarDesdeDetalle')?.addEventListener('click', () => this.editarSuplidorDesdeDetalle());
        window.cerrarModalSuplidor = () => this.cerrarModalSuplidor();
        window.cerrarModalVerSuplidor = () => this.cerrarModalVerSuplidor();
        window.agregarTelefono = () => this.agregarTelefono();
        window.eliminarTelefono = (button) => this.eliminarTelefono(button);
    }

    async loadSuplidores() {
        this.showLoading();
        try {
            const searchTerm = document.getElementById('suplidorSearchInput')?.value || null;
            this.suplidores = await this.transaccionService.getSuplidores(searchTerm);
            this.filteredSuplidores = [...this.suplidores];
            this.renderSuplidores();
        } catch (error) {
            console.error('Error loading suppliers:', error);
            window.showToast('Error al cargar los suplidores.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    renderSuplidores() {
        const container = document.getElementById('suplidoresListContainer');
        if (!container) return;

        if (this.filteredSuplidores.length === 0) {
            const searchTerm = document.getElementById('suplidorSearchInput')?.value;
            const emptyMessage = searchTerm ?
                `No se encontraron suplidores que coincidan con "${searchTerm}".` :
                'No hay suplidores registrados.';
            container.innerHTML = `
                <div class="text-center py-12 col-span-full">
                    <div class="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <i class="fas fa-truck text-3xl text-gray-400"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Sin suplidores</h3>
                    <p class="text-gray-600 mb-6">${emptyMessage}</p>
                    ${!searchTerm ? `
                        <button onclick="suplidoresManager.newSuplidor()" class="bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-light-brown">
                            <i class="fas fa-plus mr-2"></i>Agregar Primer Suplidor
                        </button>
                    ` : `
                        <button onclick="document.getElementById('suplidorSearchInput').value = ''; suplidoresManager.filterSuplidores();" class="text-brand-brown hover:text-brand-light-brown">
                            <i class="fas fa-times mr-2"></i>Limpiar búsqueda
                        </button>
                    `}
                </div>
            `;
            return;
        }

        container.innerHTML = this.filteredSuplidores.map(s => `
            <div class="bg-white rounded-lg shadow-md p-4">
                <h3 class="text-lg font-semibold flex items-center gap-2 mb-3">
                    <i class='fas fa-truck text-brand-brown'></i> 
                    ${s.nombre}
                </h3>
                <div class="space-y-2 text-sm text-gray-600 mb-4">
                    <p><i class="fas fa-map-marker-alt w-4"></i> ${s.ciudad || 'N/A'}</p>
                    <p><i class="fas fa-id-card w-4"></i> RNC: ${s.rNC || 'N/A'}</p>
                    ${s.nCF ? `<p><i class="fas fa-file-alt w-4"></i> NCF: ${s.nCF}</p>` : ''}
                    <p><i class="fas fa-envelope w-4"></i> ${s.email || 'N/A'}</p>
                    ${s.telefonos && s.telefonos.length > 0 ? 
                        `<p><i class="fas fa-phone w-4"></i> ${s.telefonos[0]}</p>` : 
                        '<p><i class="fas fa-phone w-4"></i> Sin teléfono</p>'
                    }
                </div>
                <div class="flex flex-wrap gap-2">
                    <button 
                        data-id="${s.id}" 
                        class="ver-btn flex items-center gap-2 bg-brand-brown text-white px-3 py-2 rounded-lg hover:bg-brand-light-brown transition-colors shadow-sm text-xs"
                        title="Ver detalles"
                    >
                        <i class="fas fa-eye"></i> Detalles
                    </button>
                    <button 
                        data-id="${s.id}" 
                        class="edit-btn flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm text-xs"
                        title="Editar suplidor"
                    >
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button 
                        data-id="${s.id}" 
                        class="delete-btn flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-sm text-xs"
                        title="Eliminar suplidor"
                    >
                        <i class="fas fa-trash-alt"></i> 
                    </button>
                </div>
            </div>
        `).join('');
    }

    filterSuplidores() {
        this.currentPage = 0;
        this.loadSuplidores();
    }

    newSuplidor() {
        this.currentSuplidor = null;
        this.clearForm();
        document.getElementById('modalSuplidorTitle').textContent = 'Nuevo Suplidor';
        document.getElementById('btnSuplidorIcon').className = 'fas fa-plus mr-2';
        document.getElementById('btnSuplidorText').textContent = 'Crear Suplidor';
        document.getElementById('modalSuplidor').classList.remove('hidden');
    }

    async verSuplidor(id) {
        try {
            const suplidor = this.suplidores.find(s => String(s.id) === String(id));
            if (!suplidor) {
                window.showToast('Suplidor no encontrado.', 'error');
                return;
            }

            document.getElementById('detallesSuplidor').innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Nombre</label>
                        <p class="mt-1 text-sm text-gray-900">${suplidor.nombre}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Ciudad</label>
                        <p class="mt-1 text-sm text-gray-900">${suplidor.ciudad || 'N/A'}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">RNC</label>
                        <p class="mt-1 text-sm text-gray-900">${suplidor.rNC || 'N/A'}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">NCF</label>
                        <p class="mt-1 text-sm text-gray-900">${suplidor.nCF || 'N/A'}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Email</label>
                        <p class="mt-1 text-sm text-gray-900">${suplidor.email || 'N/A'}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Teléfonos</label>
                        <div class="mt-1 text-sm text-gray-900">
                            ${suplidor.telefonos && suplidor.telefonos.length > 0 ? 
                                suplidor.telefonos.map(tel => `<p>${tel}</p>`).join('') :
                                '<p>Sin teléfonos registrados</p>'
                            }
                        </div>
                    </div>
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700">Dirección</label>
                        <p class="mt-1 text-sm text-gray-900">${suplidor.direccion || 'N/A'}</p>
                    </div>
                </div>
            `;
            
            this.currentSuplidor = suplidor;
            document.getElementById('modalVerSuplidor').classList.remove('hidden');
        } catch (error) {
            console.error('Error viewing supplier:', error);
            window.showToast('Error al mostrar los detalles del suplidor.', 'error');
        }
    }

    editSuplidor(id) {
        const suplidor = this.suplidores.find(s => String(s.id) === String(id));
        if (!suplidor) {
            window.showToast('Suplidor no encontrado.', 'error');
            return;
        }

        this.currentSuplidor = suplidor;
        this.fillForm(suplidor);
        document.getElementById('modalSuplidorTitle').textContent = 'Editar Suplidor';
        document.getElementById('btnSuplidorIcon').className = 'fas fa-save mr-2';
        document.getElementById('btnSuplidorText').textContent = 'Actualizar Suplidor';
        document.getElementById('modalSuplidor').classList.remove('hidden');
    }

    async handleSubmitSuplidor(e) {
        e.preventDefault();

        // Validaciones básicas
        const nombre = document.getElementById('suplidorNombre').value.trim();
        const ciudad = document.getElementById('suplidorCiudad').value.trim();
        const direccion = document.getElementById('suplidorDireccion').value.trim();

        if (!nombre) {
            this.showFieldError('suplidorNombre', 'El nombre es requerido');
            return;
        }
        if (!ciudad) {
            this.showFieldError('suplidorCiudad', 'La ciudad es requerida');
            return;
        }
        if (!direccion) {
            this.showFieldError('suplidorDireccion', 'La dirección es requerida');
            return;
        }

        // Recopilar teléfonos
        const telefonos = Array.from(document.querySelectorAll('.telefono-input'))
            .map(input => input.value.trim())
            .filter(tel => tel !== '');

        const suplidorData = {
            nombre: nombre,
            ciudad: ciudad,
            direccion: direccion,
            email: document.getElementById('suplidorEmail').value.trim() || null,
            rNC: document.getElementById('suplidorRNC').value.trim() || null,
            nCF: document.getElementById('suplidorNCF').value.trim() || null,
            telefonos: telefonos.length > 0 ? telefonos : null,
            longitud: null,
            latitud: null
        };

        try {
            if (this.currentSuplidor) {
                await this.transaccionService.updateSuplidor(this.currentSuplidor.id, suplidorData);
                window.showToast('Suplidor actualizado exitosamente.', 'success');
            } else {
                await this.transaccionService.createSuplidor(suplidorData);
                window.showToast('Suplidor creado exitosamente.', 'success');
            }
            this.cerrarModalSuplidor();
            this.loadSuplidores();
        } catch (error) {
            console.error('Error saving supplier:', error);
            window.showToast('Error al guardar el suplidor.', 'error');
        }
    }

    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorElement = field.nextElementSibling;
        field.classList.add('border-red-500');
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
        field.focus();
    }

    clearFieldErrors() {
        document.querySelectorAll('.border-red-500').forEach(field => {
            field.classList.remove('border-red-500');
        });
        document.querySelectorAll('.text-red-500').forEach(error => {
            error.classList.add('hidden');
            error.textContent = '';
        });
    }

    clearForm() {
        document.getElementById('formSuplidor').reset();
        this.clearFieldErrors();
        // Resetear teléfonos a solo uno
        const container = document.getElementById('telefonosContainer');
        container.innerHTML = `
            <div class="flex gap-2 mb-2">
                <input type="tel" placeholder="Ej: +1-809-123-4567" 
                       class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown telefono-input">
                <button type="button" onclick="agregarTelefono()" class="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        `;
    }

    fillForm(suplidor) {
        document.getElementById('suplidorNombre').value = suplidor.nombre || '';
        document.getElementById('suplidorCiudad').value = suplidor.ciudad || '';
        document.getElementById('suplidorRNC').value = suplidor.rNC || '';
        document.getElementById('suplidorNCF').value = suplidor.nCF || '';
        document.getElementById('suplidorEmail').value = suplidor.email || '';
        document.getElementById('suplidorDireccion').value = suplidor.direccion || '';

        // Llenar teléfonos
        const container = document.getElementById('telefonosContainer');
        container.innerHTML = '';

        if (suplidor.telefonos && suplidor.telefonos.length > 0) {
            suplidor.telefonos.forEach((telefono, index) => {
                this.addTelefonoField(telefono, index === 0);
            });
        } else {
            this.addTelefonoField('', true);
        }
    }

    agregarTelefono() {
        this.addTelefonoField('', false);
    }

    addTelefonoField(value = '', isFirst = false) {
        const container = document.getElementById('telefonosContainer');
        const telefonoDiv = document.createElement('div');
        telefonoDiv.className = 'flex gap-2 mb-2';

        telefonoDiv.innerHTML = `
            <input type="tel" placeholder="Ej: +1-809-123-4567" value="${value}"
                   class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown telefono-input">
            ${isFirst ? `
                <button type="button" onclick="agregarTelefono()" class="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700">
                    <i class="fas fa-plus"></i>
                </button>
            ` : `
                <button type="button" onclick="eliminarTelefono(this)" class="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700">
                    <i class="fas fa-minus"></i>
                </button>
            `}
        `;

        container.appendChild(telefonoDiv);
    }

    eliminarTelefono(button) {
        button.closest('.flex').remove();
    }

    cerrarModalSuplidor() {
        document.getElementById('modalSuplidor').classList.add('hidden');
        this.clearForm();
        this.currentSuplidor = null;
    }

    cerrarModalVerSuplidor() {
        document.getElementById('modalVerSuplidor').classList.add('hidden');
        this.currentSuplidor = null;
    }

    editarSuplidorDesdeDetalle() {
        if (this.currentSuplidor) {
            this.cerrarModalVerSuplidor();
            this.editSuplidor(this.currentSuplidor.id);
        }
    }

    async deleteSuplidor(id) {
        if (!confirm('¿Estás seguro de que deseas eliminar este suplidor?')) return;
        try {
            await this.transaccionService.deleteSuplidor(id);
            window.showToast('Suplidor eliminado exitosamente.', 'success');
            await this.loadSuplidores();
        } catch (error) {
            window.showToast('Error al eliminar el suplidor.', 'error');
        }
    }

    showLoading() {
        document.getElementById('suplidoresListContainer').innerHTML = '<div class="flex items-center justify-center py-12 col-span-full"><div class="animate-spin h-8 w-8 border-4 border-brand-brown border-t-transparent rounded-full"></div></div>';
    }

    hideLoading() {
        // No specific hide loading for now, as content replaces spinner
    }
}

const suplidoresManager = new SuplidoresManager();
window.suplidoresManager = suplidoresManager;

// Funciones globales para los event handlers de los modales
window.cerrarModalSuplidor = () => suplidoresManager.cerrarModalSuplidor();
window.cerrarModalVerSuplidor = () => suplidoresManager.cerrarModalVerSuplidor();
window.editarSuplidorDesdeDetalle = () => suplidoresManager.editarSuplidorDesdeDetalle();

// Formateo en tiempo real para cédula y teléfono en el formulario de suplidor
// Similar a empleados.js

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('suplidorRnc')?.addEventListener('input', formatCedulaRnc);
    document.getElementById('suplidorTelefono')?.addEventListener('input', formatTelefono);
});

function formatCedulaRnc(e) {
    const input = e.target;
    let digits = input.value.replace(/\D/g, '').slice(0, 11);
    // Si es RNC (9 dígitos), no formatear con guiones
    if (digits.length <= 9) {
        input.value = digits;
        return;
    }
    // Si es cédula (11 dígitos), formatear XXX-XXXXXXX-X
    let part1 = digits.slice(0, 3);
    let part2 = digits.slice(3, 10);
    let part3 = digits.slice(10, 11);
    let formatted = part1;
    if (part2) formatted += '-' + part2;
    if (part3) formatted += '-' + part3;
    input.value = formatted;
}

function formatTelefono(e) {
    const input = e.target;
    let digits = input.value.replace(/\D/g, '').slice(0, 10);
    let part1 = digits.slice(0, 3);
    let part2 = digits.slice(3, 6);
    let part3 = digits.slice(6, 10);
    let formatted = part1;
    if (part2) formatted += '-' + part2;
    if (part3) formatted += '-' + part3;
    input.value = formatted;
}
