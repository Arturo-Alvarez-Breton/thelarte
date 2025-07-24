// Header Component
class HeaderComponent {
    constructor(options = {}) {
        this.title = options.title || 'Módulo de Sistema';
        this.subtitle = options.subtitle || 'Gestión integral';
        this.showNotifications = options.showNotifications !== false;
        this.showUserMenu = options.showUserMenu !== false;
        
        this.notifications = [];
        this.userMenuOpen = false;
        
        this.init();
    }
    
    init() {
        this.loadNotifications();
        this.setupEventListeners();
        this.updateHeader();
    }
    
    setupEventListeners() {
        // Notification button
        const notificationBtn = document.getElementById('notificationBtn');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', () => this.toggleNotifications());
        }
        
        // User menu button
        const userMenuBtn = document.getElementById('userMenuBtn');
        if (userMenuBtn) {
            userMenuBtn.addEventListener('click', () => this.toggleUserMenu());
        }
        
        // Close menus when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#notificationBtn') && !e.target.closest('#notificationMenu')) {
                this.closeNotifications();
            }
            if (!e.target.closest('#userMenuBtn') && !e.target.closest('#userMenu')) {
                this.closeUserMenu();
            }
        });
        
        // Search functionality
        const searchInput = document.getElementById('globalSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }
    }
    
    updateHeader() {
        const titleElement = document.querySelector('header h1');
        const subtitleElement = document.querySelector('header p');
        
        if (titleElement) titleElement.textContent = this.title;
        if (subtitleElement) subtitleElement.textContent = this.subtitle;
    }
    
    setTitle(title, subtitle = null) {
        this.title = title;
        if (subtitle) this.subtitle = subtitle;
        this.updateHeader();
    }
    
    loadNotifications() {
        // Simulate loading notifications - replace with actual API call
        this.notifications = [
            {
                id: 1,
                message: 'Nueva transacción pendiente de aprobación',
                type: 'warning',
                timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
                read: false
            },
            {
                id: 2,
                message: 'Compra #1234 completada exitosamente',
                type: 'success',
                timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
                read: false
            },
            {
                id: 3,
                message: 'Inventario bajo en producto Mesa Ejecutiva',
                type: 'alert',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                read: true
            }
        ];
        
        this.updateNotificationBadge();
    }
    
    updateNotificationBadge() {
        const badge = document.querySelector('#notificationBtn .notification-badge');
        const unreadCount = this.notifications.filter(n => !n.read).length;
        
        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount > 9 ? '9+' : unreadCount.toString();
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
    }
    
    toggleNotifications() {
        const menu = document.getElementById('notificationMenu');
        if (menu) {
            const isHidden = menu.classList.contains('hidden');
            if (isHidden) {
                this.openNotifications();
            } else {
                this.closeNotifications();
            }
        }
    }
    
    openNotifications() {
        const menu = document.getElementById('notificationMenu');
        if (menu) {
            menu.classList.remove('hidden');
            this.renderNotifications();
        }
    }
    
    closeNotifications() {
        const menu = document.getElementById('notificationMenu');
        if (menu) {
            menu.classList.add('hidden');
        }
    }
    
    renderNotifications() {
        const container = document.getElementById('notificationList');
        if (!container) return;
        
        if (this.notifications.length === 0) {
            container.innerHTML = `
                <div class="p-4 text-center text-gray-500">
                    <i class="fas fa-bell-slash text-2xl mb-2"></i>
                    <p class="text-sm">No hay notificaciones</p>
                </div>
            `;
            return;
        }
        
        const notificationsHtml = this.notifications.map(notification => {
            const typeColors = {
                'success': 'text-green-600',
                'warning': 'text-yellow-600',
                'alert': 'text-red-600',
                'info': 'text-blue-600'
            };
            
            const typeIcons = {
                'success': 'fa-check-circle',
                'warning': 'fa-exclamation-triangle',
                'alert': 'fa-exclamation-circle',
                'info': 'fa-info-circle'
            };
            
            return `
                <div class="notification-item p-3 hover:bg-gray-50 border-b border-gray-100 ${!notification.read ? 'bg-blue-50' : ''}" 
                     onclick="headerComponent.markAsRead(${notification.id})">
                    <div class="flex items-start">
                        <i class="fas ${typeIcons[notification.type]} ${typeColors[notification.type]} mt-1 mr-3"></i>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm text-gray-800 ${!notification.read ? 'font-medium' : ''}">${notification.message}</p>
                            <p class="text-xs text-gray-500 mt-1">${this.formatTimestamp(notification.timestamp)}</p>
                        </div>
                        ${!notification.read ? '<div class="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-2"></div>' : ''}
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = `
            <div class="max-h-64 overflow-y-auto">
                ${notificationsHtml}
            </div>
            <div class="p-3 border-t border-gray-200 bg-gray-50">
                <button onclick="headerComponent.markAllAsRead()" class="text-sm text-brand-brown hover:text-brand-brown-light font-medium">
                    Marcar todas como leídas
                </button>
            </div>
        `;
    }
    
    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.updateNotificationBadge();
            this.renderNotifications();
        }
    }
    
    markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
        this.updateNotificationBadge();
        this.renderNotifications();
    }
    
    addNotification(message, type = 'info') {
        const newNotification = {
            id: Date.now(),
            message,
            type,
            timestamp: new Date(),
            read: false
        };
        
        this.notifications.unshift(newNotification);
        this.updateNotificationBadge();
        
        // Auto-remove after 5 minutes if not important
        if (type === 'info') {
            setTimeout(() => {
                this.removeNotification(newNotification.id);
            }, 5 * 60 * 1000);
        }
    }
    
    removeNotification(notificationId) {
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        this.updateNotificationBadge();
        this.renderNotifications();
    }
    
    toggleUserMenu() {
        this.userMenuOpen = !this.userMenuOpen;
        const menu = document.getElementById('userMenu');
        if (menu) {
            menu.classList.toggle('hidden', !this.userMenuOpen);
        }
    }
    
    closeUserMenu() {
        this.userMenuOpen = false;
        const menu = document.getElementById('userMenu');
        if (menu) {
            menu.classList.add('hidden');
        }
    }
    
    handleSearch(query) {
        if (query.length < 2) return;
        
        // Implement global search functionality
        console.log('Searching for:', query);
        
        // This would normally search across different modules
        // For now, just show a toast
        if (window.showToast) {
            window.showToast(`Buscando: "${query}"`, 'info');
        }
    }
    
    formatTimestamp(timestamp) {
        const now = new Date();
        const diff = now - timestamp;
        
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (minutes < 1) return 'Ahora mismo';
        if (minutes < 60) return `Hace ${minutes} min`;
        if (hours < 24) return `Hace ${hours}h`;
        if (days < 7) return `Hace ${days}d`;
        
        return timestamp.toLocaleDateString('es-ES');
    }
    
    updateUserInfo(userData) {
        const userAvatar = document.getElementById('userAvatar');
        const userName = document.getElementById('userName');
        
        if (userAvatar) {
            userAvatar.src = userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=59391B&color=fff`;
        }
        
        if (userName) {
            userName.textContent = userData.name || 'Usuario';
        }
    }
}

