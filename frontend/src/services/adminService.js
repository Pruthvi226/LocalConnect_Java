import api from './api';

export const adminService = {
  getAnalytics: async () => {
    const response = await api.get('/admin/analytics');
    return response.data;
  },

  getAllUsers: async () => {
    const response = await api.get('/admin/Users');
    return response.data;
  },

  getAllBookings: async () => {
    const response = await api.get('/admin/bookings');
    return response.data;
  },
};

