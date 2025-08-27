// src/main/resources/static/js/components/welcomeHeader.js

export class WelcomeHeader {
    constructor() {
        this.userInfo = null;
        this.timeElement = null;
        this.userElement = null;
        this.init();
    }

    async init() {
        await this.loadUserInfo();
        this.updateTime();
        this.startTimeUpdate();
    }

    async loadUserInfo() {
        try {
            const response = await fetch('/api/auth/user-info', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jwt_token') || localStorage.getItem('authToken')}`
                }
            });

            if (response.ok) {
                this.userInfo = await response.json();
                this.render();
            } else {
                console.warn('No se pudo cargar la información del usuario');
                this.userInfo = { username: 'Usuario', roles: ['ADMINISTRADOR'] };
                this.render();
            }
        } catch (error) {
            console.error('Error al cargar información del usuario:', error);
            this.userInfo = { username: 'Usuario', roles: ['ADMINISTRADOR'] };
            this.render();
        }
    }

    updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        const dateString = now.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        if (this.timeElement) {
            this.timeElement.innerHTML = `
                <div class="text-sm text-gray-600">
                    <i class="fas fa-clock mr-1"></i>
                    ${timeString}
                </div>
                <div class="text-xs text-gray-500">
                    ${dateString}
                </div>
            `;
        }
    }

    startTimeUpdate() {
        // Update time every second
        setInterval(() => {
            this.updateTime();
        }, 1000);
    }

    render() {
        // Find the header container - handle different structures
        let headerContainer = document.querySelector('.bg-white.shadow.p-2.md\\:p-3.flex.justify-between.items-center') ||
                             document.querySelector('.bg-white.shadow.p-2.md\\:p-4.flex.justify-between.items-center') ||
                             document.querySelector('.bg-white.shadow.p-4.flex.justify-between.items-center') ||
                             document.querySelector('.bg-white.shadow.p-2.md\\:p-4.flex.flex-col.sm\\:flex-row.justify-between.items-center');

        if (!headerContainer) {
            console.warn('No se encontró el contenedor del header');
            return;
        }

        // Remove existing quick actions
        const quickActionsContainer = headerContainer.querySelector('.grid.grid-cols-2.lg\\:grid-cols-4') ||
                                    headerContainer.querySelector('#cont-quick-actions') ||
                                    headerContainer.querySelector('.flex.flex-wrap.gap-2');
        
        if (quickActionsContainer) {
            quickActionsContainer.remove();
        }

        // Check if this is a flex-col header (like in transacciones.html)
        const isFlexCol = headerContainer.classList.contains('flex-col') || headerContainer.classList.contains('sm:flex-row');
        
        if (isFlexCol) {
            // For flex-col headers, we need to restructure
            const existingContent = headerContainer.innerHTML;
            headerContainer.className = 'bg-white shadow p-2 md:p-4 flex justify-between items-center';
            
            // Create welcome header content
            const welcomeContent = document.createElement('div');
            welcomeContent.className = 'flex-1 flex items-center justify-between';
            welcomeContent.innerHTML = `
                <div class="flex items-center space-x-4">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-brand-brown rounded-full flex items-center justify-center">
                            <i class="fas fa-user text-white text-lg"></i>
                        </div>
                        <div>
                            <h2 class="text-lg font-semibold text-gray-800">
                                ¡Bienvenido, ${this.userInfo?.username || 'Usuario'}!
                            </h2>
                            <p class="text-sm text-gray-600">
                                ${this.getRoleDisplayName(this.userInfo?.roles?.[0] || 'ADMINISTRADOR')}
                            </p>
                        </div>
                    </div>
                </div>
                <div class="flex items-center space-x-4">
                    <div class="text-right" id="welcome-time">
                        <div class="text-sm text-gray-600">
                            <i class="fas fa-clock mr-1"></i>
                            ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                        <div class="text-xs text-gray-500">
                            ${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                    </div>
                </div>
            `;

            headerContainer.innerHTML = '';
            headerContainer.appendChild(welcomeContent);
        } else {
            // For regular headers, replace the quick actions area
            const welcomeContainer = document.getElementById('welcome-header-container');
            if (welcomeContainer) {
                welcomeContainer.innerHTML = `
                    <div class="flex items-center justify-between w-full">
                        <div class="flex items-center space-x-4">
                            <div class="flex items-center space-x-3">
                                <div class="w-10 h-10 bg-brand-brown rounded-full flex items-center justify-center">
                                    <i class="fas fa-user text-white text-lg"></i>
                                </div>
                                <div>
                                    <h2 class="text-lg font-semibold text-gray-800">
                                        ¡Bienvenido, ${this.userInfo?.username || 'Usuario'}!
                                    </h2>
                                    <p class="text-sm text-gray-600">
                                        ${this.getRoleDisplayName(this.userInfo?.roles?.[0] || 'ADMINISTRADOR')}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center space-x-4">
                            <div class="text-right" id="welcome-time">
                                <div class="text-sm text-gray-600">
                                    <i class="fas fa-clock mr-1"></i>
                                    ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </div>
                                <div class="text-xs text-gray-500">
                                    ${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
        }

        // Store references for time updates
        this.timeElement = document.getElementById('welcome-time');
        this.userElement = document.querySelector('h2');
    }

    getRoleDisplayName(role) {
        const roleNames = {
            'ADMINISTRADOR': 'Administrador del Sistema',
            'TI': 'Tecnología de la Información',
            'VENDEDOR': 'Vendedor',
            'CAJERO': 'Cajero',
            'CONTABILIDAD': 'Contabilidad'
        };
        return roleNames[role] || role;
    }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only show welcome header on admin index/home page
    if (window.location.pathname.includes('/pages/admin/index.html') || 
        window.location.pathname === '/pages/admin/' ||
        window.location.pathname === '/pages/admin') {
        new WelcomeHeader();
    }
});
