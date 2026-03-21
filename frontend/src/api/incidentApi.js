import api from './axiosInstance'

export const incidentApi = {
  create: (data) => api.post('/incidents', data),
  getAll: () => api.get('/incidents'),
  getMy: () => api.get('/incidents/my'),
  getById: (id) => api.get(`/incidents/${id}`),
  updateStatus: (id, status) => api.patch(`/incidents/${id}/status?status=${status}`),
  assign: (id, userId) => api.patch(`/incidents/${id}/assign?userId=${userId}`),
}
