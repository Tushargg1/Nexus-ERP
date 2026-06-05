import client from './client'

export const authAPI = {
  login: (email, password) =>
    client.post('/auth/login', { email, password }),

  logout: () =>
    client.post('/auth/logout'),

  me: () =>
    client.get('/auth/me'),

  changePassword: (data) =>
    client.post('/auth/change-password', data),
}
