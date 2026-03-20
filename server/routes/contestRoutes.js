import { Router } from 'express'
import { getContests, getContestById, submitContest, getContestResults } from '../controllers/contestController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = Router()

router.get('/',                    protect, getContests)
router.get('/results/:contestId',  protect, getContestResults)
router.get('/:id',                 protect, getContestById)
router.post('/submit',             protect, submitContest)

export default router
