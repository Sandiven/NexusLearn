import User from '../models/User.js'
import ProblemSolve from '../models/ProblemSolve.js'
import XPHistory from '../models/XPHistory.js'
import { calculateStreak, getStreakMilestone } from '../utils/gamificationEngine.js'

// ── Helpers ───────────────────────────────────────────────
function toDateString(date) {
  // Returns YYYY-MM-DD in UTC
  return date.toISOString().slice(0, 10)
}

// ─────────────────────────────────────────────────────────
// POST /api/problems/solve
// Body: { problemId, subject, difficulty }
// Records a problem solve for the current user.
// Updates streak (problems-only) and XP history.
// ─────────────────────────────────────────────────────────
export const recordProblemSolve = async (req, res, next) => {
  try {
    const { problemId, subject, difficulty } = req.body
    const userId = req.user._id

    if (!problemId || !subject || !difficulty) {
      return res.status(400).json({ message: 'problemId, subject, difficulty required' })
    }

    // Upsert: only create if not already solved
    let alreadySolved = false
    try {
      await ProblemSolve.create({ user: userId, problemId, subject, difficulty })
    } catch (err) {
      if (err.code === 11000) {
        alreadySolved = true // duplicate key — already solved before
      } else {
        throw err
      }
    }

    if (alreadySolved) {
      return res.status(200).json({ success: true, data: { alreadySolved: true } })
    }

    // ── Update problems-based streak on the User doc ──────
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    const todayStr = toDateString(new Date())
    const lastStr  = user.lastActivityDate ? toDateString(new Date(user.lastActivityDate)) : null

    let newStreak = user.streak || 0
    let streakBroken = false

    if (lastStr === todayStr) {
      // Already active today — streak unchanged
    } else if (lastStr) {
      const yesterday = new Date()
      yesterday.setUTCDate(yesterday.getUTCDate() - 1)
      const yStr = toDateString(yesterday)

      if (lastStr === yStr) {
        // Consecutive — extend streak
        newStreak = (user.streak || 0) + 1
      } else {
        // Gap — reset streak
        newStreak = 1
        streakBroken = true
      }
    } else {
      newStreak = 1
    }

    user.streak = newStreak
    user.lastActivityDate = new Date()
    if (newStreak > (user.longestStreak || 0)) {
      user.longestStreak = newStreak
    }

    // Small XP reward for solving a problem (5 XP)
    const XP_REWARD = 5
    user.xp = (user.xp || 0) + XP_REWARD

    await user.save()

    // Log to XP history
    await XPHistory.create({
      user: userId,
      amount: XP_REWARD,
      event: 'PROBLEM_SOLVED',
    })

    return res.status(200).json({
      success: true,
      data: {
        alreadySolved: false,
        streak: newStreak,
        streakBroken,
        xpAwarded: XP_REWARD,
      },
    })
  } catch (err) {
    next(err)
  }
}

// ─────────────────────────────────────────────────────────
// GET /api/problems/progress
// Returns per-user solved counts by difficulty + totals
// Also returns total available counts from the static pool
// (frontend sends totals via query params to keep DB clean)
// ─────────────────────────────────────────────────────────
export const getProblemProgress = async (req, res, next) => {
  try {
    const userId = req.user._id

    // Totals from frontend query params (avoids a separate problems DB)
    const totalAll    = parseInt(req.query.total    || '0', 10)
    const totalEasy   = parseInt(req.query.easy     || '0', 10)
    const totalMedium = parseInt(req.query.medium   || '0', 10)
    const totalHard   = parseInt(req.query.hard     || '0', 10)

    // Aggregate solved counts per difficulty for this user
    const agg = await ProblemSolve.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$difficulty', count: { $sum: 1 } } },
    ])

    const solvedByDiff = { easy: 0, medium: 0, hard: 0 }
    for (const row of agg) {
      if (row._id in solvedByDiff) solvedByDiff[row._id] = row.count
    }

    const solvedAll = solvedByDiff.easy + solvedByDiff.medium + solvedByDiff.hard

    return res.status(200).json({
      success: true,
      data: {
        solved: { all: solvedAll, easy: solvedByDiff.easy, medium: solvedByDiff.medium, hard: solvedByDiff.hard },
        total:  { all: totalAll, easy: totalEasy, medium: totalMedium, hard: totalHard },
      },
    })
  } catch (err) {
    next(err)
  }
}

