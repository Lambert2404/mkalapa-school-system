import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Central error normalization so pages can show one consistent friendly message.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      error.friendlyMessage = 'Unable to reach the server. Please check your connection and try again.'
    } else {
      const data = error.response.data
      if (typeof data === 'string') {
        error.friendlyMessage = data
      } else if (data?.error) {
        error.friendlyMessage = data.error
      } else if (data?.detail) {
        error.friendlyMessage = data.detail
      } else if (data && typeof data === 'object') {
        const firstKey = Object.keys(data)[0]
        const firstVal = Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey]
        error.friendlyMessage = firstKey === 'non_field_errors' ? firstVal : `${firstKey}: ${firstVal}`
      } else {
        error.friendlyMessage = 'Something went wrong. Please try again.'
      }
    }
    return Promise.reject(error)
  }
)

export default api
