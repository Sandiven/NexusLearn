import User        from '../models/User.js'
import Achievement  from '../models/Achievement.js'
import {
  checkAchievements,
  getAchievementByKey,
  ACHIEVEMENT_CATALOGUE,
  ACH_EVENT,
} from '../utils/achievementEngine.js'

// ─────────────────────────────────────────────────────────
// GET /api/achievements
// All published achievements (catalogue)
// ─────────────────────────────────────────────────────────
export const getAllAchievements = async (req, res, next) => {
  try {
    // Return the embedded catalogue (fast) until DB is seeded
    const userId = req.user._id
    const user   = await User.findById(userId).select('achievements')
    const unlockedKeys = new Set(
      (user?.achievements || []).map(a => a.key)
    )

    const annotated = ACHIEVEMENT_CATALOGUE
      .filter(a => !a.isSecret || unlockedKeys.has(a.key))
      .map(a => ({
        ...a,
        unlocked:  unlockedKeys.has(a.key),
        unlockedAt: user?.achievements?.find(ua => ua.key === a.key)?.unlockedAt || null,
      }))
      .sort((a, b) => a.order - b.order)

    res.status(200).json({ success: true, data: annotated })
  } catch (err) { next(err) }
}

// ─────────────────────────────────────────────────────────
// GET /api/user/achievements
// Current user's unlocked achievements
// ─────────────────────────────────────────────────────────
export const getUserAchievements = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('achievements xp streak')
    if (!user) return res.status(404).json({ message: 'User not found' })

    const enriched = (user.achievements || []).map(ua => ({
      ...ua.toObject(),
      detail: getAchievementByKey(ua.key),
    }))

    res.status(200).json({
      success: true,
      data:    enriched,
      total:   enriched.length,
    })
  } catch (err) { next(err) }
}

// ─────────────────────────────────────────────────────────
// POST /api/achievements/check
// Called by other systems after significant events.
// Body: { event, userStats }
// Returns newly unlocked achievements.
// ─────────────────────────────────────────────────────────
export const checkAndAwardAchievements = async (req, res, next) => {
  try {
    const { event, userStats = {} } = req.body
    const userId  = req.user._id

    const user    = await User.findById(userId).select('achievements xp coins')
    if (!user)    return res.status(404).json({ message: 'User not found' })

    const unlockedKeys = new Set((user.achievements || []).map(a => a.key))

    // Build full userStats from DB + passed extras
    const merged = {
      xp:                    user.xp || 0,
      streak:                userStats.streak                || 0,
      totalLevelsCompleted:  userStats.totalLevelsCompleted  || 0,
      subjectsCompleted:     userStats.subjectsCompleted     || 0,
      contestsEntered:       userStats.contestsEntered       || 0,
      contestsWon:           userStats.contestsWon           || 0,
      fightsWon:             userStats.fightsWon             || 0,
      friendCount:           userStats.friendCount           || 0,
      ...userStats,
    }

    const toUnlock = checkAchievements(event, merged, unlockedKeys)
    if (!toUnlock.length) {
      return res.status(200).json({ success: true, data: [], message: 'No new achievements' })
    }

    // Award each unlocked achievement
    let totalXP    = 0
    let totalCoins = 0
    const newAchievements = []

    for (const key of toUnlock) {
      const ach = getAchievementByKey(key)
      if (!ach) continue

      totalXP    += ach.xpReward    || 0
      totalCoins += ach.coinReward  || 0
      newAchievements.push({
        key,
        unlockedAt: new Date(),
        xpAwarded:   ach.xpReward,
        coinsAwarded: ach.coinReward,
      })
    }

    // Persist: push achievements + award XP/coins
    await User.findByIdAndUpdate(userId, {
      $push: { achievements: { $each: newAchievements } },
      $inc:  { xp: totalXP, coins: totalCoins },
    })

    const enriched = newAchievements.map(ua => ({
      ...ua,
      detail: getAchievementByKey(ua.key),
    }))

    res.status(200).json({
      success: true,
      data:    enriched,
      totalXP,
      totalCoins,
    })
  } catch (err) { next(err) }
}
