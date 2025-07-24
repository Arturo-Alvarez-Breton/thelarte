// src/main/resources/static/js/contabilidad/contabilidad-router.js

import { sidebarComponent } from '../components/sidebar.js';
import { headerComponent } from '../components/header.js';

const loadingOverlay = document.getElementById('loadingOverlay');
const mainContent = document.getElementById('cont-main-content');

// Function to attach event listeners to wizard buttons
function attachWizardButtonListeners() {
    document.querySelectorAll('[data-action="open-wizard"]').forEach(button => {
        button.onclick = (event) => {
            const type = event.currentTarget.dataset.type;
            if (window.openTransactionWizard) {
                window.openTransactionWizard(type);
            } else {
                console.error('openTransactionWizard is not defined.');
            }
        };
    });
}

export async function loadContabilidadPage(url) {
    if (!mainContent) {
        console.error('Main content area not found. Ensure an element with id "cont-main-content" exists.');
        return;
    }

    loadingOverlay.classList.remove('hidden'); // Show loading overlay

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const html = await response.text();

        // Parse the fetched HTML to extract the <section> content
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newSection = doc.querySelector('section'); // Assuming the content is within a <section>

        if (newSection) {
            // Apply slide-out animation to current content
            mainContent.classList.add('overlay-exit');
            mainContent.classList.remove('overlay-enter');

            // Wait for animation to complete before changing content
            mainContent.addEventListener('animationend', () => {
                mainContent.innerHTML = ''; // Clear existing content
                mainContent.appendChild(newSection);
                attachWizardButtonListeners(); // Attach listeners after content is added

                // Apply slide-in animation to new content
                mainContent.classList.remove('overlay-exit');
                mainContent.classList.add('overlay-enter');
            }, { once: true }); // Ensure the event listener is removed after it fires
        } else {
            mainContent.innerHTML = `<p class="text-red-500">Error: No se encontró la sección principal en la página cargada.</p>`;
            console.error('No main section found in the fetched HTML for URL:', url);
        }

    } catch (error) {
        console.error('Error loading contabilidad page:', error);
        mainContent.innerHTML = `<p class="text-red-500">Error al cargar la página: ${error.message}</p>`;
    } finally {
        loadingOverlay.classList.add('hidden'); // Hide loading overlay
    }
}

export function setupContabilidadNavigation() {
    document.querySelectorAll('.group a[href^="/pages/contabilidad/"]').forEach(link => {
        link.addEventListener('click', async (event) => {
            event.preventDefault();
            const url = event.currentTarget.getAttribute('href');
            
            history.pushState(null, '', url);
            await loadContabilidadPage(url);
            sidebarComponent.highlightCurrentPage(url);
            headerComponent.updateTitleAndSubtitle(url);
        });
    });

    // Handle browser back/forward buttons
    window.addEventListener('popstate', (event) => {
        const url = window.location.pathname;
        if (url.startsWith('/pages/contabilidad/')) {
            loadContabilidadPage(url);
            sidebarComponent.highlightCurrentPage(url);
            headerComponent.updateTitleAndSubtitle(url);
        }
    });

    // Initial load based on current URL
    const initialUrl = window.location.pathname;
    if (initialUrl.startsWith('/pages/contabilidad/')) {
        loadContabilidadPage(initialUrl);
        sidebarComponent.highlightCurrentPage(initialUrl);
        headerComponent.updateTitleAndSubtitle(initialUrl);
    }
    attachWizardButtonListeners(); // Attach listeners on initial load as well
}