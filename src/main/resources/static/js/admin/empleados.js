import { EmpleadoService } from '../services/empleadoService.js';

class EmpleadosManager {
    constructor() {
        this.empleadoService = new EmpleadoService();
        this.empleados = [];
        this.filteredEmpleados = [];
        this.currentPage = 0;
        this.empleadosPerPage = 10;
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadEmpleados();
    }

    setupEventListeners() {
        document.getElementById('nuevoEmpleadoBtn')?.addEventListener('click', () => this.newEmpleado());
        document.getElementById('empleadoSearchInput')?.addEventListener('input', () => this.filterEmpleados());
        document.getElementById('formEmpleado')?.addEventListener('submit', (e) => this.handleSubmitEmpleado(e));
    }

    async loadEmpleados() {
        this.showLoading();
        try {
            const allEmpleados = await this.empleadoService.getEmpleados();
            const searchValue = (document.getElementById('empleadoSearchInput')?.value || '').trim().toLowerCase();
            if (searchValue) {
                this.filteredEmpleados = allEmpleados.filter(emp =>
                    (emp.nombre && emp.nombre.toLowerCase().includes(searchValue)) ||
                    (emp.apellido && emp.apellido.toLowerCase().includes(searchValue)) ||
                    (emp.cedula && emp.cedula.toLowerCase().includes(searchValue)) ||
                    (emp.rol && emp.rol.toLowerCase().includes(searchValue)) ||
                    (emp.email && emp.email.toLowerCase().includes(searchValue))
                );
            } else {
                this.filteredEmpleados = allEmpleados;
            }
            this.empleados = allEmpleados;
            this.renderEmpleados();
        } catch (error) {
            console.error('Error loading empleados:', error);
            this.empleados = [];
            this.filteredEmpleados = [];
            this.renderEmpleados();
        } finally {
            this.hideLoading();
        }
    }

    renderEmpleados() {
        const container = document.getElementById('empleadosListContainer');
        if (!container) return;
        if (this.filteredEmpleados.length === 0) {
            const searchTerm = document.getElementById('empleadoSearchInput')?.value;
            const emptyMessage = searchTerm ?
                `No se encontraron empleados que coincidan con "${searchTerm}".` :
                'No hay empleados registrados.';

            container.innerHTML = `
                <div class="text-center py-12">
                    <div class="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <i class="fas fa-briefcase text-3xl text-gray-400"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Sin empleados</h3>
                    <p class="text-gray-600 mb-6">${emptyMessage}</p>
                    ${!searchTerm ? `
                        <button onclick="empleadosManager.newEmpleado()" class="bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-light-brown">
                            <i class="fas fa-plus mr-2"></i>Agregar Primer Empleado
                        </button>
                    ` : `
                        <button onclick="document.getElementById('empleadoSearchInput').value = ''; empleadosManager.filterEmpleados();" class="text-brand-brown hover:text-brand-light-brown">
                            <i class="fas fa-times mr-2"></i>Limpiar búsqueda
                        </button>
                    `}
                </div>
            `;
            return;
        }

        container.innerHTML = this.filteredEmpleados.map(emp => `
            <div class="bg-white rounded-lg shadow-md p-4">
                <h3 class="text-lg font-semibold">${emp.nombre} ${emp.apellido}</h3>
                <p class="text-gray-600">Cédula: ${emp.cedula}</p>
                <p class="text-gray-600">Teléfono: ${emp.telefono || 'N/A'}</p>
                <p class="text-gray-600">Rol: ${emp.rol || 'N/A'}</p>
                <p class="text-gray-600">Salario: ${emp.salario != null ? '$' + emp.salario.toLocaleString() : 'N/A'}</p>
                <p class="text-gray-600">Fecha de Contratación: ${emp.fechaContratacion || 'N/A'}</p>
                <div class="mt-4 flex space-x-2">
                    <button onclick="empleadosManager.verEmpleado('${emp.cedula}')" class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Ver Detalles</button>
                </div>
            </div>
        `).join('');
    }

