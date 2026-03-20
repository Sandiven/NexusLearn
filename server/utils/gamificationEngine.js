// ─────────────────────────────────────────────────────────
// Gamification Engine — pure business logic
// All functions are stateless and testable.
// ─────────────────────────────────────────────────────────

// ── Event types ──────────────────────────────────────────
export const GAME_EVENT = {
  ATTENTION_QUIZ_CORRECT:  'ATTENTION_QUIZ_CORRECT',
  CONTENT_TEST_COMPLETE:   'CONTENT_TEST_COMPLETE',
  LEVEL_COMPLETED:         'LEVEL_COMPLETED',
  CONTEST_WIN:             'CONTEST_WIN',
  CONTEST_PARTICIPATE:     'CONTEST_PARTICIPATE',
  DAILY_CHALLENGE:         'DAILY_CHALLENGE',
  STREAK_MILESTONE:        'STREAK_MILESTONE',
}

// ── Base reward table ─────────────────────────────────────
export const BASE_REWARDS = {
  [GAME_EVENT.ATTENTION_QUIZ_CORRECT]: { xp: 10,  coins: 0  },
  [GAME_EVENT.CONTENT_TEST_COMPLETE]:  { xp: 40,  coins: 10 },
  [GAME_EVENT.LEVEL_COMPLETED]:        { xp: 200, coins: 50 },
  [GAME_EVENT.CONTEST_WIN]:            { xp: 500, coins: 100 },
  [GAME_EVENT.CONTEST_PARTICIPATE]:    { xp: 50,  coins: 15 },
  [GAME_EVENT.DAILY_CHALLENGE]:        { xp: 75,  coins: 20 },
}

// ── Streak milestone bonuses ──────────────────────────────
export const STREAK_MILESTONES = [
  { days: 3,   xp: 50,  coins: 10,  label: '3-Day Streak' },
  { days: 7,   xp: 100, coins: 25,  label: '7-Day Streak' },
  { days: 14,  xp: 200, coins: 50,  label: '2-Week Streak' },
  { days: 30,  xp: 500, coins: 100, label: '30-Day Streak' },
  { days: 60,  xp: 1000,coins: 200, label: '60-Day Streak' },
  { days: 100, xp: 2000,coins: 400, label: '100-Day Streak' },
]

// ── XP level thresholds ───────────────────────────────────
// Formula: level N requires N*250 XP to reach N+1
// Total XP for level N: sum(1..N) * 250 = N*(N+1)/2 * 250
export function xpForLevel(level) {
  return level * 250
}

export function totalXpForLevel(level) {
  // Cumulative XP needed to reach this level from 0
  return (level * (level - 1) * 250) / 2
}

export function getLevelFromXP(totalXP) {
  let level = 1
  while (totalXP >= totalXpForLevel(level + 1)) {
    level++
  }
  return level
}

export function getXPProgress(totalXP) {
  const currentLevel   = getLevelFromXP(totalXP)
  const levelStartXP   = totalXpForLevel(currentLevel)
  const levelEndXP     = totalXpForLevel(currentLevel + 1)
  const xpIntoLevel    = totalXP - levelStartXP
  const xpNeededTotal  = levelEndXP - levelStartXP
  const percentage     = Math.min((xpIntoLevel / xpNeededTotal) * 100, 100)

  return {
    currentLevel,
    xpIntoLevel,
    xpNeededTotal,
    xpToNextLevel: xpNeededTotal - xpIntoLevel,
    percentage: Math.round(percentage * 10) / 10,
  }
}

// ── Streak logic ──────────────────────────────────────────
export function calculateStreak(lastActiveDate, currentStreak) {
  const now       = new Date()
  const today     = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (!lastActiveDate) {
    return { newStreak: 1, streakBroken: false }
  }

  const last = new Date(lastActiveDate)
  const lastDay = new Date(last.getFullYear(), last.getMonth(), last.getDate())

  // Same day — no change
  if (lastDay.getTime() === today.getTime()) {
    return { newStreak: currentStreak, streakBroken: false, alreadyActive: true }
  }

  // Yesterday — continue streak
  if (lastDay.getTime() === yesterday.getTime()) {
    return { newStreak: currentStreak + 1, streakBroken: false }
  }

  // Older — streak broken
  return { newStreak: 1, streakBroken: true }
}

export function getStreakMilestone(newStreak, previousStreak) {
  return STREAK_MILESTONES.find(
    m => m.days === newStreak && newStreak > previousStreak
  ) || null
}

// ── Score-scaled rewards ──────────────────────────────────
export function calculateReward(event, options = {}) {
  const base = BASE_REWARDS[event]
  if (!base) return { xp: 0, coins: 0 }

  let xpMultiplier   = 1
  let coinMultiplier = 1

  // Scale content test reward by score percentage
  if (event === GAME_EVENT.CONTENT_TEST_COMPLETE && options.score !== undefined) {
    xpMultiplier = options.score >= 90 ? 1.5 : options.score >= 70 ? 1.0 : 0.5
  }

  // Streak multiplier (up to 2×)
  if (options.streak) {
    const streakBonus = Math.min(1 + options.streak * 0.02, 2.0)
    xpMultiplier   *= streakBonus
    coinMultiplier *= streakBonus
  }

  return {
    xp:    Math.round(base.xp    * xpMultiplier),
    coins: Math.round(base.coins * coinMultiplier),
  }
}

// ── Level-up detection ────────────────────────────────────
export function detectLevelUp(previousXP, newXP) {
  const prevLevel = getLevelFromXP(previousXP)
  const newLevel  = getLevelFromXP(newXP)
  if (newLevel > prevLevel) {
    return { leveledUp: true, fromLevel: prevLevel, toLevel: newLevel }
  }
  return { leveledUp: false }
}
