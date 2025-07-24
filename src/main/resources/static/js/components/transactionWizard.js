// Transaction Creation Wizard Component
class TransactionWizard {
    constructor(transaccionService) {
        this.transaccionService = transaccionService;
        this.currentStep = 1;
        this.totalSteps = 4;
        this.wizardData = {};
        this.isOpen = false;
        
        this.stepTitles = {
            1: 'Tipo de Transacción',
            2: 'Información General',
            3: 'Productos',
            4: 'Confirmación'
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Close wizard on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }
    
    open(transactionType = null) {
        const wizard = document.getElementById('transactionWizard');
        if (!wizard) return;
        
        this.isOpen = true;
        this.currentStep = 1;
        this.wizardData = transactionType ? { type: transactionType } : {};
        
        wizard.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevent background scroll
        
        this.updateStepIndicators();
        this.renderCurrentStep();
    }
    
    close() {
        const wizard = document.getElementById('transactionWizard');
        if (!wizard) return;
        
        this.isOpen = false;
        wizard.classList.add('hidden');
        document.body.style.overflow = ''; // Restore scroll
        
        // Reset wizard state
        this.currentStep = 1;
        this.wizardData = {};
    }
    
    nextStep() {
        if (this.validateCurrentStep()) {
            if (this.currentStep < this.totalSteps) {
                this.currentStep++;
                this.updateStepIndicators();
                this.renderCurrentStep();
            } else {
                this.createTransaction();
            }
        }
    }
    
    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepIndicators();
            this.renderCurrentStep();
        }
    }
    
    updateStepIndicators() {
        const steps = document.querySelectorAll('.wizard-step');
        steps.forEach((step, index) => {
            const stepNumber = index + 1;
            if (stepNumber <= this.currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
        
        // Update navigation buttons
        const prevBtn = document.getElementById('wizardPrevBtn');
        const nextBtn = document.getElementById('wizardNextBtn');
        const subtitle = document.getElementById('wizardSubtitle');
        
        if (prevBtn) {
            prevBtn.classList.toggle('hidden', this.currentStep === 1);
        }
        
        if (nextBtn) {
            if (this.currentStep === this.totalSteps) {
                nextBtn.innerHTML = '<i class="fas fa-check mr-1"></i>Crear Transacción';
            } else {
                nextBtn.innerHTML = 'Siguiente <i class="fas fa-arrow-right ml-1"></i>';
            }
        }
        
        if (subtitle) {
            subtitle.textContent = this.stepTitles[this.currentStep] || 'Paso';
        }
    }
    
    renderCurrentStep() {
        const container = document.getElementById('wizardContent');
        if (!container) return;
        
        switch (this.currentStep) {
            case 1:
                this.renderTypeSelection(container);
                break;
            case 2:
                this.renderDetailsForm(container);
                break;
            case 3:
                this.renderProductsForm(container);
                break;
            case 4:
                this.renderConfirmation(container);
                break;
        }
    }
    
    renderTypeSelection(container) {
        const types = [
            {
                id: 'COMPRA',
                name: 'Compra',
                description: 'Registrar una nueva compra a proveedor',
                icon: 'fas fa-shopping-cart',
                color: 'green'
            },
            {
                id: 'VENTA',
                name: 'Venta',
                description: 'Registrar una nueva venta a cliente',
                icon: 'fas fa-cash-register',
                color: 'yellow'
            },
            {
                id: 'DEVOLUCION_COMPRA',
                name: 'Devolución de Compra',
                description: 'Devolver productos a proveedor',
                icon: 'fas fa-undo',
                color: 'red'
            },
            {
                id: 'DEVOLUCION_VENTA',
                name: 'Devolución de Venta',
                description: 'Recibir productos devueltos por cliente',
                icon: 'fas fa-undo',
                color: 'red'
            }
        ];
        
        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${types.map(type => `
                    <div class="transaction-type-option border-2 rounded-lg p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${this.wizardData.type === type.id ? `border-${type.color}-500 bg-${type.color}-50` : 'border-gray-200 hover:border-gray-300'}" 
                         onclick="transactionWizard.selectType('${type.id}')">
                        <div class="flex items-center mb-4">
                            <div class="p-3 rounded-lg bg-${type.color}-100 mr-4">
                                <i class="${type.icon} text-2xl text-${type.color}-600"></i>
                            </div>
                            <div>
                                <h4 class="text-lg font-semibold text-gray-800">${type.name}</h4>
                                ${this.wizardData.type === type.id ? '<i class="fas fa-check-circle text-' + type.color + '-600 ml-2"></i>' : ''}
                            </div>
                        </div>
                        <p class="text-sm text-gray-600">${type.description}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    selectType(type) {
        this.wizardData.type = type;
        
        // Update visual selection
        const options = document.querySelectorAll('.transaction-type-option');
        options.forEach(option => {
            option.classList.remove('border-green-500', 'bg-green-50', 'border-yellow-500', 'bg-yellow-50', 'border-red-500', 'bg-red-50');
            option.classList.add('border-gray-200');
        });
        
        const selectedOption = document.querySelector(`[onclick="transactionWizard.selectType('${type}')"]`);
        if (selectedOption) {
            const colorMap = {
                'COMPRA': 'green',
                'VENTA': 'yellow',
                'DEVOLUCION_COMPRA': 'red',
                'DEVOLUCION_VENTA': 'red'
            };
            const color = colorMap[type];
            selectedOption.classList.remove('border-gray-200');
            selectedOption.classList.add(`border-${color}-500`, `bg-${color}-50`);
        }
    }
    
    renderDetailsForm(container) {
        const isReturn = this.wizardData.type?.includes('DEVOLUCION');
        const isClientTransaction = this.wizardData.type?.includes('VENTA');
        
        container.innerHTML = `
            <div class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            ${isClientTransaction ? 'Cliente' : 'Proveedor'} *
                        </label>
                        <select id="contraparteSelect" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
                            <option value="">Seleccionar ${isClientTransaction ? 'cliente' : 'proveedor'}</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Fecha *</label>
                        <input type="date" id="fechaTransaccion" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                </div>
                
                ${isReturn ? `
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Transacción Original *</label>
                        <select id="transaccionOrigenSelect" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
                            <option value="">Seleccionar transacción original</option>
                        </select>
                    </div>
                ` : ''}
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Condiciones de Pago</label>
                        <input type="text" id="condicionesPago" placeholder="Ej: Contado, 30 días" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Método de Pago</label>
                        <select id="metodoPago" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
                            <option value="">Seleccionar método</option>
                            <option value="EFECTIVO">Efectivo</option>
                            <option value="TARJETA">Tarjeta</option>
                            <option value="TRANSFERENCIA">Transferencia</option>
                            <option value="CHEQUE">Cheque</option>
                            <option value="CREDITO">Crédito</option>
                        </select>
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
                    <textarea id="observaciones" rows="3" placeholder="Observaciones adicionales..." class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown"></textarea>
                </div>
            </div>
        `;
        
        this.loadCounterparts(isClientTransaction);
        if (isReturn) {
            this.loadOriginalTransactions();
        }
    }
    
    async loadCounterparts(isClient) {
        try {
            const select = document.getElementById('contraparteSelect');
            if (!select) return;
            
            // Simulate loading counterparts - replace with actual API calls
            const counterparts = isClient ? [
                { id: 1, nombre: 'Juan Pérez' },
                { id: 2, nombre: 'María García' },
                { id: 3, nombre: 'Pedro López' }
            ] : [
                { id: 1, nombre: 'Muebles SA' },
                { id: 2, nombre: 'Decoraciones El Arte' },
                { id: 3, nombre: 'Madera Premium' }
            ];
            
            select.innerHTML = `
                <option value="">Seleccionar ${isClient ? 'cliente' : 'proveedor'}</option>
                ${counterparts.map(cp => `<option value="${cp.id}">${cp.nombre}</option>`).join('')}
            `;
        } catch (error) {
            console.error('Error loading counterparts:', error);
            this.showToast('Error al cargar ' + (isClient ? 'clientes' : 'proveedores'), 'error');
        }
    }
    
    async loadOriginalTransactions() {
        try {
            const select = document.getElementById('transaccionOrigenSelect');
            if (!select) return;
            
            // Load original transactions based on type
            const transactions = await this.transaccionService.obtenerTransacciones();
            const relevantTransactions = transactions.filter(t => {
                if (this.wizardData.type === 'DEVOLUCION_COMPRA') {
                    return t.tipo === 'COMPRA' && ['CONFIRMADA', 'RECIBIDA', 'PAGADA'].includes(t.estado);
                } else if (this.wizardData.type === 'DEVOLUCION_VENTA') {
                    return t.tipo === 'VENTA' && ['CONFIRMADA', 'FACTURADA', 'ENTREGADA', 'COBRADA'].includes(t.estado);
                }
                return false;
            });
            
            select.innerHTML = `
                <option value="">Seleccionar transacción original</option>
                ${relevantTransactions.map(t => `
                    <option value="${t.id}">
                        #${t.id} - ${t.contraparteNombre} - ${this.formatCurrency(t.total)}
                    </option>
                `).join('')}
            `;
        } catch (error) {
            console.error('Error loading original transactions:', error);
            this.showToast('Error al cargar transacciones originales', 'error');
        }
    }
    
    renderProductsForm(container) {
        if (!this.wizardData.lineas) {
            this.wizardData.lineas = [];
        }
        
        container.innerHTML = `
            <div class="space-y-6">
                <div class="flex items-center justify-between">
                    <h4 class="text-lg font-semibold text-gray-800">Productos</h4>
                    <button type="button" onclick="transactionWizard.addProductLine()" class="px-4 py-2 bg-brand-brown text-white rounded-lg hover:bg-brand-brown-light text-sm transition-colors">
                        <i class="fas fa-plus mr-1"></i>Agregar Producto
                    </button>
                </div>
                
                <div id="productLines" class="space-y-4">
                    <!-- Product lines will be rendered here -->
                </div>
                
                <div class="bg-gray-50 p-4 rounded-lg border">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-600">Subtotal:</span>
                            <span id="wizardSubtotal" class="font-medium">RD$ 0.00</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">ITBIS (18%):</span>
                            <span id="wizardTax" class="font-medium">RD$ 0.00</span>
                        </div>
                        <div class="flex justify-between border-l border-gray-300 pl-4">
                            <span class="text-lg font-semibold text-gray-800">Total:</span>
                            <span id="wizardTotal" class="text-lg font-bold text-brand-brown-light">RD$ 0.00</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.renderProductLines();
        
        // Add first line if none exist
        if (this.wizardData.lineas.length === 0) {
            this.addProductLine();
        }
    }
    
    renderProductLines() {
        const container = document.getElementById('productLines');
        if (!container) return;
        
        const linesHtml = this.wizardData.lineas.map((linea, index) => `
            <div class="border border-gray-200 rounded-lg p-4 bg-white product-line" data-index="${index}">
                <div class="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Producto *</label>
                        <select onchange="transactionWizard.updateProductLine(${index}, 'producto', this.value)" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
                            <option value="">Seleccionar producto</option>
                            <option value="1" ${linea.productoId === '1' ? 'selected' : ''}>Mesa de Comedor - RD$ 15,000.00</option>
                            <option value="2" ${linea.productoId === '2' ? 'selected' : ''}>Silla Ejecutiva - RD$ 5,500.00</option>
                            <option value="3" ${linea.productoId === '3' ? 'selected' : ''}>Sofá 3 Plazas - RD$ 25,000.00</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Cantidad *</label>
                        <input type="number" min="1" value="${linea.cantidad || 1}" 
                               onchange="transactionWizard.updateProductLine(${index}, 'cantidad', this.value)"
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Precio Unit. *</label>
                        <input type="number" step="0.01" min="0" value="${linea.precioUnitario || ''}" 
                               onchange="transactionWizard.updateProductLine(${index}, 'precio', this.value)"
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Descuento %</label>
                        <input type="number" step="0.01" min="0" max="100" value="${linea.descuentoPorcentaje || ''}" 
                               onchange="transactionWizard.updateProductLine(${index}, 'descuento', this.value)"
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Subtotal</label>
                        <input type="text" value="${this.formatCurrency(linea.subtotal || 0)}" readonly 
                               class="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600">
                    </div>
                    
                    <div>
                        <button type="button" onclick="transactionWizard.removeProductLine(${index})" 
                                class="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm transition-colors">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = linesHtml;
        this.updateTotals();
    }
    
    addProductLine() {
        if (!this.wizardData.lineas) {
            this.wizardData.lineas = [];
        }
        
        this.wizardData.lineas.push({
            productoId: '',
            cantidad: 1,
            precioUnitario: 0,
            descuentoPorcentaje: 0,
            subtotal: 0
        });
        
        this.renderProductLines();
    }
    
    removeProductLine(index) {
        if (this.wizardData.lineas.length > 1) {
            this.wizardData.lineas.splice(index, 1);
            this.renderProductLines();
        } else {
            this.showToast('Debe tener al menos un producto', 'warning');
        }
    }
    
    updateProductLine(index, field, value) {
        if (!this.wizardData.lineas[index]) return;
        
        const linea = this.wizardData.lineas[index];
        
        switch (field) {
            case 'producto':
                linea.productoId = value;
                // Set default price based on product
                const productPrices = { '1': 15000, '2': 5500, '3': 25000 };
                if (productPrices[value]) {
                    linea.precioUnitario = productPrices[value];
                }
                break;
            case 'cantidad':
                linea.cantidad = parseInt(value) || 1;
                break;
            case 'precio':
                linea.precioUnitario = parseFloat(value) || 0;
                break;
            case 'descuento':
                linea.descuentoPorcentaje = parseFloat(value) || 0;
                break;
        }
        
        // Recalculate subtotal
        const precio = linea.precioUnitario || 0;
        const cantidad = linea.cantidad || 1;
        const descuento = linea.descuentoPorcentaje || 0;
        
        linea.subtotal = precio * cantidad * (1 - descuento / 100);
        
        this.renderProductLines();
    }
    
    updateTotals() {
        if (!this.wizardData.lineas) return;
        
        const subtotal = this.wizardData.lineas.reduce((sum, linea) => sum + (linea.subtotal || 0), 0);
        const tax = subtotal * 0.18; // 18% ITBIS
        const total = subtotal + tax;
        
        const subtotalElement = document.getElementById('wizardSubtotal');
        const taxElement = document.getElementById('wizardTax');
        const totalElement = document.getElementById('wizardTotal');
        
        if (subtotalElement) subtotalElement.textContent = this.formatCurrency(subtotal);
        if (taxElement) taxElement.textContent = this.formatCurrency(tax);
        if (totalElement) totalElement.textContent = this.formatCurrency(total);
        
        // Store totals in wizard data
        this.wizardData.subtotal = subtotal;
        this.wizardData.impuestos = tax;
        this.wizardData.total = total;
    }
    
    renderConfirmation(container) {
        const typeNames = {
            'COMPRA': 'Compra',
            'VENTA': 'Venta',
            'DEVOLUCION_COMPRA': 'Devolución de Compra',
            'DEVOLUCION_VENTA': 'Devolución de Venta'
        };
        
        container.innerHTML = `
            <div class="space-y-6">
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 class="text-lg font-semibold text-blue-800 mb-2">
                        <i class="fas fa-info-circle mr-2"></i>
                        Confirmar Transacción
                    </h4>
                    <p class="text-sm text-blue-600">Revisa todos los datos antes de crear la transacción</p>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-4">
                        <h5 class="font-semibold text-gray-800 border-b pb-2">Información General</h5>
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between">
                                <span class="text-gray-600">Tipo:</span>
                                <span class="font-medium">${typeNames[this.wizardData.type] || this.wizardData.type}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Fecha:</span>
                                <span class="font-medium">${this.formatDate(document.getElementById('fechaTransaccion')?.value)}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Método de Pago:</span>
                                <span class="font-medium">${document.getElementById('metodoPago')?.selectedOptions[0]?.text || 'No especificado'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="space-y-4">
                        <h5 class="font-semibold text-gray-800 border-b pb-2">Resumen Financiero</h5>
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between">
                                <span class="text-gray-600">Subtotal:</span>
                                <span class="font-medium">${this.formatCurrency(this.wizardData.subtotal || 0)}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">ITBIS (18%):</span>
                                <span class="font-medium">${this.formatCurrency(this.wizardData.impuestos || 0)}</span>
                            </div>
                            <div class="flex justify-between border-t pt-2 text-base">
                                <span class="font-bold text-gray-800">Total:</span>
                                <span class="font-bold text-brand-brown-light">${this.formatCurrency(this.wizardData.total || 0)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="space-y-4">
                    <h5 class="font-semibold text-gray-800 border-b pb-2">Productos (${this.wizardData.lineas?.length || 0})</h5>
                    <div class="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                        ${this.wizardData.lineas?.map((linea, index) => `
                            <div class="flex justify-between items-center py-2 ${index > 0 ? 'border-t border-gray-200' : ''}">
                                <div class="flex-1">
                                    <span class="font-medium">Producto ${index + 1}</span>
                                    <div class="text-sm text-gray-600">
                                        Cantidad: ${linea.cantidad} × ${this.formatCurrency(linea.precioUnitario || 0)}
                                        ${linea.descuentoPorcentaje ? ` (${linea.descuentoPorcentaje}% desc.)` : ''}
                                    </div>
                                </div>
                                <div class="font-medium">${this.formatCurrency(linea.subtotal || 0)}</div>
                            </div>
                        `).join('') || '<p class="text-gray-500 text-center py-4">No hay productos agregados</p>'}
                    </div>
                </div>
                
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div class="flex items-start">
                        <i class="fas fa-exclamation-triangle text-yellow-600 mt-1 mr-3"></i>
                        <div>
                            <h6 class="font-medium text-yellow-800">Importante</h6>
                            <p class="text-sm text-yellow-700 mt-1">
                                Una vez creada, la transacción podrá ser editada solo mientras esté en estado PENDIENTE o CONFIRMADA.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    validateCurrentStep() {
        switch (this.currentStep) {
            case 1:
                if (!this.wizardData.type) {
                    this.showToast('Debe seleccionar un tipo de transacción', 'warning');
                    return false;
                }
                return true;
                
            case 2:
                const contraparte = document.getElementById('contraparteSelect')?.value;
                const fecha = document.getElementById('fechaTransaccion')?.value;
                
                if (!contraparte) {
                    this.showToast('Debe seleccionar una contraparte', 'warning');
                    return false;
                }
                
                if (!fecha) {
                    this.showToast('Debe especificar una fecha', 'warning');
                    return false;
                }
                
                // Store form data
                this.wizardData.contraparteId = contraparte;
                this.wizardData.fecha = fecha;
                this.wizardData.condicionesPago = document.getElementById('condicionesPago')?.value;
                this.wizardData.metodoPago = document.getElementById('metodoPago')?.value;
                this.wizardData.observaciones = document.getElementById('observaciones')?.value;
                
                if (this.wizardData.type?.includes('DEVOLUCION')) {
                    const transaccionOrigen = document.getElementById('transaccionOrigenSelect')?.value;
                    if (!transaccionOrigen) {
                        this.showToast('Debe seleccionar la transacción original para la devolución', 'warning');
                        return false;
                    }
                    this.wizardData.transaccionOrigenId = transaccionOrigen;
                }
                
                return true;
                
            case 3:
                if (!this.wizardData.lineas || this.wizardData.lineas.length === 0) {
                    this.showToast('Debe agregar al menos un producto', 'warning');
                    return false;
                }
                
                // Validate all product lines
                for (let i = 0; i < this.wizardData.lineas.length; i++) {
                    const linea = this.wizardData.lineas[i];
                    if (!linea.productoId) {
                        this.showToast(`Debe seleccionar un producto en la línea ${i + 1}`, 'warning');
                        return false;
                    }
                    if (!linea.precioUnitario || linea.precioUnitario <= 0) {
                        this.showToast(`Debe especificar un precio válido en la línea ${i + 1}`, 'warning');
                        return false;
                    }
                    if (!linea.cantidad || linea.cantidad <= 0) {
                        this.showToast(`Debe especificar una cantidad válida en la línea ${i + 1}`, 'warning');
                        return false;
                    }
                }
                
                return true;
                
            case 4:
                return this.createTransaction();
        }
        
        return true;
    }
    
    async createTransaction() {
        try {
            this.showLoading();
            
            // Prepare transaction data
            const transactionData = {
                tipo: this.wizardData.type,
                contraparteId: parseInt(this.wizardData.contraparteId),
                tipoContraparte: this.wizardData.type.includes('VENTA') ? 'CLIENTE' : 'SUPLIDOR',
                contraparteNombre: document.getElementById('contraparteSelect')?.selectedOptions[0]?.text || '',
                fecha: this.wizardData.fecha,
                condicionesPago: this.wizardData.condicionesPago,
                metodoPago: this.wizardData.metodoPago,
                observaciones: this.wizardData.observaciones,
                transaccionOrigenId: this.wizardData.transaccionOrigenId ? parseInt(this.wizardData.transaccionOrigenId) : null,
                lineas: this.wizardData.lineas.map(linea => ({
                    productoId: parseInt(linea.productoId),
                    cantidad: linea.cantidad,
                    precioUnitario: linea.precioUnitario,
                    descuentoPorcentaje: linea.descuentoPorcentaje || 0
                }))
            };
            
            await this.transaccionService.crearTransaccion(transactionData);
            
            this.hideLoading();
            this.close();
            
            // Notify success and refresh parent component
            this.showToast('Transacción creada exitosamente', 'success');
            
            // Trigger refresh of parent component
            if (window.contabilidad && typeof window.contabilidad.loadTransactions === 'function') {
                await window.contabilidad.loadTransactions();
                await window.contabilidad.loadStatistics();
            }
            
            return true;
            
        } catch (error) {
            console.error('Error creating transaction:', error);
            this.hideLoading();
            this.showToast('Error al crear la transacción: ' + (error.message || 'Error desconocido'), 'error');
            return false;
        }
    }
    
    // Utility methods
    formatCurrency(amount) {
        if (!amount && amount !== 0) return 'RD$ 0.00';
        
        const number = Math.abs(amount);
        const parts = number.toFixed(2).split('.');
        const integer = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        const decimal = parts[1];
        
        return `RD$ ${integer}.${decimal}`;
    }
    
    formatDate(dateString) {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
    
    showLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('hidden');
        }
    }
    
    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }
    
    showToast(message, type = 'info') {
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            // Fallback alert
            alert(message);
        }
    }
}

// Export for global use
window.TransactionWizard = TransactionWizard;