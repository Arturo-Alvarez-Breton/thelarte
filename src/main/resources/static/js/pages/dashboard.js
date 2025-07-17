document.addEventListener('DOMContentLoaded', () => {
  console.log('Dashboard loading...');
  
  // Check if user is authenticated using local storage
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.log('No valid token found, redirecting to login');
    window.location.href = '/pages/login.html';
    return;
  }
  console.log('Token found, loading dashboard...');

  // Mobile sidebar toggle functionality
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.getElementById('sidebar');
  const closeSidebarBtn = document.getElementById('closeSidebarBtn');
  const overlay = document.getElementById('overlay');
  
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      sidebar.classList.add('open');
      overlay.classList.remove('hidden');
    });
  }
  
  if (closeSidebarBtn) {
    closeSidebarBtn.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.add('hidden');
    });
  }
  
  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.add('hidden');
    });
  }
    console.log('User authenticated successfully');

  // Display welcome message
  const welcomeMessage = document.getElementById('welcomeMessage');
  const userEmail = localStorage.getItem('userEmail') || 'Usuario';
  
  if (welcomeMessage) {
    welcomeMessage.textContent = `Bienvenido, ${userEmail}`;
  }
  
  // Add role information if element exists
  const roleInfo = document.getElementById('roleInfo');
  if (roleInfo) {
    roleInfo.textContent = 'Usuario';
  }

  console.log('Dashboard initialized successfully for user:', userEmail);

  // Logout functionality
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        // Clear authentication data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
        
        // Redirect to login
        window.location.href = '/pages/login.html';
      }
    });
  }

  // Load dashboard data
  loadDashboardData();
});

// Function to load dashboard data
function loadDashboardData() {
  console.log('Loading dashboard data...');
  
  // Check user role to determine which metrics to load
  const userRoles = JSON.parse(localStorage.getItem('userRoles') || '[]');
  
  // Load compras metrics if user has COMPRAS_SUPLIDOR role
  if (userRoles.includes('COMPRAS_SUPLIDOR')) {
    showComprasMetrics();
    loadComprasMetrics();
  }
  
  // For demonstration, we'll set some example data for general metrics
  setTimeout(() => {
    // Update stats
    const totalSales = document.getElementById('totalSales');
    const newOrders = document.getElementById('newOrders');
    const pendingDeliveries = document.getElementById('pendingDeliveries');
    const revenue = document.getElementById('revenue');
    
    if (totalSales) totalSales.textContent = '125';
    if (newOrders) newOrders.textContent = '18';
    if (pendingDeliveries) pendingDeliveries.textContent = '7';
    if (revenue) revenue.textContent = 'RD$58,425';
    
    console.log('Dashboard data loaded');
  }, 500);
}

// Function to load compras metrics
async function loadComprasMetrics() {
  console.log('Loading compras metrics...');
  
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch('/api/compras/metricas', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener métricas de compras');
    }
    
    const metricas = await response.json();
    
    // Update compras metrics in dashboard
    updateComprasMetrics(metricas);
    
    console.log('Compras metrics loaded successfully');
  } catch (error) {
    console.error('Error loading compras metrics:', error);
    // Show mock data if API fails
    const mockMetrics = {
      totalOrdenes: 45,
      ordenesPendientes: 12,
      ordenesConfirmadas: 8,
      ordenesRecibidas: 25,
      totalGastado: 125430.50,
      periodo: 'Últimos 30 días'
    };
    updateComprasMetrics(mockMetrics);
  }
}

// Function to update compras metrics in the dashboard
function updateComprasMetrics(metricas) {
  const totalOrdenes = document.getElementById('totalOrdenesCompra');
  const ordenesPendientes = document.getElementById('ordenesPendientes');
  const ordenesConfirmadas = document.getElementById('ordenesConfirmadas');
  const totalGastado = document.getElementById('totalGastado');
  
  if (totalOrdenes) totalOrdenes.textContent = metricas.totalOrdenes;
  if (ordenesPendientes) ordenesPendientes.textContent = metricas.ordenesPendientes;
  if (ordenesConfirmadas) ordenesConfirmadas.textContent = metricas.ordenesConfirmadas;
  if (totalGastado) totalGastado.textContent = formatearMoneda(metricas.totalGastado);
  
  // Update period info
  const periodoInfo = document.getElementById('periodoCompras');
  if (periodoInfo) periodoInfo.textContent = metricas.periodo;
}

// Function to format currency
function formatearMoneda(cantidad) {
  if (!cantidad && cantidad !== 0) return 'RD$ 0,00';
  
  const numero = Math.abs(cantidad);
  const partes = numero.toFixed(2).split('.');
  const entero = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const decimal = partes[1];
  
  return `RD$ ${entero},${decimal}`;
}

// Function to show compras metrics card
function showComprasMetrics() {
  const comprasMetrics = document.getElementById('comprasMetrics');
  if (comprasMetrics) {
    comprasMetrics.classList.remove('hidden');
  }
}
