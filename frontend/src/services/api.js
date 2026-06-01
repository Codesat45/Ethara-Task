import axios from 'axios'

// Normalize the API URL — always ensure it ends with /api/v1
function resolveApiUrl() {
  let url = import.meta.env.VITE_API_URL || ''

  // If env var is set but missing the /api/v1 prefix, add it
  if (url && !url.includes('/api/v1')) {
    url = url.replace(/\/$/, '') + '/api/v1'
  }

  // If no env var at all, use hostname-based detection at runtime
  if (!url) {
    if (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) {
      url = 'https://ethara-task-3597.onrender.com/api/v1'
    } else {
      url = 'http://localhost:8000/api/v1'
    }
  }

  return url
}

const API_URL = resolveApiUrl()

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Normalize error messages
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login'
      }
    }
    const detail = error.response?.data?.detail
    const message =
      typeof detail === 'object' ? detail?.message || JSON.stringify(detail)
      : typeof detail === 'string' ? detail
      : error.message || 'An unexpected error occurred'
    return Promise.reject(new Error(message))
  }
)

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
}

export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
}

export const customerAPI = {
  getAll: (params) => api.get('/customers', { params }),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
}

export const orderAPI = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  delete: (id) => api.delete(`/orders/${id}`),
}

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
}

export default api
