import api from './api'

const contributionService = {
  list: (params = {}) => api.get('/contributions/', { params }),
  get: (id) => api.get(`/contributions/${id}/`),
  create: (data) => api.post('/contributions/', data),
  update: (id, data) => api.put(`/contributions/${id}/`, data),
  remove: (id) => api.delete(`/contributions/${id}/`),
  spreadsheet: (params = {}) => api.get('/contributions/spreadsheet/', { params }),
  bulkUpdate: (rows) => api.post('/contributions/bulk-update/', { rows }),
}

export default contributionService
