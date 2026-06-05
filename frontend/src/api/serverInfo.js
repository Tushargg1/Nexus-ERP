import client from './client'

export const serverInfoAPI = {
  // Returns the server's LAN IP addresses and access URLs
  get: () => client.get('/server-info'),
}
