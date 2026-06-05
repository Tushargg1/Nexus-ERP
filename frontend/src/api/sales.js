import client from './client'

export const salesAPI = {
  getAll: (params) => client.get('/sales', { params }),
  getById: (id) => client.get(`/sales/${id}`),
  create: (data) => client.post('/sales', data),
  recordPayment: (id, data) => client.post(`/sales/${id}/payment`, data),
  getInvoicePdf: (id) =>
    client.get(`/sales/${id}/invoice`, { responseType: 'blob' }),
}
