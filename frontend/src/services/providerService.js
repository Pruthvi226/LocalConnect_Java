import api from './api';

export const providerService = {
  getSummary: async () => {
    const response = await api.get('/provider/summary');
    return response.data;
  },

  getMyServices: async () => {
    const response = await api.get('/provider/services');
    return response.data;
  },

  getProviderBookings: async () => {
    const response = await api.get('/provider/bookings');
    return response.data;
  },

  updateBookingStatus: async (id, status, notes, beforeImageUrl, afterImageUrl) => {
    const response = await api.put(`/provider/bookings/${id}`, null, {
      params: { 
        status, 
        notes: notes || '',
        beforeImageUrl: beforeImageUrl || '',
        afterImageUrl: afterImageUrl || ''
      },
    });
    return response.data;
  },
};
