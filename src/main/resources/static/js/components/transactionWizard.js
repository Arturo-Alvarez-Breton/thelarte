// src/main/resources/static/js/components/transactionWizard.js
import { TransaccionService } from '../services/transaccionService.js';
export class TransactionWizard {
    constructor() {
        this.transaccionService = new TransaccionService();
        this.wizardModal = document.getElementById('transactionWizard');
        this.wizardContent = document.getElementById('wizardContent');
        this.wizardSubtitle = document.getElementById('wizardSubtitle');
        this.wizardPrevBtn = document.getElementById('wizardPrevBtn');
        this.wizardNextBtn = document.getElementById('wizardNextBtn');
        this.currentStep = 0;
        this.loadCardnetService();
        // Inicializa un cardnetService provisional mientras carga el real
        this.cardnetService = {
            createSession: () => Promise.reject("Servicio aún no disponible"),
            verifyTransaction: () => Promise.reject("Servicio aún no disponible")
        };
        this.transactionData = {
            tipoTransaccion: '',
            cliente: null,
            proveedor: null,
            metodoPago: '',
            observaciones: '',
            lineas: [],
            subtotal: 0,
            impuestos: 0,
            // === Devolución-specific fields ===
            transaccionOrigen: null,
            productosADevolver: [],
        };
        this.steps = [];
        this.transacciones = [];
        this.transaccionesFiltradas = [];

        this.initSteps();
        this.setupEventListeners();
    }
    async loadCardnetService() {
        try {
            const module = await import('../services/cardnetService.js');
            this.cardnetService = new module.CardnetService();
            console.log("CardnetService cargado correctamente");
        } catch (e) {
            console.error("No se pudo cargar el servicio de CardNet:", e);
        }
    }

    initSteps() {
        // Default steps - will be customized based on transaction type
        this.steps = [
            {
                title: 'Selecciona el tipo de transacción',
                content: this.getStep1Content(),
                onNext: () => this.validateStep1()
            }
        ];
    }

    initStepsForType(type) {
        switch (type) {
            case 'VENTA':
                this.steps = [
                    {
                        title: 'Datos del Cliente',
                        content: this.getVentaStep1Content(),
                        onNext: () => this.validateVentaStep1(),
                        onLoad: () => this.loadVentaStep1Data()
                    },
                    {
                        title: 'Productos a Vender',
                        content: this.getVentaStep2Content(),
                        onNext: () => this.validateVentaStep2(),
                        onLoad: () => this.loadVentaStep2Data()
                    },
                    {
                        title: 'Método de Pago',
                        content: this.getVentaStep3Content(),
                        onNext: () => this.validateVentaStep3(),
                        onLoad: () => this.loadVentaStep3Data && this.loadVentaStep3Data() // Optional, in case you need listeners
                    },
                    {
                        title: 'Confirmación de Venta',
                        content: this.getVentaStep4Content(),
                        onNext: () => this.finalizeVenta(),
                        onLoad: () => {
                            // Siempre actualiza totales y renderiza el resumen al entrar al paso 4
                            this.updateVentaTotals && this.updateVentaTotals();
                            if (this.wizardContent && typeof this.getVentaStep4Content === 'function') {
                                this.wizardContent.innerHTML = this.getVentaStep4Content();
                            }
                        }
                    }
                ];
                break;
            case 'COMPRA':
                this.steps = [
                    {
                        title: 'Datos del Proveedor',
                        content: this.getCompraStep1Content(),
                        onNext: () => this.validateCompraStep1(),
                        onLoad: () => this.loadCompraStep1Data()
                    },
                    {
                        title: 'Productos a Comprar',
                        content: this.getCompraStep2Content(),
                        onNext: () => this.validateCompraStep2(),
                        onLoad: () => this.loadCompraStep2Data()
                    },
                    {
                        title: 'Confirmación de Compra',
                        content: this.getCompraStep3Content(),
                        onNext: () => this.finalizeCompra(),
                        onLoad: () => {
                            // Siempre actualiza totales y renderiza el resumen al entrar al paso 3 (confirmación)
                            this.updateCompraTotals && this.updateCompraTotals();
                            if (this.wizardContent && typeof this.getCompraStep3Content === 'function') {
                                this.wizardContent.innerHTML = this.getCompraStep3Content();
                            }
                        }
                    }
                ];
                break;
            case 'DEVOLUCION_VENTA':
            case 'DEVOLUCION_COMPRA':
                this.steps = [
                    {
                        title: 'Tipo de Devolución',
                        content: this.getDevolucionStep1Content(),
                        onNext: () => this.validateDevolucionStep1()
                    },
                    {
                        title: 'Selecciona la transacción origen',
                        content: this.getDevolucionStep2Content(),
                        onNext: () => this.validateDevolucionStep2(),
                        onLoad: () => this.loadDevolucionStep2Data()
                    },
                    {
                        title: 'Selecciona los productos a devolver',
                        content: this.getDevolucionStep3Content(),
                        onNext: () => this.validateDevolucionStep3(),
                        onLoad: () => this.loadDevolucionStep3Data()
                    },
                    {
                        title: 'Confirmación de la Devolución',
                        content: this.getDevolucionStep4Content(),
                        onNext: () => this.finalizeDevolucion(),
                        onLoad: () => {
                            // Siempre refresca el resumen al entrar al paso 4
                            if (this.wizardContent && typeof this.getDevolucionStep4Content === 'function') {
                                this.wizardContent.innerHTML = this.getDevolucionStep4Content();
                            }
                            // Opcional: deshabilita el botón si faltan datos
                            const btn = document.getElementById('wizardNextBtn');
                            if (btn) {
                                btn.disabled = !this.transactionData.transaccionOrigen || !this.transactionData.productosADevolver?.length;
                            }
                        }
                    }
                ];
                break;
            default:
                this.initSteps();
        }
    }

    setupEventListeners() {
        if (this.wizardPrevBtn) {
            this.wizardPrevBtn.onclick = () => this.prevStep();
        }
        if (this.wizardNextBtn) {
            this.wizardNextBtn.onclick = async () => {
                if (this.currentStep === this.steps.length - 1) {
                    const currentStepHandler = this.steps[this.currentStep];
                    if (currentStepHandler.onNext) {
                        await currentStepHandler.onNext();
                    }
                } else {
                    this.nextStep();
                }
            };
        }
        // Close button on the wizard header - verificar que wizardModal existe
        if (this.wizardModal) {
            const closeButton = this.wizardModal.querySelector('button[onclick*="closeTransactionWizard"]');
            if (closeButton) {
                closeButton.onclick = () => this.close();
            }
        }
    }

    open(type = null) {
        this.transactionData = {
            tipoTransaccion: type || '',
            cliente: null,
            proveedor: null,
            metodoPago: '',
            observaciones: '',
            lineas: [],
            subtotal: 0,
            impuestos: 0,
            total: 0,
            transaccionOrigen: null,
            productosADevolver: [],
        };

        // Initialize steps based on transaction type
        if (type) {
            this.initStepsForType(type);
        } else {
            this.initSteps();
        }

        this.currentStep = 0;
        this.updateWizardUI();
        this.wizardModal.classList.remove('hidden');
    }

    close() {
        this.wizardModal.classList.add('hidden');
    }

