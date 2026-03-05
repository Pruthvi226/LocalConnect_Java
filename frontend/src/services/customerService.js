import api from './api';

export const customerService = {
  getSummary: async () => {
    const response = await api.get('/customer/summary');
    return response.data;
  },
};
