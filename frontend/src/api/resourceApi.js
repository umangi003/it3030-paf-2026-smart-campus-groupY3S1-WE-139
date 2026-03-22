import api from './axiosInstance'

export const resourceApi = {
  getAll: () => api.get('/resources'),
  getAvailable: () => api.get('/resources/available'),
  getById: (id) => api.get(`/resources/${id}`),
  search: (name) => api.get(`/resources/search?name=${name}`),
  create: (data) => api.post('/resources', data),
  update: (id, data) => api.put(`/resources/${id}`, data),
  delete: (id) => api.delete(`/resources/${id}`),
}
