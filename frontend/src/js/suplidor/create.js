const form = document.getElementById('supplierForm');

form.addEventListener('submit', async e => {
  e.preventDefault();
  
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  
  // Disable button and show loading state
  submitBtn.disabled = true;
  submitBtn.textContent = 'Guardando...';
  
  try {
    const data = {
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
    
    const response = await fetch('/api/suplidores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    alert('Suplidor creado exitosamente!');
    location.href = 'index.html';
    
  } catch (error) {
    console.error('Error creating supplier:', error);
    alert('Error al crear el suplidor. Por favor, intenta de nuevo.');
  } finally {
    // Re-enable button
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});
