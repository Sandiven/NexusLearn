import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Request interceptor: attach JWT ──────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nx_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor: global error handling ──────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status

    if (status === 401) {
      // Token expired or invalid — clear auth and redirect to login.
      // Guard: if we're already on /login or /signup, do NOT redirect
      // again — this prevents the infinite loop caused by background
      // pollers (e.g. notification bell) firing 401s after logout.
      const currentPath = window.location.pathname
      const onAuthPage =
        currentPath === '/login' ||
        currentPath === '/signup' ||
        currentPath === '/'

      if (!onAuthPage) {
        localStorage.removeItem('nx_token')
        window.location.href = '/login'
      }
    }

    if (status === 403) {
      console.warn('Nexus Learn: Access forbidden')
    }

    if (status >= 500) {
      console.error('Nexus Learn: Server error', error.response?.data)
    }

    return Promise.reject(error)
  }
)

export default api

// ── Typed helpers ────────────────────────────────────────
export const get = (url, params) => api.get(url, { params })
export const post = (url, data) => api.post(url, data)
export const put = (url, data) => api.put(url, data)
export const patch = (url, data) => api.patch(url, data)
export const del = (url) => api.delete(url)
