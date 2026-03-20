import { Router } from 'express'
import { getNotifications, markRead } from '../controllers/notificationController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = Router()
router.use(protect)

router.get('/',           getNotifications)
router.post('/mark-read', markRead)

export default router
