import api from './api';

export const UserService = {
  getSummary: async () => {
    const response = await api.get('/customer/summary');
    return response.data;
  },
};

