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
    const token = localStorage.getItem('authToken');
    const resp = await fetch(`/api/suplidores/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!resp.ok) {
      throw new Error(`HTTP error! status: ${resp.status}`);
    }
    const s = await resp.json();
    form.nombre.value = s.nombre || '';
    
    // Wait for provinces to load before setting the value
    if (form.ciudad.disabled) {
      await cargarProvincias();
    }
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
    alert('Por favor, completa los campos obligatorios (Nombre y Provincia).');
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
    return;
  }

  const url = id ? `/api/suplidores/${id}` : '/api/suplidores';
  const method = id ? 'PUT' : 'POST';
  const token = localStorage.getItem('authToken');

  try {
    const resp = await fetch(url, {
      method,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(id ? { id: parseInt(id, 10), ...data } : data)
    });
    
    if (!resp.ok) {
      throw new Error(`HTTP error! status: ${resp.status}`);
    }
    
    const savedData = await resp.json();
    console.log('Suplidor guardado:', savedData);
    
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

/**
 * Verifica si el token es válido haciendo una petición al endpoint de validación
 * @param {string} token Token JWT a verificar
 */
// Cargar provincias desde API Digital.gob.do
async function cargarProvincias() {
  const ciudadSelect = document.getElementById('ciudad');
  ciudadSelect.innerHTML = '<option value="">Cargando provincias...</option>';
  ciudadSelect.disabled = true;
  
  try {
    const resp = await fetch('https://api.digital.gob.do/v1/territories/provinces');
    if (!resp.ok) throw new Error('Error al obtener provincias');
    const json = await resp.json();
    
    ciudadSelect.innerHTML = '<option value="">Seleccione una provincia</option>';
    if (Array.isArray(json.data)) {
      json.data.forEach(prov => {
        const opt = document.createElement('option');
        opt.value = prov.name;
        opt.textContent = prov.name;
        ciudadSelect.appendChild(opt);
      });
    }
    ciudadSelect.disabled = false;
  } catch (err) {
    ciudadSelect.innerHTML = '<option value="">Error cargando provincias</option>';
    console.error("Error cargando provincias:", err);
    ciudadSelect.disabled = true;
  }
}

async function verifyToken(token) {
  try {
    const resp = await fetch('/api/dashboard/validate', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!resp.ok) {
      console.log('Token validation failed');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
      window.location.href = '/pages/login.html';
      return false;
    }
    
    const data = await resp.json();
    console.log('Token validation successful:', data);
    return data.authorized;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
}

// Código para manejar navegación móvil y autenticación
document.addEventListener('DOMContentLoaded', () => {
  // Check if user is authenticated using local storage
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.log('No valid token found, redirecting to login');
    window.location.href = '/pages/login.html';
    return;
  }
  
  // Verificación adicional: Comprobar validez del token con el servidor
  verifyToken(token);


  // Display welcome message
  const welcomeMessage = document.getElementById('welcomeMessage');
  const userEmail = localStorage.getItem('userEmail') || 'Usuario';
  
  if (welcomeMessage) {
    welcomeMessage.textContent = `Bienvenido, ${userEmail}`;
  }
  
  // Add role information if element exists
  const roleInfo = document.getElementById('roleInfo');
  if (roleInfo) {
    roleInfo.textContent = 'Usuario';
  }

  // Logout functionality
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        // Clear authentication data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
        
        // Redirect to login
        window.location.href = '/pages/login.html';
      }
    });
  }

  // Cargar provincias antes de configurar el formulario
  await cargarProvincias();
  
  // Inicializar configuración del formulario
  setMode();
});
