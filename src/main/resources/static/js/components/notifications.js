// Toast Notification Component
class ToastManager {
    constructor() {
        this.toasts = [];
        this.container = null;
        this.init();
    }
    
    init() {
        this.createContainer();
    }
    
    createContainer() {
        // Create container if it doesn't exist
        this.container = document.getElementById('toastContainer');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toastContainer';
            this.container.className = 'fixed top-4 right-4 z-50 space-y-2';
            document.body.appendChild(this.container);
        }
    }
    
    show(message, type = 'info', duration = 5000) {
        const toast = this.createToast(message, type, duration);
        this.toasts.push(toast);
        this.container.appendChild(toast.element);
        
        // Animate in
        setTimeout(() => {
            toast.element.classList.remove('transform', 'translate-x-full', 'opacity-0');
            toast.element.classList.add('translate-x-0', 'opacity-100');
        }, 100);
        
        // Auto remove
        if (duration > 0) {
            setTimeout(() => {
                this.remove(toast.id);
            }, duration);
        }
        
        return toast.id;
    }
    
    createToast(message, type, duration) {
        const id = Date.now() + Math.random();
        
        const typeConfig = {
            success: {
                bgColor: 'bg-green-500',
                icon: 'fa-check-circle',
                textColor: 'text-white'
            },
            error: {
                bgColor: 'bg-red-500',
                icon: 'fa-exclamation-circle',
                textColor: 'text-white'
            },
            warning: {
                bgColor: 'bg-yellow-500',
                icon: 'fa-exclamation-triangle',
                textColor: 'text-white'
            },
            info: {
                bgColor: 'bg-blue-500',
                icon: 'fa-info-circle',
                textColor: 'text-white'
            }
        };
        
        const config = typeConfig[type] || typeConfig.info;
        
        const element = document.createElement('div');
        element.className = `${config.bgColor} ${config.textColor} px-6 py-4 rounded-lg shadow-lg max-w-md transform transition-all duration-300 translate-x-full opacity-0`;
        
        element.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${config.icon} mr-3 text-lg flex-shrink-0"></i>
                <span class="text-sm font-medium flex-1">${message}</span>
                <button type="button" class="ml-4 ${config.textColor} hover:opacity-70 flex-shrink-0" onclick="toastManager.remove('${id}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        return {
            id,
            element,
            type,
            message,
            duration
        };
    }
    
    remove(id) {
        const toastIndex = this.toasts.findIndex(t => t.id === id);
        if (toastIndex === -1) return;
        
        const toast = this.toasts[toastIndex];
        
        // Animate out
        toast.element.classList.remove('translate-x-0', 'opacity-100');
        toast.element.classList.add('translate-x-full', 'opacity-0');
        
        // Remove from DOM and array
        setTimeout(() => {
            if (toast.element.parentNode) {
                toast.element.parentNode.removeChild(toast.element);
            }
            this.toasts.splice(toastIndex, 1);
        }, 300);
    }
    
    removeAll() {
        this.toasts.forEach(toast => {
            this.remove(toast.id);
        });
    }
    
    // Convenience methods
    success(message, duration = 5000) {
        return this.show(message, 'success', duration);
    }
    
    error(message, duration = 7000) {
        return this.show(message, 'error', duration);
    }
    
    warning(message, duration = 6000) {
        return this.show(message, 'warning', duration);
    }
    
    info(message, duration = 5000) {
        return this.show(message, 'info', duration);
    }
}

// Create global instance
const toastManager = new ToastManager();

// Global function for easy access
window.showToast = (message, type = 'info', duration = 5000) => {
    return toastManager.show(message, type, duration);
};

// Export for modules
window.ToastManager = ToastManager;
window.toastManager = toastManager;