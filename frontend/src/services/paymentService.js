import api from './api';

export const paymentService = {
  getByBooking: async (bookingId) => {
    const response = await api.get(`/payments/booking/${bookingId}`);
    return response.data;
  },

  createStripeIntent: async (bookingId) => {
    const response = await api.post('/payments/stripe/create-intent', { bookingId });
    return response.data;
  },

  createPayPalOrder: async (bookingId) => {
    const response = await api.post('/payments/paypal/create-order', { bookingId });
    return response.data;
  },

  capturePayPalOrder: async (orderId) => {
    const response = await api.post('/payments/paypal/capture', { orderId });
    return response.data;
  },

  processLegacy: async (bookingId, paymentMethod, transactionId) => {
    const response = await api.post('/payments/process', {
      bookingId,
      paymentMethod,
      transactionId,
    });
    return response.data;
  },
};
