import api from './api'

const debtService = {
  list: (params = {}) => api.get('/debts/', { params }),
  forStudent: (studentId) => api.get(`/debts/${studentId}/`),
}

export default debtService
