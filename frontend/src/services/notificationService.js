import api from './api';

export const notificationService = {
  getAll: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  getUnread: async () => {
    const response = await api.get('/notifications/unread');
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data?.count ?? 0;
  },

  markAsRead: async (id) => {
    await api.put(`/notifications/${id}/read`);
  },

  markAllAsRead: async () => {
    await api.put('/notifications/read-all');
  },
};
