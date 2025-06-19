document.addEventListener('DOMContentLoaded', async function () {
    try {
        const response = await fetch('/pages/structure/sidebar.html');
        if (!response.ok) throw new Error('No se pudo cargar sidebar.html');
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
    } catch (error) {
        console.error('🛑 Error cargando el sidebar:', error);
    }
});