import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@services/api'

const TOKEN_KEY = 'nx_token'

const useAuthStore = create(
  persist(
    (set) => ({
      // ── State ────────────────────────────────────────────
      user:            null,
      token:           null,
      isAuthenticated: false,
      isLoading:       false,
      error:           null,

      // ── Register ─────────────────────────────────────────
      register: async (userData) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await api.post('/auth/signup', userData)
          localStorage.setItem(TOKEN_KEY, data.token)
          set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false })
          return { success: true }
        } catch (err) {
          const message = err.response?.data?.message || 'Registration failed'
          set({ error: message, isLoading: false })
          return { success: false, message }
        }
      },

      // ── Login ────────────────────────────────────────────
      login: async (credentials) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await api.post('/auth/login', credentials)
          localStorage.setItem(TOKEN_KEY, data.token)
          set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false })
          return { success: true }
        } catch (err) {
          const message = err.response?.data?.message || 'Login failed'
          set({ error: message, isLoading: false })
          return { success: false, message }
        }
      },

      // ── Logout ───────────────────────────────────────────
      logout: () => {
        localStorage.removeItem(TOKEN_KEY)
        set({ user: null, token: null, isAuthenticated: false, error: null })
      },

      // ── Helpers ──────────────────────────────────────────
      clearError: () => set({ error: null }),
      setUser:    (user) => set({ user }),
    }),
    {
      name: 'nexus-auth',
      partialize: (state) => ({
        token:           state.token,
        user:            state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export default useAuthStore
