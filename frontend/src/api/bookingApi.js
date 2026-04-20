import api from './axiosInstance'

export const bookingApi = {
  create:     (data)        => api.post('/bookings', data),
  getMy:      ()            => api.get('/bookings/my'),
  getAll:     (status)      => api.get('/bookings', { params: status ? { status } : {} }),  // Fix 3
  getById:    (id)          => api.get(`/bookings/${id}`),
  cancel:     (id)          => api.patch(`/bookings/${id}/cancel`),
  generateQR: (id)          => api.post(`/bookings/${id}/qr`),
  approve:    (id)          => api.patch(`/bookings/${id}/approve`),          // Fix 2
  reject:     (id, reason)  => api.patch(`/bookings/${id}/reject`, { reason }), // Fix 2
}