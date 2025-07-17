document.addEventListener('DOMContentLoaded', async function () {
    try {
        const response = await fetch('/pages/structure/sidebar-compras.html');
        if (!response.ok) throw new Error('No se pudo cargar sidebar-compras.html');
        const data = await response.text();

        // Inserta al principio del body
        const temp = document.createElement('div');
        temp.innerHTML = data;
        document.body.prepend(temp);

        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        const openBtn = document.getElementById('openSidebarBtn');
        const closeBtn = document.getElementById('closeSidebarBtn');

        function openSidebar() {
            sidebar.classList.remove('-translate-x-full');
            overlay.classList.remove('hidden');
            openBtn.classList.add('hidden');
        }
        function closeSidebar() {
            sidebar.classList.add('-translate-x-full');
            overlay.classList.add('hidden');
            openBtn.classList.remove('hidden');
        }

        if (openBtn) openBtn.addEventListener('click', openSidebar);
        if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
        if (overlay) overlay.addEventListener('click', closeSidebar);

        // Asegura que al recargar la página, el sidebar esté cerrado y el botón visible
        closeSidebar();

        const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
        if (sidebarLogoutBtn) {
            sidebarLogoutBtn.addEventListener('click', () => {
                if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userEmail');
                    localStorage.removeItem('userRoles');
                    window.location.href = '/pages/login.html';
                }
            });
        }
        
        const sidebarUserEmail = document.getElementById('sidebarUserEmail');
        const sidebarUserRole = document.getElementById('sidebarUserRole');
        if (sidebarUserEmail) {
            sidebarUserEmail.textContent = localStorage.getItem('userEmail') || 'Usuario';
        }
        if (sidebarUserRole) {
            sidebarUserRole.textContent = 'Compras - Suplidor';
        }
    } catch (error) {
        console.error('🛑 Error cargando el sidebar de compras:', error);
    }
});