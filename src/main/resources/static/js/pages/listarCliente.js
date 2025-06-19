// Ejemplo de datos estáticos; reemplazar o comentar cuando haya fetch real.
const clientesData = [
    // { id: 1, nombre: "Juan", apellido: "Pérez", telefono: "809-123-4567" },
    // { id: 2, nombre: "María", apellido: "Gómez", telefono: "849-987-6543" },
];

// Función para renderizar la tabla
function renderClientes(data) {
    const tbody = document.getElementById('clientesBody');
    const emptyMsg = document.getElementById('emptyMessage');
    tbody.innerHTML = '';
    if (!data || data.length === 0) {
        emptyMsg.classList.remove('hidden');
        tbody.innerHTML = '';
        return;
    }
    emptyMsg.classList.add('hidden');
    data.forEach(cliente => {
        const tr = document.createElement('tr');
        tr.classList.add('border-b');
        tr.innerHTML = `
          <td class="px-4 py-2">${cliente.id}</td>
          <td class="px-4 py-2">${cliente.nombre}</td>
          <td class="px-4 py-2">${cliente.apellido}</td>
          <td class="px-4 py-2">${cliente.telefono || '-'}</td>
          <td class="px-4 py-2 space-x-2">
            <button data-id="${cliente.id}" class="editar-btn text-blue-500 hover:underline">Editar</button>
            <button data-id="${cliente.id}" class="eliminar-btn text-red-500 hover:underline">Eliminar</button>
          </td>
        `;
        tbody.appendChild(tr);
    });
    // Asociar eventos a los botones
    document.querySelectorAll('.editar-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            editCliente(id);
        });
    });
    document.querySelectorAll('.eliminar-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            deleteCliente(id);
        });
    });
}

// Stub: acción al hacer clic “Editar”
function editCliente(id) {
    // Aquí redirigir o abrir modal con formulario de edición
    console.log("Editar cliente con ID:", id);
    // Ejemplo: window.location.href = `/clientes/edit.html?id=${id}`;
}

// Stub: acción al hacer clic “Eliminar”
function deleteCliente(id) {
    // Confirmar y luego llamar al endpoint DELETE
    if (confirm("¿Seguro que deseas eliminar el cliente ID " + id + "?")) {
        console.log("Eliminar cliente con ID:", id);
        // Ejemplo:
        // fetch(`/api/clientes/${id}`, { method: 'DELETE' })
        //   .then(...)
    }
}

// Cargar clientes (por ahora usa datos estáticos)
async function loadClientes() {
    // Si tuvieras un endpoint real:
    // try {
    //   const resp = await fetch('/api/clientes');
    //   if (resp.ok) {
    //     const data = await resp.json();
    //     renderClientes(data);
    //   } else {
    //     console.error('Error al obtener clientes');
    //     renderClientes([]);
    //   }
    // } catch (err) {
    //   console.error('Error de red al cargar clientes', err);
    //   renderClientes([]);
    // }
    // Por ahora:
    renderClientes(clientesData);
}

document.getElementById('btnNuevoCliente').addEventListener('click', () => {
    // Redirigir a formulario de creación de cliente
    console.log("Nuevo cliente");
    // Ejemplo: window.location.href = '/clientes/nuevo.html';
});

document.addEventListener('DOMContentLoaded', loadClientes);