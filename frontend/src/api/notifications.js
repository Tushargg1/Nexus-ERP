import client from './client'

export const notificationsAPI = {
  getAll: (params) => client.get('/notifications', { params }),
  markRead: (id) => client.patch(`/notifications/${id}/read`),
  markAllRead: () => client.patch('/notifications/read-all'),
  getUnreadCount: () => client.get('/notifications/unread-count'),
}
