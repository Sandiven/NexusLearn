// import { Router } from 'express'
// import {
//   inviteToFight,
//   acceptFight,
//   getFight,
//   getPendingFights,
//   getActiveFight,
//   readyUp,
//   advanceFight,
//   joinQueue,
//   leaveQueue,
//   challengeFriend,
//   cancelChallenge,
//   declineChallenge,
//   cleanupStaleFights,
// } from '../controllers/fightController.js'
// import { protect } from '../middleware/authMiddleware.js'

// const router = Router()
// router.use(protect)

// router.post('/invite',              inviteToFight)
// router.post('/accept',              acceptFight)
// router.get('/active',               getActiveFight)
// router.get('/pending',              getPendingFights)
// router.post('/queue/join',          joinQueue)
// router.post('/queue/leave',         leaveQueue)
// router.post('/challenge',           challengeFriend)
// router.post('/cleanup-stale',       cleanupStaleFights)
// router.delete('/:id/cancel',        cancelChallenge)
// router.post('/:id/decline',         declineChallenge)
// router.post('/:id/ready',           readyUp)
// router.post('/:id/advance',         advanceFight)
// router.get('/:id',                  getFight)

// export default router
import { Router } from 'express'
import {
  inviteToFight,
  acceptFight,
  getFight,
  getPendingFights,
  getActiveFight,
  readyUp,
  advanceFight,
  joinQueue,
  leaveQueue,
  challengeFriend,
  cancelChallenge,
  declineChallenge,
  cleanupStaleFights,
} from '../controllers/fightController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = Router()
router.use(protect)

router.post('/invite',              inviteToFight)
router.post('/accept',              acceptFight)
router.get('/active',               getActiveFight)
router.get('/pending',              getPendingFights)
router.post('/queue/join',          joinQueue)
router.post('/queue/leave',         leaveQueue)
router.post('/challenge',           challengeFriend)
router.post('/cleanup-stale',       cleanupStaleFights)
router.delete('/:id/cancel',        cancelChallenge)
router.post('/:id/decline',         declineChallenge)
router.post('/:id/ready',           readyUp)
router.post('/:id/advance',         advanceFight)
router.get('/:id',                  getFight)

export default router