    async nextStep() {
        const currentStepHandler = this.steps[this.currentStep];
        if (currentStepHandler.onNext) {
            const isValid = await currentStepHandler.onNext();
            if (!isValid) {
                return; // Stop if validation fails
            }
        }

        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.updateWizardUI();
        }
    }

    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.updateWizardUI();
        }
    }

    async updateWizardUI() {
        const currentStepData = this.steps[this.currentStep];
        if (this.wizardSubtitle) {
            this.wizardSubtitle.textContent = currentStepData.title;
        }
        if (this.wizardContent) {
            this.wizardContent.innerHTML = currentStepData.content;
            if (currentStepData.onLoad) {
                await currentStepData.onLoad();
            }
        }

        // Update step indicators
        document.querySelectorAll('.wizard-step').forEach((step, index) => {
            if (index === this.currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        // Update navigation buttons
        if (this.wizardPrevBtn) {
            this.wizardPrevBtn.classList.toggle('hidden', this.currentStep === 0);
        }
        if (this.wizardNextBtn) {
            // --- CORRECCIÓN: Si solo hay un paso y es el primero, muestra "Siguiente", nunca "Finalizar" ---
            if (this.steps.length === 1 && this.currentStep === 0) {
                this.wizardNextBtn.innerHTML = 'Siguiente <i class="fas fa-arrow-right ml-1"></i>';
            } else if (this.currentStep === this.steps.length - 1) {
                this.wizardNextBtn.innerHTML = 'Finalizar <i class="fas fa-check ml-1"></i>';
            } else {
                this.wizardNextBtn.innerHTML = 'Siguiente <i class="fas fa-arrow-right ml-1"></i>';
            }
        }
    }

    // --- Step 1: Select Transaction Type ---
    getStep1Content() {
        return `
            <div class="space-y-4">
                <label class="block text-gray-700 text-sm font-bold mb-2">Tipo de Transacción:</label>
                <div class="flex flex-col space-y-2">
                    <label class="inline-flex items-center">
                        <input type="radio" name="transactionType" value="DEVOLUCION_VENTA" class="form-radio text-brand-brown" ${this.transactionData.tipoTransaccion === 'DEVOLUCION_VENTA' ? 'checked' : ''}>
                        <span class="ml-2 text-gray-700">Devolución de Venta</span>
                    </label>
                    <label class="inline-flex items-center">
                        <input type="radio" name="transactionType" value="DEVOLUCION_COMPRA" class="form-radio text-brand-brown" ${this.transactionData.tipoTransaccion === 'DEVOLUCION_COMPRA' ? 'checked' : ''}>
                        <span class="ml-2 text-gray-700">Devolución de Compra</span>
                    </label>
                </div>
            </div>
        `;
    }
    // src/main/resources/static/js/components/transactionWizard.js

// ... (código anterior igual)

    // =============== VENTA WIZARD METHODS ===============
    getVentaStep1Content() {
        return `
    <div class="space-y-4">
        <h3 class="text-lg font-semibold text-brand-brown">Información del Cliente</h3>
        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-2">
            <p class="text-sm text-yellow-700">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                <strong>Debe seleccionar un cliente para continuar. "Consumidor Final" no está permitido.</strong>
            </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Buscar Cliente <span class="text-red-500">*</span></label>
                <input type="text" id="ventaClienteSearch" placeholder="Buscar por nombre o cédula..." 
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Cliente <span class="text-red-500">*</span></label>
                <select id="ventaClienteSelect" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
                    <option value="">Seleccione un cliente</option>
                </select>
            </div>
        </div>
        <div>
            <button type="button" id="btnNuevoCliente" class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                <i class="fas fa-plus mr-2"></i>Nuevo Cliente
            </button>
        </div>
        <!-- Formulario para nuevo cliente (oculto inicialmente) -->
        <div id="nuevoClienteForm" class="hidden mt-4 border p-4 rounded-lg bg-gray-50">
            <h4 class="text-md font-bold mb-2">Registrar Nuevo Cliente</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Cédula <span class="text-red-500">*</span></label>
                    <input type="text" id="nuevoClienteCedula" 
                           placeholder="000-0000000-0"
                           maxlength="13"
                           oninput="restrictToNumbersOnly(this); formatCedulaRnc(this);"
                           class="w-full px-3 py-2 border rounded" required>
                    <p class="text-xs text-gray-500 mt-1">Formato: 000-0000000-0</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nombre <span class="text-red-500">*</span></label>
                    <input type="text" id="nuevoClienteNombre" 
                           placeholder="Nombre del cliente"
                           oninput="restrictToLettersOnly(this);"
                           class="w-full px-3 py-2 border rounded" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Apellido <span class="text-red-500">*</span></label>
                    <input type="text" id="nuevoClienteApellido" 
                           placeholder="Apellido del cliente"
                           oninput="restrictToLettersOnly(this);"
                           class="w-full px-3 py-2 border rounded" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono <span class="text-red-500">*</span></label>
                    <input type="tel" id="nuevoClienteTelefono" 
                           placeholder="809-000-0000"
                           maxlength="12"
                           oninput="restrictToNumbersOnly(this); formatTelefono(this);"
                           class="w-full px-3 py-2 border rounded" required>
                    <p class="text-xs text-gray-500 mt-1">Formato: 809-000-0000</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" id="nuevoClienteEmail" 
                           placeholder="cliente@ejemplo.com"
                           class="w-full px-3 py-2 border rounded">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                    <input type="text" id="nuevoClienteDireccion" 
                           placeholder="Dirección completa"
                           class="w-full px-3 py-2 border rounded">
                </div>
            </div>
            <div class="mt-4 flex space-x-2">
                <button type="button" id="guardarNuevoCliente" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Guardar Cliente</button>
                <button type="button" id="cancelarNuevoCliente" class="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">Cancelar</button>
            </div>
        </div>
    </div>
    `;
    }

    async loadVentaStep1Data() {
        try {
            const clientes = await this.transaccionService.getClientes();
            const select = document.getElementById('ventaClienteSelect');
            const searchInput = document.getElementById('ventaClienteSearch');
            const btnNuevoCliente = document.getElementById('btnNuevoCliente');
            const nuevoClienteForm = document.getElementById('nuevoClienteForm');
            const guardarBtn = document.getElementById('guardarNuevoCliente');
            const cancelarBtn = document.getElementById('cancelarNuevoCliente');

            // Inicializa el select con todos los clientes
            if (select) {
                select.innerHTML = '<option value="">Consumidor Final</option>';
                clientes.forEach(cliente => {
                    select.innerHTML += `<option value="${cliente.cedula}">${cliente.nombre} ${cliente.apellido} (${cliente.cedula})</option>`;
                });
            }

            // Filtro dinámico por input
            if (searchInput && select) {
                searchInput.addEventListener('input', (e) => {
                    const searchTerm = e.target.value.toLowerCase();
                    const filtered = clientes.filter(cliente =>
                        cliente.nombre.toLowerCase().includes(searchTerm) ||
                        cliente.apellido.toLowerCase().includes(searchTerm) ||
                        cliente.cedula.toLowerCase().includes(searchTerm)
                    );
                    select.innerHTML = '<option value="">Consumidor Final</option>';
                    filtered.forEach(cliente => {
                        select.innerHTML += `<option value="${cliente.cedula}">${cliente.nombre} ${cliente.apellido} (${cliente.cedula})</option>`;
                    });
                });
            }

            // Mostrar/ocultar formulario de nuevo cliente
            if (btnNuevoCliente && nuevoClienteForm) {
                btnNuevoCliente.onclick = () => nuevoClienteForm.classList.toggle('hidden');
            }
            if (cancelarBtn && nuevoClienteForm) {
                cancelarBtn.onclick = () => nuevoClienteForm.classList.add('hidden');
            }

            // Guardar el nuevo cliente
            if (guardarBtn && select && nuevoClienteForm) {
                // En la función loadVentaStep1Data(), modifica la parte de guardarBtn.onclick:
                guardarBtn.onclick = async () => {
                    const cedula = document.getElementById('nuevoClienteCedula').value.trim();
                    const nombre = document.getElementById('nuevoClienteNombre').value.trim();
                    const apellido = document.getElementById('nuevoClienteApellido').value.trim();
                    const telefono = document.getElementById('nuevoClienteTelefono').value.trim();
                    const email = document.getElementById('nuevoClienteEmail').value.trim();
                    const direccion = document.getElementById('nuevoClienteDireccion').value.trim();

                    // Validaciones
                    if (!cedula || !nombre || !apellido || !telefono) {
                        window.showToast('Completa los campos obligatorios (*) del cliente.', 'error');
                        return;
                    }

                    if (!validateCedula(cedula)) {
                        window.showToast('La cédula debe tener el formato correcto: 000-0000000-0', 'error');
                        document.getElementById('nuevoClienteCedula').focus();
                        return;
                    }

                    if (!validateTelefono(telefono)) {
                        window.showToast('El teléfono debe tener el formato correcto: 809-000-0000', 'error');
                        document.getElementById('nuevoClienteTelefono').focus();
                        return;
                    }

                    if (email && !validateEmail(email)) {
                        window.showToast('El email debe tener un formato válido', 'error');
                        document.getElementById('nuevoClienteEmail').focus();
                        return;
                    }

                    try {
                        const nuevoCliente = await this.transaccionService.createCliente({
                            cedula, nombre, apellido, telefono, email, direccion
                        });
                        window.showToast('Cliente creado exitosamente.', 'success');

                        const option = document.createElement('option');
                        option.value = nuevoCliente.cedula;
                        option.textContent = `${nuevoCliente.nombre} ${nuevoCliente.apellido} (${nuevoCliente.cedula})`;
                        select.appendChild(option);
                        select.value = nuevoCliente.cedula;
                        this.transactionData.cliente = nuevoCliente;
                        nuevoClienteForm.classList.add('hidden');
                    } catch (err) {
                        window.showToast('Error al crear cliente: ' + (err.message || err), 'error');
                    }
                };
            }
        } catch (error) {
            console.error('Error loading clients:', error);
            window.showToast('Error al cargar clientes.', 'error');
        }
    }
    validateStep1() {
        const selectedType = document.querySelector('input[name="transactionType"]:checked');
        if (!selectedType) {
            window.showToast('Por favor, selecciona un tipo de transacción.', 'error');
            return false;
        }
        this.transactionData.tipoTransaccion = selectedType.value;
        this.initStepsForType(selectedType.value);

        // Si el tipo es devolución, avanza automáticamente al segundo paso
        if (selectedType.value === 'DEVOLUCION_COMPRA' || selectedType.value === 'DEVOLUCION_VENTA') {
            this.currentStep = 1;
        } else {
            this.currentStep = 0;
        }

        this.updateWizardUI();
        return false;
    }

    // --- Step 2: Transaction Details ---
// --- Step 3: Add Products ---
// --- Step 4: Confirmation ---
// ========== DEVOLUCIONES ==========

    getDevolucionStep1Content() {
        return `
            <div class="space-y-4">
                <label class="block text-gray-700 text-sm font-bold mb-2">Tipo de Devolución:</label>
                <div class="flex flex-col space-y-2">
                    <label class="inline-flex items-center">
                        <input type="radio" name="tipoDevolucion" value="DEVOLUCION_VENTA" class="form-radio text-brand-brown" ${this.transactionData.tipoTransaccion === 'DEVOLUCION_VENTA' ? 'checked' : ''}>
                        <span class="ml-2 text-gray-700">Devolución de Venta</span>
                    </label>
                    <label class="inline-flex items-center">
                        <input type="radio" name="tipoDevolucion" value="DEVOLUCION_COMPRA" class="form-radio text-brand-brown" ${this.transactionData.tipoTransaccion === 'DEVOLUCION_COMPRA' ? 'checked' : ''}>
                        <span class="ml-2 text-gray-700">Devolución de Compra</span>
                    </label>
                </div>
            </div>
        `;
    }

    validateDevolucionStep1() {
        const selectedType = document.querySelector('input[name="tipoDevolucion"]:checked');
        if (!selectedType) {
            window.showToast('Selecciona el tipo de devolución', 'error');
            return false;
        }
        this.transactionData.tipoTransaccion = selectedType.value;
        return true;
    }

    getDevolucionStep2Content() {
        return `
        <div class="space-y-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Transacción origen:</label>
            
            <!-- Añadir buscador -->
            <div class="mb-4">
                <input type="text" id="devolucionSearchInput" placeholder="Buscar por ID, cliente o fecha..." 
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
            </div>
            
            <div id="devolucionTransaccionesContainer">
                <div class="text-gray-500">Cargando transacciones...</div>
            </div>
        </div>
    `;
    }

    async loadDevolucionStep2Data() {
        // Obtener transacciones para filtrar según tipo
        const tipo = this.transactionData.tipoTransaccion === 'DEVOLUCION_COMPRA' ? 'COMPRA' : 'VENTA';
        try {
            // ¡Pasa el filtro de tipo!
            this.transacciones = await this.transaccionService.getTransacciones({ tipo });
            this.transaccionesFiltradas = this.transacciones.filter(
                t => t.tipo === tipo && t.estado !== 'CANCELADA'
            );

            const container = document.getElementById('devolucionTransaccionesContainer');
            if (!container) return;

            // Crear el buscador primero
            container.innerHTML = `
            <div class="mb-4">
                <input type="text" id="devolucionSearchInput" placeholder="Buscar por ID, cliente o fecha..." 
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
            </div>
            <div id="devolucionTransaccionesLista" class="max-h-96 overflow-y-auto">
                <div class="text-gray-500 text-center p-4">Cargando transacciones...</div>
            </div>
        `;

            // Configurar el buscador
            const searchInput = document.getElementById('devolucionSearchInput');
            const listaContainer = document.getElementById('devolucionTransaccionesLista');

            if (!listaContainer) return;

            // Función para renderizar las transacciones filtradas
            const renderTransacciones = (transacciones) => {
                if (!transacciones.length) {
                    listaContainer.innerHTML = `<div class="text-gray-500 text-center p-4">No hay transacciones para devolución.</div>`;
                    return;
                }

                listaContainer.innerHTML = transacciones.map((t) => {
                    const stateColor = this.getStateColor(t.estado);
                    const isSelected = this.transactionData.transaccionOrigen && this.transactionData.transaccionOrigen.id === t.id;

                    return `
                    <div class="border-l-4 border-${stateColor}-500 rounded px-4 py-2 mb-2 cursor-pointer 
                        ${isSelected ? "bg-brand-light-brown text-white" : "bg-white hover:bg-gray-50"}"
                        onclick="window.transactionWizard.selectTransaccionOrigen(${t.id})">
                        <div class="flex items-center justify-between">
                            <div>
                                <strong>${t.contraparteNombre || 'Sin nombre'}</strong> 
                                <span class="ml-1 text-xs font-semibold">#${t.id}</span>
                                <span class="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-${stateColor}-100 text-${stateColor}-800">
                                    ${t.estado || 'N/A'}
                                </span>
                            </div>
                            <span class="text-xs ${isSelected ? 'text-white' : 'text-gray-500'}">
                                ${new Date(t.fecha).toLocaleDateString('es-DO')}
                            </span>
                        </div>
                        <div class="flex items-center justify-between mt-1">
                            <span class="text-sm ${isSelected ? 'text-white' : 'text-gray-600'}">
                                <i class="fas fa-cubes mr-1"></i>
                                ${t.lineas ? t.lineas.reduce((sum, line) => sum + (parseInt(line.cantidad) || 0), 0) : 0} unidades
                            </span>
                            <span class="text-sm font-bold ${isSelected ? 'text-white' : 'text-brand-brown'}">
                                ${this.formatCurrency(t.total)}
                            </span>
                        </div>
                    </div>
                `;
                }).join('');
            };

            // Renderizar inicialmente todas las transacciones
            renderTransacciones(this.transaccionesFiltradas);

            // Configurar búsqueda
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    const searchTerm = e.target.value.toLowerCase().trim();

                    if (!searchTerm) {
                        renderTransacciones(this.transaccionesFiltradas);
                        return;
                    }

                    const filtradas = this.transaccionesFiltradas.filter(t => {
                        // Buscar en ID
                        if (t.id.toString().includes(searchTerm)) return true;

                        // Buscar en nombre de contraparte
                        if (t.contraparteNombre && t.contraparteNombre.toLowerCase().includes(searchTerm)) return true;

                        // Buscar en fecha
                        const fecha = new Date(t.fecha).toLocaleDateString('es-DO').toLowerCase();
                        if (fecha.includes(searchTerm)) return true;

                        // Buscar en total
                        const total = this.formatCurrency(t.total).toLowerCase();
                        if (total.includes(searchTerm)) return true;

                        return false;
                    });

                    renderTransacciones(filtradas);
                });
            }

        } catch (e) {
            console.error('Error cargando transacciones:', e);
            window.showToast('Error cargando transacciones.', 'error');

            const container = document.getElementById('devolucionTransaccionesContainer');
            if (container) {
                container.innerHTML = `
                <div class="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 text-center">
                    <i class="fas fa-exclamation-triangle text-xl mb-2"></i>
                    <p>Error al cargar las transacciones.</p>
                    <button onclick="window.transactionWizard.loadDevolucionStep2Data()" 
                            class="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">
                        Reintentar
                    </button>
                </div>
            `;
            }
        }
    }
    renderDevolucionTransacciones(transacciones) {
        const container = document.getElementById('devolucionTransaccionesContainer');
        if (!container) return;

        if (!transacciones.length) {
            container.innerHTML = `<div class="text-gray-500">No hay transacciones que coincidan con los criterios.</div>`;
            return;
        }

        container.innerHTML = transacciones.map((t) => `
        <div class="border-l-4 border-${this.getStateColor(t.estado)}-500 rounded px-4 py-2 mb-2 cursor-pointer ${this.transactionData.transaccionOrigen && this.transactionData.transaccionOrigen.id === t.id ? "bg-brand-light-brown text-white" : "bg-white"}
            hover:bg-gray-100"
            onclick="window.transactionWizard.selectTransaccionOrigen(${t.id})">
            <strong>${t.contraparteNombre || 'Sin nombre'}</strong> #${t.id} - ${t.estado} <span class="ml-2 text-xs text-gray-500">${new Date(t.fecha).toLocaleDateString('es-DO')}</span>
            <br>
            <span class="text-sm text-gray-600">Total: ${this.formatCurrency(t.total)}</span>
        </div>
    `).join('');
    }

    selectTransaccionOrigen(id) {
        this.transactionData.transaccionOrigen = this.transaccionesFiltradas.find(t => t.id === id);
        // Reset productos seleccionados si cambia la transacción
        this.transactionData.productosADevolver = [];
        this.updateWizardUI();
    }

    validateDevolucionStep2() {
        if (!this.transactionData.transaccionOrigen) {
            window.showToast('Selecciona una transacción origen', 'error');
            return false;
        }
        return true;
    }


    loadDevolucionStep4Data() {
        // Nada por ahora
    }
    async finalizeVenta() {
        try {
            this.updateTotals && this.updateTotals();

            // Gestión del cliente
            if (this.transactionData.cliente && !this.transactionData.cliente.cedula) {
                const nuevoCliente = await this.transaccionService.createCliente(this.transactionData.cliente);
                if (!nuevoCliente || !nuevoCliente.cedula) {
                    window.showToast('No se pudo crear el cliente.', 'error');
                    return false;
                }
                this.transactionData.cliente.cedula = nuevoCliente.cedula;
            }
            const cedulaLong = this.transactionData.cliente
                ? cedulaToLong(this.transactionData.cliente.cedula)
                : null;

            // Validación de productos
            const lineaInvalida = this.transactionData.lineas.find(
                line => !(line.nombreProducto || line.nombre)
            );
            if (lineaInvalida) {
                window.showToast('Hay un producto sin nombre. Corrige antes de continuar.', 'error');
                return;
            }

            const payload = {
                tipo: 'VENTA',
                cliente: this.transactionData.cliente ? {
                    cedula: this.transactionData.cliente.cedula,
                    nombre: this.transactionData.cliente.nombre,
                    apellido: this.transactionData.cliente.apellido
                } : null,
                proveedor: null,
                metodoPago: this.transactionData.metodoPago,
                observaciones: this.transactionData.observaciones,
                lineas: this.transactionData.lineas.map(line => ({
                    productoId: line.productoId,
                    productoNombre: line.nombreProducto || line.nombre,
                    cantidad: line.cantidad,
                    precioUnitario: line.precioUnitario,
                    subtotal: line.subtotalLinea,
                    impuestoPorcentaje: line.impuestoPorcentaje ?? 0,
                    impuestoMonto: line.impuestoMonto ?? 0,
                    total: line.totalLinea ?? line.subtotalLinea,
                    descuentoPorcentaje: line.descuentoPorcentaje ?? 0,
                    descuentoMonto: line.descuentoMonto ?? 0,
                    observaciones: line.observaciones ?? ""
                })),
                subtotal: this.transactionData.subtotal,
                impuestos: this.transactionData.impuestos,
                total: this.transactionData.total,
                contraparteId: cedulaLong,
                contraparteNombre: this.transactionData.cliente
                    ? (this.transactionData.cliente.nombre + " " + this.transactionData.cliente.apellido)
                    : null,
                tipoContraparte: "CLIENTE",
                vendedorId: window.currentUser ? window.currentUser.id : null,
            };

            // Añadir información del tipo de pago y si es en cuotas
            payload.tipoPago = this.transactionData.tipoPago || 'NORMAL';

            // Si es pago con tarjeta
            if (this.transactionData.metodoPago === 'TARJETA' && this.transactionData.cardnetResponse) {
                payload.datosTarjeta = {
                    numeroAutorizacion: this.transactionData.cardnetAuthCode,
                    referencia: this.transactionData.referenceNumber,
                    ultimosCuatro: this.extractLastFourDigits(this.transactionData.cardnetResponse.CreditCardNumber),
                    respuestaAdquirente: this.transactionData.cardnetResponse.ResponseCode
                };
            }

            // Si es pago en cuotas
            if (this.transactionData.tipoPago === 'ENCUOTAS') {
                // Calcular montos y saldo pendiente
                const montoInicial = this.transactionData.montoInicial || 0;
                const montoTotal = this.transactionData.total || 0;
                const totalCuotas = this.transactionData.cuotasFlexibles?.reduce(
                    (sum, cuota) => sum + (parseFloat(cuota.monto) || 0), 0
                ) || 0;
                const saldoPendiente = montoTotal - montoInicial - totalCuotas;

                // Agregar información del plan de pagos al payload
                payload.planPagos = {
                    montoInicial: montoInicial,
                    montoTotal: montoTotal,
                    saldoPendiente: saldoPendiente,
                    cuotas: this.transactionData.cuotasFlexibles.map(cuota => ({
                        numero: cuota.numero,
                        fecha: cuota.fecha,
                        monto: parseFloat(cuota.monto),
                        estado: 'PENDIENTE'
                    }))
                };

                // Registrar detalles en observaciones también
                if (!payload.observaciones) payload.observaciones = "";
                payload.observaciones += "\n\nVENTA A CRÉDITO:";
                payload.observaciones += `\nPago inicial: ${this.formatCurrency(montoInicial)}`;
                payload.observaciones += `\nTotal a financiar: ${this.formatCurrency(montoTotal - montoInicial)}`;
                payload.observaciones += `\nNúmero de cuotas: ${this.transactionData.cuotasFlexibles?.length || 0}`;

                // Si hay saldo pendiente (no cubierto por las cuotas), incluirlo
                if (saldoPendiente > 0) {
                    payload.observaciones += `\nSaldo pendiente sin programar: ${this.formatCurrency(saldoPendiente)}`;
                }
            }

            console.log("Payload de venta:", JSON.stringify(payload, null, 2));
            await this.transaccionService.crearTransaccion(payload);
            window.showToast('Venta procesada exitosamente.', 'success');
            this.close();
            if (window.transaccionesManager) window.transaccionesManager.loadTransactions();
        } catch (error) {
            console.error('Error al procesar venta:', error);
            window.showToast('Error al procesar la venta: ' + (error.message || error), 'error');
        }
    }
    extractLastFourDigits(cardNumber) {
        if (!cardNumber) return '';
        const match = cardNumber.match(/(\d{4})$/);
        return match ? match[1] : '';
    }
    async processCardnetPayment() {
        try {
            // Mostrar pantalla de carga
            this.showLoadingOverlay("Enviando pago al terminal Verifone...");

            // Crea la sesión de CardNet indicando que es para terminal físico
            const sessionData = await this.cardnetService.createSession({
                ordenId: `ORD-${Date.now()}`,
                total: this.transactionData.total,
                impuestos: this.transactionData.impuestos,
                email: this.transactionData.cliente?.email,
                telefono: this.transactionData.cliente?.telefono,
                direccion: this.transactionData.cliente?.direccion
            }, true); // Añadimos 'true' para indicar que es para terminal físico

            if (!sessionData.SESSION) {
                throw new Error("No se pudo crear la sesión de pago");
            }

            // Guarda los datos de la sesión
            this.cardnetSessionId = sessionData.SESSION;
            this.cardnetSessionKey = sessionData["session-key"];

            // Oculta el overlay de carga y muestra el modal de proceso de terminal
            this.hideLoadingOverlay();
            this.showTerminalProcessingModal(sessionData.SESSION);

        } catch (error) {
            this.hideLoadingOverlay();
            window.showToast(`Error al iniciar pago con terminal: ${error.message}`, 'error');
            console.error("Error en processCardnetPayment:", error);
        }
    }
    /**
     * Muestra el modal de proceso de pago en terminal
     */
    showTerminalProcessingModal(sessionId) {
        // Crea un modal para mostrar el estado del proceso en terminal
        const modal = document.createElement('div');
        modal.id = 'terminalPaymentModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';

        modal.innerHTML = `
        <div class="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div class="bg-brand-brown text-white p-6">
                <div class="flex items-center justify-between">
                    <h3 class="text-xl font-bold">Pago con Terminal</h3>
                    <button id="closeTerminalModal" class="text-white hover:text-gray-300">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="p-6">
                <div id="terminalPaymentStatus" class="mb-4">
                    <div class="flex items-center justify-center mb-4">
                        <div class="animate-spin h-10 w-10 border-4 border-brand-brown border-t-transparent rounded-full"></div>
                    </div>
                    <p class="text-center text-lg font-medium" id="terminalStatusMessage">
                        Transacción enviada al terminal
                    </p>
                    <p class="text-center text-gray-600 mt-2" id="terminalInstructions">
                        Por favor, solicite al cliente que presente su tarjeta en el terminal.
                    </p>
                </div>
                
                <div id="terminalPaymentComplete" class="text-center hidden">
                    <div class="bg-green-100 text-green-800 p-4 rounded-lg mb-4">
                        <i class="fas fa-check-circle text-3xl text-green-500 mb-2"></i>
                        <p class="font-bold">¡Pago completado exitosamente!</p>
                        <p id="terminalAuthCode" class="mt-1"></p>
                    </div>
                    <button id="closeTerminalPaymentComplete" 
                            class="bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-light-brown">
                        Cerrar
                    </button>
                </div>
                
                <div id="terminalPaymentError" class="text-center hidden">
                    <div class="bg-red-100 text-red-800 p-4 rounded-lg mb-4">
                        <i class="fas fa-exclamation-circle text-3xl text-red-500 mb-2"></i>
                        <p class="font-bold">Error en la transacción</p>
                        <p id="terminalErrorMessage" class="mt-1"></p>
                    </div>
                    <button id="closeTerminalPaymentError" 
                            class="bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-light-brown">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    `;

        document.body.appendChild(modal);

        // Configura los eventos
        document.getElementById('closeTerminalModal').addEventListener('click', () => {
            this.cancelTerminalPayment();
        });

        document.getElementById('closeTerminalPaymentComplete')?.addEventListener('click', () => {
            document.getElementById('terminalPaymentModal').remove();
            this.finalizeVenta();
        });

        document.getElementById('closeTerminalPaymentError')?.addEventListener('click', () => {
            document.getElementById('terminalPaymentModal').remove();
        });

        // Iniciar el polling para consultar estado
        this.startPollingTerminalStatus(
            sessionId,
            this.handleTerminalStatusChange.bind(this),
            this.handleTerminalPaymentComplete.bind(this),
            this.handleTerminalPaymentError.bind(this)
        );
    }

    /**
     * Maneja cambios de estado en la transacción del terminal
     */
    handleTerminalStatusChange(statusData) {
        const statusMessage = document.getElementById('terminalStatusMessage');
        const instructions = document.getElementById('terminalInstructions');

        if (!statusMessage || !instructions) return;

        if (statusData.status === 'CREATED') {
            statusMessage.textContent = 'Transacción enviada al terminal';
            instructions.textContent = 'Por favor, solicite al cliente que presente su tarjeta en el terminal.';
        } else if (statusData.status === 'PENDING') {
            statusMessage.textContent = 'Esperando acción en terminal';
            instructions.textContent = 'El terminal está procesando el pago.';
        } else if (statusData.status === 'CANCELLED_BY_USER') {
            this.handleTerminalPaymentError(new Error("Transacción cancelada por el usuario"));
        } else {
            statusMessage.textContent = statusData.message || 'Procesando...';
        }
    }

    /**
     * Maneja la finalización exitosa del pago en terminal
     */
    handleTerminalPaymentComplete(statusData) {
        const statusDiv = document.getElementById('terminalPaymentStatus');
        const completeDiv = document.getElementById('terminalPaymentComplete');
        const authCodeElement = document.getElementById('terminalAuthCode');

        if (!statusDiv || !completeDiv) return;

        // Ocultar estado y mostrar completado
        statusDiv.classList.add('hidden');
        completeDiv.classList.remove('hidden');

        // Mostrar código de autorización si existe
        if (statusData.authCode && authCodeElement) {
            authCodeElement.textContent = `Código de autorización: ${statusData.authCode}`;
        }

        // Guardar información para la venta
        this.transactionData.cardnetResponse = statusData;
        this.transactionData.cardnetAuthCode = statusData.authCode;
        this.transactionData.referenceNumber = statusData.referenceName || statusData.sessionId;
    }

    /**
     * Maneja errores en el proceso de pago en terminal
     */
    handleTerminalPaymentError(error) {
        const statusDiv = document.getElementById('terminalPaymentStatus');
        const errorDiv = document.getElementById('terminalPaymentError');
        const errorMessageElement = document.getElementById('terminalErrorMessage');

        if (!statusDiv || !errorDiv) return;

        // Ocultar estado y mostrar error
        statusDiv.classList.add('hidden');
        errorDiv.classList.remove('hidden');

        // Mostrar mensaje de error
        if (errorMessageElement) {
            errorMessageElement.textContent = error.message || 'Error desconocido al procesar el pago';
        }
    }

    /**
     * Cancela una transacción en curso en el terminal
     */
    cancelTerminalPayment() {
        // Detener polling
        if (this._pollingInterval) {
            clearInterval(this._pollingInterval);
            this._pollingInterval = null;
        }

        // Cerrar modal
        const modal = document.getElementById('terminalPaymentModal');
        if (modal) modal.remove();
    }



    /**
     * Inicia consultas periódicas al servidor para verificar estado
     */
    async startPollingTerminalStatus(sessionId, onStatusChange, onComplete, onError) {
        const startTime = Date.now();
        const maxPollingTime = 300000; // 5 minutos máximo
        const pollingInterval = 3000; // Consultar cada 3 segundos

        // Limpiar cualquier intervalo existente
        if (this._pollingInterval) {
            clearInterval(this._pollingInterval);
        }

        this._pollingInterval = setInterval(async () => {
            try {
                const statusData = await this.cardnetService.checkStatus(sessionId);

                // Notificar el cambio de estado
                if (onStatusChange) {
                    onStatusChange(statusData);
                }

                // Si la transacción está completada
                if (statusData.isCompleted) {
                    clearInterval(this._pollingInterval);
                    this._pollingInterval = null;
                    if (onComplete) {
                        onComplete(statusData);
                    }
                }

                // Si ha pasado el tiempo máximo, detener
                if (Date.now() - startTime > maxPollingTime) {
                    clearInterval(this._pollingInterval);
                    this._pollingInterval = null;
                    if (onError) {
                        onError(new Error("Tiempo de espera agotado para la transacción"));
                    }
                }

            } catch (error) {
                console.error("Error consultando estado:", error);
                clearInterval(this._pollingInterval);
                this._pollingInterval = null;
                if (onError) {
                    onError(error);
                }
            }
        }, pollingInterval);
    }
    async finalizeCompra() {
        try {
            this.updateTotals && this.updateTotals();

            // Validación extra: asegúrate que el proveedor y su nombre existen
            if (!this.transactionData.proveedor || !this.transactionData.proveedor.nombre) {
                window.showToast('El nombre del proveedor es obligatorio para la compra.', 'error');
                return false;
            }
            // Si el proveedor no tiene id, es un nuevo suplidor, así que créalo
            if (!this.transactionData.proveedor?.id) {
                // Debes tener un método real para crear suplidor en tu transaccionService o uno extra
                const nuevoSuplidor = await this.transaccionService.createSuplidor(this.transactionData.proveedor);
                if (!nuevoSuplidor || !nuevoSuplidor.id) {
                    window.showToast('No se pudo crear el proveedor.', 'error');
                    return false;
                }
                this.transactionData.proveedor.id = nuevoSuplidor.id;
            }
            for (let line of this.transactionData.lineas) {
                if (!line.productoId) {
                    const nuevoProducto = await this.transaccionService.createProducto({
                        nombre: line.nombreProducto,
                        precioCompra: line.precioUnitario,
                        precioVenta: 0, // <-- Envía 0 al crear el producto, el usuario lo modificará luego
                        tipo: line.tipo || "MUEBLE"
                    });
                    if (nuevoProducto && nuevoProducto.id) {
                        line.productoId = nuevoProducto.id;
                        // puedes ajustar otros datos si lo deseas
                    } else {
                        window.showToast('No se pudo crear el producto.', 'error');
                        return false;
                    }
                }
            }

            const payload = {
                tipo: 'COMPRA', // Solo este campo, no tipoTransaccion
                cliente: null,
                proveedor: this.transactionData.proveedor ? {
                    id: this.transactionData.proveedor.id,
                    nombre: this.transactionData.proveedor.nombre,
                    rnc: this.transactionData.proveedor.rnc,
                    telefono: this.transactionData.proveedor.telefono,
                    email: this.transactionData.proveedor.email
                } : null,
                contraparteId: this.transactionData.proveedor?.id,
                contraparteNombre: this.transactionData.proveedor?.nombre, // ¡Este campo es obligatorio!
                tipoContraparte: 'SUPLIDOR',
                metodoPago: this.transactionData.metodoPago || 'EFECTIVO',
                observaciones: this.transactionData.observaciones ||
                    (this.transactionData.proveedor ? `Compra de proveedor: ${this.transactionData.proveedor.nombre}` : ''),
                lineas: this.transactionData.lineas.map(line => ({
                    productoId: line.productoId,
                    productoNombre: line.nombreProducto,
                    cantidad: line.cantidad,
                    precioUnitario: line.precioUnitario,
                    subtotal: line.subtotalLinea // nombre esperado por backend
                })),
                subtotal: this.transactionData.subtotal,
                impuestos: this.transactionData.impuestos,
                total: this.transactionData.total,
                vendedorId: window.currentUser ? window.currentUser.id : null,
            };

            // Depuración: muestra el payload
            console.log("Payload enviado:", JSON.stringify(payload, null, 2));

            await this.transaccionService.crearTransaccion(payload);
            window.showToast('Compra procesada exitosamente.', 'success');
            this.close();
            if (window.transaccionesManager) window.transaccionesManager.loadTransactions();
        } catch (error) {
            console.error('Error al procesar compra:', error);
            window.showToast('Error al procesar la compra: ' + (error.message || error), 'error');
        }
    }

    // --- Utility Functions ---
    updateTotals() {
        let subtotal = 0;
        let impuestos = 0;
        let total = 0;

        this.transactionData.lineas.forEach(line => {
            subtotal += line.subtotalLinea;
            // Assuming a fixed ITBIS for now, or fetch from product
            // For simplicity, let's assume 18% ITBIS on subtotalLinea for now if product.itbis is not available
            const productItbisRate = line.itbis || 0.18; // Use 18% if not specified
            impuestos += line.subtotalLinea * productItbisRate;
        });

        total = subtotal + impuestos;

        this.transactionData.subtotal = subtotal;
        this.transactionData.impuestos = impuestos;
        this.transactionData.total = total;

        // Update displayed totals
        const subtotalElement = this.wizardContent.querySelector('p:has(strong)'); // Find the subtotal paragraph
        if (subtotalElement) {
            subtotalElement.innerHTML = `Subtotal: <strong>${this.formatCurrency(this.transactionData.subtotal)}</strong>`;
            subtotalElement.nextElementSibling.innerHTML = `Impuestos: <strong>${this.formatCurrency(this.transactionData.impuestos)}</strong>`;
            subtotalElement.nextElementSibling.nextElementSibling.innerHTML = `Total: <strong>${this.formatCurrency(this.transactionData.total)}</strong>`;
        }
    }

    formatCurrency(amount) {
        if (typeof amount !== 'number') {
            amount = parseFloat(amount) || 0;
        }
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
            minimumFractionDigits: 2
        }).format(amount);
    }

    formatTransactionType(type) {
        const types = {
            'COMPRA': 'Compra',
            'VENTA': 'Venta',
            'DEVOLUCION_COMPRA': 'Devolución Compra',
            'DEVOLUCION_VENTA': 'Devolución Venta'
        };
        return types[type] || type;
    }

    // =============== VENTA WIZARD METHODS ===============
    async validateVentaStep1() {
        const clienteCedula = document.getElementById('ventaClienteSelect')?.value;

        // Validar que se haya seleccionado un cliente
        if (!clienteCedula || clienteCedula === '') {
            window.showToast('Debe seleccionar un cliente para continuar', 'error');
            return false;
        }

        // Si se ha seleccionado un cliente, cargamos sus datos completos
        try {
            const cliente = await this.transaccionService.getClienteByCedula(clienteCedula);
            if (cliente) {
                this.transactionData.cliente = cliente;
            } else {
                this.transactionData.cliente = {cedula: clienteCedula};
            }
        } catch (error) {
            console.error('Error loading client:', error);
            this.transactionData.cliente = {cedula: clienteCedula};
        }

        return true;
    }

    getVentaStep2Content() {
        return `
            <div class="space-y-4">
                <h3 class="text-lg font-semibold text-brand-brown">Productos a Vender</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Buscar Producto</label>
                        <input type="text" id="ventaProductoSearch" placeholder="Buscar por nombre o código..." 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Producto</label>
                        <select id="ventaProductoSelect" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
                            <option value="">Seleccionar producto</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                        <div class="flex">
                            <input type="number" id="ventaCantidad" min="1" value="1" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
                            <button type="button" onclick="window.transactionWizard.addVentaProduct()" 
                                    class="ml-2 bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-light-brown">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div id="ventaProductsList" class="space-y-2">
                    <!-- Selected products will appear here -->
                </div>
                
                <div class="bg-gray-50 p-4 rounded-lg">
                    <div class="flex justify-between items-center">
                        <span class="font-medium">Subtotal:</span>
                        <span id="ventaSubtotal" class="font-bold">${this.formatCurrency(0)}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="font-medium">Impuestos:</span>
                        <span id="ventaImpuestos" class="font-bold">${this.formatCurrency(0)}</span>
                    </div>
                    <div class="flex justify-between items-center text-lg">
                        <span class="font-bold">Total:</span>
                        <span id="ventaTotal" class="font-bold text-brand-brown">${this.formatCurrency(0)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    async loadVentaStep2Data() {
        try {
            const productos = await this.transaccionService.getProductosParaVenta();
            const select = document.getElementById('ventaProductoSelect');
            const searchInput = document.getElementById('ventaProductoSearch');

            if (select) {
                select.innerHTML = '<option value="">Seleccionar producto</option>';
                productos.forEach(producto => {
                    select.innerHTML += `<option value="${producto.id}">
            ${producto.nombre} - ${this.formatCurrency(producto.precioCompra)}
            (Tienda: ${producto.cantidadDisponible || 0} / Almacén: ${producto.cantidadAlmacen || 0} / Total: ${(producto.cantidadDisponible || 0) + (producto.cantidadAlmacen || 0)})
        </option>`;
                });
            }

// Setup search functionality
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    const searchTerm = e.target.value.toLowerCase();
                    const filteredProducts = productos.filter(producto =>
                        producto.nombre.toLowerCase().includes(searchTerm) ||
                        producto.codigo.toLowerCase().includes(searchTerm)
                    );

                    select.innerHTML = '<option value="">Seleccionar producto</option>';
                    filteredProducts.forEach(producto => {
                        select.innerHTML += `<option value="${producto.id}">
                ${producto.nombre} - ${this.formatCurrency(producto.precioCompra)}
                (Tienda: ${producto.cantidadDisponible || 0} / Almacén: ${producto.cantidadAlmacen || 0} / Total: ${(producto.cantidadDisponible || 0) + (producto.cantidadAlmacen || 0)})
            </option>`;
                    });
                });
            }

            this.updateVentaProductsList();
            this.updateVentaTotals();
        } catch (error) {
            console.error('Error loading products:', error);
            window.showToast('Error al cargar productos.', 'error');
        }
    }

    async addVentaProduct() {
        const productSelect = document.getElementById('ventaProductoSelect');
        const cantidadInput = document.getElementById('ventaCantidad');

        if (!productSelect.value || !cantidadInput.value) {
            window.showToast('Selecciona un producto y cantidad válida.', 'error');
            return;
        }

        const cantidad = parseInt(cantidadInput.value);
        if (cantidad <= 0) {
            window.showToast('La cantidad debe ser mayor a 0.', 'error');
            return;
        }

        // Find product details from the loaded products
        const productId = parseInt(productSelect.value);
        try {
            const productos = await this.transaccionService.getProductosParaVenta();
            const selectedProduct = productos.find(p => p.id === productId);

            if (!selectedProduct) {
                window.showToast('Producto no encontrado.', 'error');
                return;
            }

            // --- NUEVO: stock total = disponible en tienda + almacen ---
            const stockDisponible = Number(selectedProduct.cantidadDisponible) || 0;
            const stockAlmacen = Number(selectedProduct.cantidadAlmacen) || 0;
            const stockTotal = stockDisponible + stockAlmacen;

            if (cantidad > stockTotal) {
                window.showToast(`Cantidad excede el stock total (Tienda: ${stockDisponible}, Almacén: ${stockAlmacen})`, 'error');
                return;
            }

            const existingLineIndex = this.transactionData.lineas.findIndex(line => line.productoId === selectedProduct.id);

            if (existingLineIndex > -1) {
                // Update existing line
                const existingLine = this.transactionData.lineas[existingLineIndex];
                existingLine.cantidad += cantidad;
                existingLine.subtotalLinea = existingLine.precioUnitario * existingLine.cantidad;
            } else {
                // Add new line
                this.transactionData.lineas.push({
                    productoId: selectedProduct.id,
                    nombreProducto: selectedProduct.nombre,
                    codigoProducto: selectedProduct.codigo,
                    cantidad: cantidad,
                    precioUnitario: selectedProduct.precioCompra,
                    descuento: 0,
                    subtotalLinea: selectedProduct.precioCompra * cantidad,
                    categoria: selectedProduct.categoria
                });
            }

            cantidadInput.value = 1;
            productSelect.value = '';
            this.updateVentaProductsList();
            this.updateVentaTotals();
            window.showToast('Producto agregado exitosamente.', 'success');
        } catch (error) {
            console.error('Error adding product:', error);
            window.showToast('Error al agregar producto.', 'error');
        }
    }

    updateVentaProductsList() {
        const container = document.getElementById('ventaProductsList');
        if (!container) return;

        if (this.transactionData.lineas.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-4">No hay productos seleccionados</p>';
            return;
        }

        container.innerHTML = this.transactionData.lineas.map((linea, index) => `
            <div class="flex justify-between items-center bg-white p-3 border border-gray-200 rounded-lg">
                <div>
                    <span class="font-medium">${linea.nombreProducto}</span>
                    <span class="text-gray-600 ml-2">(${linea.cantidad} x ${this.formatCurrency(linea.precioUnitario)})</span>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="font-bold">${this.formatCurrency(linea.subtotalLinea)}</span>
                    <!-- Botón eliminar removido -->
                </div>
            </div>
        `).join('');
    }
    updateVentaTotals() {
        let subtotal = 0;
        let impuestos = 0;

        this.transactionData.lineas.forEach(line => {
            subtotal += line.subtotalLinea;
            // Assuming 18% ITBIS
            impuestos += line.subtotalLinea * 0.18;
        });

        this.transactionData.subtotal = subtotal;
        this.transactionData.impuestos = impuestos;
        this.transactionData.total = subtotal + impuestos;

        // Update display
        const subtotalElement = document.getElementById('ventaSubtotal');
        const impuestosElement = document.getElementById('ventaImpuestos');
        const totalElement = document.getElementById('ventaTotal');

        if (subtotalElement) subtotalElement.textContent = this.formatCurrency(this.transactionData.subtotal);
        if (impuestosElement) impuestosElement.textContent = this.formatCurrency(this.transactionData.impuestos);
        if (totalElement) totalElement.textContent = this.formatCurrency(this.transactionData.total);
    }

    validateVentaStep2() {
        if (this.transactionData.lineas.length === 0) {
            window.showToast('Debe agregar al menos un producto a la venta.', 'error');
            return false;
        }
        return true;
    }


    /**
     * Muestra el formulario de pago de CardNet
     */
    showCardnetPaymentForm(sessionId) {
        // Crea un modal con el formulario de CardNet
        const modal = document.createElement('div');
        modal.id = 'cardnetPaymentModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';

        modal.innerHTML = `
        <div class="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-bold text-brand-brown">Pago con Tarjeta</h3>
                <button id="closeCardnetModal" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="text-center mb-4">
                <p class="mb-4">Serás redirigido a la plataforma segura de CardNet para completar el pago.</p>
                <form id="cardnetForm" action="https://lab.cardnet.com.do/authorize" method="post" target="_blank">
                    <input name="SESSION" value="${sessionId}" type="hidden">
                    <button type="submit" class="w-full bg-brand-brown text-white py-3 rounded-lg hover:bg-brand-light-brown transition-colors">
                        Proceder al Pago
                    </button>
                </form>
            </div>
            <div class="mt-4 text-sm text-gray-500 text-center">
                <p>Al hacer clic en "Proceder al Pago", serás redirigido a la plataforma segura de CardNet.</p>
                <p>Una vez completado el pago, regresa a esta ventana.</p>
            </div>
            <div class="mt-6 flex justify-center">
                <button id="checkCardnetPayment" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Ya completé el pago
                </button>
            </div>
        </div>
    `;

        document.body.appendChild(modal);

        // Configura los eventos
        document.getElementById('closeCardnetModal').addEventListener('click', () => {
            document.getElementById('cardnetPaymentModal').remove();
        });

        document.getElementById('cardnetForm').addEventListener('submit', () => {
            setTimeout(() => {
                window.showToast('Procesando pago con CardNet...', 'info');
            }, 1000);
        });

        document.getElementById('checkCardnetPayment').addEventListener('click', () => {
            this.verifyCardnetPayment();
        });
    }

    /**
     * Verifica el estado del pago en CardNet
     */
    async verifyCardnetPayment() {
        if (!this.cardnetSessionId || !this.cardnetSessionKey) {
            window.showToast('No hay una sesión de pago activa', 'error');
            return;
        }

        try {
            this.showLoadingOverlay("Verificando pago...");

            const result = await this.cardnetService.verifyTransaction(
                this.cardnetSessionId,
                this.cardnetSessionKey
            );

            this.hideLoadingOverlay();

            // Verifica si el pago fue exitoso
            if (result.ResponseCode === '00') {
                // Guarda los datos de la transacción
                this.transactionData.cardnetResponse = result;
                this.transactionData.cardnetAuthCode = result.AuthorizationCode;
                this.transactionData.referenceNumber = result.RetrievalReferenceNumber;

                // Cierra el modal de CardNet
                const modal = document.getElementById('cardnetPaymentModal');
                if (modal) modal.remove();

                // Muestra mensaje de éxito
                window.showToast('Pago procesado exitosamente', 'success');

                // Continúa con la finalización de la venta
                this.finalizeVenta();
            } else {
                window.showToast(`Pago rechazado: ${this.getCardnetErrorMessage(result.ResponseCode)}`, 'error');
            }
        } catch (error) {
            this.hideLoadingOverlay();
            window.showToast(`Error al verificar el pago: ${error.message}`, 'error');
            console.error("Error en verifyCardnetPayment:", error);
        }
    }

    /**
     * Obtiene el mensaje de error según el código de respuesta de CardNet
     */
    getCardnetErrorMessage(responseCode) {
        const errorMessages = {
            '01': 'Tarjeta rechazada, contacta a tu banco',
            '05': 'Transacción rechazada',
            '51': 'Fondos insuficientes',
            '54': 'Tarjeta vencida',
            '61': 'Excedió límite de retiro',
            '99': 'Error en el código de seguridad (CVV)'
            // Puedes agregar más códigos según la documentación
        };

        return errorMessages[responseCode] || `Error código ${responseCode}`;
    }

    /**
     * Muestra un overlay de carga
     */
    showLoadingOverlay(message = "Procesando...") {
        const overlay = document.createElement('div');
        overlay.id = 'paymentLoadingOverlay';
        overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        overlay.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-lg text-center">
            <div class="animate-spin h-10 w-10 border-4 border-brand-brown border-t-transparent rounded-full mx-auto mb-4"></div>
            <p class="text-gray-600 font-medium">${message}</p>
        </div>
    `;
        document.body.appendChild(overlay);
    }

    /**
     * Oculta el overlay de carga
     */
    hideLoadingOverlay() {
        const overlay = document.getElementById('paymentLoadingOverlay');
        if (overlay) overlay.remove();
    }

    // Muestra/oculta campos según el tipo de pago
    toggleTipoPago(tipo) {
        const normalFields = document.getElementById('metodoPagoNormal');
        const cuotasFields = document.getElementById('metodoPagoEnCuotas');
        const gestionCuotas = document.getElementById('gestionCuotasFlexibles');

        if (tipo === 'NORMAL') {
            normalFields.classList.remove('hidden');
            cuotasFields.classList.add('hidden');
            gestionCuotas.classList.add('hidden');
        } else {
            normalFields.classList.add('hidden');
            cuotasFields.classList.remove('hidden');
            gestionCuotas.classList.remove('hidden');

            // Inicializar cuotas
            this.inicializarGestionCuotas();
        }

        this.transactionData.tipoPago = tipo;
    }