    filterEmpleados() {
        this.loadEmpleados();
    }

    newEmpleado() {
        this.currentEmpleado = null;
        this.clearForm();
        document.getElementById('modalEmpleadoTitle').textContent = 'Nuevo Empleado';
        document.getElementById('btnEmpleadoIcon').className = 'fas fa-plus mr-2';
        document.getElementById('btnEmpleadoText').textContent = 'Crear Empleado';
        document.getElementById('empleadoCedula').disabled = false;
        document.getElementById('modalEmpleado').classList.remove('hidden');
    }

    verEmpleado(cedula) {
        const empleado = this.empleados.find(e => e.cedula === cedula);
        if (!empleado) {
            window.showToast('Empleado no encontrado.', 'error');
            return;
        }
        document.getElementById('detallesEmpleado').innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Nombre</label>
                    <p class="mt-1 text-sm text-gray-900">${empleado.nombre}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Apellido</label>
                    <p class="mt-1 text-sm text-gray-900">${empleado.apellido}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Cédula</label>
                    <p class="mt-1 text-sm text-gray-900">${empleado.cedula}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Teléfono</label>
                    <p class="mt-1 text-sm text-gray-900">${empleado.telefono || 'N/A'}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Rol</label>
                    <p class="mt-1 text-sm text-gray-900">${empleado.rol || 'N/A'}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Salario</label>
                    <p class="mt-1 text-sm text-gray-900">${empleado.salario != null ? '$' + empleado.salario.toLocaleString() : 'N/A'}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Comisión</label>
                    <p class="mt-1 text-sm text-gray-900">${empleado.comision != null ? empleado.comision + '%' : 'N/A'}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Fecha de Contratación</label>
                    <p class="mt-1 text-sm text-gray-900">${empleado.fechaContratacion || 'N/A'}</p>
                </div>
                <div class="md:col-span-2 flex justify-end mt-6">
                    <button onclick="empleadosManager.editEmpleado('${empleado.cedula}')" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        <i class="fas fa-edit mr-2"></i>
                        Editar
                    </button>
                </div>
            </div>
        `;
        this.currentEmpleado = empleado;
        document.getElementById('modalVerEmpleado').classList.remove('hidden');
    }

    editEmpleado(cedula) {
        const empleado = this.empleados.find(e => e.cedula === cedula);
        if (!empleado) {
            window.showToast('Empleado no encontrado.', 'error');
            return;
        }
        this.currentEmpleado = empleado;
        this.fillForm(this.currentEmpleado);
        document.getElementById('modalEmpleadoTitle').textContent = 'Editar Empleado';
        document.getElementById('btnEmpleadoIcon').className = 'fas fa-save mr-2';
        document.getElementById('btnEmpleadoText').textContent = 'Actualizar Empleado';
        document.getElementById('empleadoCedula').disabled = true;
        document.getElementById('modalEmpleado').classList.remove('hidden');
    }

    async handleSubmitEmpleado(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const empleadoData = {
            nombre: formData.get('nombre'),
            apellido: formData.get('apellido'),
            cedula: formData.get('cedula'),
            telefono: formData.get('telefono'),
            email: formData.get('email'),
            rol: formData.get('rol'),
            salario: formData.get('salario') ? parseFloat(formData.get('salario')) : null,
            comision: formData.get('comision') !== '' ? parseFloat(formData.get('comision')) : null,
            fechaContratacion: formData.get('fechaContratacion')
        };

        if (typeof validateFormEmpleado === "function" && !validateFormEmpleado(empleadoData)) {
            return;
        }

        try {
            if (this.currentEmpleado) {
                await this.empleadoService.updateEmpleado(this.currentEmpleado.cedula, empleadoData);
                window.showToast('Empleado actualizado exitosamente.', 'success');
            } else {
                await this.empleadoService.createEmpleado(empleadoData);
                window.showToast('Empleado creado exitosamente.', 'success');
            }
            this.cerrarModalEmpleado();
            await this.loadEmpleados();
        } catch (error) {
            console.error('Error saving empleado:', error);
            const errorMessage = error.message || 'Error desconocido';
            window.showToast(`Error al guardar el empleado: ${errorMessage}`, 'error');
        }
    }

    clearForm() {
        document.getElementById('formEmpleado').reset();
        document.getElementById('empleadoComisionContainer').classList.add('hidden');
    }

    fillForm(empleado) {
        document.getElementById('empleadoNombre').value = empleado.nombre || '';
        document.getElementById('empleadoApellido').value = empleado.apellido || '';
        document.getElementById('empleadoCedula').value = empleado.cedula || '';
        document.getElementById('empleadoTelefono').value = empleado.telefono || '';
        document.getElementById('empleadoEmail').value = empleado.email || '';
        document.getElementById('empleadoRol').value = empleado.rol || '';
        document.getElementById('empleadoSalario').value = empleado.salario || '';
        document.getElementById('empleadoComision').value = empleado.comision != null ? empleado.comision : '';
        document.getElementById('empleadoFechaContratacion').value = empleado.fechaContratacion || '';
        if (empleado.rol === 'COMERCIAL') {
            document.getElementById('empleadoComisionContainer').classList.remove('hidden');
        } else {
            document.getElementById('empleadoComisionContainer').classList.add('hidden');
        }
    }

    cerrarModalEmpleado() {
        document.getElementById('modalEmpleado').classList.add('hidden');
        this.clearForm();
        this.currentEmpleado = null;
    }

    cerrarModalVerEmpleado() {
        document.getElementById('modalVerEmpleado').classList.add('hidden');
        this.currentEmpleado = null;
    }

    editarEmpleadoDesdeDetalle() {
        if (this.currentEmpleado) {
            this.cerrarModalVerEmpleado();
            this.editEmpleado(this.currentEmpleado.cedula);
        }
    }

    showLoading() {
        const container = document.getElementById('empleadosListContainer');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <div class="animate-spin h-10 w-10 border-4 border-brand-brown border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p class="text-gray-600 font-medium">Consultando información de empleados...</p>
                    <p class="text-gray-500 text-sm mt-2">Un momento, por favor</p>
                </div>
            `;
        }
    }

    hideLoading() {}
    showError(message) {
        const container = document.getElementById('empleadosListContainer');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <div class="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <i class="fas fa-exclamation-triangle text-3xl text-red-400"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Error al cargar</h3>
                    <p class="text-gray-600 mb-6">${message}</p>
                    <button onclick="empleadosManager.loadEmpleados()" class="bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-light-brown">
                        <i class="fas fa-refresh mr-2"></i>Reintentar
                    </button>
                </div>
            `;
        }
    }
}

const empleadosManager = new EmpleadosManager();
window.empleadosManager = empleadosManager;
window.cerrarModalEmpleado = () => empleadosManager.cerrarModalEmpleado();
window.cerrarModalVerEmpleado = () => empleadosManager.cerrarModalVerEmpleado();
window.editarEmpleadoDesdeDetalle = () => empleadosManager.editarEmpleadoDesdeDetalle();

// Formateo en tiempo real y comisión según rol
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('empleadoCedula')?.addEventListener('input', formatCedula);
    document.getElementById('empleadoTelefono')?.addEventListener('input', formatTelefono);
    document.getElementById('empleadoRol')?.addEventListener('change', function () {
        const rol = this.value;
        const comisionContainer = document.getElementById('empleadoComisionContainer');
        if (rol === 'COMERCIAL') {
            comisionContainer.classList.remove('hidden');
        } else {
            comisionContainer.classList.add('hidden');
            document.getElementById('empleadoComision').value = '';
            const errorEl = document.getElementById('empleadoComisionError');
            if (errorEl) {
                errorEl.textContent = '';
                errorEl.classList.add('hidden');
            }
        }
    });
});

function formatCedula(e) {
    const input = e.target;
    let digits = input.value.replace(/\D/g, '').slice(0, 11);
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