import client from './client'

export const dashboardAPI = {
  getStats: () => client.get('/dashboard/stats'),
  getCharts: (params) => client.get('/dashboard/charts', { params }),
  getAlerts: () => client.get('/dashboard/alerts'),
  getRecentTransactions: () => client.get('/dashboard/recent'),
}
