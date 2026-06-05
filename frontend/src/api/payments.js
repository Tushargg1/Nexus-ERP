import client from './client'

export const paymentsAPI = {
  getAll: (params) => client.get('/payments', { params }),
  create: (data) => client.post('/payments', data),
  getPending: (params) => client.get('/payments/pending', { params }),
  getSummary: (params) => client.get('/payments/summary', { params }),
}
