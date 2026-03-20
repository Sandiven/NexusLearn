import Contest from '../models/Contest.js'
import ContestResult from '../models/ContestResult.js'
import User from '../models/User.js'

function calcContestScore(correct, total, completionTime, timeLimit) {
  const timeFactor = Math.max(0, 1 - completionTime / (timeLimit * 1.5))
  const baseScore  = correct * 100
  const timeBonus  = Math.round(timeFactor * correct * 30)
  return baseScore + timeBonus
}

// GET /api/contests
export const getContests = async (req, res, next) => {
  try {
    const { status, subject } = req.query
    const filter = { isPublished: true }
    if (status)  filter.status     = status
    if (subject) filter.subjectSlug = subject

    const contests = await Contest.find(filter)
      .select('-questions.correctIndex')
      .sort({ startTime: -1 })

    res.status(200).json({ success: true, data: contests })
  } catch (err) { next(err) }
}

// GET /api/contests/:id
export const getContestById = async (req, res, next) => {
  try {
    const contest = await Contest.findById(req.params.id).select('-questions.correctIndex')
    if (!contest) return res.status(404).json({ message: 'Contest not found' })

    const existing = await ContestResult.findOne({ user: req.user._id, contest: contest._id })
    res.status(200).json({ success: true, data: contest, alreadySubmitted: !!existing })
  } catch (err) { next(err) }
}

// POST /api/contests/submit
export const submitContest = async (req, res, next) => {
  try {
    const { contestId, answers, completionTime } = req.body
    const userId = req.user._id

    const contest = await Contest.findById(contestId)
    if (!contest) return res.status(404).json({ message: 'Contest not found' })

    const existing = await ContestResult.findOne({ user: userId, contest: contestId })
    if (existing) return res.status(409).json({ message: 'Already submitted' })

    let correct = 0
    const gradedAnswers = answers.map((ans) => {
      const q        = contest.questions[ans.questionIndex]
      const isCorrect = q && ans.selectedIndex === q.correctIndex
      if (isCorrect) correct++
      return { questionIndex: ans.questionIndex, selectedIndex: ans.selectedIndex, correct: isCorrect, timeTaken: ans.timeTaken || 0 }
    })

    const total       = contest.questions.length
    const score       = calcContestScore(correct, total, completionTime, contest.timeLimit)
    const accuracy    = correct / total
    const isWin       = correct === total
    const xpEarned    = Math.round(isWin ? contest.xpReward : contest.participationXP + Math.round((contest.xpReward - contest.participationXP) * accuracy))
    const coinsEarned = Math.round(isWin ? contest.coinReward : Math.round(contest.coinReward * accuracy * 0.5))

    const result = await ContestResult.create({
      user: userId, contest: contestId, score,
      correctAnswers: correct, totalQuestions: total,
      completionTime, answers: gradedAnswers,
      xpAwarded: xpEarned, coinsAwarded: coinsEarned,
    })

    await User.findByIdAndUpdate(userId, { $inc: { xp: xpEarned, coins: coinsEarned } })

    const betterCount = await ContestResult.countDocuments({
      contest: contestId,
      $or: [{ score: { $gt: score } }, { score, completionTime: { $lt: completionTime } }],
    })
    const rank = betterCount + 1
    await ContestResult.findByIdAndUpdate(result._id, { rank })

    res.status(200).json({
      success: true,
      data: { score, correct, total, rank, completionTime, xpAwarded: xpEarned, coinsAwarded: coinsEarned, answers: gradedAnswers },
    })
  } catch (err) { next(err) }
}

// GET /api/contests/results/:contestId
export const getContestResults = async (req, res, next) => {
  try {
    const results = await ContestResult.find({ contest: req.params.contestId })
      .populate('user', 'username avatar level')
      .sort({ score: -1, completionTime: 1 })
      .limit(50)

    const ranked = results.map((r, i) => ({
      rank: i + 1, username: r.user?.username, avatar: r.user?.avatar,
      userLevel: r.user?.level, score: r.score, correctAnswers: r.correctAnswers,
      totalQuestions: r.totalQuestions, completionTime: r.completionTime, xpAwarded: r.xpAwarded,
    }))

    res.status(200).json({ success: true, data: ranked })
  } catch (err) { next(err) }
}
