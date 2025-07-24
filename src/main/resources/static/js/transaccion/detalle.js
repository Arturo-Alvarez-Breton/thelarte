const service = new TransaccionService();
let transactionId = null;
let currentTransaction = null;

function showLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.classList.remove('hidden');
  }
}

function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.classList.add('hidden');
  }
}

async function loadDetalle(){
  const params = new URLSearchParams(window.location.search);
  transactionId = params.get('id');
  if(!transactionId) {
    alert('No se especificó una transacción');
    window.location.href = 'index.html';
    return;
  }

  showLoading();
  try{
    currentTransaction = await service.obtenerTransaccionPorId(transactionId);
    console.log("Transacción recibida:", currentTransaction); // <-- LOG AQUI
    document.title = `Transacción #${transactionId} | Thelarte`;
    renderTransaction(currentTransaction);
  } catch(e) {
    console.error(e);
    alert('No se pudo cargar la transacción');
    window.location.href = 'index.html';
  } finally {
    hideLoading();
  }
}

function formatearMonedaDominicana(cantidad) {
    if (!cantidad && cantidad !== 0) return 'RD$ 0,00';
    
    const numero = Math.abs(cantidad);
    const partes = numero.toFixed(2).split('.');
    const entero = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const decimal = partes[1];
    
    return `RD$ ${entero},${decimal}`;
}

function formatDate(dateString, includeTime = true) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Fecha inválida';
  
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return date.toLocaleDateString('es-DO', options);
}

function getStatusClass(estado) {
  const classes = {
    'PENDIENTE': 'bg-yellow-100 text-yellow-800',
    'CONFIRMADA': 'bg-blue-100 text-blue-800',
    'COMPLETADA': 'bg-green-100 text-green-800',
    'CANCELADA': 'bg-red-100 text-red-800',
    'FACTURADA': 'bg-purple-100 text-purple-800',
    'RECIBIDA': 'bg-indigo-100 text-indigo-800',
    'PAGADA': 'bg-green-100 text-green-800',
    'ENTREGADA': 'bg-teal-100 text-teal-800',
    'COBRADA': 'bg-emerald-100 text-emerald-800'
  };
  return classes[estado] || 'bg-gray-100 text-gray-800';
}

function getTypeClass(tipo) {
  const classes = {
    'COMPRA': 'tipo-compra',
    'VENTA': 'tipo-venta',
    'DEVOLUCION_COMPRA': 'tipo-devolucion',
    'DEVOLUCION_VENTA': 'tipo-devolucion'
  };
  return classes[tipo] || '';
}

function getTypeDisplay(tipo) {
  const types = {
    'COMPRA': 'Compra',
    'VENTA': 'Venta',
    'DEVOLUCION_COMPRA': 'Devolución Compra',
    'DEVOLUCION_VENTA': 'Devolución Venta'
  };
  return types[tipo] || tipo;
}

