import api from './api';

const buildQuery = (filters = {}) => {
  const params = new URLSearchParams();
  Object.keys(filters).forEach((key) => {
    const value = filters[key];
    if (value !== null && value !== undefined && value !== '') {
      params.append(key, value);
    }
  });
  const query = params.toString();
  return query ? `/services?${query}` : '/services';
};

export const serviceService = {
  getAll: async (filters = {}) => {
    const response = await api.get(buildQuery(filters));
    // Backend returns Page<ServiceDto>, so we need .content
    return response.data.content || response.data;
  },

  getAllWithFilters: async (filters = {}) => {
    const response = await api.get(buildQuery(filters));
    return response.data.content || response.data;
  },

  getAllPaginated: async (filters = {}) => {
    const response = await api.get(buildQuery(filters));
    return response.data;
  },

  getRecommendations: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      const value = filters[key];
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value);
      }
    });
    const query = params.toString();
    const endpoint = query ? `/services/recommend?${query}` : '/services/recommend';
    const response = await api.get(endpoint);
    return response.data.content || response.data;
  },

  getRecommendationsPaginated: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      const value = filters[key];
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value);
      }
    });
    const query = params.toString();
    const endpoint = query ? `/services/recommend?${query}` : '/services/recommend';
    const response = await api.get(endpoint);
    return response.data;
  },

  search: async (query) => {
    const response = await api.get(`/services/search?q=${encodeURIComponent(query)}`);
    return response.data.content || response.data;
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
