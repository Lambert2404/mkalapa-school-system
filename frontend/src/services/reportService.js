import api from './api'

const reportService = {
  monthly: (params = {}) => api.get('/reports/monthly/', { params }),
  debts: (params = {}) => api.get('/reports/debts/', { params }),
  sms: (params = {}) => api.get('/reports/sms/', { params }),
  completed: (params = {}) => api.get('/reports/completed/', { params }),
  dashboard: (params = {}) => api.get('/dashboard/', { params }),
}

export default reportService