// ─────────────────────────────────────────────────────────
// GET /api/problems/streak-calendar
// Returns daily solve counts over the rolling past year
// Response: { days: [{ date: 'YYYY-MM-DD', count: N }], activeDays, currentStreak, bestStreak }
// ─────────────────────────────────────────────────────────
export const getStreakCalendar = async (req, res, next) => {
  try {
    const userId = req.user._id

    // Rolling window: last 365 days
    const now   = new Date()
    const start = new Date(now)
    start.setUTCFullYear(start.getUTCFullYear() - 1)
    start.setUTCHours(0, 0, 0, 0)

    // Aggregate daily solve counts
    const agg = await ProblemSolve.aggregate([
      { $match: { user: userId, solvedAt: { $gte: start } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$solvedAt', timezone: 'UTC' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])

    // Build a map for fast lookup
    const countMap = {}
    for (const row of agg) {
      countMap[row._id] = row.count
    }

    // Build all 365 day slots
    const days = []
    for (let i = 0; i <= 365; i++) {
      const d = new Date(start)
      d.setUTCDate(d.getUTCDate() + i)
      if (d > now) break
      const dateStr = toDateString(d)
      days.push({ date: dateStr, count: countMap[dateStr] || 0 })
    }

    // Calculate activeDays, currentStreak, bestStreak from days array
    const activeDays = days.filter(d => d.count > 0).length

    // Current streak: count backwards from today
    let currentStreak = 0
    const todayStr = toDateString(now)
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].count > 0) {
        currentStreak++
      } else {
        // Allow today to be empty (user hasn't solved yet today)
        if (days[i].date === todayStr && currentStreak === 0) continue
        break
      }
    }

    // Best streak: longest run of consecutive active days
    let bestStreak = 0, run = 0
    for (const d of days) {
      if (d.count > 0) {
        run++
        if (run > bestStreak) bestStreak = run
      } else {
        run = 0
      }
    }

    // Also fetch from User.longestStreak in case historical data predates this model
    const user = await User.findById(userId).select('longestStreak streak')
    const dbBest = user?.longestStreak || 0
    if (dbBest > bestStreak) bestStreak = dbBest

    return res.status(200).json({
      success: true,
      data: { days, activeDays, currentStreak, bestStreak },
    })
  } catch (err) {
    next(err)
  }
}

// ─────────────────────────────────────────────────────────
// GET /api/user/xp-history
// Returns daily XP totals for the past N days (default 30)
// Used by the XP graph on Progress page
// ─────────────────────────────────────────────────────────
export const getXPHistory = async (req, res, next) => {
  try {
    const userId = req.user._id
    const days   = Math.min(parseInt(req.query.days || '30', 10), 365)

    const start = new Date()
    start.setUTCDate(start.getUTCDate() - (days - 1))
    start.setUTCHours(0, 0, 0, 0)

    const agg = await XPHistory.aggregate([
      { $match: { user: userId, earnedAt: { $gte: start } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$earnedAt', timezone: 'UTC' },
          },
          xp: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ])

    const xpMap = {}
    for (const row of agg) {
      xpMap[row._id] = row.xp
    }

    // Fill all day slots (zero if no XP that day)
    const result = []
    for (let i = 0; i < days; i++) {
      const d = new Date(start)
      d.setUTCDate(d.getUTCDate() + i)
      const dateStr = toDateString(d)
      const label   = d.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })
      result.push({ date: dateStr, day: label, xp: xpMap[dateStr] || 0 })
    }

    return res.status(200).json({
      success: true,
      data: result,
    })
  } catch (err) {
    next(err)
  }
}
