import client from './client'

export const productionAPI = {
  getAll: (params) => client.get('/production', { params }),
  getById: (id) => client.get(`/production/${id}`),
  create: (data) => client.post('/production', data),
  advanceStage: (id, data) => client.post(`/production/${id}/advance`, data),
  getActive: () => client.get('/production/active'),
}
