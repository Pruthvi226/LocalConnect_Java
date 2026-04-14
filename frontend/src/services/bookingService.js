import api from './api';

export const bookingService = {
  getAll: async (params = {}) => {
    const response = await api.get('/bookings', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  getUserBookings: async (page = 0, size = 10) => {
    const response = await api.get(`/bookings/user?page=${page}&size=${size}&sort=createdAt,desc`);
    return response.data;
  },

  create: async (serviceId, bookingDate, notes, isEmergency, problemImageUrl, paymentMethod) => {
    // Format date for Spring Boot LocalDateTime: YYYY-MM-DDTHH:mm:ss
    let formattedDate = bookingDate;
    if (bookingDate instanceof Date) {
      formattedDate = bookingDate.toISOString().split('.')[0];
    } else if (typeof bookingDate === 'string' && bookingDate.includes('Z')) {
      formattedDate = bookingDate.split('.')[0];
    }
    
    const payload = {
      serviceId,
      bookingDate: formattedDate,
      notes: notes || '',
      isEmergency: isEmergency || false,
      problemImageUrl: problemImageUrl || '',
      paymentMethod: paymentMethod || 'ONLINE'
    };
    const response = await api.post('/bookings', payload);
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

  cancelPost: async (bookingId) => {
    const response = await api.post('/bookings/cancel', { bookingId });
    return response.data;
  },

  getInvoice: async (id) => {
    const response = await api.get(`/bookings/${id}/invoice`, {
      responseType: 'blob'
    });
    return response.data;
  },

  proposePrice: async (id, price) => {
    const response = await api.post(`/bookings/${id}/propose-price`, { price });
    return response.data;
  },

  acceptPrice: async (id) => {
    const response = await api.post(`/bookings/${id}/accept-price`);
    return response.data;
  },

  complete: async (id, paymentStatus = 'PAID') => {
    const response = await api.put(`/bookings/${id}/complete`, { paymentStatus });
    return response.data;
  },
};

