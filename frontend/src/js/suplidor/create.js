const form = document.getElementById('supplierForm');

form.addEventListener('submit', async e => {
  e.preventDefault();
  const data = {
    nombre: form.nombre.value,
    ciudad: form.ciudad.value,
    direccion: form.direccion.value,
    email: form.email.value,
    rNC: form.rnc.value,
    nCF: form.ncf.value,
    telefonos: form.telefonos.value.split(',').map(t => t.trim()).filter(Boolean)
  };
  await fetch('/api/suplidores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  location.href = 'index.html';
});
