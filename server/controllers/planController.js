import UserPlan from '../models/UserPlan.js'
import User     from '../models/User.js'

// ── Catalogue of available practice plans ────────────────
export const PLAN_CATALOGUE = [
  {
    id:             'js-50',
    title:          'JavaScript Foundations',
    description:    'Master core JavaScript concepts with 50 targeted exercises.',
    subject:        'JavaScript',
    totalQuestions: 50,
    maxPoints:      500,
    badgeKey:       'js_foundations',
    badgeLabel:     'JS Founder',
    accentColor:    '#FFB800',
    icon:           'JS',
    difficulty:     'Beginner',
    sampleQuestions: [
      'What is the difference between let, const, and var?',
      'Explain closures in JavaScript.',
      'What is event bubbling and capturing?',
      'How does the prototype chain work?',
      'What are Promises and async/await?',
    ],
  },
  {
    id:             'dsa-150',
    title:          'DSA Mastery',
    description:    'Complete 150 Data Structures & Algorithms problems to master the fundamentals.',
    subject:        'Data Structures & Algorithms',
    totalQuestions: 150,
    maxPoints:      1500,
    badgeKey:       'dsa_master',
    badgeLabel:     'DSA Master',
    accentColor:    '#00F5FF',
    icon:           'DS',
    difficulty:     'Intermediate',
    sampleQuestions: [
      'Implement a binary search algorithm.',
      'Find the longest common subsequence.',
      'Detect a cycle in a linked list.',
      'Implement a min-heap from scratch.',
      'Solve the 0/1 Knapsack problem using DP.',
    ],
  },
  {
    id:             'db-75',
    title:          'Database Deep Dive',
    description:    '75 questions covering SQL, NoSQL, indexing, and transactions.',
    subject:        'Databases',
    totalQuestions: 75,
    maxPoints:      750,
    badgeKey:       'db_expert',
    badgeLabel:     'DB Expert',
    accentColor:    '#0080FF',
    icon:           'DB',
    difficulty:     'Intermediate',
    sampleQuestions: [
      'What is database normalization?',
      'Explain ACID properties with examples.',
      'What is the difference between clustered and non-clustered indexes?',
      'When would you choose NoSQL over SQL?',
      'Explain the CAP theorem.',
    ],
  },
  {
    id:             'algo-100',
    title:          'Algorithm Sprint',
    description:    '100 algorithm challenges — sorting, searching, graphs and DP.',
    subject:        'Algorithms',
    totalQuestions: 100,
    maxPoints:      1000,
    badgeKey:       'algo_sprinter',
    badgeLabel:     'Algo Sprinter',
    accentColor:    '#8B5CF6',
    icon:           'AL',
    difficulty:     'Advanced',
    sampleQuestions: [
      'Implement QuickSort and analyze its complexity.',
      'Find the shortest path using Dijkstra\'s algorithm.',
      'Explain the Master Theorem for recurrences.',
      'Solve the Travelling Salesman Problem (greedy approach).',
      'Implement a topological sort.',
    ],
  },
  {
    id:             'os-60',
    title:          'OS Essentials',
    description:    '60 questions on Operating Systems — processes, memory, concurrency.',
    subject:        'Operating Systems',
    totalQuestions: 60,
    maxPoints:      600,
    badgeKey:       'os_pro',
    badgeLabel:     'OS Pro',
    accentColor:    '#00FF88',
    icon:           'OS',
    difficulty:     'Intermediate',
    sampleQuestions: [
      'Explain the difference between a process and a thread.',
      'What is a deadlock and how can it be prevented?',
      'Explain virtual memory and paging.',
      'What are the CPU scheduling algorithms?',
      'Explain mutex vs semaphore.',
    ],
  },
]

// ── Reward calculation ───────────────────────────────────
// Full points if no streak breaks; reduce 15% per break, min 40% of max
function calcEarnedPoints(maxPoints, streakBreaks) {
  const penalty = Math.min(streakBreaks * 0.15, 0.60)
  return Math.round(maxPoints * (1 - penalty))
}

// ─────────────────────────────────────────────────────────
// GET /api/plans/catalogue  — all plan templates
// ─────────────────────────────────────────────────────────
export const getCatalogue = async (req, res, next) => {
  try {
    // Annotate with user's enrollment status
    const userId = req.user._id
    const enrollments = await UserPlan.find({ user: userId }).lean()
    const enrollMap   = new Map(enrollments.map(e => [e.planId, e]))

    const data = PLAN_CATALOGUE.map(plan => ({
      ...plan,
      userPlan: enrollMap.get(plan.id) || null,
    }))

    res.status(200).json({ success: true, data })
  } catch (err) { next(err) }
}

// ─────────────────────────────────────────────────────────
// GET /api/plans/mine  — current user's enrolled plans
// ─────────────────────────────────────────────────────────
export const getMyPlans = async (req, res, next) => {
  try {
    const plans = await UserPlan.find({ user: req.user._id }).lean()
    // Enrich with catalogue metadata
    const enriched = plans.map(up => ({
      ...up,
      catalogue: PLAN_CATALOGUE.find(p => p.id === up.planId) || null,
    }))
    res.status(200).json({ success: true, data: enriched })
  } catch (err) { next(err) }
}

