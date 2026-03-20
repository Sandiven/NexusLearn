import { Router } from 'express'
import {
  getAllAchievements,
  getUserAchievements,
  checkAndAwardAchievements,
} from '../controllers/achievementController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = Router()

router.use(protect)

router.get('/',         getAllAchievements)       // GET  /api/achievements
router.get('/mine',     getUserAchievements)       // GET  /api/achievements/mine
router.post('/check',   checkAndAwardAchievements) // POST /api/achievements/check

export default router
