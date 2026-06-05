import client from './client'

export const rawMaterialsAPI = {
  getAll: (params) => client.get('/raw-materials', { params }),
  getById: (id) => client.get(`/raw-materials/${id}`),
  create: (data) => client.post('/raw-materials', data),
  update: (id, data) => client.put(`/raw-materials/${id}`, data),
  delete: (id) => client.delete(`/raw-materials/${id}`),
  getLowStock: () => client.get('/raw-materials/low-stock'),
  adjust: (id, data) => client.post(`/raw-materials/${id}/adjust`, data),
}
