import DailyChallenge from '../models/DailyChallenge.js'
import User           from '../models/User.js'
import { pickQuestionForDate, todayUTC } from '../data/dailyChallengePool.js'

const DAILY_XP    = 10
const DAILY_COINS = 3

// ─────────────────────────────────────────────────────────────────────────────
// Helper: get-or-create today's DailyChallenge document
// ─────────────────────────────────────────────────────────────────────────────
async function getTodayChallenge() {
  const date = todayUTC()
  let doc = await DailyChallenge.findOne({ date })
  if (!doc) {
    const q = pickQuestionForDate(date)
    doc = await DailyChallenge.create({
      date,
      questionId:   q.id,
      subject:      q.subject,
      subjectLabel: q.subjectLabel,
      difficulty:   q.difficulty,
      title:        q.title,
      question:     q.question,
      options:      q.options,
      correctIndex: q.correctIndex,
      explanation:  q.explanation,
      accentColor:  q.accentColor,
      attempts:     [],
    })
  }
  return doc
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/daily-challenge
// Returns today's challenge + current user's attempt status (correctIndex hidden)
// ─────────────────────────────────────────────────────────────────────────────
export const getTodayDailyChallenge = async (req, res, next) => {
  try {
    const userId = req.user._id
    const doc    = await getTodayChallenge()

    const userAttempt = doc.attempts.find(a => a.user.toString() === userId.toString())

    // Never expose correctIndex to un-attempted users
    const payload = {
      date:         doc.date,
      subject:      doc.subject,
      subjectLabel: doc.subjectLabel,
      difficulty:   doc.difficulty,
      title:        doc.title,
      question:     doc.question,
      options:      doc.options,
      accentColor:  doc.accentColor,
      // Only send these if the user already attempted
      attempted:    !!userAttempt,
      isCorrect:    userAttempt ? userAttempt.isCorrect    : null,
      selectedIndex:userAttempt ? userAttempt.selectedIndex : null,
      correctIndex: userAttempt ? doc.correctIndex          : null,
      explanation:  userAttempt ? doc.explanation           : null,
      rewardGranted:userAttempt ? userAttempt.rewardGranted : false,
    }

    res.status(200).json({ success: true, data: payload })
  } catch (err) { next(err) }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/daily-challenge/submit
// Body: { selectedIndex: number }
// ─────────────────────────────────────────────────────────────────────────────
export const submitDailyChallenge = async (req, res, next) => {
  try {
    const userId = req.user._id
    const { selectedIndex } = req.body

    if (selectedIndex === undefined || selectedIndex === null) {
      return res.status(400).json({ message: 'selectedIndex is required' })
    }

    const doc = await getTodayChallenge()

    // ── Enforce one-attempt-per-user-per-day ─────────────────────────────
    const alreadyAttempted = doc.attempts.some(a => a.user.toString() === userId.toString())
    if (alreadyAttempted) {
      return res.status(409).json({ message: 'You have already attempted today\'s daily challenge.' })
    }

    const isCorrect    = Number(selectedIndex) === doc.correctIndex
    let   rewardGranted = false

    // ── Grant reward only for correct answer ──────────────────────────────
    if (isCorrect) {
      await User.findByIdAndUpdate(userId, {
        $inc: { xp: DAILY_XP, coins: DAILY_COINS },
      })
      rewardGranted = true
    }

    // ── Record attempt ────────────────────────────────────────────────────
    doc.attempts.push({
      user: userId,
      selectedIndex: Number(selectedIndex),
      isCorrect,
      rewardGranted,
      attemptedAt: new Date(),
    })
    await doc.save()

    // Fetch updated user for fresh XP/coins
    const updatedUser = await User.findById(userId).select('xp coins')

    res.status(200).json({
      success: true,
      data: {
        isCorrect,
        correctIndex:  doc.correctIndex,
        explanation:   doc.explanation,
        rewardGranted,
        xpAwarded:     isCorrect ? DAILY_XP    : 0,
        coinsAwarded:  isCorrect ? DAILY_COINS : 0,
        totalXP:       updatedUser.xp,
        totalCoins:    updatedUser.coins,
      },
    })
  } catch (err) { next(err) }
}
