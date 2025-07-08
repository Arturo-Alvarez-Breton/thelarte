import { getTransacciones } from '../services/transaccionService.js';

document.getElementById('filterForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  await loadTransacciones();
});

async function loadTransacciones() {
  const estado = document.getElementById('estado').value;
  const desde = document.getElementById('desde').value;
  const hasta = document.getElementById('hasta').value;

  const params = {};
  if (estado) params.estado = estado;
  if (desde) params.fechaInicio = `${desde}T00:00:00`;
  if (hasta) params.fechaFin = `${hasta}T23:59:59`;

  try {
    const transacciones = await getTransacciones(params);
    renderTable(transacciones);
  } catch (error) {
    console.error(error);
    alert('Error al cargar las transacciones');
  }
}

function renderTable(items) {
  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = '';
  items.forEach(t => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-800">${t.id}</td>
      <td class="px-4 py-2 whitespace-nowrap text-sm">${t.tipo}</td>
      <td class="px-4 py-2 whitespace-nowrap text-sm">${t.contraparteNombre || ''}</td>
      <td class="px-4 py-2 whitespace-nowrap text-sm">${new Date(t.fecha).toLocaleDateString()}</td>
      <td class="px-4 py-2 whitespace-nowrap text-sm">${t.estado}</td>
      <td class="px-4 py-2 whitespace-nowrap text-sm text-right">$${t.total.toFixed(2)}</td>
    `;
    tbody.appendChild(row);
  });
}

// initial load
loadTransacciones();
