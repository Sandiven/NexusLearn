import { Router } from 'express'
import { getTodayDailyChallenge, submitDailyChallenge } from '../controllers/dailyChallengeController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = Router()

router.use(protect)

router.get('/',       getTodayDailyChallenge)  // GET  /api/daily-challenge
router.post('/submit', submitDailyChallenge)    // POST /api/daily-challenge/submit

export default router
