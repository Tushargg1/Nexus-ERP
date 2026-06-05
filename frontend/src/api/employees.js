import client from './client'

export const employeesAPI = {
  getAll: (params) => client.get('/employees', { params }),
  getById: (id) => client.get(`/employees/${id}`),
  create: (data) => client.post('/employees', data),
  update: (id, data) => client.put(`/employees/${id}`, data),
  delete: (id) => client.delete(`/employees/${id}`),
}
