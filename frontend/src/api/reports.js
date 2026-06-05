import client from './client'

export const reportsAPI = {
  getSales: (params) =>
    client.get('/reports/sales', { params, responseType: params.format ? 'blob' : 'json' }),
  getPurchases: (params) =>
    client.get('/reports/purchases', { params, responseType: params.format ? 'blob' : 'json' }),
  getInventory: (params) =>
    client.get('/reports/inventory', { params, responseType: params.format ? 'blob' : 'json' }),
  getProfitLoss: (params) =>
    client.get('/reports/profit-loss', { params, responseType: params.format ? 'blob' : 'json' }),
  getSalary: (params) =>
    client.get('/reports/salary', { params, responseType: params.format ? 'blob' : 'json' }),
  getSupplier: (params) =>
    client.get('/reports/supplier', { params, responseType: params.format ? 'blob' : 'json' }),
  getCustomer: (params) =>
    client.get('/reports/customer', { params, responseType: params.format ? 'blob' : 'json' }),
}