// Breadcrumb Component
class BreadcrumbComponent {
    constructor() {
        this.breadcrumbs = [];
        this.init();
    }
    
    init() {
        this.updateFromPath();
    }
    
    updateFromPath() {
        const path = window.location.pathname;
        const segments = path.split('/').filter(segment => segment);
        
        this.breadcrumbs = [];
        
        // Build breadcrumbs from path segments
        let currentPath = '';
        segments.forEach((segment, index) => {
            currentPath += '/' + segment;
            
            const breadcrumb = {
                name: this.formatSegmentName(segment),
                path: currentPath,
                isLast: index === segments.length - 1
            };
            
            this.breadcrumbs.push(breadcrumb);
        });
        
        this.render();
    }
    
    formatSegmentName(segment) {
        const nameMap = {
            'pages': 'Inicio',
            'contabilidad': 'Contabilidad',
            'transaccion': 'Transacciones',
            'producto': 'Productos',
            'cliente': 'Clientes',
            'suplidor': 'Suplidores',
            'empleado': 'Empleados',
            'index': 'Lista',
            'form': 'Formulario',
            'edit': 'Editar',
            'detalle': 'Detalles'
        };
        
        return nameMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    }
    
    setBreadcrumbs(breadcrumbs) {
        this.breadcrumbs = breadcrumbs;
        this.render();
    }
    
    addBreadcrumb(name, path) {
        this.breadcrumbs.forEach(b => b.isLast = false);
        this.breadcrumbs.push({
            name,
            path,
            isLast: true
        });
        this.render();
    }
    
    render() {
        const container = document.getElementById('breadcrumbContainer');
        if (!container || this.breadcrumbs.length === 0) return;
        
        const breadcrumbsHtml = this.breadcrumbs.map((crumb, index) => {
            if (crumb.isLast) {
                return `<span class="text-gray-500">${crumb.name}</span>`;
            } else {
                return `
                    <a href="${crumb.path}" class="text-brand-brown hover:text-brand-brown-light">
                        ${crumb.name}
                    </a>
                    <i class="fas fa-chevron-right text-gray-400 mx-2"></i>
                `;
            }
        }).join('');
        
        container.innerHTML = `
            <nav class="flex items-center text-sm mb-4">
                <i class="fas fa-home text-gray-400 mr-2"></i>
                ${breadcrumbsHtml}
            </nav>
        `;
    }
}

// Export components
window.HeaderComponent = HeaderComponent;
window.BreadcrumbComponent = BreadcrumbComponent;