import { Router } from 'express'
import {
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  withdrawFriendRequest,
  removeFriend,
  getFriendsList,
  getIncomingRequests,
  getSentRequests,
} from '../controllers/friendController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = Router()

router.use(protect)

// User search (mounted separately on /api/users)
router.get('/search',           searchUsers)

// Friend management
router.get('/list',             getFriendsList)
router.get('/requests',         getIncomingRequests)
router.get('/requests/sent',    getSentRequests)

router.post('/request',         sendFriendRequest)
router.post('/accept',          acceptFriendRequest)
router.post('/reject',          rejectFriendRequest)
router.delete('/request/:requestId', withdrawFriendRequest)

router.delete('/:friendId',     removeFriend)

export default router
