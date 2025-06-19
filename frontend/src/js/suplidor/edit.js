const form = document.getElementById('supplierForm');
const params = new URLSearchParams(window.location.search);
const id = params.get('id');

async function load() {
  const resp = await fetch(`/api/suplidores/${id}`);
  if (!resp.ok) return;
  const s = await resp.json();
  form.nombre.value = s.nombre;
  form.ciudad.value = s.ciudad;
  form.direccion.value = s.direccion;
  form.email.value = s.email;
  form.rnc.value = s.rNC;
  form.ncf.value = s.nCF;
  form.telefonos.value = (s.telefonos || []).join(', ');
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  const data = {
    id,
    nombre: form.nombre.value,
    ciudad: form.ciudad.value,
    direccion: form.direccion.value,
    email: form.email.value,
    rNC: form.rnc.value,
    nCF: form.ncf.value,
    telefonos: form.telefonos.value.split(',').map(t => t.trim()).filter(Boolean)
  };
  await fetch(`/api/suplidores/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  location.href = 'index.html';
});

load();
