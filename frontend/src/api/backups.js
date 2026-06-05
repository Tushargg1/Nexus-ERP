import client from './client'

export const backupsAPI = {
  getAll: () => client.get('/backup'),
  trigger: () => client.post('/backup'),
  download: (id) =>
    client.get(`/backup/download/${id}`, { responseType: 'blob' }),
}
