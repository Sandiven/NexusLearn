import User from '../models/User.js'
import ContestResult from '../models/ContestResult.js'

// ── Tier calculation ──────────────────────────────────────
export function assignTiers(entries) {
  return entries.map((entry, i) => {
    const rank = entry.rank || i + 1
    let tier
    if      (rank <= 3)   tier = 'S+'
    else if (rank <= 13)  tier = 'S'
    else if (rank <= 43)  tier = 'A'
    else if (rank <= 100) tier = 'B'
    else                  tier = 'C'
    return { ...entry, rank, tier }
  })
}

// ─────────────────────────────────────────────────────────
// GET /api/leaderboard/global
// Returns top 100 users sorted by XP descending
// Also accepts ?currentUserId= to append current user rank if outside top 100
// ─────────────────────────────────────────────────────────
export const getGlobalLeaderboard = async (req, res, next) => {
  try {
    const LIMIT = 100

    const users = await User.find({ isActive: true })
      .select('username avatar xp coins streak level longestStreak')
      .sort({ xp: -1, streak: -1, createdAt: 1 })
      .limit(LIMIT)

    const total = await User.countDocuments({ isActive: true })

    const entries = users.map((u, i) => ({
      userId:        u._id,
      username:      u.username,
      avatar:        u.avatar,
      xp:            u.xp,
      coins:         u.coins,
      streak:        u.streak,
      level:         u.level,
      longestStreak: u.longestStreak,
      rank:          i + 1,
    }))

    const ranked = assignTiers(entries)

    // If the authenticated user is not in top 100, also return their rank separately
    const currentUserId = req.user?._id?.toString()
    let currentUserEntry = null

    if (currentUserId) {
      const inTop100 = ranked.some(e => e.userId?.toString() === currentUserId)
      if (!inTop100) {
        const currentUser = await User.findById(currentUserId).select('username avatar xp coins streak level longestStreak')
        if (currentUser) {
          const higherCount = await User.countDocuments({
            isActive: true,
            $or: [
              { xp: { $gt: currentUser.xp } },
              { xp: currentUser.xp, _id: { $lt: currentUserId } },
            ],
          })
          const userRank = higherCount + 1
          let tier
          if      (userRank <= 3)   tier = 'S+'
          else if (userRank <= 13)  tier = 'S'
          else if (userRank <= 43)  tier = 'A'
          else if (userRank <= 100) tier = 'B'
          else                      tier = 'C'

          currentUserEntry = {
            userId:        currentUser._id,
            username:      currentUser.username,
            avatar:        currentUser.avatar,
            xp:            currentUser.xp,
            coins:         currentUser.coins,
            streak:        currentUser.streak,
            level:         currentUser.level,
            longestStreak: currentUser.longestStreak,
            rank:          userRank,
            tier,
            isCurrentUser: true,
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      data:    ranked,
      currentUserEntry,
      meta:    { total, limit: LIMIT },
    })
  } catch (err) { next(err) }
}

// ─────────────────────────────────────────────────────────
// GET /api/leaderboard/search?q=username
// Search users by username with their real XP rank
// ─────────────────────────────────────────────────────────
export const searchLeaderboard = async (req, res, next) => {
  try {
    const { q } = req.query
    if (!q || !q.trim()) return res.status(200).json({ success: true, data: [] })

    const users = await User.find({
      isActive: true,
      username: { $regex: q.trim(), $options: 'i' },
    })
      .select('username avatar xp coins streak level')
      .limit(20)

    // For each result, compute their actual global rank
    const results = await Promise.all(users.map(async (u) => {
      const higherCount = await User.countDocuments({
        isActive: true,
        $or: [
          { xp: { $gt: u.xp } },
          { xp: u.xp, _id: { $lt: u._id } },
        ],
      })
      const rank = higherCount + 1
      let tier
      if      (rank <= 3)   tier = 'S+'
      else if (rank <= 13)  tier = 'S'
      else if (rank <= 43)  tier = 'A'
      else if (rank <= 100) tier = 'B'
      else                  tier = 'C'
      return { userId: u._id, username: u.username, avatar: u.avatar, xp: u.xp, coins: u.coins, streak: u.streak, level: u.level, rank, tier }
    }))

    results.sort((a, b) => a.rank - b.rank)

    res.status(200).json({ success: true, data: results })
  } catch (err) { next(err) }
}

// ─────────────────────────────────────────────────────────
// GET /api/leaderboard/contest/:contestId
// ─────────────────────────────────────────────────────────
export const getContestLeaderboard = async (req, res, next) => {
  try {
    const { contestId } = req.params
    const limit = Math.min(parseInt(req.query.limit) || 50, 200)

    const results = await ContestResult.find({ contest: contestId })
      .populate('user', 'username avatar level streak')
      .sort({ score: -1, completionTime: 1 })
      .limit(limit)

    const entries = results.map((r) => ({
      userId:         r.user?._id,
      username:       r.user?.username   || 'Unknown',
      avatar:         r.user?.avatar     || 'default',
      level:          r.user?.level      || 1,
      streak:         r.user?.streak     || 0,
      score:          r.score,
      correctAnswers: r.correctAnswers,
      totalQuestions: r.totalQuestions,
      completionTime: r.completionTime,
      xpAwarded:      r.xpAwarded,
      coinsAwarded:   r.coinsAwarded,
    }))

    const ranked = assignTiers(entries)
    res.status(200).json({ success: true, data: ranked })
  } catch (err) { next(err) }
}

// ─────────────────────────────────────────────────────────
// GET /api/leaderboard/user/:userId
// ─────────────────────────────────────────────────────────
export const getUserRank = async (req, res, next) => {
  try {
    const { userId } = req.params

    const user = await User.findById(userId).select('username xp')
    if (!user) return res.status(404).json({ message: 'User not found' })

    const higherCount = await User.countDocuments({
      isActive: true,
      $or: [
        { xp: { $gt: user.xp } },
        { xp: user.xp, _id: { $lt: userId } },
      ],
    })

    const rank = higherCount + 1

    let tier
    if      (rank <= 3)   tier = 'S+'
    else if (rank <= 13)  tier = 'S'
    else if (rank <= 43)  tier = 'A'
    else if (rank <= 100) tier = 'B'
    else                  tier = 'C'

    res.status(200).json({
      success: true,
      data:    { rank, tier, xp: user.xp, username: user.username },
    })
  } catch (err) { next(err) }
}