// ─────────────────────────────────────────────────────────
// POST /api/plans/enroll
// Body: { planId, daysPerWeek, questionsPerDay }
// ─────────────────────────────────────────────────────────
export const enrollPlan = async (req, res, next) => {
  try {
    const { planId, daysPerWeek = [], questionsPerDay = 5 } = req.body
    const userId   = req.user._id
    const template = PLAN_CATALOGUE.find(p => p.id === planId)
    if (!template) return res.status(404).json({ message: 'Plan not found' })

    const existing = await UserPlan.findOne({ user: userId, planId })
    if (existing) return res.status(409).json({ message: 'Already enrolled in this plan' })

    const userPlan = await UserPlan.create({
      user:            userId,
      planId,
      daysPerWeek:     Array.isArray(daysPerWeek) ? daysPerWeek : [],
      questionsPerDay: Math.max(1, parseInt(questionsPerDay) || 5),
      totalQuestions:  template.totalQuestions,
      maxPoints:       template.maxPoints,
      badgeKey:        template.badgeKey,
      status:          'active',
      startedAt:       new Date(),
    })

    res.status(201).json({ success: true, data: userPlan })
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Already enrolled' })
    next(err)
  }
}

// ─────────────────────────────────────────────────────────
// PATCH /api/plans/:planId/configure
// Body: { daysPerWeek, questionsPerDay }
// ─────────────────────────────────────────────────────────
export const configurePlan = async (req, res, next) => {
  try {
    const { planId }     = req.params
    const { daysPerWeek, questionsPerDay } = req.body

    const userPlan = await UserPlan.findOne({ user: req.user._id, planId })
    if (!userPlan) return res.status(404).json({ message: 'Enrollment not found' })
    if (userPlan.status === 'completed') return res.status(400).json({ message: 'Plan already completed' })

    if (Array.isArray(daysPerWeek))    userPlan.daysPerWeek    = daysPerWeek
    if (questionsPerDay !== undefined) userPlan.questionsPerDay = Math.max(1, parseInt(questionsPerDay) || 5)

    await userPlan.save()
    res.status(200).json({ success: true, data: userPlan })
  } catch (err) { next(err) }
}

// ─────────────────────────────────────────────────────────
// POST /api/plans/:planId/progress
// Body: { questionsAnswered }  — record daily session
// ─────────────────────────────────────────────────────────
export const recordProgress = async (req, res, next) => {
  try {
    const { planId }          = req.params
    const { questionsAnswered = 0 } = req.body
    const userId              = req.user._id

    const userPlan = await UserPlan.findOne({ user: userId, planId })
    if (!userPlan) return res.status(404).json({ message: 'Enrollment not found' })
    if (userPlan.status !== 'active') return res.status(400).json({ message: `Plan is ${userPlan.status}` })

    const now   = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Check streak continuity
    let streakBroken = false
    if (userPlan.lastActivityAt) {
      const lastDay = new Date(userPlan.lastActivityAt)
      const last    = new Date(lastDay.getFullYear(), lastDay.getMonth(), lastDay.getDate())
      const diffMs  = today - last
      const diffDays = diffMs / 86400000
      if (diffDays > 1) {
        streakBroken = true
        userPlan.streakBreaks   += 1
        userPlan.currentStreak  = 1
      } else if (diffDays === 1) {
        userPlan.currentStreak  += 1
      }
      // Same day — no streak change
    } else {
      userPlan.currentStreak = 1
    }

    userPlan.longestStreak  = Math.max(userPlan.longestStreak, userPlan.currentStreak)
    userPlan.questionsCompleted = Math.min(
      userPlan.questionsCompleted + Math.max(0, parseInt(questionsAnswered) || 0),
      userPlan.totalQuestions
    )
    userPlan.lastActivityAt = now

    // Check completion
    if (userPlan.questionsCompleted >= userPlan.totalQuestions) {
      userPlan.status      = 'completed'
      userPlan.completedAt = now
      userPlan.badgeEarned = true
      userPlan.earnedPoints = calcEarnedPoints(userPlan.maxPoints, userPlan.streakBreaks)

      // Award XP and coins to user (persists in DB — drives Home page stats)
      const xpToAward    = userPlan.earnedPoints
      const coinsToAward = Math.round(userPlan.earnedPoints / 10)

      // Push badge to user.achievements (so Achievements page sees it), prevent duplicates
      const existingBadge = await User.findOne({
        _id: userId,
        'achievements.key': userPlan.badgeKey,
      })

      const achievementPush = existingBadge ? {} : {
        $push: { achievements: {
          key:          userPlan.badgeKey,
          unlockedAt:   now,
          xpAwarded:    xpToAward,
          coinsAwarded: coinsToAward,
        }},
      }

      await User.findByIdAndUpdate(userId, {
        $inc: { xp: xpToAward, coins: coinsToAward },
        ...achievementPush,
      })
    }

    await userPlan.save()
    res.status(200).json({
      success: true,
      data:    userPlan,
      streakBroken,
      completed: userPlan.status === 'completed',
    })
  } catch (err) { next(err) }
}
