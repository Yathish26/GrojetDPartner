// API Configuration
const API_CONFIG = {
  BASE_URL: 'http://192.168.1.35:5000', // Use your computer's IP address instead of localhost
  ENDPOINTS: {
    // Delivery agent auth (using Bearer tokens for React Native)
    DELIVERY_LOGIN: '/delivery/auth/login',
    DELIVERY_LOGOUT: '/delivery/auth/logout',
    DELIVERY_PROFILE: '/delivery/auth/profile',
    DELIVERY_STATUS_TOGGLE: '/delivery/auth/status/toggle',
    DELIVERY_LOCATION: '/delivery/auth/location',
    DELIVERY_EARNINGS_UPDATE: '/delivery/auth/earnings/update',
    
    // Admin auth
    ADMIN_LOGIN: '/admin/auth/login',
    
    // Admin dashboard
    ADMIN_DASHBOARD_STATS: '/admin/dashboard/stats',
    
    // Admin user management
    ADMIN_USERS: '/admin/users',
    ADMIN_USER_STATUS: '/admin/users/:id/status',
    ADMIN_USER_DELETE: '/admin/users/:id',
    
    // Admin delivery agent management
    ADMIN_DELIVERY_AGENTS: '/admin/delivery-agents',
    ADMIN_DELIVERY_AGENT_APPROVE: '/admin/delivery-agents/:id/approve',
    ADMIN_DELIVERY_AGENT_REJECT: '/admin/delivery-agents/:id/reject',
    ADMIN_DELIVERY_AGENT_STATUS: '/admin/delivery-agents/:id/status',
    ADMIN_DELIVERY_AGENT_DELETE: '/admin/delivery-agents/:id',
    
    // Admin order management
    ADMIN_ORDERS: '/admin/orders',
    ADMIN_ORDER_STATUS: '/admin/orders/:id/status',
    ADMIN_ORDER_ASSIGN: '/admin/orders/:id/assign',
    
    // Admin merchant management
    ADMIN_MERCHANTS: '/admin/merchants',
    ADMIN_MERCHANT_APPROVE: '/admin/merchants/:id/approve',
    ADMIN_MERCHANT_REJECT: '/admin/merchants/:id/reject',
    ADMIN_MERCHANT_STATUS: '/admin/merchants/:id/status',
    ADMIN_MERCHANT_DELETE: '/admin/merchants/:id',
    
    // Admin category management
    ADMIN_CATEGORIES: '/admin/categories',
    ADMIN_CATEGORY_CREATE: '/admin/categories',
    ADMIN_CATEGORY_UPDATE: '/admin/categories/:id',
    ADMIN_CATEGORY_DELETE: '/admin/categories/:id',
    
    // Admin product management
    ADMIN_PRODUCTS: '/admin/products',
    ADMIN_PRODUCT_STATUS: '/admin/products/:id/status',
    ADMIN_PRODUCT_DELETE: '/admin/products/:id',
    
    // Inventory management
    INVENTORY_ALL: '/inventory/all',
    INVENTORY_ADD: '/inventory/add',
    INVENTORY_DELETE: '/inventory/delete',
    INVENTORY_EDIT: '/inventory/edit',
    INVENTORY_STATS: '/inventory/stats/summary',
    INVENTORY_LOW_STOCK: '/inventory/alerts/low-stock',
  }
};

// Helper function to make authenticated requests for React Native
export const makeAuthenticatedRequest = async (endpoint, options = {}) => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  console.log('Making request to:', url);
  console.log('Request options:', options);
  
  // Get token from secure storage
  const { getToken } = await import('../utils/AuthManager.js');
  const token = await getToken();
  
  console.log('Using token:', token ? 'Token present' : 'No token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    console.log('Final request options:', finalOptions);
    const response = await fetch(url, finalOptions);
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (!response.ok) {
      console.error('HTTP error! status:', response.status);
      const errorText = await response.text();
      console.error('Error response body:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Parsed response data:', data);
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export default API_CONFIG;
