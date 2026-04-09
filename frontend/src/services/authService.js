import api from './api';

export const authService = {
  register: async (UserData) => {
    const response = await api.post('/auth/register', UserData);
    return response.data;
  },

  registerUser: async (UserData) => {
    const { role, ...rest } = UserData;
    const response = await api.post('/auth/register/customer', rest);
    return response.data;
  },

  registerProvider: async (UserData) => {
    const { role, ...rest } = UserData;
    const response = await api.post('/auth/register/provider', rest);
    return response.data;
  },

  login: async (username, password, rememberMe = false) => {
    const response = await api.post('/auth/login', { username, password });
    if (response.data.token) {
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('auth_token', response.data.token);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  isAuthenticated: () => {
    return !!(localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token'));
  },

  getToken: () => {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  },
};

