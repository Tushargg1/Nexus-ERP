import client from './client'

export const customersAPI = {
  getAll: (params) => client.get('/customers', { params }),
  getById: (id) => client.get(`/customers/${id}`),
  create: (data) => client.post('/customers', data),
  update: (id, data) => client.put(`/customers/${id}`, data),
  delete: (id) => client.delete(`/customers/${id}`),
  getLedger: (id, params) => client.get(`/customers/${id}/ledger`, { params }),
  getOutstanding: (id) => client.get(`/customers/${id}/outstanding`),
  getDues: (params) => client.get('/customers/dues', { params }),
}