function renderTransaction(t) {
  // Transaction header
  document.getElementById('transactionTitle').textContent = `Transacción #${t.id}`;
  document.getElementById('transactionDate').textContent = formatDate(t.fecha);
  document.getElementById('transactionTotal').textContent = formatearMonedaDominicana(t.total);
  
  // Type badge
  const typeBadge = document.getElementById('transactionTypeBadge');
  typeBadge.textContent = getTypeDisplay(t.tipo);
  typeBadge.className = `transaction-type-badge ${getTypeClass(t.tipo)}`;
  
  // Status badge
  const statusBadge = document.getElementById('transactionStatus');
  statusBadge.textContent = t.estado;
  statusBadge.className = `px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(t.estado)}`;
  
  // Counterpart info
  document.getElementById('counterpartName').textContent = t.contraparteNombre;
  document.getElementById('counterpartType').textContent = t.tipoContraparte === 'CLIENTE' ? 'Cliente' : 'Proveedor';
  document.getElementById('counterpartId').textContent = `ID: ${t.contraparteId}`;
  
  // Show/hide edit button based on transaction status
  const editButton = document.getElementById('btnEditTransaction');
  const editableEstados = ['PENDIENTE', 'CONFIRMADA'];
  if (editButton) {
    if (editableEstados.includes(t.estado)) {
      editButton.style.display = 'inline-flex';
      editButton.onclick = () => editTransaction();
    } else {
      // Replace with disabled button
      editButton.style.display = 'none';
      const buttonsContainer = document.getElementById('actionButtons');
      const disabledBtn = document.createElement('button');
      disabledBtn.className = 'bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed';
      disabledBtn.innerHTML = '<i class="fas fa-lock mr-2"></i>No Editable';
      disabledBtn.title = `No se puede editar una transacción ${t.estado}`;
      buttonsContainer.insertBefore(disabledBtn, editButton);
    }
  }
  
  // Document info
  document.getElementById('invoiceNumber').textContent = t.numeroFactura || 'N/A';
  document.getElementById('referenceNumber').textContent = t.numeroReferencia || t.numeroOrdenCompra || 'N/A';
  document.getElementById('creationDate').textContent = formatDate(t.fechaCreacion);
  
  // Payment info
  document.getElementById('paymentMethod').textContent = t.metodoPago || 'No especificado';
  document.getElementById('paymentTerms').textContent = t.condicionesPago || 'Estándar';
  document.getElementById('paymentStatus').textContent = getPaymentStatus(t);
  
  // Notes/Observations
  if (t.observaciones) {
    document.getElementById('observationsText').textContent = t.observaciones;
    document.getElementById('notesSection').classList.remove('hidden');
  }
  
  // Products
  const tbody = document.querySelector('#lineasTable tbody');
  tbody.innerHTML = t.lineas.map(l => `
    <tr class="hover:bg-gray-50">
      <td class="px-4 py-3">
        <div>
          <div class="font-medium text-gray-900">${l.productoNombre}</div>
          ${l.descripcionProducto ? `<div class="text-xs text-gray-500">${l.descripcionProducto}</div>` : ''}
        </div>
      </td>
      <td class="px-4 py-3 text-center font-medium">${l.cantidad}</td>
      <td class="px-4 py-3 text-right font-mono">${formatearMonedaDominicana(l.precioUnitario)}</td>
      <td class="px-4 py-3 text-right font-mono font-bold">${formatearMonedaDominicana(l.total)}</td>
    </tr>
  `).join('');
  
  // Totals
  document.getElementById('subtotalAmount').textContent = formatearMonedaDominicana(t.subtotal);
  document.getElementById('taxAmount').textContent = formatearMonedaDominicana(t.impuestos);
  document.getElementById('finalTotal').textContent = formatearMonedaDominicana(t.total);
}

function getPaymentStatus(transaction) {
  if (transaction.tipo === 'VENTA') {
    if (transaction.estado === 'COBRADA') return 'Pagado';
    if (transaction.estado === 'ENTREGADA') return 'Por cobrar';
    return 'Pendiente';
  } else {
    if (transaction.estado === 'PAGADA') return 'Pagado';
    if (transaction.estado === 'RECIBIDA') return 'Por pagar';
    return 'Pendiente';
  }
}

function exportPDF() {
  alert('Funcionalidad de exportación a PDF en desarrollo');
}

function sendByEmail() {
  alert('Funcionalidad de envío por correo en desarrollo');
}

function editTransaction() {
  window.location.href = `edit.html?id=${transactionId}`;
}

document.addEventListener('DOMContentLoaded', loadDetalle);

function deleteTransaction() {
  if (!confirm('¿Estás seguro de que deseas eliminar esta transacción? Esta acción no se puede deshacer.')) return;
  service.eliminarTransaccion(transactionId)
      .then(() => {
        alert('Transacción eliminada exitosamente');
        window.location.href = 'index.html';
      })
      .catch(error => {
        console.error('Error al eliminar la transacción:', error);
        alert('No se pudo eliminar la transacción. Por favor, intenta de nuevo.');
      });
}