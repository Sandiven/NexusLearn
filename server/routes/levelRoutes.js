import { Router } from 'express'
import {
  getLevelById,
  getQuestionsByLevel,
  completeLevel,
  getSubjectLevelProgress,
  getQuestionsBySubjectLevel,
  updateContentProgress,
  seedDemoContent,
} from '../controllers/levelController.js'
import { protect, restrictTo } from '../middleware/authMiddleware.js'

const router = Router()

// Subject-level-based routes (new)
router.get('/subject/:slug/progress',               protect, getSubjectLevelProgress)
router.get('/subject/:slug/questions/:levelNumber', protect, getQuestionsBySubjectLevel)

// Progress update (lecture/notes completion)
router.post('/progress/update', protect, updateContentProgress)

// Submit quiz answers
router.post('/complete', protect, completeLevel)

// Seed demo content (admin or open for demo)
router.post('/seed', seedDemoContent)

// Legacy routes (kept for backward compat)
router.get('/questions/:levelId', protect, getQuestionsByLevel)
router.get('/:id',                protect, getLevelById)

export default router
