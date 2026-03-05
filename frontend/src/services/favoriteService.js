import api from './api';

export const favoriteService = {
  getAll: async () => {
    const response = await api.get('/favorites');
    return response.data;
  },

  add: async (serviceId) => {
    const response = await api.post(`/favorites/${serviceId}`);
    return response.data;
  },

  remove: async (serviceId) => {
    await api.delete(`/favorites/${serviceId}`);
  },

  check: async (serviceId) => {
    const response = await api.get(`/favorites/check/${serviceId}`);
    return response.data?.isFavorite ?? false;
  },
};
