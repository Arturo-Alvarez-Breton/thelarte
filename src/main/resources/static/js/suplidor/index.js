const table = document.getElementById('supplierTable');
const emptyState = document.getElementById('emptyState');

async function loadSuppliers() {
  try {
    const resp = await fetch('/api/suplidores');
    if (!resp.ok) {
      throw new Error(`HTTP error! status: ${resp.status}`);
    }
    const data = await resp.json();
    
    if (data.length === 0) {
      table.parentElement.style.display = 'none';
      emptyState.classList.remove('hidden');
      return;
    }
    
    table.parentElement.style.display = 'block';
    emptyState.classList.add('hidden');
    
    table.innerHTML = data.map(s => `
      <tr class="hover:bg-gray-50">
        <td class="px-6 py-4 text-sm font-medium text-gray-900">${s.id}</td>
        <td class="px-6 py-4 text-sm text-gray-900">${s.nombre}</td>
        <td class="px-6 py-4 text-sm text-gray-500">${s.ciudad}</td>
        <td class="px-6 py-4 text-sm text-gray-500">${s.email || 'N/A'}</td>
        <td class="px-6 py-4 text-sm text-gray-500">${s.rNC || 'N/A'}</td>
        <td class="px-6 py-4 text-sm text-center">
          <div class="flex justify-center space-x-2">
            <a href="form.html?id=${s.id}"
               class="text-blue-600 hover:text-blue-800 px-3 py-1 rounded-md hover:bg-blue-50 transition-colors">
              ✏️ Editar
            </a>
            <button data-id="${s.id}" 
                    class="delete text-red-600 hover:text-red-800 px-3 py-1 rounded-md hover:bg-red-50 transition-colors">
              🗑️ Eliminar
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error loading suppliers:', error);
    alert('Error al cargar los suplidores. Por favor, intenta de nuevo.');
  }
}

async function deleteSupplier(id) {
  if (!confirm('¿Estás seguro de que deseas eliminar este suplidor?')) return;
  
  try {
    const resp = await fetch(`/api/suplidores/${id}`, { method: 'DELETE' });
    if (!resp.ok) {
      throw new Error(`HTTP error! status: ${resp.status}`);
    }
    loadSuppliers();
    alert('Suplidor eliminado exitosamente.');
  } catch (error) {
    console.error('Error deleting supplier:', error);
    alert('Error al eliminar el suplidor. Por favor, intenta de nuevo.');
  }
}

table.addEventListener('click', e => {
  if (e.target.classList.contains('delete')) {
    deleteSupplier(e.target.dataset.id);
  }
});

loadSuppliers();
