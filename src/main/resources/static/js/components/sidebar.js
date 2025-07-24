// src/main/resources/static/js/components/sidebar.js

export const sidebarComponent = {
    highlightCurrentPage: (currentUrl = window.location.pathname) => {
        document.querySelectorAll('#sidebar nav ul li a').forEach(link => {
            link.classList.remove('bg-brand-light-brown', 'text-white');
            link.classList.add('text-white'); // Ensure default color

            const linkHref = link.getAttribute('href');
            // Normalize URLs for comparison
            const normalizedCurrentUrl = currentUrl.endsWith('/') ? currentUrl.slice(0, -1) : currentUrl;
            const normalizedLinkHref = linkHref.endsWith('/') ? linkHref.slice(0, -1) : linkHref;

            if (normalizedCurrentUrl === normalizedLinkHref) {
                link.classList.add('bg-brand-light-brown', 'text-white');
            } else if (normalizedCurrentUrl.startsWith(normalizedLinkHref + '/') && normalizedLinkHref !== '/pages/contabilidad') {
                // For sub-pages, e.g., /pages/contabilidad/productos should highlight /pages/contabilidad/productos
                link.classList.add('bg-brand-light-brown', 'text-white');
            } else if (normalizedCurrentUrl === '/pages/contabilidad' && normalizedLinkHref === '/pages/contabilidad/index.html') {
                // Special case for /pages/contabilidad/ mapping to index.html
                link.classList.add('bg-brand-light-brown', 'text-white');
            }
        });
    }
};
