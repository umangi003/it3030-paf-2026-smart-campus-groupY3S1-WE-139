import api from './axiosInstance'

export const bookingApi = {
  create:     (data)        => api.post('/bookings', data),
  getMy:      ()            => api.get('/bookings/my'),
  getAll:     (status)      => api.get('/bookings', { params: status ? { status } : {} }),
  getById:    (id)          => api.get(`/bookings/${id}`),
  cancel:     (id)          => api.patch(`/bookings/${id}/cancel`),
  delete:     (id)          => api.delete(`/bookings/${id}`),
  generateQR: (id)          => api.post(`/bookings/${id}/qr`),
  approve:    (id)          => api.patch(`/bookings/${id}/approve`),
  reject:     (id, reason)  => api.patch(`/bookings/${id}/reject`, { reason }),
}