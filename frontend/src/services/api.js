import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration and global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check for systemic authentication failure
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_token');
      
      // Only redirect if not already on login/register pages to avoid loops
      const currentPath = window.location.pathname;
      const publicPaths = ['/', '/login', '/register', '/landing', '/role-selection',
        '/login/customer', '/login/provider', '/register/customer', '/register/provider'];
      const isPublic = publicPaths.some(p => currentPath === p || currentPath.startsWith(p + '/'));
      if (!isPublic) {
        window.location.href = '/login';
      }
    }
    
    // Log error for debugging in production-simulated environment
    if (process.env.NODE_ENV === 'development') {
        console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, error.response?.data || error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;