// Inicializa la gestión de cuotas
    inicializarGestionCuotas() {
        // Inicializar arreglo de cuotas si no existe
        if (!this.transactionData.cuotasFlexibles) {
            this.transactionData.cuotasFlexibles = [];
        }

        // Mostrar cuotas existentes
        this.actualizarListaCuotas();

        // Configurar eventos
        const btnAgregarCuota = document.getElementById('btnAgregarCuota');
        if (btnAgregarCuota) {
            btnAgregarCuota.onclick = () => this.agregarCuotaFlexible();
        }

        // Configurar evento para el monto inicial
        const montoInicial = document.getElementById('montoInicial');
        if (montoInicial) {
            montoInicial.onchange = () => this.actualizarMontoAFinanciar();
            montoInicial.onkeyup = () => this.actualizarMontoAFinanciar();
        }
    }

// Actualiza el monto a financiar cuando cambia el monto inicial
    actualizarMontoAFinanciar() {
        const montoInicial = parseFloat(document.getElementById('montoInicial').value) || 0;
        const montoTotal = this.transactionData.total || 0;

        // Validar que el monto inicial no exceda el total
        if (montoInicial > montoTotal) {
            window.showToast('El monto inicial no puede ser mayor al total', 'error');
            document.getElementById('montoInicial').value = montoTotal;
            return;
        }

        // Calcular monto a financiar
        const montoAFinanciar = montoTotal - montoInicial;

        // Actualizar en la interfaz
        const spanMontoAFinanciar = document.getElementById('montoAFinanciar');
        if (spanMontoAFinanciar) {
            spanMontoAFinanciar.textContent = this.formatCurrency(montoAFinanciar);
        }

        // Guardar en transactionData
        this.transactionData.montoInicial = montoInicial;
        this.transactionData.montoAFinanciar = montoAFinanciar;

        // Actualizar saldo pendiente
        this.actualizarSaldoPendiente();
    }

