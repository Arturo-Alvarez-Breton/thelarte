const service = new TransaccionService();

function showLoading(){document.getElementById('loadingOverlay').classList.remove('hidden');}
function hideLoading(){document.getElementById('loadingOverlay').classList.add('hidden');}

async function loadDetalle(){
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if(!id) return;
  showLoading();
  try{
    const t = await service.obtenerTransaccionPorId(id);
    render(t);
  }catch(e){
    console.error(e);
    alert('No se pudo cargar la transacción');
  }finally{
    hideLoading();
  }
}

function render(t){
  const info = document.getElementById('transaccionInfo');
  info.innerHTML = `
    <p><strong>Número:</strong> ${t.id}</p>
    <p><strong>Fecha:</strong> ${t.fecha ? new Date(t.fecha).toLocaleString() : ''}</p>
    <p><strong>Contraparte:</strong> ${t.contraparteNombre}</p>
    <p><strong>Estado:</strong> ${t.estado}</p>
  `;
  const tbody = document.querySelector('#lineasTable tbody');
  tbody.innerHTML = t.lineas.map(l=>`
      <tr class="border-t">
        <td class="px-3 py-2">${l.productoNombre}</td>
        <td class="px-3 py-2 text-right">${l.cantidad}</td>
        <td class="px-3 py-2 text-right">${service.formatearMoneda(l.precioUnitario)}</td>
        <td class="px-3 py-2 text-right">${service.formatearMoneda(l.total)}</td>
      </tr>
  `).join('');
  document.getElementById('totales').innerHTML = `
      <p>Subtotal: ${service.formatearMoneda(t.subtotal)}</p>
      <p>Impuestos: ${service.formatearMoneda(t.impuestos)}</p>
      <p class="font-bold text-lg">Total: ${service.formatearMoneda(t.total)}</p>
  `;
}

document.addEventListener('DOMContentLoaded', loadDetalle);
