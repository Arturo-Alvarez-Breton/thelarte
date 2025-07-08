import { makeAuthenticatedRequest } from '../services/authService.js';

class DevolucionWizard {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.transacciones = [];
        this.transaccionOriginal = null;
        this.productosDevolucion = [];
        this.editingProductIndex = -1;
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.setDefaultDate();
        this.updateWizardState();
    }

    setupEventListeners() {
        // Wizard navigation
        document.getElementById('nextBtn').addEventListener('click', () => this.nextStep());
        document.getElementById('prevBtn').addEventListener('click', () => this.prevStep());
        
        // Transaction type selection
        document.getElementById('tipoDevolucion').addEventListener('change', (e) => this.onTipoDevolucionChange(e.target.value));
        
        // Transaction search
        document.getElementById('searchBtn').addEventListener('click', () => this.searchTransacciones());
        document.getElementById('transaccionSelect').addEventListener('change', (e) => this.onTransaccionSelect(e.target.value));
        
        // Product selection
        document.getElementById('addProductBtn').addEventListener('click', () => this.openProductModal());
        document.getElementById('cancelProductBtn').addEventListener('click', () => this.closeProductModal());
        document.getElementById('addProductConfirmBtn').addEventListener('click', () => this.addProductDevolucion());
        
        // Modal close on outside click
        document.getElementById('productModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('productModal')) {
                this.closeProductModal();
            }
        });

        // Form submission
        document.getElementById('wizardForm').addEventListener('submit', (e) => this.handleSubmit(e));

        // Real-time calculations
        document.getElementById('modalCantidadDevolucion').addEventListener('input', () => this.calculateDevolucionTotal());
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
                indicator.classList.remove('bg-gray-300', 'text-gray-600');
                indicator.classList.add('bg-green-600', 'text-white');
                if (prevLine) {
                    prevLine.classList.remove('bg-gray-300');
                    prevLine.classList.add('bg-green-600');
                }
            } else if (i === this.currentStep) {
                indicator.classList.remove('bg-gray-300', 'text-gray-600', 'bg-green-600');
                indicator.classList.add('bg-brandGold', 'text-white');
                if (prevLine) {
                    prevLine.classList.remove('bg-gray-300');
                    prevLine.classList.add('bg-brandGold');
                }
            } else {
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
        
        if (this.currentStep === 1) {
            prevBtn.classList.add('hidden');
        } else {
            prevBtn.classList.remove('hidden');
        }
        
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
                const tipoDevolucion = document.getElementById('tipoDevolucion').value;
                if (!tipoDevolucion) {
                    alert('Por favor seleccione el tipo de devolución');
                    return false;
                }
                return true;
                
            case 2:
                if (!this.transaccionOriginal) {
                    alert('Por favor seleccione una transacción');
                    return false;
                }
                return true;
                
            case 3:
                if (this.productosDevolucion.length === 0) {
                    alert('Debe agregar al menos un producto para la devolución');
                    return false;
                }
                return true;
                
            case 4:
                return true;
                
            default:
                return true;
        }
    }

    onTipoDevolucionChange(tipo) {
        const searchSection = document.getElementById('searchSection');
        const searchLabel = document.getElementById('searchLabel');
        
        if (tipo) {
            searchSection.classList.remove('hidden');
            if (tipo === 'DEVOLUCION_COMPRA') {
                searchLabel.textContent = 'Buscar Compra Original';
                document.getElementById('searchPlaceholder').placeholder = 'Ingrese ID de compra, suplidor o número de orden...';
            } else if (tipo === 'DEVOLUCION_VENTA') {
                searchLabel.textContent = 'Buscar Venta Original';
                document.getElementById('searchPlaceholder').placeholder = 'Ingrese ID de venta, cliente o número de factura...';
            }
        } else {
            searchSection.classList.add('hidden');
        }
    }

    async searchTransacciones() {
        const tipoDevolucion = document.getElementById('tipoDevolucion').value;
        const searchTerm = document.getElementById('searchPlaceholder').value;
        
        if (!searchTerm.trim()) {
            alert('Por favor ingrese un término de búsqueda');
            return;
        }

        let endpoint = '';
        if (tipoDevolucion === 'DEVOLUCION_COMPRA') {
            endpoint = '/api/transacciones/compras';
        } else if (tipoDevolucion === 'DEVOLUCION_VENTA') {
            endpoint = '/api/transacciones/ventas';
        }

        try {
            const response = await makeAuthenticatedRequest(endpoint);
            if (response.ok) {
                const transacciones = await response.json();
                this.transacciones = transacciones.filter(t => 
                    t.id.toString().includes(searchTerm) ||
                    t.contraparteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (t.numeroFactura && t.numeroFactura.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (t.numeroOrdenCompra && t.numeroOrdenCompra.toLowerCase().includes(searchTerm.toLowerCase()))
                );
                this.populateTransaccionSelect();
            }
        } catch (error) {
            console.error('Error searching transacciones:', error);
            alert('Error al buscar transacciones');
        }
    }

    populateTransaccionSelect() {
        const select = document.getElementById('transaccionSelect');
        select.innerHTML = '<option value="">Seleccionar transacción...</option>';
        
        this.transacciones.forEach(transaccion => {
            const option = document.createElement('option');
            option.value = transaccion.id;
            const fecha = new Date(transaccion.fecha).toLocaleDateString();
            const referencia = transaccion.numeroFactura || transaccion.numeroOrdenCompra || '';
            option.textContent = `ID: ${transaccion.id} - ${transaccion.contraparteNombre} - ${fecha} - $${transaccion.total} ${referencia ? '- ' + referencia : ''}`;
            select.appendChild(option);
        });

        document.getElementById('transaccionSelectContainer').classList.remove('hidden');
    }

    async onTransaccionSelect(transaccionId) {
        if (!transaccionId) {
            this.transaccionOriginal = null;
            document.getElementById('transaccionDetails').classList.add('hidden');
            return;
        }

        try {
            const response = await makeAuthenticatedRequest(`/api/transacciones/${transaccionId}`);
            if (response.ok) {
                this.transaccionOriginal = await response.json();
                this.showTransaccionDetails();
            }
        } catch (error) {
            console.error('Error loading transaction details:', error);
            alert('Error al cargar los detalles de la transacción');
        }
    }

    showTransaccionDetails() {
        const container = document.getElementById('transaccionDetails');
        const transaccion = this.transaccionOriginal;
        
        document.getElementById('detailId').textContent = transaccion.id;
        document.getElementById('detailContraparte').textContent = transaccion.contraparteNombre;
        document.getElementById('detailFecha').textContent = new Date(transaccion.fecha).toLocaleDateString();
        document.getElementById('detailTotal').textContent = `$${transaccion.total}`;
        document.getElementById('detailEstado').textContent = transaccion.estado;
        
        const productosContainer = document.getElementById('detailProductos');
        productosContainer.innerHTML = transaccion.lineas.map(linea => `
            <div class="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                    <span class="font-medium">${linea.productoNombre}</span>
                    <span class="text-sm text-gray-600 ml-2">Cantidad: ${linea.cantidad}</span>
                </div>
                <span class="font-bold">$${linea.total}</span>
            </div>
        `).join('');
        
        container.classList.remove('hidden');
    }

    openProductModal() {
        if (!this.transaccionOriginal || !this.transaccionOriginal.lineas) {
            alert('Primero debe seleccionar una transacción original');
            return;
        }

        this.editingProductIndex = -1;
        this.clearModal();
        this.populateProductosOriginales();
        document.getElementById('productModal').classList.remove('hidden');
        document.getElementById('productModal').classList.add('flex');
    }

    closeProductModal() {
        document.getElementById('productModal').classList.add('hidden');
        document.getElementById('productModal').classList.remove('flex');
        this.clearModal();
    }

    clearModal() {
        document.getElementById('productoOriginalSelect').value = '';
        document.getElementById('modalCantidadDevolucion').value = '';
        document.getElementById('modalMotivoDevolucion').value = '';
        document.getElementById('modalObservaciones').value = '';
    }

    populateProductosOriginales() {
        const select = document.getElementById('productoOriginalSelect');
        select.innerHTML = '<option value="">Seleccionar producto...</option>';
        
        this.transaccionOriginal.lineas.forEach((linea, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${linea.productoNombre} - Cantidad: ${linea.cantidad} - $${linea.precioUnitario}`;
            option.dataset.linea = JSON.stringify(linea);
            select.appendChild(option);
        });

        select.addEventListener('change', (e) => this.onProductoOriginalSelect(e));
    }

    onProductoOriginalSelect(e) {
        const selectedOption = e.target.options[e.target.selectedIndex];
        if (selectedOption.value) {
            const linea = JSON.parse(selectedOption.dataset.linea);
            document.getElementById('modalCantidadDevolucion').max = linea.cantidad;
            document.getElementById('modalCantidadDevolucion').placeholder = `Máximo: ${linea.cantidad}`;
            this.calculateDevolucionTotal();
        }
    }

    calculateDevolucionTotal() {
        const selectedOption = document.getElementById('productoOriginalSelect').options[document.getElementById('productoOriginalSelect').selectedIndex];
        if (!selectedOption.value) return;

        const linea = JSON.parse(selectedOption.dataset.linea);
        const cantidadDevolucion = parseInt(document.getElementById('modalCantidadDevolucion').value) || 0;
        
        if (cantidadDevolucion > linea.cantidad) {
            document.getElementById('modalCantidadDevolucion').value = linea.cantidad;
            return;
        }

        const porcentajeDevolucion = cantidadDevolucion / linea.cantidad;
        const subtotalDevolucion = linea.subtotal * porcentajeDevolucion;
        const impuestoDevolucion = linea.impuestoMonto * porcentajeDevolucion;
        const totalDevolucion = linea.total * porcentajeDevolucion;

        this.showDevolucionCalculation(subtotalDevolucion, impuestoDevolucion, totalDevolucion);
    }

    showDevolucionCalculation(subtotal, impuesto, total) {
        let calcElement = document.getElementById('devolucionCalculation');
        if (!calcElement) {
            calcElement = document.createElement('div');
            calcElement.id = 'devolucionCalculation';
            calcElement.className = 'mt-4 p-3 bg-gray-50 rounded-lg text-sm';
            document.querySelector('#productModal .space-y-4').appendChild(calcElement);
        }

        calcElement.innerHTML = `
            <div class="flex justify-between"><span>Subtotal a devolver:</span><span>$${subtotal.toFixed(2)}</span></div>
            <div class="flex justify-between"><span>Impuesto a devolver:</span><span>$${impuesto.toFixed(2)}</span></div>
            <div class="flex justify-between font-bold border-t pt-2"><span>Total a devolver:</span><span>$${total.toFixed(2)}</span></div>
        `;
    }

    addProductDevolucion() {
        const productoIndex = document.getElementById('productoOriginalSelect').value;
        const cantidadDevolucion = parseInt(document.getElementById('modalCantidadDevolucion').value);
        const motivoDevolucion = document.getElementById('modalMotivoDevolucion').value;
        const observaciones = document.getElementById('modalObservaciones').value;

        if (!productoIndex || !cantidadDevolucion || !motivoDevolucion) {
            alert('Por favor complete todos los campos obligatorios');
            return;
        }

        const lineaOriginal = this.transaccionOriginal.lineas[productoIndex];
        
        if (cantidadDevolucion > lineaOriginal.cantidad) {
            alert('La cantidad a devolver no puede ser mayor a la cantidad original');
            return;
        }

        const existingIndex = this.productosDevolucion.findIndex(p => p.productoId == lineaOriginal.productoId);
        if (existingIndex !== -1 && this.editingProductIndex === -1) {
            alert('Ya existe este producto en la lista de devolución. Puede editarlo desde la tabla.');
            return;
        }

        const porcentajeDevolucion = cantidadDevolucion / lineaOriginal.cantidad;
        const subtotalDevolucion = lineaOriginal.subtotal * porcentajeDevolucion;
        const impuestoDevolucion = lineaOriginal.impuestoMonto * porcentajeDevolucion;
        const totalDevolucion = lineaOriginal.total * porcentajeDevolucion;

        const lineaDevolucion = {
            productoId: lineaOriginal.productoId,
            productoNombre: lineaOriginal.productoNombre,
            cantidad: cantidadDevolucion,
            precioUnitario: lineaOriginal.precioUnitario,
            descuentoPorcentaje: lineaOriginal.descuentoPorcentaje || 0,
            descuentoMonto: lineaOriginal.descuentoMonto * porcentajeDevolucion || 0,
            impuestoPorcentaje: lineaOriginal.impuestoPorcentaje || 0,
            impuestoMonto: impuestoDevolucion,
            subtotal: subtotalDevolucion,
            total: totalDevolucion,
            motivoDevolucion: motivoDevolucion,
            observaciones: observaciones
        };

        if (this.editingProductIndex !== -1) {
            this.productosDevolucion[this.editingProductIndex] = lineaDevolucion;
        } else {
            this.productosDevolucion.push(lineaDevolucion);
        }

        this.renderProductosDevolucion();
        this.updateDevolucionTotals();
        this.closeProductModal();
    }

    renderProductosDevolucion() {
        const container = document.getElementById('productosDevolucionList');
        const emptyState = document.getElementById('emptyProductsDevolucion');

        if (this.productosDevolucion.length === 0) {
            container.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }

        container.classList.remove('hidden');
        emptyState.classList.add('hidden');

        container.innerHTML = this.productosDevolucion.map((producto, index) => `
            <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                            <h4 class="font-medium text-gray-800">${producto.productoNombre}</h4>
                            <span class="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                ${producto.motivoDevolucion}
                            </span>
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
                                <span class="font-medium">Motivo:</span>
                                <span class="text-gray-800">${producto.motivoDevolucion}</span>
                            </div>
                            <div>
                                <span class="font-medium">Total:</span>
                                <span class="text-red-600 font-bold">-$${producto.total.toFixed(2)}</span>
                            </div>
                        </div>
                        ${producto.observaciones ? `<p class="mt-2 text-sm text-gray-500">${producto.observaciones}</p>` : ''}
                    </div>
                    <div class="flex gap-2 ml-4">
                        <button type="button" onclick="devolucionWizard.editProductDevolucion(${index})" 
                                class="text-blue-600 hover:text-blue-800 transition">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.828-2.828z"/>
                            </svg>
                        </button>
                        <button type="button" onclick="devolucionWizard.removeProductDevolucion(${index})" 
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

    editProductDevolucion(index) {
        const producto = this.productosDevolucion[index];
        this.editingProductIndex = index;
        
        // Find the original line index
        const originalIndex = this.transaccionOriginal.lineas.findIndex(l => l.productoId === producto.productoId);
        
        document.getElementById('productoOriginalSelect').value = originalIndex;
        document.getElementById('modalCantidadDevolucion').value = producto.cantidad;
        document.getElementById('modalMotivoDevolucion').value = producto.motivoDevolucion;
        document.getElementById('modalObservaciones').value = producto.observaciones;
        
        this.openProductModal();
    }

    removeProductDevolucion(index) {
        if (confirm('¿Está seguro de que desea eliminar este producto de la devolución?')) {
            this.productosDevolucion.splice(index, 1);
            this.renderProductosDevolucion();
            this.updateDevolucionTotals();
        }
    }

    updateDevolucionTotals() {
        const subtotal = this.productosDevolucion.reduce((sum, p) => sum + p.subtotal, 0);
        const impuestos = this.productosDevolucion.reduce((sum, p) => sum + p.impuestoMonto, 0);
        const total = this.productosDevolucion.reduce((sum, p) => sum + p.total, 0);

        document.getElementById('subtotalDevolucionAmount').textContent = `-$${subtotal.toFixed(2)}`;
        document.getElementById('taxDevolucionAmount').textContent = `-$${impuestos.toFixed(2)}`;
        document.getElementById('totalDevolucionAmount').textContent = `-$${total.toFixed(2)}`;
    }

    updateSummary() {
        const tipoDevolucion = document.getElementById('tipoDevolucion').value;
        const transaccion = this.transaccionOriginal;
        
        document.getElementById('resumenTipoDevolucion').textContent = 
            tipoDevolucion === 'DEVOLUCION_COMPRA' ? 'Devolución de Compra' : 'Devolución de Venta';
        document.getElementById('resumenTransaccionOriginal').textContent = 
            transaccion ? `ID: ${transaccion.id} - ${transaccion.contraparteNombre}` : 'No seleccionada';
        document.getElementById('resumenFechaDevolucion').textContent = 
            new Date(document.getElementById('fecha').value).toLocaleDateString();
        document.getElementById('resumenCantidadProductos').textContent = 
            this.productosDevolucion.length;
        
        this.updateDevolucionTotals();
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.productosDevolucion.length === 0) {
            alert('Debe agregar al menos un producto para la devolución');
            return;
        }

        const formData = this.getFormData();
        
        try {
            const response = await makeAuthenticatedRequest('/api/transacciones', {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Devolución registrada exitosamente');
                window.location.href = '/pages/transaccion/index.html';
            } else {
                const errorData = await response.text();
                console.error('Error response:', errorData);
                alert('Error al registrar la devolución: ' + errorData);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al procesar la solicitud: ' + error.message);
        }
    }

    getFormData() {
        const tipoDevolucion = document.getElementById('tipoDevolucion').value;
        const transaccion = this.transaccionOriginal;
        
        const subtotal = this.productosDevolucion.reduce((sum, p) => sum + p.subtotal, 0);
        const impuestos = this.productosDevolucion.reduce((sum, p) => sum + p.impuestoMonto, 0);
        const total = this.productosDevolucion.reduce((sum, p) => sum + p.total, 0);

        return {
            tipo: tipoDevolucion,
            fecha: document.getElementById('fecha').value + 'T00:00:00',
            estado: 'PENDIENTE',
            contraparteId: transaccion.contraparteId,
            tipoContraparte: transaccion.tipoContraparte,
            contraparteNombre: transaccion.contraparteNombre,
            transaccionOrigenId: transaccion.id,
            numeroReferencia: `DEV-${Date.now()}`,
            observaciones: document.getElementById('observacionesDevolucion').value,
            subtotal: subtotal,
            impuestos: impuestos,
            total: total,
            lineas: this.productosDevolucion
        };
    }
}

// Initialize the wizard when page loads
window.devolucionWizard = new DevolucionWizard();