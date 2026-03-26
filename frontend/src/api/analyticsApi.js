import api from './axiosInstance'

export const analyticsApi = {
  getSummary: () => api.get('/analytics/summary'),
}
