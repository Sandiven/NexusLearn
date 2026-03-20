import User from '../models/User.js'
import XPHistory from '../models/XPHistory.js'
import {
  calculateReward,
  calculateStreak,
  getStreakMilestone,
  detectLevelUp,
  getXPProgress,
  GAME_EVENT,
  BASE_REWARDS,
} from '../utils/gamificationEngine.js'

// ─────────────────────────────────────────────────────────
// POST /api/rewards/xp
// Body: { event, options: { score?, streak? } }
// Awards XP for a specific game event.
// ─────────────────────────────────────────────────────────
export const awardXP = async (req, res, next) => {
  try {
    const { event, options = {} } = req.body
    const userId = req.user._id

    if (!Object.values(GAME_EVENT).includes(event)) {
      return res.status(400).json({ message: `Unknown event: ${event}` })
    }

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    const previousXP = user.xp
    const reward     = calculateReward(event, { ...options, streak: user.streak })
    const newXP      = previousXP + reward.xp

    const levelUpResult = detectLevelUp(previousXP, newXP)

    // Update user
    user.xp = newXP
    if (levelUpResult.leveledUp) {
      user.level = levelUpResult.toLevel
    }
    await user.save()

    const progress = getXPProgress(newXP)

    res.status(200).json({
      success: true,
      data: {
        xpAwarded:    reward.xp,
        totalXP:      newXP,
        progress,
        levelUp:      levelUpResult,
      },
    })
  } catch (err) {
    next(err)
  }
}

// ─────────────────────────────────────────────────────────
// POST /api/rewards/coins
// Body: { event, amount? }
// Awards coins for a specific event or explicit amount.
// ─────────────────────────────────────────────────────────
export const awardCoins = async (req, res, next) => {
  try {
    const { event, amount } = req.body
    const userId = req.user._id

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    let coinsToAward = amount
    if (!coinsToAward && event) {
      const reward   = calculateReward(event, { streak: user.streak })
      coinsToAward   = reward.coins
    }

    if (!coinsToAward || coinsToAward < 0) {
      return res.status(400).json({ message: 'Invalid coin amount' })
    }

    user.coins += coinsToAward
    await user.save()

    res.status(200).json({
      success: true,
      data: {
        coinsAwarded: coinsToAward,
        totalCoins:   user.coins,
      },
    })
  } catch (err) {
    next(err)
  }
}

// ─────────────────────────────────────────────────────────
// POST /api/streak/update
// Called once per day when user completes an activity.
// ─────────────────────────────────────────────────────────
export const updateStreak = async (req, res, next) => {
  try {
    const userId = req.user._id
    const user   = await User.findById(userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    const previousStreak = user.streak
    const { newStreak, streakBroken, alreadyActive } = calculateStreak(
      user.lastActivityDate,
      user.streak
    )

    // Already active today — no change needed
    if (alreadyActive) {
      return res.status(200).json({
        success: true,
        data: { streak: user.streak, streakBroken: false, milestone: null, alreadyActive: true },
      })
    }

    user.streak           = newStreak
    user.lastActivityDate = new Date()
    if (newStreak > (user.longestStreak || 0)) {
      user.longestStreak = newStreak
    }

    // Streak milestone bonus
    const milestone = getStreakMilestone(newStreak, previousStreak)
    let milestoneReward = null

    if (milestone) {
      user.xp    += milestone.xp
      user.coins += milestone.coins
      milestoneReward = milestone
    }

    await user.save()

    res.status(200).json({
      success: true,
      data: {
        streak:        newStreak,
        streakBroken,
        previousStreak,
        milestone:     milestoneReward,
      },
    })
  } catch (err) {
    next(err)
  }
}

// ─────────────────────────────────────────────────────────
// POST /api/rewards/event
// Unified endpoint — awards XP + coins + updates streak
// Body: { event, options: { score? } }
// ─────────────────────────────────────────────────────────
export const processEvent = async (req, res, next) => {
  try {
    const { event, options = {} } = req.body
    const userId = req.user._id

    if (!Object.values(GAME_EVENT).includes(event)) {
      return res.status(400).json({ message: `Unknown event: ${event}` })
    }

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    // 1. Calculate reward (with streak multiplier)
    const reward     = calculateReward(event, { ...options, streak: user.streak })
    const previousXP = user.xp

    // 2. Apply rewards
    user.xp    += reward.xp
    user.coins += reward.coins

    // 3. Level up detection
    const levelUpResult = detectLevelUp(previousXP, user.xp)
    if (levelUpResult.leveledUp) user.level = levelUpResult.toLevel

    // 4. Update streak if this is a significant action
    const streakEvents = [GAME_EVENT.LEVEL_COMPLETED, GAME_EVENT.DAILY_CHALLENGE]
    let streakResult = null
    if (streakEvents.includes(event)) {
      const { newStreak, streakBroken, alreadyActive } = calculateStreak(user.lastActivityDate, user.streak)
      if (!alreadyActive) {
        user.streak           = newStreak
        user.lastActivityDate = new Date()
        if (newStreak > (user.longestStreak || 0)) user.longestStreak = newStreak

        const milestone = getStreakMilestone(newStreak, user.streak)
        if (milestone) {
          user.xp    += milestone.xp
          user.coins += milestone.coins
          streakResult = { newStreak, milestone }
        } else {
          streakResult = { newStreak, milestone: null }
        }
      }
    }

    await user.save()

    // ── Log XP to history for graph ───────────────────────
    if (reward.xp > 0) {
      await XPHistory.create({ user: userId, amount: reward.xp, event }).catch(() => {})
    }

    res.status(200).json({
      success: true,
      data: {
        event,
        reward,
        xpTotal:   user.xp,
        coins:     user.coins,
        streak:    user.streak,
        progress:  getXPProgress(user.xp),
        levelUp:   levelUpResult,
        streakResult,
      },
    })
  } catch (err) {
    next(err)
  }
}

// ─────────────────────────────────────────────────────────
// GET /api/user/progress
// Returns current gamification state for the navbar/UI
// ─────────────────────────────────────────────────────────
export const getUserProgress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    const progress = getXPProgress(user.xp)

    res.status(200).json({
      success: true,
      data: {
        xp:            user.xp,
        coins:         user.coins,
        streak:        user.streak,
        longestStreak: user.longestStreak,
        level:         user.level,
        progress,
        lastActivityDate: user.lastActivityDate,
      },
    })
  } catch (err) {
    next(err)
  }
}
