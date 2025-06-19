const form = document.getElementById('supplierForm');
const params = new URLSearchParams(window.location.search);
const id = params.get('id');

if (!id) {
  alert('ID de suplidor no encontrado');
  location.href = 'index.html';
}

async function load() {
  try {
    const resp = await fetch(`/api/suplidores/${id}`);
    if (!resp.ok) {
      throw new Error(`HTTP error! status: ${resp.status}`);
    }
    const s = await resp.json();
    form.nombre.value = s.nombre || '';
    form.ciudad.value = s.ciudad || '';
    form.direccion.value = s.direccion || '';
    form.email.value = s.email || '';
    form.rnc.value = s.rNC || '';
    form.ncf.value = s.nCF || '';
    form.telefonos.value = (s.telefonos || []).join(', ');
  } catch (error) {
    console.error('Error loading supplier:', error);
    alert('Error al cargar los datos del suplidor');
    location.href = 'index.html';
  }
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  
  // Disable button and show loading state
  submitBtn.disabled = true;
  submitBtn.textContent = 'Actualizando...';
  
  try {
    const data = {
      id: parseInt(id),
      nombre: form.nombre.value.trim(),
      ciudad: form.ciudad.value.trim(),
      direccion: form.direccion.value.trim(),
      email: form.email.value.trim(),
      rNC: form.rnc.value.trim(),
      nCF: form.ncf.value.trim(),
      telefonos: form.telefonos.value ? form.telefonos.value.split(',').map(t => t.trim()).filter(Boolean) : []
    };
    
    // Basic validation
    if (!data.nombre || !data.ciudad) {
      alert('Por favor, completa los campos obligatorios (Nombre y Ciudad).');
      return;
    }
    
    const response = await fetch(`/api/suplidores/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    alert('Suplidor actualizado exitosamente!');
    location.href = 'index.html';
    
  } catch (error) {
    console.error('Error updating supplier:', error);
    alert('Error al actualizar el suplidor. Por favor, intenta de nuevo.');
  } finally {
    // Re-enable button
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});

// Load supplier data when page loads
load();
