import { makeAuthenticatedRequest } from '../services/authService.js';

class VentaWizard {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.productos = [];
        this.clientes = [];
        this.empleados = [];
        this.editingProductIndex = -1;
        this.init();
    }

    async init() {
        await this.loadClientes();
        await this.loadEmpleados();
        await this.loadProductos();
        this.setupEventListeners();
        this.setDefaultDate();
        this.updateWizardState();
    }

    async loadClientes() {
        try {
            const response = await makeAuthenticatedRequest('/api/clientes');
            if (response.ok) {
                this.clientes = await response.json();
                this.populateClienteSelect();
            }
        } catch (error) {
            console.error('Error loading clientes:', error);
        }
    }

    async loadEmpleados() {
        try {
            const response = await makeAuthenticatedRequest('/api/empleados');
            if (response.ok) {
                this.empleados = await response.json();
                this.populateEmpleadoSelect();
            }
        } catch (error) {
            console.error('Error loading empleados:', error);
        }
    }

    async loadProductos() {
        try {
            const response = await makeAuthenticatedRequest('/api/productos');
            if (response.ok) {
                this.productosDisponibles = await response.json();
                this.populateProductoSelect();
            }
        } catch (error) {
            console.error('Error loading productos:', error);
        }
    }

    populateClienteSelect() {
        const select = document.getElementById('clienteId');
        select.innerHTML = '<option value="">Seleccionar cliente...</option>';
        
        this.clientes.forEach(cliente => {
            const option = document.createElement('option');
            option.value = cliente.id;
            option.textContent = `${cliente.nombre} ${cliente.apellido} - ${cliente.cedula}`;
            select.appendChild(option);
        });
    }

    populateEmpleadoSelect() {
        const select = document.getElementById('vendedorId');
        select.innerHTML = '<option value="">Seleccionar vendedor...</option>';
        
        this.empleados.forEach(empleado => {
            const option = document.createElement('option');
            option.value = empleado.id;
            option.textContent = `${empleado.nombre} ${empleado.apellido}`;
            select.appendChild(option);
        });
    }

    populateProductoSelect() {
        const select = document.getElementById('productoSelect');
        select.innerHTML = '<option value="">Seleccionar producto...</option>';
        
        this.productosDisponibles.forEach(producto => {
            const option = document.createElement('option');
            option.value = producto.id;
            option.textContent = `${producto.nombre} - $${producto.precio}`;
            option.dataset.precio = producto.precio;
            option.dataset.nombre = producto.nombre;
            select.appendChild(option);
        });
    }

    setupEventListeners() {
        // Wizard navigation
        document.getElementById('nextBtn').addEventListener('click', () => this.nextStep());
        document.getElementById('prevBtn').addEventListener('click', () => this.prevStep());
        
        // Product modal
        document.getElementById('addProductBtn').addEventListener('click', () => this.openProductModal());
        document.getElementById('addFirstProductBtn').addEventListener('click', () => this.openProductModal());
        document.getElementById('cancelProductBtn').addEventListener('click', () => this.closeProductModal());
        document.getElementById('addProductConfirmBtn').addEventListener('click', () => this.addProduct());
        
        // Product selection
        document.getElementById('productoSelect').addEventListener('change', (e) => this.onProductSelect(e));
        
        // Modal close on outside click
        document.getElementById('productModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('productModal')) {
                this.closeProductModal();
            }
        });

        // Form submission
        document.getElementById('wizardForm').addEventListener('submit', (e) => this.handleSubmit(e));

        // Real-time calculations
        ['modalCantidad', 'modalPrecioUnitario', 'modalDescuento', 'modalImpuesto'].forEach(id => {
            document.getElementById(id).addEventListener('input', () => this.calculateModalTotal());
        });

        // Payment method change handler
        document.getElementById('metodoPago').addEventListener('change', (e) => this.handlePaymentMethodChange(e.target.value));
    }

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('fecha').value = today;
    }

    updateWizardState() {
        // Hide all steps
        for (let i = 1; i <= this.totalSteps; i++) {
            document.getElementById(`step${i}`).classList.add('hidden');
        }
        
        // Show current step
        document.getElementById(`step${this.currentStep}`).classList.remove('hidden');
        
        // Update progress indicators
        this.updateProgressIndicators();
        
        // Update navigation buttons
        this.updateNavigationButtons();
        
        // Update summary if on last step
        if (this.currentStep === 4) {
            this.updateSummary();
        }
    }

    updateProgressIndicators() {
        for (let i = 1; i <= this.totalSteps; i++) {
            const indicator = document.getElementById(`step${i}-indicator`);
            const prevLine = i > 1 ? indicator.parentElement.querySelector('.h-1') : null;
            
            if (i < this.currentStep) {
                // Completed step
                indicator.classList.remove('bg-gray-300', 'text-gray-600');
                indicator.classList.add('bg-green-600', 'text-white');
                if (prevLine) {
                    prevLine.classList.remove('bg-gray-300');
                    prevLine.classList.add('bg-green-600');
                }
            } else if (i === this.currentStep) {
                // Current step
                indicator.classList.remove('bg-gray-300', 'text-gray-600', 'bg-green-600');
                indicator.classList.add('bg-brandGold', 'text-white');
                if (prevLine) {
                    prevLine.classList.remove('bg-gray-300');
                    prevLine.classList.add('bg-brandGold');
                }
            } else {
                // Future step
                indicator.classList.remove('bg-brandGold', 'text-white', 'bg-green-600');
                indicator.classList.add('bg-gray-300', 'text-gray-600');
                if (prevLine) {
                    prevLine.classList.remove('bg-brandGold', 'bg-green-600');
                    prevLine.classList.add('bg-gray-300');
                }
            }
        }
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');
        
        // Previous button
        if (this.currentStep === 1) {
            prevBtn.classList.add('hidden');
        } else {
            prevBtn.classList.remove('hidden');
        }
        
        // Next/Submit buttons
        if (this.currentStep === this.totalSteps) {
            nextBtn.classList.add('hidden');
            submitBtn.classList.remove('hidden');
        } else {
            nextBtn.classList.remove('hidden');
            submitBtn.classList.add('hidden');
        }
    }

    nextStep() {
        if (this.validateCurrentStep()) {
            if (this.currentStep < this.totalSteps) {
                this.currentStep++;
                this.updateWizardState();
            }
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateWizardState();
        }
    }

    validateCurrentStep() {
        switch (this.currentStep) {
            case 1:
                const clienteId = document.getElementById('clienteId').value;
                const vendedorId = document.getElementById('vendedorId').value;
                if (!clienteId) {
                    alert('Por favor seleccione un cliente');
                    return false;
                }
                if (!vendedorId) {
                    alert('Por favor seleccione un vendedor');
                    return false;
                }
                return true;
                
            case 2:
                const fecha = document.getElementById('fecha').value;
                if (!fecha) {
                    alert('Por favor ingrese la fecha de venta');
                    return false;
                }
                return true;
                
            case 3:
                if (this.productos.length === 0) {
                    alert('Debe agregar al menos un producto');
                    return false;
                }
                return true;
                
            case 4:
                return true;
                
            default:
                return true;
        }
    }

    updateSummary() {
        const clienteId = document.getElementById('clienteId').value;
        const cliente = this.clientes.find(c => c.id == clienteId);
        const vendedorId = document.getElementById('vendedorId').value;
        const vendedor = this.empleados.find(e => e.id == vendedorId);
        const fecha = document.getElementById('fecha').value;
        const metodoPago = document.getElementById('metodoPago').value;
        
        document.getElementById('resumenCliente').textContent = 
            cliente ? `${cliente.nombre} ${cliente.apellido}` : 'No seleccionado';
        document.getElementById('resumenVendedor').textContent = 
            vendedor ? `${vendedor.nombre} ${vendedor.apellido}` : 'No seleccionado';
        document.getElementById('resumenFecha').textContent = 
            fecha ? new Date(fecha).toLocaleDateString() : 'No especificada';
        document.getElementById('resumenMetodoPago').textContent = 
            metodoPago || 'No especificado';
        document.getElementById('resumenCantidadProductos').textContent = 
            this.productos.length;
        
        this.updateTotals();
    }

    // Product management methods
    openProductModal() {
        this.editingProductIndex = -1;
        this.clearModal();
        document.getElementById('productModal').classList.remove('hidden');
        document.getElementById('productModal').classList.add('flex');
    }

    closeProductModal() {
        document.getElementById('productModal').classList.add('hidden');
        document.getElementById('productModal').classList.remove('flex');
        this.clearModal();
    }

    clearModal() {
        document.getElementById('productoSelect').value = '';
        document.getElementById('modalCantidad').value = '';
        document.getElementById('modalPrecioUnitario').value = '';
        document.getElementById('modalDescuento').value = '';
        document.getElementById('modalImpuesto').value = '18';
        document.getElementById('modalObservaciones').value = '';
    }

    onProductSelect(e) {
        const selectedOption = e.target.options[e.target.selectedIndex];
        if (selectedOption.value) {
            document.getElementById('modalPrecioUnitario').value = selectedOption.dataset.precio;
            this.calculateModalTotal();
        }
    }

    calculateModalTotal() {
        const cantidad = parseFloat(document.getElementById('modalCantidad').value) || 0;
        const precio = parseFloat(document.getElementById('modalPrecioUnitario').value) || 0;
        const descuento = parseFloat(document.getElementById('modalDescuento').value) || 0;
        const impuesto = parseFloat(document.getElementById('modalImpuesto').value) || 18;

        let subtotal = cantidad * precio;
        const descuentoMonto = (subtotal * descuento) / 100;
        subtotal -= descuentoMonto;
        
        const impuestoMonto = (subtotal * impuesto) / 100;
        const total = subtotal + impuestoMonto;

        this.showModalCalculation(subtotal, impuestoMonto, total);
    }

    showModalCalculation(subtotal, impuesto, total) {
        let calcElement = document.getElementById('modalCalculation');
        if (!calcElement) {
            calcElement = document.createElement('div');
            calcElement.id = 'modalCalculation';
            calcElement.className = 'mt-4 p-3 bg-gray-50 rounded-lg text-sm';
            document.querySelector('#productModal .space-y-4').appendChild(calcElement);
        }

        calcElement.innerHTML = `
            <div class="flex justify-between"><span>Subtotal:</span><span>$${subtotal.toFixed(2)}</span></div>
            <div class="flex justify-between"><span>Impuesto:</span><span>$${impuesto.toFixed(2)}</span></div>
            <div class="flex justify-between font-bold border-t pt-2"><span>Total:</span><span>$${total.toFixed(2)}</span></div>
        `;
    }

    addProduct() {
        const productoId = document.getElementById('productoSelect').value;
        const cantidad = parseInt(document.getElementById('modalCantidad').value);
        const precioUnitario = parseFloat(document.getElementById('modalPrecioUnitario').value);
        const descuento = parseFloat(document.getElementById('modalDescuento').value) || 0;
        const impuesto = parseFloat(document.getElementById('modalImpuesto').value) || 18;
        const observaciones = document.getElementById('modalObservaciones').value;

        if (!productoId || !cantidad || !precioUnitario) {
            alert('Por favor complete todos los campos obligatorios');
            return;
        }

        const producto = this.productosDisponibles.find(p => p.id == productoId);
        if (!producto) {
            alert('Producto no encontrado');
            return;
        }

        const existingIndex = this.productos.findIndex(p => p.productoId == productoId);
        if (existingIndex !== -1 && this.editingProductIndex === -1) {
            alert('Ya existe este producto en la lista. Puede editarlo desde la tabla.');
            return;
        }
        
        let subtotal = cantidad * precioUnitario;
        const descuentoMonto = (subtotal * descuento) / 100;
        subtotal -= descuentoMonto;
        
        const impuestoMonto = (subtotal * impuesto) / 100;
        const total = subtotal + impuestoMonto;

        const lineaProducto = {
            productoId: productoId,
            productoNombre: producto.nombre,
            cantidad: cantidad,
            precioUnitario: precioUnitario,
            descuentoPorcentaje: descuento,
            descuentoMonto: descuentoMonto,
            impuestoPorcentaje: impuesto,
            impuestoMonto: impuestoMonto,
            subtotal: subtotal,
            total: total,
            observaciones: observaciones
        };

        if (this.editingProductIndex !== -1) {
            this.productos[this.editingProductIndex] = lineaProducto;
        } else {
            this.productos.push(lineaProducto);
        }

        this.renderProductos();
        this.updateTotals();
        this.closeProductModal();
    }

    renderProductos() {
        const container = document.getElementById('productsList');
        const emptyState = document.getElementById('emptyProducts');

        if (this.productos.length === 0) {
            container.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }

        container.classList.remove('hidden');
        emptyState.classList.add('hidden');

        container.innerHTML = this.productos.map((producto, index) => `
            <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                            <h4 class="font-medium text-gray-800">${producto.productoNombre}</h4>
                        </div>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm text-gray-600">
                            <div>
                                <span class="font-medium">Cantidad:</span>
                                <span class="text-gray-800">${producto.cantidad}</span>
                            </div>
                            <div>
                                <span class="font-medium">Precio Unit:</span>
                                <span class="text-gray-800">$${producto.precioUnitario.toFixed(2)}</span>
                            </div>
                            <div>
                                <span class="font-medium">Descuento:</span>
                                <span class="text-gray-800">${producto.descuentoPorcentaje}%</span>
                            </div>
                            <div>
                                <span class="font-medium">Total:</span>
                                <span class="text-brandGold font-bold">$${producto.total.toFixed(2)}</span>
                            </div>
                        </div>
                        ${producto.observaciones ? `<p class="mt-2 text-sm text-gray-500">${producto.observaciones}</p>` : ''}
                    </div>
                    <div class="flex gap-2 ml-4">
                        <button type="button" onclick="ventaWizard.editProduct(${index})" 
                                class="text-blue-600 hover:text-blue-800 transition">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.828-2.828z"/>
                            </svg>
                        </button>
                        <button type="button" onclick="ventaWizard.removeProduct(${index})" 
                                class="text-red-600 hover:text-red-800 transition">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    editProduct(index) {
        const producto = this.productos[index];
        this.editingProductIndex = index;
        
        document.getElementById('productoSelect').value = producto.productoId;
        document.getElementById('modalCantidad').value = producto.cantidad;
        document.getElementById('modalPrecioUnitario').value = producto.precioUnitario;
        document.getElementById('modalDescuento').value = producto.descuentoPorcentaje;
        document.getElementById('modalImpuesto').value = producto.impuestoPorcentaje;
        document.getElementById('modalObservaciones').value = producto.observaciones;
        
        document.getElementById('productModal').classList.remove('hidden');
        document.getElementById('productModal').classList.add('flex');
    }

    removeProduct(index) {
        if (confirm('¿Está seguro de que desea eliminar este producto?')) {
            this.productos.splice(index, 1);
            this.renderProductos();
            this.updateTotals();
        }
    }

    updateTotals() {
        const subtotal = this.productos.reduce((sum, p) => sum + p.subtotal, 0);
        const impuestos = this.productos.reduce((sum, p) => sum + p.impuestoMonto, 0);
        const total = this.productos.reduce((sum, p) => sum + p.total, 0);

        document.getElementById('subtotalAmount').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('taxAmount').textContent = `$${impuestos.toFixed(2)}`;
        document.getElementById('totalAmount').textContent = `$${total.toFixed(2)}`;
    }

    handlePaymentMethodChange(metodoPago) {
        // Similar to compra wizard payment method handling
        const fieldGroups = [
            'camposEfectivo',
            'camposTransferenciaACH', 
            'camposTransferenciaLBTR',
            'camposCheque',
            'camposCredito',
            'camposTransferenciaInternacional'
        ];
        
        fieldGroups.forEach(groupId => {
            const group = document.getElementById(groupId);
            if (group) {
                group.classList.add('hidden');
            }
        });

        const container = document.getElementById('camposCondicionales');
        if (!metodoPago) {
            container.classList.add('hidden');
            return;
        }

        container.classList.remove('hidden');

        let targetGroupId = '';
        switch(metodoPago) {
            case 'EFECTIVO':
                targetGroupId = 'camposEfectivo';
                break;
            case 'TRANSFERENCIA_ACH':
                targetGroupId = 'camposTransferenciaACH';
                break;
            case 'TRANSFERENCIA_LBTR':
                targetGroupId = 'camposTransferenciaLBTR';
                this.setDefaultLBTRDateTime();
                break;
            case 'CHEQUE':
                targetGroupId = 'camposCheque';
                this.setDefaultChequeDate();
                break;
            case 'CREDITO':
                targetGroupId = 'camposCredito';
                break;
            case 'TRANSFERENCIA_INTERNACIONAL':
                targetGroupId = 'camposTransferenciaInternacional';
                break;
        }

        if (targetGroupId) {
            const targetGroup = document.getElementById(targetGroupId);
            if (targetGroup) {
                targetGroup.classList.remove('hidden');
            }
        }
    }

    setDefaultLBTRDateTime() {
        const now = new Date();
        const localISOTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        document.getElementById('fechaHoraLBTR').value = localISOTime;
    }

    setDefaultChequeDate() {
        const today = new Date();
        const futureDate = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
        document.getElementById('fechaVencimientoCheque').value = futureDate.toISOString().split('T')[0];
    }

    generatePaymentMetadata() {
        const metodoPago = document.getElementById('metodoPago').value;
        if (!metodoPago) return null;

        const metadata = {
            metodoPago: metodoPago,
            moneda: 'DOP'
        };

        switch(metodoPago) {
            case 'EFECTIVO':
                metadata.recibidoPor = document.getElementById('recibidoPor').value;
                metadata.lugarPago = document.getElementById('lugarPago').value;
                break;
                
            case 'TRANSFERENCIA_ACH':
                metadata.tipoTransferencia = 'ACH';
                metadata.bancoOrigen = document.getElementById('bancoOrigen').value;
                metadata.bancoDestino = document.getElementById('bancoDestino').value;
                metadata.numeroCuentaOrigen = document.getElementById('cuentaOrigen').value;
                metadata.numeroReferencia = document.getElementById('referenciaACH').value;
                metadata.fechaProcesamiento = document.getElementById('fecha').value;
                metadata.horarioCorte = '12:00';
                break;
                
            case 'TRANSFERENCIA_LBTR':
                metadata.tipoTransferencia = 'LBTR';
                metadata.bancoOrigen = document.getElementById('bancoOrigenLBTR').value;
                metadata.costoTransferencia = parseFloat(document.getElementById('costoTransferencia').value) || 100.00;
                metadata.numeroReferencia = document.getElementById('referenciaLBTR').value;
                metadata.fechaHora = document.getElementById('fechaHoraLBTR').value;
                break;
                
            case 'CHEQUE':
                metadata.numeroCheque = document.getElementById('numeroCheque').value;
                metadata.banco = document.getElementById('bancoCheque').value;
                metadata.titular = document.getElementById('titularCheque').value;
                metadata.fechaEmision = document.getElementById('fecha').value;
                metadata.fechaVencimiento = document.getElementById('fechaVencimientoCheque').value;
                break;
                
            case 'CREDITO':
                metadata.banco = document.getElementById('bancoCredito').value;
                metadata.tipoCreditoEmpresarial = 'Línea de crédito';
                metadata.plazoPagos = parseInt(document.getElementById('plazoPagos').value) || 12;
                metadata.tasaInteres = parseFloat(document.getElementById('tasaInteres').value) || 15.5;
                metadata.fechaVencimiento = document.getElementById('fechaVencimientoCredito').value;
                metadata.modalidadPago = 'Mensual';
                metadata.factorCalculo = 360;
                break;
                
            case 'TRANSFERENCIA_INTERNACIONAL':
                metadata.tipoTransferencia = 'SWIFT';
                metadata.swiftOrigen = document.getElementById('swiftOrigen').value;
                metadata.swiftDestino = document.getElementById('swiftDestino').value;
                metadata.tasaCambio = parseFloat(document.getElementById('tasaCambio').value) || 58.50;
                metadata.comisionTransferencia = parseFloat(document.getElementById('comisionTransferencia').value) || 2500.00;
                metadata.monedaOrigen = 'DOP';
                metadata.monedaDestino = 'USD';
                break;
        }

        return metadata;
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.productos.length === 0) {
            alert('Debe agregar al menos un producto');
            return;
        }

        const formData = this.getFormData();
        
        try {
            const response = await makeAuthenticatedRequest('/api/transacciones', {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Venta registrada exitosamente');
                window.location.href = '/pages/transaccion/index.html';
            } else {
                const errorData = await response.text();
                console.error('Error response:', errorData);
                alert('Error al registrar la venta: ' + errorData);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al procesar la solicitud: ' + error.message);
        }
    }

    getFormData() {
        const clienteId = document.getElementById('clienteId').value;
        const cliente = this.clientes.find(c => c.id == clienteId);
        
        const subtotal = this.productos.reduce((sum, p) => sum + p.subtotal, 0);
        const impuestos = this.productos.reduce((sum, p) => sum + p.impuestoMonto, 0);
        const total = this.productos.reduce((sum, p) => sum + p.total, 0);

        // Generate payment metadata
        const paymentMetadata = this.generatePaymentMetadata();

        return {
            tipo: 'VENTA',
            fecha: document.getElementById('fecha').value + 'T00:00:00',
            estado: 'CONFIRMADA',
            contraparteId: clienteId,
            tipoContraparte: 'CLIENTE',
            contraparteNombre: cliente ? `${cliente.nombre} ${cliente.apellido}` : '',
            vendedorId: document.getElementById('vendedorId').value,
            numeroFactura: document.getElementById('numeroFactura').value,
            metodoPago: document.getElementById('metodoPago').value,
            metadatosPago: paymentMetadata ? JSON.stringify(paymentMetadata) : null,
            condicionesPago: document.getElementById('condicionesPago').value,
            direccionEntrega: document.getElementById('direccionEntrega').value,
            fechaEntregaEsperada: document.getElementById('fechaEntregaEsperada').value ? 
                document.getElementById('fechaEntregaEsperada').value + 'T00:00:00' : null,
            observaciones: document.getElementById('observaciones').value,
            subtotal: subtotal,
            impuestos: impuestos,
            total: total,
            lineas: this.productos
        };
    }
}

// Initialize the wizard when page loads
window.ventaWizard = new VentaWizard();