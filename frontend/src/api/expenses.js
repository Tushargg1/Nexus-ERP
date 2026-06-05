import client from './client'

export const expensesAPI = {
  getAll: (params) => client.get('/expenses', { params }),
  create: (data) => client.post('/expenses', data),
  update: (id, data) => client.put(`/expenses/${id}`, data),
  delete: (id) => client.delete(`/expenses/${id}`),
  getSummary: (params) => client.get('/expenses/summary', { params }),
  getMonthly: (params) => client.get('/expenses/monthly', { params }),
}
