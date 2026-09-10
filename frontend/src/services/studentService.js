import api from './api'

const studentService = {
  list: (params = {}) => api.get('/students/', { params }),
  get: (id) => api.get(`/students/${id}/`),
  profile: (id) => api.get(`/students/${id}/profile/`),
  create: (data) => api.post('/students/', data),
  update: (id, data) => api.put(`/students/${id}/`, data),
  remove: (id) => api.delete(`/students/${id}/`),
}

export default studentService
