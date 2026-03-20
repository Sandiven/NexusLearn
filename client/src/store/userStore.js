import { create } from 'zustand'
import api from '@services/api'

const useUserStore = create((set) => ({
  // ── State ────────────────────────────────────────────
  profile: null,
  xp: 0,
  coins: 0,
  level: 1,
  streak: 0,
  achievements: [],
  subjects: [],
  isLoading: false,
  error: null,

  // ── Actions ──────────────────────────────────────────
  fetchProfile: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await api.get('/users/profile')
      set({ profile: data, isLoading: false })
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load profile', isLoading: false })
    }
  },

  updateProfile: async (updates) => {
    set({ isLoading: true })
    try {
      const { data } = await api.put('/users/profile', updates)
      set({ profile: data, isLoading: false })
      return { success: true }
    } catch (err) {
      set({ isLoading: false })
      return { success: false, message: err.response?.data?.message }
    }
  },

  // Optimistic XP update — synced with server in feature logic
  addXP: (amount) => set((state) => ({ xp: state.xp + amount })),
  addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),

  reset: () =>
    set({ profile: null, xp: 0, coins: 0, level: 1, streak: 0, achievements: [], subjects: [] }),
}))

export default useUserStore
