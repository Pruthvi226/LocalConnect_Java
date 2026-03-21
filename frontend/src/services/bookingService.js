import api from './api';

export const bookingService = {
  getAll: async () => {
    const response = await api.get('/bookings');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  create: async (serviceId, bookingDate, notes, isEmergency, problemImageUrl) => {
    const payload = {
      serviceId,
      bookingDate: bookingDate.toISOString().split('.')[0], // Removes .SSSZ for LocalDateTime
      notes: notes || '',
      isEmergency: isEmergency || false,
      problemImageUrl: problemImageUrl || '',
    };
    const response = await api.post('/bookings/create', payload);
    return response.data;
  },

  update: async (id, status, notes) => {
    const response = await api.put(`/bookings/${id}`, null, {
      params: {
        status,
        notes: notes || '',
      },
    });
    return response.data;
  },

  cancel: async (id) => {
    const response = await api.delete(`/bookings/${id}`);
    return response.data;
  },
};
