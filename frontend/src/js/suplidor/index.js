const table = document.getElementById('supplierTable');

async function loadSuppliers() {
  const resp = await fetch('/api/suplidores');
  if (!resp.ok) return;
  const data = await resp.json();
  table.innerHTML = data.map(s => `
    <tr>
      <td class="px-4 py-2">${s.id}</td>
      <td class="px-4 py-2">${s.nombre}</td>
      <td class="px-4 py-2">${s.ciudad}</td>
      <td class="px-4 py-2">${s.email}</td>
      <td class="px-4 py-2 space-x-2">
        <a href="edit.html?id=${s.id}" class="text-primary-300">Editar</a>
        <button data-id="${s.id}" class="delete text-red-500">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

async function deleteSupplier(id) {
  if (!confirm('¿Eliminar suplidor?')) return;
  await fetch(`/api/suplidores/${id}`, { method: 'DELETE' });
  loadSuppliers();
}

table.addEventListener('click', e => {
  if (e.target.classList.contains('delete')) {
    deleteSupplier(e.target.dataset.id);
  }
});

loadSuppliers();
