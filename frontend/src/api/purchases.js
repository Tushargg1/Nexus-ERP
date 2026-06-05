import client from './client'

export const purchasesAPI = {
  getAll: (params) => client.get('/purchases', { params }),
  getById: (id) => client.get(`/purchases/${id}`),
  create: (data) => client.post('/purchases', data),
  recordPayment: (id, data) => client.post(`/purchases/${id}/payment`, data),
  getInvoicePdf: (id) =>
    client.get(`/purchases/${id}/invoice`, { responseType: 'blob' }),
}
