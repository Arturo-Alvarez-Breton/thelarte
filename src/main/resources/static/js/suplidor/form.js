const form = document.getElementById('supplierForm');
const titleEl = document.getElementById('formTitle');
const descEl = document.getElementById('formDesc');
const submitBtn = document.getElementById('submitBtn');
const params = new URLSearchParams(window.location.search);
const id = params.get('id');

function setMode() {
  if (id) {
    document.title = 'Editar Suplidor - Thelarte';
    titleEl.textContent = 'Editar Suplidor';
    descEl.textContent = 'Actualiza la información del proveedor';
    submitBtn.textContent = 'Actualizar Suplidor';
    loadSupplier();
  } else {
    document.title = 'Nuevo Suplidor - Thelarte';
    titleEl.textContent = 'Nuevo Suplidor';
    descEl.textContent = 'Registra un nuevo proveedor en el sistema';
    submitBtn.textContent = 'Guardar Suplidor';
  }
}

async function loadSupplier() {
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
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = id ? 'Actualizando...' : 'Guardando...';

  const data = {
    nombre: form.nombre.value.trim(),
    ciudad: form.ciudad.value.trim(),
    direccion: form.direccion.value.trim(),
    email: form.email.value.trim(),
    rNC: form.rnc.value.trim(),
    nCF: form.ncf.value.trim(),
    telefonos: form.telefonos.value ? form.telefonos.value.split(',').map(t => t.trim()).filter(Boolean) : []
  };

  if (!data.nombre || !data.ciudad) {
    alert('Por favor, completa los campos obligatorios (Nombre y Ciudad).');
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
    return;
  }

  const url = id ? `/api/suplidores/${id}` : '/api/suplidores';
  const method = id ? 'PUT' : 'POST';

  try {
    const resp = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(id ? { id: parseInt(id), ...data } : data)
    });
    if (!resp.ok) {
      throw new Error(`HTTP error! status: ${resp.status}`);
    }
    alert(id ? 'Suplidor actualizado exitosamente!' : 'Suplidor creado exitosamente!');
    location.href = 'index.html';
  } catch (error) {
    console.error('Error saving supplier:', error);
    alert(id ? 'Error al actualizar el suplidor. Por favor, intenta de nuevo.' : 'Error al crear el suplidor. Por favor, intenta de nuevo.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});

setMode();
