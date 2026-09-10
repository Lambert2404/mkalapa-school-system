import api from './api'

const settingsService = {
  get: () => api.get('/settings/'),
  update: (data) => api.put('/settings/', data),
  templates: () => api.get('/settings/templates/'),
  updateTemplate: (id, data) => api.put(`/settings/templates/${id}/`, data),
  createTemplate: (data) => api.post('/settings/templates/', data),
}

export default settingsService
