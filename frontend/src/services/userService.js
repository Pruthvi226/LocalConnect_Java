import api from './api';

export const userService = {
  getMe: async () => {
    const response = await api.get('/Users/me');
    return response.data;
  },

  updateMe: async (UserData) => {
    const response = await api.put('/Users/me', UserData);
    return response.data;
  },
};

