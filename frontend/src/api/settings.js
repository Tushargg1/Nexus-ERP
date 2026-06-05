import client from './client'

export const settingsAPI = {
  getCompanyInfo: () => client.get('/settings/company'),
  updateCompanyInfo: (data) => client.put('/settings/company', data),
  getUsers: () => client.get('/settings/users'),
  createUser: (data) => client.post('/settings/users', data),
  updateUser: (id, data) => client.put(`/settings/users/${id}`, data),
  deleteUser: (id) => client.delete(`/settings/users/${id}`),
  getPreferences: () => client.get('/settings/preferences'),
  updatePreferences: (data) => client.put('/settings/preferences', data),
}
