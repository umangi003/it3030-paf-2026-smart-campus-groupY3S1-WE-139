import api from './axiosInstance'

export const notificationPrefApi = {
  get: () => api.get('/notifications/preferences'),
  update: (data) => api.put('/notifications/preferences', data),
}
