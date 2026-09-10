import api from './api'

const smsService = {
  history: (params = {}) => api.get('/sms/', { params }),
  sendOne: (payload) => api.post('/sms/send/', payload),
  sendBulk: (payload) => api.post('/sms/send-bulk/', payload),
  preview: (payload) => api.post('/sms/preview/', payload),
}

export default smsService
