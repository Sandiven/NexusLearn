import { Router } from 'express'
import {
  recordProblemSolve,
  getProblemProgress,
  getStreakCalendar,
  getXPHistory,
} from '../controllers/problemsController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = Router()
router.use(protect)

// ── Problem solve tracking ────────────────────────────────
router.post('/problems/solve',            recordProblemSolve)
router.get('/problems/progress',          getProblemProgress)
router.get('/problems/streak-calendar',   getStreakCalendar)

// ── XP history graph ──────────────────────────────────────
router.get('/user/xp-history',            getXPHistory)

export default router
