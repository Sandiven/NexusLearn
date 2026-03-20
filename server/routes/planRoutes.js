import { Router } from 'express'
import {
  getCatalogue,
  getMyPlans,
  enrollPlan,
  configurePlan,
  recordProgress,
} from '../controllers/planController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = Router()
router.use(protect)

router.get('/catalogue',             getCatalogue)
router.get('/mine',                  getMyPlans)
router.post('/enroll',               enrollPlan)
router.patch('/:planId/configure',   configurePlan)
router.post('/:planId/progress',     recordProgress)

export default router
