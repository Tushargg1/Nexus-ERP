import client from './client'

export const attendanceAPI = {
  markAttendance: (data) => client.post('/attendance', data),
  getAttendance: (params) => client.get('/attendance', { params }),
  getSummary: (params) => client.get('/attendance/summary', { params }),
  bulkMark: (data) => client.post('/attendance/bulk', data),
}
