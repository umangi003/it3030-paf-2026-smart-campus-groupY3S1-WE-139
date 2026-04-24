import api from './axiosInstance'

export const incidentApi = {
  create: (data) => api.post('/incidents', data),
  getAll: () => api.get('/incidents'),
  getMy: () => api.get('/incidents/my'),
  getById: (id) => api.get(`/incidents/${id}`),
  updateStatus: (id, status) => api.patch(`/incidents/${id}/status?status=${status}`),
  assign: (id, userId) => api.patch(`/incidents/${id}/assign?userId=${userId}`),
  reject: (id, reason) => api.patch(`/incidents/${id}/reject?reason=${encodeURIComponent(reason)}`),
  uploadAttachments: (id, files) => {
    const formData = new FormData()
    files.forEach(f => formData.append('files', f))
    return api.post(`/incidents/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  deleteIncident: (id) => api.delete(`/incidents/${id}`),

  // Comments
    getComments: (incidentId) => api.get(`/incidents/${incidentId}/comments`),
    addComment: (incidentId, content) => api.post(`/incidents/${incidentId}/comments`, { content }),
    editComment: (commentId, content) => api.put(`/comments/${commentId}`, { content }),
    deleteComment: (commentId) => api.delete(`/comments/${commentId}`),
}
