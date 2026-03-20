import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '@store/authStore'
import * as authService from '@services/authService'

/**
 * useAuth — UI-layer auth hook
 * Wraps the Zustand authStore actions with local loading + error state
 * for form feedback.
 */
export function useAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const storeLogin = useAuthStore((s) => s.login)
  const storeRegister = useAuthStore((s) => s.register)
  const storeLogout = useAuthStore((s) => s.logout)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)

  const clearError = useCallback(() => setError(null), [])

  // ── login ───────────────────────────────────────────────
  const login = useCallback(
    async (credentials) => {
      setLoading(true)
      setError(null)
      try {
        const result = await storeLogin(credentials)
        if (result.success) {
          navigate('/dashboard', { replace: true })
        } else {
          setError(result.message)
        }
      } catch {
        setError('Something went wrong. Please try again.')
      } finally {
        setLoading(false)
      }
    },
    [storeLogin, navigate]
  )

  // ── signup ──────────────────────────────────────────────
  const signup = useCallback(
    async (userData) => {
      setLoading(true)
      setError(null)
      try {
        const result = await storeRegister(userData)
        if (result.success) {
          navigate('/dashboard', { replace: true })
        } else {
          setError(result.message)
        }
      } catch {
        setError('Something went wrong. Please try again.')
      } finally {
        setLoading(false)
      }
    },
    [storeRegister, navigate]
  )

  // ── logout ──────────────────────────────────────────────
  const logout = useCallback(() => {
    storeLogout()
    authService.logout()
    navigate('/', { replace: true })
  }, [storeLogout, navigate])

  return { login, signup, logout, loading, error, clearError, isAuthenticated, user }
}
