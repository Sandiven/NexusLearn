import api from './api.js'

const TOKEN_KEY = 'nx_token'

// ── Token helpers ─────────────────────────────────────────
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token)
export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const removeToken = () => localStorage.removeItem(TOKEN_KEY)
export const isAuthenticated = () => Boolean(getToken())

// ── signup ────────────────────────────────────────────────
export const signup = async ({ username, email, password, confirmPassword }) => {
  const { data } = await api.post('/auth/signup', {
    username,
    email,
    password,
    confirmPassword,
  })
  setToken(data.token)
  return data
}

// ── login ─────────────────────────────────────────────────
export const login = async ({ email, password }) => {
  const { data } = await api.post('/auth/login', { email, password })
  setToken(data.token)
  return data
}

// ── getCurrentUser ────────────────────────────────────────
export const getCurrentUser = async () => {
  const { data } = await api.get('/auth/me')
  return data.user
}

// ── logout ────────────────────────────────────────────────
export const logout = () => {
  removeToken()
}
