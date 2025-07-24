// Sidebar Component
class SidebarComponent {
    constructor() {
        this.isOpen = false;
        this.isMobile = window.innerWidth < 1024;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.handleResize();
    }
    
    setupEventListeners() {
        // Menu toggle button
        const menuBtn = document.getElementById('menuBtn');
        if (menuBtn) {
            menuBtn.addEventListener('click', () => this.toggle());
        }
        
        // Close button
        const closeSidebarBtn = document.getElementById('closeSidebarBtn');
        if (closeSidebarBtn) {
            closeSidebarBtn.addEventListener('click', () => this.close());
        }
        
        // Overlay click
        const overlay = document.getElementById('overlay');
        if (overlay) {
            overlay.addEventListener('click', () => this.close());
        }
        
        // Window resize
        window.addEventListener('resize', () => this.handleResize());
        
        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen && this.isMobile) {
                this.close();
            }
        });
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    open() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('overlay');
        
        if (sidebar && overlay) {
            sidebar.classList.remove('-translate-x-full');
            overlay.classList.remove('hidden');
            this.isOpen = true;
            
            // Prevent body scroll on mobile
            if (this.isMobile) {
                document.body.style.overflow = 'hidden';
            }
        }
    }
    
    close() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('overlay');
        
        if (sidebar && overlay) {
            sidebar.classList.add('-translate-x-full');
            overlay.classList.add('hidden');
            this.isOpen = false;
            
            // Restore body scroll
            document.body.style.overflow = '';
        }
    }
    
    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth < 1024;
        
        // If switching from mobile to desktop, close sidebar
        if (wasMobile && !this.isMobile && this.isOpen) {
            this.close();
        }
        
        // Auto-open on desktop if not mobile
        if (!this.isMobile) {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.classList.remove('-translate-x-full');
            }
        }
    }
    
    setActiveItem(href) {
        // Remove active class from all items
        const navItems = document.querySelectorAll('#sidebar nav a');
        navItems.forEach(item => {
            item.classList.remove('bg-brand-brown', 'text-white');
            item.classList.add('text-gray-700', 'hover:bg-gray-100');
        });
        
        // Add active class to current item
        const activeItem = document.querySelector(`#sidebar nav a[href="${href}"]`);
        if (activeItem) {
            activeItem.classList.remove('text-gray-700', 'hover:bg-gray-100');
            activeItem.classList.add('bg-brand-brown', 'text-white');
        }
    }
    
    highlightCurrentPage() {
        const currentPath = window.location.pathname;
        this.setActiveItem(currentPath);
    }
}

// User info and logout functionality
class UserComponent {
    constructor() {
        this.currentUser = null;
        this.init();
    }
    
    init() {
        this.loadUserInfo();
        this.setupLogout();
    }
    
    loadUserInfo() {
        // This would normally load from authentication service
        const welcomeMessage = document.getElementById('welcomeMessage');
        const roleInfo = document.getElementById('roleInfo');
        
        if (welcomeMessage && roleInfo) {
            // Simulate user data - replace with actual auth service call
            const userData = this.getCurrentUser();
            welcomeMessage.textContent = `Bienvenido, ${userData.name}`;
            roleInfo.textContent = userData.role;
        }
    }
    
    getCurrentUser() {
        // Simulate getting user data from localStorage or API
        return {
            name: 'Usuario Admin',
            role: 'Administrador',
            avatar: 'https://ui-avatars.com/api/?name=Usuario&background=59391B&color=fff'
        };
    }
    
    setupLogout() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }
    
    logout() {
        if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            // Clear user data
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            
            // Redirect to login
            window.location.href = '/pages/login.html';
        }
    }
}

// Export for use in main modules
window.SidebarComponent = SidebarComponent;
window.UserComponent = UserComponent;