import { Router } from 'express'
import {
  awardXP,
  awardCoins,
  updateStreak,
  processEvent,
  getUserProgress,
} from '../controllers/rewardsController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = Router()

// All routes require authentication
router.use(protect)

// ── Reward routes ─────────────────────────────────────────
router.post('/rewards/xp',    awardXP)
router.post('/rewards/coins', awardCoins)
router.post('/rewards/event', processEvent)   // unified single-call endpoint

// ── Streak route ──────────────────────────────────────────
router.post('/streak/update', updateStreak)

// ── Progress route ────────────────────────────────────────
router.get('/user/progress',  getUserProgress)

export default router
