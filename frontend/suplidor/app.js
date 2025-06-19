const API_URL = '/api/suplidores';
let suppliers = [];
let filtered = [];
let currentPage = 1;
const pageSize = 10;
let map, marker;

const tableBody = document.getElementById('tableBody');
const pagination = document.getElementById('pagination');
const searchInput = document.getElementById('searchInput');
const modal = document.getElementById('modal');
const deleteModal = document.getElementById('deleteModal');
const supplierForm = document.getElementById('supplierForm');
const modalTitle = document.getElementById('modalTitle');
const closeModalBtn = document.getElementById('closeModal');
const newBtn = document.getElementById('newBtn');
const closeDeleteBtn = document.getElementById('closeDelete');
const confirmDeleteBtn = document.getElementById('confirmDelete');
let deleteId = null;

async function loadSuppliers() {
  try {
    const resp = await fetch(API_URL);
    suppliers = await resp.json();
    filtered = suppliers.slice();
    currentPage = 1;
    renderTable();
  } catch (err) {
    console.error('Error loading suppliers', err);
  }
}

function renderTable() {
  const start = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  tableBody.innerHTML = pageItems.map(s => `
    <tr>
      <td>${s.nombre || ''}</td>
      <td>${s.ciudad || ''}</td>
      <td>${s.direccion || ''}</td>
      <td>${s.email || ''}</td>
      <td>${(s.telefonos || []).join('<br>')}</td>
      <td>${s.rNC || ''}</td>
      <td>${s.nCF || ''}</td>
      <td>${s.longitud || ''}</td>
      <td>${s.latitud || ''}</td>
      <td class="actions">
        <button class="btn-primary" onclick="openModal('edit', ${s.id})">Editar</button>
        <button class="btn-primary" onclick="openDelete(${s.id})">Eliminar</button>
      </td>
    </tr>`).join('');

  renderPagination();
}

function renderPagination() {
  const pageCount = Math.ceil(filtered.length / pageSize) || 1;
  pagination.innerHTML = '';
  for (let i = 1; i <= pageCount; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    if (i === currentPage) btn.classList.add('active');
    btn.addEventListener('click', () => { currentPage = i; renderTable(); });
    pagination.appendChild(btn);
  }
}

searchInput.addEventListener('input', () => {
  const term = searchInput.value.toLowerCase();
  filtered = suppliers.filter(s =>
    s.nombre.toLowerCase().includes(term) ||
    (s.ciudad && s.ciudad.toLowerCase().includes(term))
  );
  currentPage = 1;
  renderTable();
});

function openModal(mode, id) {
  supplierForm.reset();
  supplierForm.id.value = '';
  modal.style.display = 'flex';
  modalTitle.textContent = mode === 'create' ? 'Nuevo Suplidor' : 'Editar Suplidor';
  initMap();
  if (mode === 'edit') {
    const s = suppliers.find(x => x.id === id);
    if (!s) return;
    supplierForm.id.value = s.id;
    supplierForm.nombre.value = s.nombre || '';
    supplierForm.ciudad.value = s.ciudad || '';
    supplierForm.direccion.value = s.direccion || '';
    supplierForm.email.value = s.email || '';
    supplierForm.rnc.value = s.rNC || '';
    supplierForm.ncf.value = s.nCF || '';
    supplierForm.telefonos.value = (s.telefonos || []).join(', ');
    supplierForm.longitud.value = s.longitud || '';
    supplierForm.latitud.value = s.latitud || '';
    if (s.latitud && s.longitud) {
      const latlng = [parseFloat(s.latitud), parseFloat(s.longitud)];
      map.setView(latlng, 13);
      if (marker) marker.setLatLng(latlng); else marker = L.marker(latlng).addTo(map);
    }
  } else {
    if (marker) { map.removeLayer(marker); marker = null; }
    map.setView([18.5, -70], 8);
  }
}

function closeModal() {
  modal.style.display = 'none';
}

function initMap() {
  if (!map) {
    map = L.map('map').setView([18.5, -70], 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);
    map.on('click', function(e) {
      const { lat, lng } = e.latlng;
      supplierForm.latitud.value = lat.toFixed(6);
      supplierForm.longitud.value = lng.toFixed(6);
      if (marker) { marker.setLatLng(e.latlng); }
      else { marker = L.marker(e.latlng).addTo(map); }
    });
  }
}

closeModalBtn.addEventListener('click', closeModal);
newBtn.addEventListener('click', () => openModal('create'));

supplierForm.addEventListener('submit', async e => {
  e.preventDefault();
  const id = supplierForm.id.value;
  const data = {
    nombre: supplierForm.nombre.value,
    ciudad: supplierForm.ciudad.value,
    direccion: supplierForm.direccion.value,
    email: supplierForm.email.value,
    rNC: supplierForm.rnc.value,
    nCF: supplierForm.ncf.value,
    telefonos: supplierForm.telefonos.value ? supplierForm.telefonos.value.split(',').map(t => t.trim()).filter(Boolean) : [],
    longitud: supplierForm.longitud.value,
    latitud: supplierForm.latitud.value
  };

  try {
    const resp = await fetch(id ? `${API_URL}/${id}` : API_URL, {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(id ? { ...data, id: parseInt(id) } : data)
    });
    if (resp.ok) {
      await loadSuppliers();
      closeModal();
    } else {
      console.error('Save error', resp.status);
    }
  } catch(err) {
    console.error('Request failed', err);
  }
});

function openDelete(id) {
  deleteId = id;
  deleteModal.style.display = 'flex';
}

function closeDelete() {
  deleteModal.style.display = 'none';
}

closeDeleteBtn.addEventListener('click', closeDelete);

confirmDeleteBtn.addEventListener('click', async () => {
  if (!deleteId) return;
  try {
    const resp = await fetch(`${API_URL}/${deleteId}`, { method: 'DELETE' });
    if (resp.ok) {
      await loadSuppliers();
      closeDelete();
    }
  } catch(err) {
    console.error('Delete failed', err);
  }
});

// initial load
loadSuppliers();
