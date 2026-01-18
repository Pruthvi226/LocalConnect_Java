import api from './api';

export const serviceService = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    const response = await api.get(`/services?${params.toString()}`);
    return response.data;
  },

  search: async (query) => {
    const response = await api.get(`/services/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/services/categories');
    return response.data;
  },

  create: async (serviceData) => {
    const response = await api.post('/services', serviceData);
    return response.data;
  },

  update: async (id, serviceData) => {
    const response = await api.put(`/services/${id}`, serviceData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/services/${id}`);
    return response.data;
  },
};
