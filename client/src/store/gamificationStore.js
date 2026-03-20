import { create } from 'zustand'
import api from '@services/api'

// ── XP level helpers (mirrors server logic) ──────────────
export function xpForLevel(level) { return level * 250 }

export function totalXpForLevel(level) {
  return (level * (level - 1) * 250) / 2
}

export function getLevelFromXP(totalXP) {
  let level = 1
  while (totalXP >= totalXpForLevel(level + 1)) level++
  return level
}

export function getXPProgress(totalXP) {
  const currentLevel  = getLevelFromXP(totalXP)
  const levelStartXP  = totalXpForLevel(currentLevel)
  const levelEndXP    = totalXpForLevel(currentLevel + 1)
  const xpIntoLevel   = totalXP - levelStartXP
  const xpNeeded      = levelEndXP - levelStartXP
  return {
    currentLevel,
    xpIntoLevel,
    xpNeeded,
    xpToNext:   xpNeeded - xpIntoLevel,
    percentage: Math.min(Math.round((xpIntoLevel / xpNeeded) * 1000) / 10, 100),
  }
}

// ── Streak milestone definitions ─────────────────────────
export const STREAK_MILESTONES = [
  { days: 3,   label: '3-Day Streak',    accent: '#FFB800' },
  { days: 7,   label: 'One Week!',       accent: '#FF6B35' },
  { days: 14,  label: '2-Week Streak',   accent: '#8B5CF6' },
  { days: 30,  label: 'Month Warrior',   accent: '#00F5FF' },
  { days: 100, label: 'Legend',          accent: '#00FF88' },
]

export function getStreakMilestoneLabel(streak) {
  const found = [...STREAK_MILESTONES].reverse().find(m => streak >= m.days)
  return found || null
}

// ── Zustand store ─────────────────────────────────────────
const useGamificationStore = create((set, get) => ({
  // ── State ───────────────────────────────────────────────
  xp:            0,
  coins:         0,
  streak:        0,
  longestStreak: 0,
  level:         1,
  progress:      { currentLevel: 1, xpIntoLevel: 0, xpNeeded: 250, xpToNext: 250, percentage: 0 },
  lastActivityDate: null,
  isLoading:     false,

  // Pending animation queue
  pendingReward: null,   // { xp, coins, event, levelUp }
  levelUpData:   null,   // { fromLevel, toLevel }

  // ── Hydrate from auth store user object ─────────────────
  hydrateFromUser: (user) => {
    if (!user) return
    const progress = getXPProgress(user.xp || 0)
    set({
      xp:            user.xp    || 0,
      coins:         user.coins || 0,
      streak:        user.streak || 0,
      longestStreak: user.longestStreak || 0,
      level:         user.level || 1,
      progress,
      lastActivityDate: user.lastActivityDate || null,
    })
  },

  // ── Fetch fresh progress from server ────────────────────
  fetchProgress: async () => {
    try {
      const { data } = await api.get('/user/progress')
      const d = data.data
      // Always recompute progress from the returned XP to guarantee all fields exist
      const freshProgress = getXPProgress(d.xp || 0)
      set({
        xp:            d.xp            ?? 0,
        coins:         d.coins         ?? 0,
        streak:        d.streak        ?? 0,
        longestStreak: d.longestStreak ?? 0,
        level:         d.level         ?? freshProgress.currentLevel,
        progress:      freshProgress,
        lastActivityDate: d.lastActivityDate ?? null,
      })
    } catch (err) {
      console.error('Failed to fetch progress:', err)
    }
  },

  // ── Process a game event (unified) ──────────────────────
  processEvent: async (event, options = {}) => {
    set({ isLoading: true })
    try {
      const { data } = await api.post('/rewards/event', { event, options })
      const { reward, xpTotal, coins, streak, progress, levelUp, streakResult } = data.data

      // Optimistically update
      set({
        xp:       xpTotal,
        coins,
        streak,
        progress,
        level:    progress.currentLevel,
        isLoading: false,
        pendingReward: {
          xp:     reward.xp,
          coins:  reward.coins,
          event,
          levelUp: levelUp?.leveledUp ? levelUp : null,
          streakMilestone: streakResult?.milestone || null,
        },
        levelUpData: levelUp?.leveledUp ? levelUp : null,
      })

      return { success: true, reward, levelUp, streakResult }
    } catch (err) {
      set({ isLoading: false })
      console.error('processEvent failed:', err)
      return { success: false }
    }
  },

  // ── Optimistic local XP add (for instant feedback) ──────
  addXPLocal: (amount) => {
    const newXP = get().xp + amount
    const progress = getXPProgress(newXP)
    set({ xp: newXP, progress, level: progress.currentLevel })
  },

  addCoinsLocal: (amount) => {
    set(state => ({ coins: state.coins + amount }))
  },

  // ── Clear pending reward (after animation plays) ────────
  clearPendingReward: () => set({ pendingReward: null }),
  clearLevelUp:       () => set({ levelUpData: null }),
}))

export default useGamificationStore
