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
    
    const idCell = document.createElement('td');
    idCell.className = "px-4 py-2 whitespace-nowrap text-sm text-gray-800";
    idCell.textContent = t.id;
    row.appendChild(idCell);
    
    const tipoCell = document.createElement('td');
    tipoCell.className = "px-4 py-2 whitespace-nowrap text-sm";
    tipoCell.textContent = t.tipo;
    row.appendChild(tipoCell);
    
    const contraparteCell = document.createElement('td');
    contraparteCell.className = "px-4 py-2 whitespace-nowrap text-sm";
    contraparteCell.textContent = t.contraparteNombre || '';
    row.appendChild(contraparteCell);
    
    const fechaCell = document.createElement('td');
    fechaCell.className = "px-4 py-2 whitespace-nowrap text-sm";
    fechaCell.textContent = new Date(t.fecha).toLocaleDateString();
    row.appendChild(fechaCell);
    
    const estadoCell = document.createElement('td');
    estadoCell.className = "px-4 py-2 whitespace-nowrap text-sm";
    estadoCell.textContent = t.estado;
    row.appendChild(estadoCell);
    
    const totalCell = document.createElement('td');
    totalCell.className = "px-4 py-2 whitespace-nowrap text-sm text-right";
    totalCell.textContent = `$${t.total.toFixed(2)}`;
    row.appendChild(totalCell);
    
    tbody.appendChild(row);
  });
}

// initial load
loadTransacciones();