// Agrega una nueva cuota flexible
    agregarCuotaFlexible() {
        // Calcular fecha sugerida (1 mes después de la última cuota o de hoy)
        let fechaSugerida = new Date();
        if (this.transactionData.cuotasFlexibles && this.transactionData.cuotasFlexibles.length > 0) {
            const ultimaCuota = this.transactionData.cuotasFlexibles[this.transactionData.cuotasFlexibles.length - 1];
            fechaSugerida = new Date(ultimaCuota.fecha);
        }
        fechaSugerida.setMonth(fechaSugerida.getMonth() + 1);

        // Formato YYYY-MM-DD para el input date
        const fechaFormateada = fechaSugerida.toISOString().split('T')[0];

        // Crear nueva cuota
        const nuevaCuota = {
            id: Date.now(), // ID único temporal
            numero: (this.transactionData.cuotasFlexibles?.length || 0) + 1,
            fecha: fechaFormateada,
            monto: 0,
            estado: 'PENDIENTE'
        };

        // Agregar al arreglo
        if (!this.transactionData.cuotasFlexibles) {
            this.transactionData.cuotasFlexibles = [];
        }
        this.transactionData.cuotasFlexibles.push(nuevaCuota);

        // Actualizar la lista en la interfaz
        this.actualizarListaCuotas();
    }

