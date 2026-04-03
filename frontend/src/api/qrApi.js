import api from './axiosInstance'

export const qrApi = {
  verify: (token) => api.get(`/qr/verify/${token}`),
}
