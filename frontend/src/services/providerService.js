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

  getProviderBookings: async (params = {}) => {
    const response = await api.get('/provider/bookings', { params });
    return response.data;
  },

  updateBookingStatus: async (id, status, notes, beforeImageUrl, afterImageUrl, providerLat, providerLng, etaMinutes) => {
    const response = await api.put(`/provider/bookings/${id}`, null, {
      params: { 
        status, 
        notes: notes || '',
        beforeImageUrl: beforeImageUrl || '',
        afterImageUrl: afterImageUrl || '',
        providerLat,
        providerLng,
        etaMinutes
      },
    });
    return response.data;
  },

  acceptBooking: async (id) => {
    const response = await api.post(`/bookings/${id}/accept`);
    return response.data;
  },

  rejectBooking: async (id) => {
    const response = await api.post(`/bookings/${id}/reject`);
    return response.data;
  },

  getProviderTransactions: async (params = {}) => {
    const response = await api.get('/provider/transactions', { params });
    return response.data;
  },

  confirmOfflinePayment: async (paymentId) => {
    const response = await api.post(`/payments/offline/confirm/${paymentId}`);
    return response.data;
  },

  completeBooking: async (id, data) => {
    const response = await api.put(`/bookings/${id}/complete`, data);
    return response.data;
  },
  
  getInvoice: async (id) => {
    const response = await api.get(`/bookings/${id}/invoice`, {
      responseType: 'blob'
    });
    return response.data;
  },
};

