import { Router } from 'express'
import {
  getAllSubjects,
  getSubjectBySlug,
  createSubject,
  getMySubjectProgress,
} from '../controllers/subjectController.js'
import { protect, restrictTo } from '../middleware/authMiddleware.js'

const router = Router()

router.get('/progress/me', protect, getMySubjectProgress)  // must be before /:slug
router.get('/', getAllSubjects)
router.get('/:slug', getSubjectBySlug)
router.post('/', protect, restrictTo('admin'), createSubject)

export default router
