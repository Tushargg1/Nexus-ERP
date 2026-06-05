import client from './client'

export const salariesAPI = {
  generate: (data) => client.post('/salaries/generate', data),
  getAll: (params) => client.get('/salaries', { params }),
  markPaid: (id, data) => client.post(`/salaries/${id}/paid`, data),
  getSalarySlipPdf: (id) =>
    client.get(`/salaries/${id}/slip`, { responseType: 'blob' }),
  getSummary: (params) => client.get('/salaries/summary', { params }),
}
