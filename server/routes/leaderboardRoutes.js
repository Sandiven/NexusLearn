import { Router } from 'express'
import {
  getGlobalLeaderboard,
  getContestLeaderboard,
  getUserRank,
  searchLeaderboard,
} from '../controllers/leaderboardController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = Router()

router.use(protect) // all leaderboard routes require auth

router.get('/global',             getGlobalLeaderboard)
router.get('/search',             searchLeaderboard)
router.get('/contest/:contestId', getContestLeaderboard)
router.get('/user/:userId',       getUserRank)

export default router
