import api from './api';

export const messageService = {
  send: async (receiverId, content, bookingId = null) => {
    const response = await api.post('/messages/send', { receiverId, content, bookingId });
    return response.data;
  },

  getConversation: async (userId) => {
    const response = await api.get(`/messages/conversation/${userId}`);
    return response.data;
  },

  getUnread: async () => {
    const response = await api.get('/messages/unread');
    return response.data;
  },

  markAsRead: async (messageId) => {
    await api.put(`/messages/${messageId}/read`);
  },

  markAllAsRead: async () => {
    await api.put('/messages/read-all');
  },
};