// Actualiza la lista de cuotas en la interfaz
    actualizarListaCuotas() {
        const container = document.getElementById('listaCuotasFlexibles');
        if (!container) return;

        if (!this.transactionData.cuotasFlexibles || this.transactionData.cuotasFlexibles.length === 0) {
            container.innerHTML = '<p class="text-gray-500 italic">No hay cuotas configuradas</p>';
            return;
        }

        container.innerHTML = this.transactionData.cuotasFlexibles.map((cuota, index) => `
        <div class="flex items-center space-x-3 p-3 bg-white rounded border">
            <div class="font-medium text-gray-700">Cuota ${cuota.numero}</div>
            <div class="flex-grow grid grid-cols-2 gap-2">
                <div>
                    <label class="text-xs text-gray-600 block">Fecha</label>
                    <input type="date" value="${cuota.fecha}" 
                           class="w-full border rounded px-2 py-1 text-sm"
                           onchange="window.transactionWizard.actualizarFechaCuota(${cuota.id}, this.value)">
                </div>
                <div>
                    <label class="text-xs text-gray-600 block">Monto</label>
                    <input type="number" value="${cuota.monto}" min="0" step="0.01"
                           class="w-full border rounded px-2 py-1 text-sm"
                           onchange="window.transactionWizard.actualizarMontoCuota(${cuota.id}, this.value)">
                </div>
            </div>
            <div>
                <button type="button" class="text-red-500 hover:text-red-700"
                        onclick="window.transactionWizard.eliminarCuota(${cuota.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');

        // Actualizar saldo pendiente
        this.actualizarSaldoPendiente();
    }

// Actualiza la fecha de una cuota
    actualizarFechaCuota(id, fecha) {
        const cuota = this.transactionData.cuotasFlexibles.find(c => c.id === id);
        if (cuota) {
            cuota.fecha = fecha;
        }
    }

// Actualiza el monto de una cuota
    actualizarMontoCuota(id, monto) {
        const montoValue = parseFloat(monto) || 0;
        const cuota = this.transactionData.cuotasFlexibles.find(c => c.id === id);
        if (cuota) {
            cuota.monto = montoValue;
            this.actualizarSaldoPendiente();
        }
    }

// Elimina una cuota
    eliminarCuota(id) {
        this.transactionData.cuotasFlexibles = this.transactionData.cuotasFlexibles.filter(c => c.id !== id);

        // Renumerar cuotas
        this.transactionData.cuotasFlexibles.forEach((cuota, index) => {
            cuota.numero = index + 1;
        });

        this.actualizarListaCuotas();
    }

// Actualiza el saldo pendiente
    actualizarSaldoPendiente() {
        const montoInicial = parseFloat(document.getElementById('montoInicial').value) || 0;
        const totalCuotas = this.transactionData.cuotasFlexibles?.reduce((sum, cuota) => sum + (parseFloat(cuota.monto) || 0), 0) || 0;
        const totalPagos = montoInicial + totalCuotas;
        const saldoPendiente = this.transactionData.total - totalPagos;

        const spanSaldoPendiente = document.getElementById('saldoPendiente');
        if (spanSaldoPendiente) {
            spanSaldoPendiente.textContent = this.formatCurrency(saldoPendiente);

            // Cambiar color según si está completo o no
            if (saldoPendiente <= 0) {
                spanSaldoPendiente.classList.remove('text-brand-brown');
                spanSaldoPendiente.classList.add('text-green-600');
            } else {
                spanSaldoPendiente.classList.add('text-brand-brown');
                spanSaldoPendiente.classList.remove('text-green-600');
            }
        }

        // Guardar en transactionData
        this.transactionData.saldoPendiente = saldoPendiente;
        return saldoPendiente;
    }

    getVentaStep3Content() {
        return `
        <div class="space-y-4">
            <h3 class="text-lg font-semibold text-brand-brown">Método de Pago</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de pago:</label>
                    <div class="space-y-2">
                        <label class="inline-flex items-center">
                            <input type="radio" name="TipoPago" value="NORMAL" class="form-radio text-brand-brown" checked 
                                   onchange="window.transactionWizard.toggleTipoPago('NORMAL')">
                            <span class="ml-2">Normal</span>
                        </label>
                        <label class="inline-flex items-center">
                            <input type="radio" name="TipoPago" value="ENCUOTAS" class="form-radio text-brand-brown"
                                   onchange="window.transactionWizard.toggleTipoPago('ENCUOTAS')">
                            <span class="ml-2">En cuotas</span>
                        </label>
                    </div>
                </div>
                
                <!-- Campos normales -->
                <div id="metodoPagoNormal">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Seleccionar método:</label>
                    <div class="space-y-2">
                        <label class="inline-flex items-center">
                            <input type="radio" name="ventaMetodoPago" value="EFECTIVO" class="form-radio text-brand-brown" checked>
                            <span class="ml-2">Efectivo</span>
                        </label>
                        <label class="inline-flex items-center">
                            <input type="radio" name="ventaMetodoPago" value="TARJETA" class="form-radio text-brand-brown">
                            <span class="ml-2">Tarjeta</span>
                        </label>
                        <label class="inline-flex items-center">
                            <input type="radio" name="ventaMetodoPago" value="TRANSFERENCIA" class="form-radio text-brand-brown">
                            <span class="ml-2">Transferencia</span>
                        </label>
                    </div>
                </div>
                
                <!-- Campos para pago en cuotas (inicialmente oculto) -->
                <div id="metodoPagoEnCuotas" class="hidden">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Monto de inicial</label>
                            <input type="number" id="montoInicial" class="w-full border rounded px-3 py-2" min="0">
                        </div>
                        <div class="text-sm text-gray-700 py-1 px-2 bg-gray-100 rounded">
                            <span>Total a financiar: </span>
                            <span id="montoAFinanciar" class="font-bold">${this.formatCurrency(this.transactionData.total)}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Gestión de cuotas flexibles -->
                <div id="gestionCuotasFlexibles" class="hidden col-span-2 mt-4 border p-4 rounded-lg bg-gray-50">
                    <div class="flex justify-between items-center mb-4">
                        <h4 class="font-bold">Gestión de Cuotas</h4>
                        <button type="button" id="btnAgregarCuota" class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm">
                            <i class="fas fa-plus mr-1"></i> Agregar Cuota
                        </button>
                    </div>
                    
                    <div id="listaCuotasFlexibles" class="space-y-3">
                        <!-- Aquí se añadirán dinámicamente las cuotas -->
                    </div>
                    
                    <div class="flex justify-between items-center mt-4 pt-3 border-t">
                        <div class="font-medium">Saldo restante:</div>
                        <div id="saldoPendiente" class="font-bold text-xl text-brand-brown">${this.formatCurrency(this.transactionData.total)}</div>
                    </div>
                </div>
                
                <!-- Campo de observaciones -->
                <div class="col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                    <textarea id="ventaObservaciones" rows="4" placeholder="Observaciones adicionales..." 
                              class="w-full px-3 py-2 border rounded"></textarea>
                </div>
            </div>
        </div>
    `;
    }
    validateVentaStep3() {
        const tipoPago = document.querySelector('input[name="TipoPago"]:checked')?.value;
        this.transactionData.tipoPago = tipoPago;

        if (tipoPago === 'ENCUOTAS') {
            // Validar que haya un monto inicial (puede ser 0 si es todo financiado)
            const montoInicial = parseFloat(document.getElementById('montoInicial').value);
            if (isNaN(montoInicial)) {
                window.showToast('Debe ingresar el monto inicial (puede ser 0)', 'error');
                return false;
            }

            // Las cuotas ya no son obligatorias al inicio, solo hay que calcular el saldo pendiente
            const saldoPendiente = this.actualizarSaldoPendiente();

            // Si el saldo pendiente es negativo (pago excesivo), advertir
            if (saldoPendiente < 0) {
                if (!confirm(`El total de pagos excede el precio por ${this.formatCurrency(-saldoPendiente)}. ¿Desea continuar de todos modos?`)) {
                    return false;
                }
            }

            // Si no hay cuotas pero hay saldo pendiente, confirmar que es intencional
            if (saldoPendiente > 0 && (!this.transactionData.cuotasFlexibles || this.transactionData.cuotasFlexibles.length === 0)) {
                if (!confirm(`Hay un saldo pendiente de ${this.formatCurrency(saldoPendiente)} sin cuotas programadas. El cliente deberá completar el pago posteriormente. ¿Desea continuar?`)) {
                    return false;
                }
            }

            // Para pagos en cuotas con monto inicial, usar EFECTIVO para el primer pago
            this.transactionData.metodoPago = 'EFECTIVO';
        } else {
            // Pago normal - código existente
            const metodoPago = document.querySelector('input[name="ventaMetodoPago"]:checked')?.value;
            if (!metodoPago) {
                window.showToast('Selecciona un método de pago.', 'error');
                return false;
            }
            this.transactionData.metodoPago = metodoPago;

            if (metodoPago === 'TARJETA') {
                // Usar la función actualizada para terminal físico en vez de web
                this.processCardnetPayment();
                return false; // Detener el flujo normal para que se maneje en la función de pago con tarjeta
            }
        }

        this.transactionData.observaciones = document.getElementById('ventaObservaciones')?.value || '';
        return true;
    }

    // PASO 3: Selección de productos a devolver con cantidad
    getDevolucionStep3Content() {
        const t = this.transactionData.transaccionOrigen;
        let html = `
        <div class="space-y-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Selecciona los productos a devolver:</label>
            <div id="productosADevolverContainer">
                <div class="text-gray-500">Cargando productos...</div>
            </div>
        </div>
    `;
        return html;
    }

// Modifica la estructura de productosADevolver para guardar objetos: [{ idx, cantidad }]
    // En loadDevolucionStep3Data
    async loadDevolucionStep3Data() {
        const container = document.getElementById('productosADevolverContainer');
        const trans = this.transactionData.transaccionOrigen;
        if (!trans || !container) return;

        if (!Array.isArray(this.transactionData.productosADevolver)) this.transactionData.productosADevolver = [];

        // Agregar buscador para productos
        const searchHTML = `
    <div class="mb-4">
        <input type="text" id="productosDevolucionSearch" placeholder="Buscar productos..." 
               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown mb-3">
    </div>`;

        container.innerHTML = searchHTML + '<div id="productosDevolucionList"></div>';

        const productosList = document.getElementById('productosDevolucionList');
        if (!productosList) return;

        // Helpers
        const isSelected = (idx) => this.transactionData.productosADevolver.some(obj => obj.idx === idx);
        const getCantidad = (idx, max) => {
            const found = this.transactionData.productosADevolver.find(obj => obj.idx === idx);
            return found ? found.cantidad : 1;
        };

        // Función para renderizar la lista filtrada
        const renderProductos = (filtro = '') => {
            const lineasFiltradas = trans.lineas.filter(linea => {
                if (!filtro) return true;
                const nombre = (linea.nombreProducto || linea.productoNombre || '').toLowerCase();
                const codigo = (linea.codigoProducto || '').toLowerCase();
                return nombre.includes(filtro.toLowerCase()) || codigo.includes(filtro.toLowerCase());
            });

            if (lineasFiltradas.length === 0) {
                productosList.innerHTML = '<p class="text-gray-500 text-center">No hay productos que coincidan con la búsqueda</p>';
                return;
            }

            productosList.innerHTML = lineasFiltradas.map((linea, idx) => {
                const maxCantidad = linea.cantidad;
                const checked = isSelected(idx) ? 'checked' : '';
                const cantidad = getCantidad(idx, maxCantidad);
                const stateColor = checked ? 'green' : 'gray';

                return `
            <div class="flex items-center mb-3 p-3 border border-${stateColor}-300 rounded-lg ${checked ? 'bg-green-50' : 'bg-white'}">
                <div class="mr-3">
                    <input type="checkbox" id="prodADevolver-${idx}" ${checked} 
                           onchange="window.transactionWizard.toggleProductoADevolver(${idx})"
                           class="w-5 h-5 text-brand-brown">
                </div>
                <div class="flex-grow">
                    <label for="prodADevolver-${idx}" class="block font-medium text-gray-700">
                        ${linea.nombreProducto || linea.productoNombre || 'Producto sin nombre'}
                    </label>
                    <div class="text-sm text-gray-600">
                        ${linea.codigoProducto ? `Código: ${linea.codigoProducto} | ` : ''}
                        Precio: ${this.formatCurrency(linea.precioUnitario)} | 
                        Disponible: ${maxCantidad}
                    </div>
                </div>
                <div class="ml-4 flex items-center">
                    <label class="mr-2 text-sm text-gray-600">Cantidad:</label>
                    <input type="number"
                        min="1"
                        max="${maxCantidad}"
                        value="${cantidad}"
                        id="cantidadADevolver-${idx}"
                        class="w-16 px-2 py-1 border rounded-md ${checked ? '' : 'bg-gray-100'}"
                        ${!checked ? "disabled" : ""}
                        onchange="window.transactionWizard.setCantidadADevolver(${idx}, this.value)">
                </div>
            </div>
            `;
            }).join('');
        };

        // Inicializar con todos los productos
        renderProductos();

        // Configurar el buscador
        const searchInput = document.getElementById('productosDevolucionSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => renderProductos(e.target.value));
        }
    }

// Actualiza la selección y pone cantidad=1 por defecto
    toggleProductoADevolver(idx) {
        const trans = this.transactionData.transaccionOrigen;
        if (!trans) return;
        let arr = this.transactionData.productosADevolver;
        const foundIdx = arr.findIndex(obj => obj.idx === idx);
        if (foundIdx > -1) {
            // Quitar producto
            arr.splice(foundIdx, 1);
        } else {
            // Agregar producto con cantidad 1 por defecto
            arr.push({ idx, cantidad: 1 });
        }
        this.transactionData.productosADevolver = arr;
        this.updateWizardUI();
    }

// Al modificar cantidad, solo si el producto está seleccionado
    setCantidadADevolver(idx, val) {
        let arr = this.transactionData.productosADevolver;
        const found = arr.find(obj => obj.idx === idx);
        const linea = this.transactionData.transaccionOrigen.lineas[idx];
        if (found && linea) {
            const maxCantidad = linea.cantidad;
            const cantidad = Math.max(1, Math.min(Number(val), maxCantidad));
            found.cantidad = cantidad;
        }
    }

    validateDevolucionStep3() {
        if (!this.transactionData.productosADevolver.length) {
            window.showToast('Selecciona al menos un producto a devolver', 'error');
            return false;
        }
        // Validación: no se puede devolver menos de 1 ni más de la cantidad original
        for (let obj of this.transactionData.productosADevolver) {
            const linea = this.transactionData.transaccionOrigen.lineas[obj.idx];
            if (obj.cantidad < 1 || obj.cantidad > linea.cantidad) {
                window.showToast(`Cantidad inválida para ${linea.nombreProducto || linea.productoNombre}`, 'error');
                return false;
            }
        }
        return true;
    }
    getDevolucionStep4Content() {
        const t = this.transactionData.transaccionOrigen;
        const seleccionados = Array.isArray(this.transactionData.productosADevolver) && t
            ? this.transactionData.productosADevolver.map(obj => {
                const linea = t.lineas[obj.idx];
                return linea ? { ...linea, cantidad: obj.cantidad } : null;
            }).filter(Boolean)
            : [];

        const origenStr = t
            ? `#${t.id} - ${t.contraparteNombre || t.nombre || t.proveedorNombre || t.clienteNombre || "Sin nombre"}`
            : '<span style="color:red">Debes seleccionar la transacción origen</span>';

        return `
        <div>
            <h4 class="font-bold mb-2">Resumen de la Devolución</h4>
            <p><strong>Tipo:</strong> ${this.formatTransactionType(this.transactionData.tipoTransaccion)}</p>
            <p><strong>Transacción Origen:</strong> ${origenStr}</p>
            <div class="mt-2">
                <h5 class="font-semibold">Productos a Devolver:</h5>
                ${seleccionados.length ?
            seleccionados.map(l => `<div>${l.nombreProducto || l.productoNombre} (x${l.cantidad})</div>`).join('') :
            '<span style="color:red">No hay productos seleccionados</span>'
        }
            </div>
            <div class="mt-3">
                <label class="block text-gray-700 text-sm font-bold mb-2">Observaciones:</label>
                <textarea id="devolucionObservaciones" rows="2" class="w-full border rounded px-2 py-1">${this.transactionData.observaciones || ""}</textarea>
            </div>
        </div>
    `;
    }
    async finalizeDevolucion() {
        try {
            const t = this.transactionData.transaccionOrigen;
            const observaciones = document.getElementById('devolucionObservaciones')?.value || "";

            // Genera las líneas asegurando productoId válido y nombreProducto siempre presente
            const lineas = this.transactionData.productosADevolver.map(obj => {
                const linea = t.lineas[obj.idx];

                // ARREGLO: productoId siempre válido (>0)
                if (!linea.productoId || linea.productoId <= 0) {
                    window.showToast(`Producto inválido para devolución: ${linea.nombreProducto || linea.productoNombre || "Producto sin nombre"}`, 'error');
                    throw new Error("Producto inválido");
                }

                // ARREGLO: nombreProducto nunca vacío
                let nombreProducto = linea.nombreProducto || linea.productoNombre || linea.nombre || "";
                if (!nombreProducto.trim()) {
                    window.showToast('La línea de producto no tiene nombre válido.', 'error');
                    throw new Error("Producto sin nombre");
                }

                return {
                    productoId: linea.productoId,
                    productoNombre: nombreProducto,
                    cantidad: obj.cantidad,
                    precioUnitario: linea.precioUnitario,
                    subtotalLinea: obj.cantidad * linea.precioUnitario,
                    // Puedes agregar otros campos si el backend lo espera
                };
            });

            // Determina correctamente la contraparte
            let contraparteId, tipoContraparte, contraparteNombre;
            if (t.tipo === "COMPRA" || t.tipo === "DEVOLUCION_COMPRA") {
                tipoContraparte = "SUPLIDOR";
                contraparteId = t.proveedor?.id || t.contraparteId;
                contraparteNombre = t.proveedor?.nombre || t.contraparteNombre || "Sin nombre";
            } else if (t.tipo === "VENTA" || t.tipo === "DEVOLUCION_VENTA") {
                tipoContraparte = "CLIENTE";
                contraparteId = t.cliente?.id || t.contraparteId;
                if (t.cliente?.nombre && t.cliente?.apellido) {
                    contraparteNombre = `${t.cliente.nombre} ${t.cliente.apellido}`;
                } else {
                    contraparteNombre = t.cliente?.nombre || t.contraparteNombre || "Consumidor Final";
                }
            } else {
                window.showToast('Tipo de transacción origen desconocido.', 'error');
                throw new Error("Tipo de transacción origen desconocido");
            }

            if (!contraparteId) {
                window.showToast('No se encontró el ID de la contraparte en la transacción origen.', 'error');
                return;
            }
            if (!contraparteNombre) {
                window.showToast('No se encontró el nombre de la contraparte en la transacción origen.', 'error');
                return;
            }

            const payload = {
                tipo: this.transactionData.tipoTransaccion,
                transaccionOrigenId: t.id,
                contraparteId,
                tipoContraparte,
                contraparteNombre,
                observaciones,
                lineas,
            };

            console.log("Payload de devolución FINAL:", payload);

            await this.transaccionService.createDevolucion(payload);
            window.showToast('Devolución procesada exitosamente.', 'success');
            this.close();
            if (window.transaccionesManager) window.transaccionesManager.loadTransactions();
        } catch (error) {
            window.showToast('Error al procesar la devolución: ' + (error.message || error), 'error');
        }
    }
    getVentaStep4Content() {
        const clienteInfo = this.transactionData.cliente ?
            `${this.transactionData.cliente.nombre} ${this.transactionData.cliente.apellido} (${this.transactionData.cliente.cedula})` :
            'Consumidor Final';

        // Determinar si hay un plan de pagos en cuotas
        let planPagosHTML = '';
        if (this.transactionData.tipoPago === 'ENCUOTAS') {
            const montoInicial = this.transactionData.montoInicial || 0;
            const montoTotal = this.transactionData.total || 0;
            const totalCuotas = this.transactionData.cuotasFlexibles?.reduce(
                (sum, cuota) => sum + (parseFloat(cuota.monto) || 0), 0
            ) || 0;
            const saldoPendiente = montoTotal - montoInicial - totalCuotas;

            planPagosHTML = `
            <div class="mt-4 pt-4 border-t border-gray-300">
                <h4 class="font-bold text-brand-brown mb-3">Plan de Pagos</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                    <div>
                        <p><strong>Tipo de pago:</strong> En cuotas</p>
                        <p><strong>Pago inicial:</strong> ${this.formatCurrency(montoInicial)}</p>
                        <p><strong>Total a financiar:</strong> ${this.formatCurrency(montoTotal - montoInicial)}</p>
                    </div>
                    <div>
                        <p><strong>Número de cuotas:</strong> ${this.transactionData.cuotasFlexibles?.length || 0}</p>
                        <p class="${saldoPendiente <= 0 ? 'text-green-600' : 'text-yellow-600'} font-medium">
                            <strong>Saldo pendiente:</strong> ${this.formatCurrency(saldoPendiente)}
                        </p>
                    </div>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="min-w-full bg-white">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="py-2 px-3 text-left text-sm font-medium text-gray-700">Cuota</th>
                                <th class="py-2 px-3 text-left text-sm font-medium text-gray-700">Fecha</th>
                                <th class="py-2 px-3 text-right text-sm font-medium text-gray-700">Monto</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            ${this.transactionData.cuotasFlexibles?.map(cuota => `
                                <tr>
                                    <td class="py-2 px-3 text-sm">${cuota.numero}</td>
                                    <td class="py-2 px-3 text-sm">${new Date(cuota.fecha).toLocaleDateString()}</td>
                                    <td class="py-2 px-3 text-sm text-right">${this.formatCurrency(cuota.monto)}</td>
                                </tr>
                            `).join('') || ''}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        }

        return `
        <div class="space-y-4">
            <h3 class="text-lg font-semibold text-brand-brown">Confirmación de Venta</h3>
            <div class="bg-gray-50 p-4 rounded-lg space-y-2">
                <p><strong>Cliente:</strong> ${clienteInfo}</p>
                <p><strong>Método de Pago:</strong> ${this.transactionData.metodoPago}</p>
                <p><strong>Tipo de Pago:</strong> ${this.transactionData.tipoPago === 'ENCUOTAS' ? 'En cuotas' : 'Normal'}</p>
                <p><strong>Total de Productos:</strong> ${this.transactionData.lineas.length}</p>
                <p><strong>Subtotal:</strong> ${this.formatCurrency(this.transactionData.subtotal)}</p>
                <p><strong>Impuestos:</strong> ${this.formatCurrency(this.transactionData.impuestos)}</p>
                <p class="text-xl"><strong>Total a Cobrar:</strong> <span class="text-brand-brown">${this.formatCurrency(this.transactionData.total)}</span></p>
                
                ${planPagosHTML}
            </div>
            
            <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p class="text-sm text-yellow-700">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    Revisa toda la información antes de procesar la venta. Una vez confirmada, no se podrá modificar.
                </p>
            </div>
        </div>
    `;
    }



    // =============== COMPRA WIZARD METHODS ===============
    getCompraStep1Content() {
        return `
    <div class="space-y-4">
        <h3 class="text-lg font-semibold text-brand-brown">Información del Proveedor</h3>
        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-2">
            <p class="text-sm text-yellow-700">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                <strong>Debe seleccionar un suplidor o completar los datos de un nuevo proveedor para continuar.</strong>
            </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Buscar Suplidor <span class="text-red-500">*</span></label>
                <input type="text" id="compraSuplidorSearch" placeholder="Buscar por nombre o RNC..." 
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Seleccionar Suplidor <span class="text-red-500">*</span></label>
                <select id="compraSuplidorSelect" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
                    <option value="">Seleccione un suplidor</option>
                </select>
            </div>
        </div>
        <div>
            <button type="button" id="btnNuevoSuplidor" class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                <i class="fas fa-plus mr-2"></i>Nuevo Suplidor
            </button>
        </div>
        <!-- Formulario para nuevo suplidor (oculto inicialmente) -->
        <div id="compraProveedorForm" class="hidden mt-4 border p-4 rounded-lg bg-gray-50">
            <h4 class="text-md font-bold mb-2">Registrar Nuevo Suplidor</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del Proveedor <span class="text-red-500">*</span></label>
                    <input type="text" id="compraNombreProveedor" 
                           placeholder="Nombre de la empresa o persona"
                           oninput="restrictToLettersOnly(this);"
                           required
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">RNC</label>
                    <input type="text" id="compraRncProveedor"
                           placeholder="00-0000000"
                           maxlength="10"
                           oninput="restrictToNumbersOnly(this); formatCedulaRnc(this);"
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
                    <p class="text-xs text-gray-500 mt-1">Formato RNC: 00-0000000 (opcional)</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input type="tel" id="compraTelefonoProveedor"
                           placeholder="809-000-0000"
                           maxlength="12"
                           oninput="restrictToNumbersOnly(this); formatTelefono(this);"
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
                    <p class="text-xs text-gray-500 mt-1">Formato: 809-000-0000</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" id="compraEmailProveedor"
                           placeholder="proveedor@ejemplo.com"
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
                </div>
            </div>
            <div class="mt-4 flex space-x-2">
                <button type="button" id="guardarNuevoSuplidor" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Guardar Suplidor</button>
                <button type="button" id="cancelarNuevoSuplidor" class="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">Cancelar</button>
            </div>
        </div>
    </div>
    `;
    }

    async loadCompraStep1Data() {
        try {
            const suplidores = await this.transaccionService.getSuplidores();
            const select = document.getElementById('compraSuplidorSelect');
            const searchInput = document.getElementById('compraSuplidorSearch');
            const form = document.getElementById('compraProveedorForm');
            const btnNuevoSuplidor = document.getElementById('btnNuevoSuplidor');
            const guardarBtn = document.getElementById('guardarNuevoSuplidor');
            const cancelarBtn = document.getElementById('cancelarNuevoSuplidor');

            // Inicializa el select con todos los suplidores
            if (select) {
                select.innerHTML = '<option value="">Seleccione un suplidor</option>';
                suplidores.forEach(suplidor => {
                    select.innerHTML += `<option value="${suplidor.id}">${suplidor.nombre} (${suplidor.rnc || 'Sin RNC'})</option>`;
                });
            }

            // Filtro dinámico por input
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    const searchTerm = e.target.value.toLowerCase();
                    const filtered = suplidores.filter(suplidor =>
                        (suplidor.nombre && suplidor.nombre.toLowerCase().includes(searchTerm)) ||
                        (suplidor.rnc && suplidor.rnc.toLowerCase().includes(searchTerm)) ||
                        (suplidor.cedula && suplidor.cedula.toLowerCase().includes(searchTerm))
                    );
                    select.innerHTML = '<option value="">Seleccione un suplidor</option>';
                    filtered.forEach(suplidor => {
                        select.innerHTML += `<option value="${suplidor.id}">${suplidor.nombre} (${suplidor.rnc || 'Sin RNC'})</option>`;
                    });
                });
            }

            // Mostrar/ocultar formulario de nuevo suplidor
            if (btnNuevoSuplidor && form) {
                btnNuevoSuplidor.onclick = () => form.classList.toggle('hidden');
            }
            if (cancelarBtn && form) {
                cancelarBtn.onclick = () => form.classList.add('hidden');
            }

            // Guardar el nuevo suplidor
            if (guardarBtn && select && form) {
                guardarBtn.onclick = async () => {
                    const nombre = document.getElementById('compraNombreProveedor').value.trim();
                    const rnc = document.getElementById('compraRncProveedor').value.trim();
                    const telefono = document.getElementById('compraTelefonoProveedor').value.trim();
                    const email = document.getElementById('compraEmailProveedor').value.trim();

                    // Validaciones
                    if (!nombre) {
                        window.showToast('El nombre del suplidor es obligatorio.', 'error');
                        return;
                    }

                    if (rnc && !validateRNC(rnc)) {
                        window.showToast('El RNC debe tener el formato correcto: 00-0000000', 'error');
                        document.getElementById('compraRncProveedor').focus();
                        return;
                    }

                    if (telefono && !validateTelefono(telefono)) {
                        window.showToast('El teléfono debe tener el formato correcto: 809-000-0000', 'error');
                        document.getElementById('compraTelefonoProveedor').focus();
                        return;
                    }

                    if (email && !validateEmail(email)) {
                        window.showToast('El email debe tener un formato válido', 'error');
                        document.getElementById('compraEmailProveedor').focus();
                        return;
                    }

                    try {
                        const nuevoSuplidor = await this.transaccionService.createSuplidor({
                            nombre,
                            rnc: rnc || null,
                            telefono: telefono || null,
                            email: email || null,
                            pais: 'República Dominicana', // Valor por defecto
                            ciudad: 'Santo Domingo', // Valor por defecto
                            direccion: 'N/A' // Valor por defecto
                        });
                        window.showToast('Suplidor creado exitosamente.', 'success');

                        const option = document.createElement('option');
                        option.value = nuevoSuplidor.id;
                        option.textContent = `${nuevoSuplidor.nombre} (${nuevoSuplidor.rnc || 'Sin RNC'})`;
                        select.appendChild(option);
                        select.value = nuevoSuplidor.id;

                        this.transactionData.proveedor = nuevoSuplidor;
                        form.classList.add('hidden');

                        // Limpiar formulario
                        document.getElementById('compraNombreProveedor').value = '';
                        document.getElementById('compraRncProveedor').value = '';
                        document.getElementById('compraTelefonoProveedor').value = '';
                        document.getElementById('compraEmailProveedor').value = '';
                    } catch (err) {
                        window.showToast('Error al crear suplidor: ' + (err.message || err), 'error');
                    }
                };
            }
        } catch (error) {
            console.error('Error loading suppliers:', error);
            window.showToast('Error al cargar suplidores.', 'error');
        }
    }

    validateCompraStep1() {
        const suplidorSelect = document.getElementById('compraSuplidorSelect');
        const nombreInput = document.getElementById('compraNombreProveedor');

        const suplidorSeleccionado = suplidorSelect && suplidorSelect.value && suplidorSelect.value !== '';
        const nombreProveedorIngresado = nombreInput && nombreInput.value && nombreInput.value.trim() !== '';

        if (!suplidorSeleccionado && !nombreProveedorIngresado) {
            window.showToast('Debe seleccionar un suplidor o ingresar los datos de un nuevo proveedor', 'error');
            return false;
        }

        if (suplidorSeleccionado) {
            // Si se seleccionó un suplidor existente, obtener sus datos completos
            const selectedOption = suplidorSelect.options[suplidorSelect.selectedIndex];
            const suplidorText = selectedOption.text;
            const suplidorId = suplidorSelect.value;

            // Extraer información del texto del option
            const nombreMatch = suplidorText.match(/^(.+?)\s*\(/);
            const rncMatch = suplidorText.match(/\((.+?)\)/);

            this.transactionData.proveedor = {
                id: suplidorId,
                nombre: nombreMatch ? nombreMatch[1].trim() : suplidorText,
                rnc: rncMatch && rncMatch[1] !== 'Sin RNC' ? rncMatch[1] : '',
                telefono: '',
                email: ''
            };
        } else if (nombreProveedorIngresado) {
            const nombre = nombreInput.value.trim();
            const rncInput = document.getElementById('compraRncProveedor');
            const telefonoInput = document.getElementById('compraTelefonoProveedor');
            const emailInput = document.getElementById('compraEmailProveedor');

            // Validaciones para nuevo proveedor
            if (rncInput.value && !validateRNC(rncInput.value)) {
                window.showToast('El RNC debe tener el formato correcto: 00-0000000', 'error');
                rncInput.focus();
                return false;
            }

            if (telefonoInput.value && !validateTelefono(telefonoInput.value)) {
                window.showToast('El teléfono debe tener el formato correcto: 809-000-0000', 'error');
                telefonoInput.focus();
                return false;
            }

            if (emailInput.value && !validateEmail(emailInput.value)) {
                window.showToast('El email debe tener un formato válido', 'error');
                emailInput.focus();
                return false;
            }

            this.transactionData.proveedor = {
                nombre: nombre,
                rnc: rncInput?.value || '',
                telefono: telefonoInput?.value || '',
                email: emailInput?.value || ''
            };
        }

        console.log('=== DEBUG: Proveedor data saved ===');
        console.log('Proveedor completo:', this.transactionData.proveedor);
        console.log('Nombre:', this.transactionData.proveedor?.nombre);
        console.log('ID:', this.transactionData.proveedor?.id);

        return true;
    }
    getCompraStep2Content() {
        return `
        <div class="space-y-4">
            <h3 class="text-lg font-semibold text-brand-brown">Productos a Comprar</h3>
            <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <p class="text-sm text-blue-700">
                    <i class="fas fa-info-circle mr-2"></i>
                    Registra los productos que vas a comprar. Estos se agregarán al inventario.
                </p>
            </div>
            
            <!-- BUSCADOR DE PRODUCTOS EXISTENTES -->
            <div class="border border-gray-200 rounded-lg p-4 mb-2">
                <h4 class="font-semibold text-brand-brown mb-2">Agregar producto existente</h4>
                <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Buscar Producto</label>
                        <input type="text" id="compraBuscarProductoExistente" placeholder="Nombre o código..."
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Producto</label>
                        <select id="compraProductoExistenteSelect"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
                            <option value="">Seleccionar producto</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                        <input type="number" id="compraCantidadExistente" min="1" value="1"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">&nbsp;</label>
                        <button type="button" id="btnAgregarProductoExistente"
                            class="w-full bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-light-brown">
                            <i class="fas fa-plus mr-2"></i>Agregar
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- BOTÓN PARA FORMULARIO DE NUEVO PRODUCTO -->
            <div class="mb-2">
                <button type="button" id="btnToggleNuevoProducto"
                    class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                    <i class="fas fa-plus mr-2"></i>Registrar nuevo producto
                </button>
            </div>
            
            <!-- FORMULARIO PARA NUEVO PRODUCTO (OCULTO INICIALMENTE) -->
            <div id="compraProductsForm" class="space-y-4 border border-gray-200 rounded-lg p-4 hidden">
                <h4 class="font-semibold text-brand-brown mb-2">Registrar producto nuevo</h4>
                <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto *</label>
                        <input type="text" id="compraNombreProducto" required
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Producto *</label>
                        <select id="compraTipoProducto" required
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
                            <option value="MUEBLE">Mueble</option>
                            <option value="MESA">Mesa</option>
                            <option value="OTOMAN">Otoman</option>
                            <option value="SILLA">Silla</option>
                            <option value="OTRO">Otro</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Cantidad *</label>
                        <input type="number" id="compraCantidad" min="1" value="1" required
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Precio Unitario *</label>
                        <input type="number" id="compraPrecioUnitario" step="0.01" min="0" required
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">&nbsp;</label>
                        <button type="button" onclick="addCompraProduct()" 
                                class="w-full bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-light-brown">
                            <i class="fas fa-plus mr-2"></i>Agregar
                        </button>
                    </div>
                </div>
            </div>
            
            <div id="compraProductsList" class="space-y-2">
                <!-- Selected products will appear here -->
            </div>
            
            <div class="bg-gray-50 p-4 rounded-lg">
                <div class="flex justify-between items-center text-lg">
                    <span class="font-bold">Total de Compra:</span>
                    <span id="compraTotal" class="font-bold text-brand-brown">${this.formatCurrency(0)}</span>
                </div>
            </div>
        </div>
    `;
    }
    async loadCompraStep2Data() {
        // Inicializa productos existentes
        if (!this._productosParaCompra) {
            this._productosParaCompra = await this.transaccionService.getProductosParaVenta();
        }
        const productos = this._productosParaCompra || [];
        const select = document.getElementById('compraProductoExistenteSelect');
        const searchInput = document.getElementById('compraBuscarProductoExistente');
        const cantidadInput = document.getElementById('compraCantidadExistente');
        const btnAgregar = document.getElementById('btnAgregarProductoExistente');
        const btnToggleNuevo = document.getElementById('btnToggleNuevoProducto');
        const formNuevo = document.getElementById('compraProductsForm');

        // Inicializa el select con todos los productos
        if (select) {
            select.innerHTML = '<option value="">Seleccionar producto</option>';
            productos.forEach(producto => {
                select.innerHTML += `<option value="${producto.id}">${producto.nombre} - ${this.formatCurrency(producto.precioCompra)} (Stock: ${producto.cantidadDisponible})</option>`;
            });
        }

        // Filtro dinámico por input
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const filtered = productos.filter(producto =>
                    producto.nombre.toLowerCase().includes(searchTerm) ||
                    producto.codigo.toLowerCase().includes(searchTerm)
                );
                select.innerHTML = '<option value="">Seleccionar producto</option>';
                filtered.forEach(producto => {
                    select.innerHTML += `<option value="${producto.id}">${producto.nombre} - ${this.formatCurrency(producto.precioCompra)} (Stock: ${producto.cantidadDisponible})</option>`;
                });
            });
        }

        // Toggle formulario para nuevo producto
        if (btnToggleNuevo && formNuevo) {
            btnToggleNuevo.onclick = () => formNuevo.classList.toggle('hidden');
        }

        // Evento para agregar producto EXISTENTE
        if (btnAgregar) {
            btnAgregar.onclick = () => {
                const id = parseInt(select.value);
                const cantidad = parseInt(cantidadInput.value);
                if (!id || !cantidad || cantidad <= 0) {
                    window.showToast('Selecciona un producto y cantidad válida.', 'error');
                    return;
                }
                const producto = productos.find(p => p.id === id);
                if (!producto) {
                    window.showToast('Producto no encontrado.', 'error');
                    return;
                }
                // Agrega a las líneas (puedes adaptar la lógica según tu modelo)
                this.transactionData.lineas.push({
                    productoId: producto.id,
                    nombreProducto: producto.nombre,
                    cantidad: cantidad,
                    precioUnitario: producto.precioCompra,
                    subtotalLinea: producto.precioCompra * cantidad,
                    categoria: producto.categoria,
                });
                cantidadInput.value = 1;
                select.value = '';
                this.updateCompraProductsList();
                this.updateCompraTotals();
                window.showToast('Producto agregado exitosamente.', 'success');
            };
        }

        // Inicializa totales
        this.updateCompraTotals();
    }
    addCompraProduct() {
        const nombre = document.getElementById('compraNombreProducto')?.value;
        const cantidad = parseInt(document.getElementById('compraCantidad')?.value);
        const precio = parseFloat(document.getElementById('compraPrecioUnitario')?.value);
        const tipo = document.getElementById('compraTipoProducto')?.value || "MUEBLE";

        if (!nombre || !nombre.trim()) {
            window.showToast('El nombre del producto es requerido.', 'error');
            return;
        }
        if (!cantidad || cantidad <= 0) {
            window.showToast('La cantidad debe ser mayor a 0.', 'error');
            return;
        }
        if (!precio || precio <= 0) {
            window.showToast('El precio debe ser mayor a 0.', 'error');
            return;
        }

        const subtotal = cantidad * precio;
        const lineaCompra = {
            nombreProducto: nombre.trim(),
            cantidad: cantidad,
            precioUnitario: precio,
            subtotalLinea: subtotal,
            tipo: tipo // <<--- ¡GUARDA EL TIPO!
        };

        this.transactionData.lineas.push(lineaCompra);

        // Clear form
        document.getElementById('compraNombreProducto').value = '';
        document.getElementById('compraCantidad').value = '1';
        document.getElementById('compraPrecioUnitario').value = '';
        document.getElementById('compraTipoProducto').value = 'MUEBLE';

        this.updateCompraProductsList();
        this.updateCompraTotals();
        window.showToast('Producto agregado exitosamente.', 'success');
    }

    updateCompraProductsList() {
        const container = document.getElementById('compraProductsList');
        if (!container) return;

        container.innerHTML = this.transactionData.lineas.map((linea, index) => `
            <div class="grid grid-cols-6 gap-4 items-center bg-white p-3 border border-gray-200 rounded-lg">
                <div class="col-span-2 font-medium">${linea.nombreProducto}</div>
                <div>
                    <label class="text-sm">Cant:</label>
                    <input type="number" value="${linea.cantidad}" onchange="window.transactionWizard.updateCompraProduct(${index}, 'cantidad', this.value)" class="w-full p-1 border rounded">
                </div>
                <div>
                    <label class="text-sm">Precio:</label>
                    <input type="number" value="${linea.precioUnitario}" onchange="window.transactionWizard.updateCompraProduct(${index}, 'precioUnitario', this.value)" class="w-full p-1 border rounded">
                </div>
                <div class="font-bold text-right">${this.formatCurrency(linea.subtotalLinea)}</div>
                <div>
                    <!-- Botón eliminar removido -->
                </div>
            </div>
        `).join('');
    }

    removeCompraProduct(index) {
        this.transactionData.lineas.splice(index, 1);
        this.updateCompraProductsList();
        this.updateCompraTotals();
    }

    updateCompraProduct(index, field, value) {
        const linea = this.transactionData.lineas[index];
        if (linea) {
            if (field === 'cantidad') {
                linea.cantidad = parseInt(value) || 0;
            } else if (field === 'precioUnitario') {
                linea.precioUnitario = parseFloat(value) || 0;
            }
            linea.subtotalLinea = linea.cantidad * linea.precioUnitario;
            this.updateCompraProductsList();
            this.updateCompraTotals();
        }
    }

    updateCompraTotals() {
        const total = this.transactionData.lineas.reduce((sum, linea) => sum + linea.subtotalLinea, 0);
        this.transactionData.subtotal = total;
        this.transactionData.impuestos = 0; // No taxes on purchases for this simple case
        this.transactionData.total = total;

        const totalElement = document.getElementById('compraTotal');
        if (totalElement) {
            totalElement.textContent = this.formatCurrency(total);
        }
    }

    validateCompraStep2() {
        if (this.transactionData.lineas.length === 0) {
            window.showToast('Debe agregar al menos un producto a la compra.', 'error');
            return false;
        }
        return true;
    }

    getCompraStep3Content() {
        return `
            <div class="space-y-4">
                <h3 class="text-lg font-semibold text-brand-brown">Confirmación de Compra</h3>
                <div class="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><strong>Proveedor:</strong> ${this.transactionData.proveedor?.nombre}</p>
                    <p><strong>RNC:</strong> ${this.transactionData.proveedor?.rnc || 'N/A'}</p>
                    <p><strong>Total de Productos:</strong> ${this.transactionData.lineas.length}</p>
                    <p class="text-xl"><strong>Total a Pagar:</strong> <span class="text-brand-brown">${this.formatCurrency(this.transactionData.total)}</span></p>
                </div>
                
                <div class="space-y-2">
                    <h4 class="font-medium">Productos:</h4>
                    ${this.transactionData.lineas.map(linea => `
                        <div class="flex justify-between items-center bg-white p-2 border border-gray-200 rounded">
                            <span>${linea.nombreProducto} (x${linea.cantidad})</span>
                            <span class="font-medium">${this.formatCurrency(linea.subtotalLinea)}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <p class="text-sm text-yellow-700">
                        <i class="fas fa-exclamation-triangle mr-2"></i>
                        Revisa toda la información antes de procesar la compra. Los productos se agregarán al inventario.
                    </p>
                </div>
            </div>
        `;
    }
    // Agrega esta función dentro de la clase TransactionWizard
    getStateColor(estado) {
        const stateColors = {
            'COMPLETADA': 'green',
            'PENDIENTE': 'yellow',
            'CANCELADA': 'red',
            'PROCESANDO': 'blue',
            'FINALIZADA': 'green',
            'ACTIVA': 'green',
            'INACTIVA': 'gray'
        };
        return stateColors[estado] || 'gray';
    }
}

function cedulaToLong(cedula) {
    if (!cedula) return null;
    // Quita cualquier caracter que no sea dígito
    const soloNumeros = cedula.replace(/\D/g, '');
    // Si está vacío, regresa null
    if (!soloNumeros) return null;
    return Number(soloNumeros);
}

// Funciones de validación y formato
function formatCedulaRnc(input) {
    let digits = input.value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 9) {
        // Formato RNC: XX-XXXXXXX
        if (digits.length > 2) {
            input.value = digits.slice(0, 2) + '-' + digits.slice(2);
        } else {
            input.value = digits;
        }
        return;
    }
    // Formato Cédula: XXX-XXXXXXX-X
    let part1 = digits.slice(0, 3);
    let part2 = digits.slice(3, 10);
    let part3 = digits.slice(10, 11);
    let formatted = part1;
    if (part2) formatted += '-' + part2;
    if (part3) formatted += '-' + part3;
    input.value = formatted;
}

function formatTelefono(input) {
    let digits = input.value.replace(/\D/g, '').slice(0, 10);
    if (digits.length >= 10) {
        input.value = digits.slice(0, 3) + '-' + digits.slice(3, 6) + '-' + digits.slice(6);
    } else if (digits.length >= 6) {
        input.value = digits.slice(0, 3) + '-' + digits.slice(3);
    } else {
        input.value = digits;
    }
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateCedula(cedula) {
    const digits = cedula.replace(/\D/g, '');
    return digits.length === 11;
}

function validateRNC(rnc) {
    const digits = rnc.replace(/\D/g, '');
    return digits.length === 9;
}

function validateTelefono(telefono) {
    const digits = telefono.replace(/\D/g, '');
    return digits.length === 10;
}

function restrictToLettersOnly(input) {
    input.value = input.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
}

function restrictToNumbersOnly(input) {
    input.value = input.value.replace(/[^0-9-]/g, '');
}

// Make wizard globally accessible for HTML onclicks
window.transactionWizard = new TransactionWizard();
window.openTransactionWizard = (type) => window.transactionWizard.open(type);
window.closeTransactionWizard = () => window.transactionWizard.close();
window.wizardNextStep = () => window.transactionWizard.nextStep();
window.wizardPrevStep = () => window.transactionWizard.prevStep();
window.addCompraProduct = () => window.transactionWizard.addCompraProduct();
window.removeCompraProduct = (index) => window.transactionWizard.removeCompraProduct(index);
window.updateCompraProduct = (index, field, value) => window.transactionWizard.updateCompraProduct(index, field, value);
// Para devoluciones
window.selectTransaccionOrigen = (id) => window.transactionWizard.selectTransaccionOrigen(id);
window.toggleProductoADevolver = (idx) => window.transactionWizard.toggleProductoADevolver(idx);
// Agrega la función global para el input de cantidad
window.setCantidadADevolver = (idx, val) => window.transactionWizard.setCantidadADevolver(idx, val);