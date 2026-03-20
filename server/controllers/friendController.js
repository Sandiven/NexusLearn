import User from '../models/User.js'
import FriendRequest from '../models/FriendRequest.js'

const FRIEND_FIELDS = 'username avatar xp coins streak level longestStreak'

// GET /api/users/search?q=
export const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query
    if (!q || q.trim().length < 2) return res.status(400).json({ message: 'Query must be at least 2 chars' })
    const currentUser = await User.findById(req.user._id).select('friends')
    const users = await User.find({
      _id: { $ne: req.user._id, $nin: currentUser.friends },
      username: { $regex: q.trim(), $options: 'i' },
      isActive: true,
    }).select(FRIEND_FIELDS).limit(20)
    const pendingOut = await FriendRequest.find({
      sender: req.user._id,
      recipient: { $in: users.map(u => u._id) },
      status: 'pending',
    }).select('recipient')
    const pendingIds = new Set(pendingOut.map(r => r.recipient.toString()))
    const results = users.map(u => ({ ...u.toObject(), requestPending: pendingIds.has(u._id.toString()) }))
    res.status(200).json({ success: true, data: results })
  } catch (err) { next(err) }
}

// POST /api/friends/request
export const sendFriendRequest = async (req, res, next) => {
  try {
    const { recipientId, message = '' } = req.body
    const senderId = req.user._id
    if (recipientId === senderId.toString()) return res.status(400).json({ message: 'Cannot request yourself' })
    const recipient = await User.findById(recipientId)
    if (!recipient) return res.status(404).json({ message: 'User not found' })
    const currentUser = await User.findById(senderId).select('friends')
    if (currentUser.friends.map(f => f.toString()).includes(recipientId)) return res.status(409).json({ message: 'Already friends' })
    const existing = await FriendRequest.findOne({ $or: [{ sender: senderId, recipient: recipientId }, { sender: recipientId, recipient: senderId }] })
    if (existing) {
      if (existing.status === 'pending') return res.status(409).json({ message: 'Request already pending' })
      if (existing.status === 'rejected') { existing.status = 'pending'; existing.message = message; await existing.save(); return res.status(200).json({ success: true, data: existing }) }
    }
    const request = await FriendRequest.create({ sender: senderId, recipient: recipientId, message })
    res.status(201).json({ success: true, data: request })
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Request already exists' })
    next(err)
  }
}

// POST /api/friends/accept
export const acceptFriendRequest = async (req, res, next) => {
  try {
    const { requestId } = req.body
    const request = await FriendRequest.findById(requestId)
    if (!request) return res.status(404).json({ message: 'Request not found' })
    if (request.recipient.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorised' })
    if (request.status !== 'pending') return res.status(400).json({ message: `Already ${request.status}` })
    request.status = 'accepted'
    await request.save()
    await Promise.all([
      User.findByIdAndUpdate(request.sender,    { $addToSet: { friends: request.recipient } }),
      User.findByIdAndUpdate(request.recipient, { $addToSet: { friends: request.sender } }),
    ])
    const newFriend = await User.findById(request.sender).select(FRIEND_FIELDS)
    res.status(200).json({ success: true, data: { request, newFriend } })
  } catch (err) { next(err) }
}

// POST /api/friends/reject
export const rejectFriendRequest = async (req, res, next) => {
  try {
    const { requestId } = req.body
    const request = await FriendRequest.findById(requestId)
    if (!request) return res.status(404).json({ message: 'Request not found' })
    if (request.recipient.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorised' })
    request.status = 'rejected'
    await request.save()
    res.status(200).json({ success: true })
  } catch (err) { next(err) }
}

// DELETE /api/friends/request/:requestId  — sender withdraws their own pending request
export const withdrawFriendRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params
    const request = await FriendRequest.findById(requestId)
    if (!request) return res.status(404).json({ message: 'Request not found' })
    // Only the original sender can withdraw
    if (request.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the sender can withdraw a request' })
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ message: `Cannot withdraw a ${request.status} request` })
    }
    await FriendRequest.findByIdAndDelete(requestId)
    res.status(200).json({ success: true })
  } catch (err) { next(err) }
}

// DELETE /api/friends/:friendId
export const removeFriend = async (req, res, next) => {
  try {
    const { friendId } = req.params
    await Promise.all([
      User.findByIdAndUpdate(req.user._id, { $pull: { friends: friendId } }),
      User.findByIdAndUpdate(friendId,     { $pull: { friends: req.user._id } }),
    ])
    await FriendRequest.findOneAndDelete({ $or: [{ sender: req.user._id, recipient: friendId }, { sender: friendId, recipient: req.user._id }] })
    res.status(200).json({ success: true })
  } catch (err) { next(err) }
}

// GET /api/friends/list
export const getFriendsList = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({ path: 'friends', select: FRIEND_FIELDS })
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.status(200).json({ success: true, data: user.friends })
  } catch (err) { next(err) }
}

// GET /api/friends/requests
export const getIncomingRequests = async (req, res, next) => {
  try {
    const requests = await FriendRequest.find({ recipient: req.user._id, status: 'pending' })
      .populate('sender', FRIEND_FIELDS).sort({ createdAt: -1 })
    res.status(200).json({ success: true, data: requests })
  } catch (err) { next(err) }
}

// GET /api/friends/requests/sent
export const getSentRequests = async (req, res, next) => {
  try {
    const requests = await FriendRequest.find({ sender: req.user._id, status: 'pending' })
      .populate('recipient', FRIEND_FIELDS).sort({ createdAt: -1 })
    res.status(200).json({ success: true, data: requests })
  } catch (err) { next(err) }
}
