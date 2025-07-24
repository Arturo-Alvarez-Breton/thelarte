const productList = document.getElementById('productList');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const tipoFilter = document.getElementById('tipoFilter');

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '/pages/login.html';
        return;
    }

    verifyToken(token);

    const welcomeMessage = document.getElementById('welcomeMessage');
    const userEmail = localStorage.getItem('userEmail') || 'Usuario';

    if (welcomeMessage) {
        welcomeMessage.textContent = `Bienvenido, ${userEmail}`;
    }

    const roleInfo = document.getElementById('roleInfo');
    if (roleInfo) {
        roleInfo.textContent = 'Usuario';
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('userEmail');
                window.location.href = '/pages/login.html';
            }
        });
    }

    // Delegación de eventos para eliminar producto SOLO se registra una vez aquí
    productList.addEventListener('click', e => {
        if (e.target.classList.contains('delete')) {
            e.preventDefault();
            e.stopPropagation();
            console.log("Click eliminar!", e.target.dataset.id);
            deleteProduct(e.target.dataset.id);
        }
    });

    // Filtros dinámicos
    if (searchInput) {
        searchInput.addEventListener('input', () => loadProducts());
    }
    if (tipoFilter) {
        tipoFilter.addEventListener('change', () => loadProducts());
    }

    loadProducts();
});

async function loadProducts() {
    try {
        const token = localStorage.getItem('authToken');
        let url = '/api/productos';

        // Opcional: Filtro por tipo
        const tipo = tipoFilter ? tipoFilter.value : '';
        const search = searchInput ? searchInput.value.trim().toLowerCase() : '';

        // Realiza la petición principal
        const resp = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!resp.ok) {
            throw new Error(`HTTP error! status: ${resp.status}`);
        }
        let data = await resp.json();

        // Filtrado en el cliente por tipo y búsqueda
        if (tipo) {
            data = data.filter(p => p.tipo && p.tipo.toLowerCase() === tipo.toLowerCase());
        }
        if (search) {
            data = data.filter(p =>
                (p.nombre && p.nombre.toLowerCase().includes(search)) ||
                (p.descripcion && p.descripcion.toLowerCase().includes(search))
            );
        }

        if (data.length === 0) {
            productList.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        productList.innerHTML = data.map(p => `
      <div class="flex flex-col md:flex-row md:items-center md:justify-between bg-white rounded-xl shadow p-6 hover:shadow-lg transition">
        <div class="flex items-center gap-6 flex-1">
          <img src="${p.fotoUrl || '/images/product-placeholder.png'}" alt="${p.nombre || 'Producto'}"
               class="w-32 h-24 object-cover rounded-xl border border-gray-200 bg-gray-100" />
          <div>
            <h3 class="font-serif text-xl font-bold text-[#7b5222]">${p.nombre || 'Sin nombre'}</h3>
            <p class="text-sm text-gray-500 font-serif mt-1">${p.descripcion || ''}</p>
            <span class="inline-block mt-2 text-[#59391B] font-bold font-serif text-lg">$${p.precioVenta ? Number(p.precioVenta).toLocaleString('es-DO', { minimumFractionDigits: 2 }) : '0.00'}</span>
          </div>
        </div>
        <div class="flex flex-row md:flex-col gap-2 mt-4 md:mt-0 md:ml-8">
            <a href="form.html?id=${p.id}"
               class="text-blue-600 hover:text-blue-800 px-3 py-1 rounded-md hover:bg-blue-50 transition-colors">Editar</a>
            <button type="button" data-id="${p.id}" 
                class="delete text-red-600 hover:text-red-800 px-3 py-1 rounded-md hover:bg-red-50 transition-colors">Eliminar</button>
            <a href="/pages/unidades/index.html?productoId=${p.id}"
               class="text-blue-600 hover:text-blue-800 px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"> Unidades</a>
        </div>
      </div>
    `).join('');
    } catch (error) {
        console.error('Error loading products:', error);
        alert('Error al cargar los productos. Por favor, intenta de nuevo.');
    }
}

async function deleteProduct(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return;

    try {
        const token = localStorage.getItem('authToken');
        const resp = await fetch(`/api/productos/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!resp.ok) {
            throw new Error(`HTTP error! status: ${resp.status}`);
        }
        await loadProducts();
        alert('Producto eliminado exitosamente.');
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error al eliminar el producto. Por favor, intenta de nuevo.');
    }
}

/**
 * Verifica si el token es válido haciendo una petición al endpoint de validación
 * @param {string} token Token JWT a verificar
 */
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
    loadProducts()
}