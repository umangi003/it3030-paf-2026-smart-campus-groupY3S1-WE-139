import api from './axiosInstance'

export const bookingApi = {
  create: (data) => api.post('/bookings', data),
  getAll: () => api.get('/bookings'),
  getMy: () => api.get('/bookings/my'),
  getById: (id) => api.get(`/bookings/${id}`),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`),
  generateQR: (id) => api.post(`/bookings/${id}/qr`),
  verifyQR: (token) => api.get(`/qr/verify/${token}`),
}
