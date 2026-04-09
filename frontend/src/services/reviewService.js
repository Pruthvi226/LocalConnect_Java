import api from './api';

export const reviewService = {
  getByService: async (serviceId) => {
    const response = await api.get(`/reviews/service/${serviceId}`);
    return response.data;
  },

  create: async (serviceId, rating, comment) => {
    const response = await api.post('/reviews', null, {
      params: {
        serviceId,
        rating,
        comment: comment || '',
      },
    });
    return response.data;
  },

  update: async (id, rating, comment) => {
    const response = await api.put(`/reviews/${id}`, null, {
      params: {
        rating,
        comment: comment || '',
      },
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  },
};

