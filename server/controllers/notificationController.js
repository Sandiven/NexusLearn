import FriendRequest from '../models/FriendRequest.js'
import Fight        from '../models/Fight.js'
import User         from '../models/User.js'

const FRIEND_FIELDS = 'username avatar level xp'

// ── GET /api/notifications ────────────────────────────────
// Aggregates real-time notifications for the current user:
//   1. Incoming friend requests (pending)
//   2. Friend request accepted (recent, last 48h)
//   3. Friend request declined (recent, last 48h)
//   4. Fight invitations received (invited status)
//   5. Fight accepted / cancelled status updates (recent)
export const getNotifications = async (req, res, next) => {
  try {
    const userId   = req.user._id
    const since48h = new Date(Date.now() - 48 * 3600 * 1000)

    // 1. Incoming pending friend requests
    const incomingFriendReqs = await FriendRequest.find({
      recipient: userId,
      status:    'pending',
    }).populate('sender', FRIEND_FIELDS).sort({ createdAt: -1 }).limit(20)

    // 2. Friend requests I sent — recently accepted or rejected
    const myResolvedReqs = await FriendRequest.find({
      sender:    userId,
      status:    { $in: ['accepted', 'rejected'] },
      updatedAt: { $gte: since48h },
    }).populate('recipient', FRIEND_FIELDS).sort({ updatedAt: -1 }).limit(10)

    // 3. Fight challenges where I am player2 (invited) and status is 'invited'
    const fightInvites = await Fight.find({
      'player2.user': userId,
      status:          'invited',
    }).populate('player1.user', FRIEND_FIELDS)
      .sort({ createdAt: -1 }).limit(10)

    // 4. Fights I was invited to — recently accepted or cancelled
    const resolvedFights = await Fight.find({
      $or: [
        { 'player2.user': userId, status: { $in: ['accepted','cancelled'] } },
        { 'player1.user': userId, status: { $in: ['accepted','cancelled'] } },
      ],
      updatedAt: { $gte: since48h },
    }).populate('player1.user', FRIEND_FIELDS)
      .populate('player2.user', FRIEND_FIELDS)
      .sort({ updatedAt: -1 }).limit(10)

    // Build notification list
    const notifications = []

    for (const req of incomingFriendReqs) {
      notifications.push({
        id:      `fr-${req._id}`,
        type:    'friend_request',
        title:   'Friend Request',
        message: `${req.sender?.username} sent you a friend request`,
        data:    { requestId: req._id, sender: req.sender },
        time:    req.createdAt,
        action:  true,  // can accept/decline
      })
    }

    for (const req of myResolvedReqs) {
      notifications.push({
        id:      `fr-res-${req._id}`,
        type:    req.status === 'accepted' ? 'friend_accepted' : 'friend_declined',
        title:   req.status === 'accepted' ? 'Friend Request Accepted' : 'Friend Request Declined',
        message: req.status === 'accepted'
          ? `${req.recipient?.username} accepted your friend request!`
          : `${req.recipient?.username} declined your friend request`,
        data:    { requestId: req._id, user: req.recipient },
        time:    req.updatedAt,
        action:  false,
      })
    }

    for (const fight of fightInvites) {
      const p1 = fight.player1?.user
      notifications.push({
        id:      `fight-inv-${fight._id}`,
        type:    'fight_invite',
        title:   '1v1 Challenge!',
        message: `${p1?.username} challenged you to a ${fight.subjectSlug.replace(/-/g,' ')} 1v1!`,
        data:    { fightId: fight._id, challenger: p1, subjectSlug: fight.subjectSlug },
        time:    fight.createdAt,
        action:  true,   // can accept
        fightId: fight._id,
      })
    }

    for (const fight of resolvedFights) {
      const isP1  = fight.player1.user?._id?.toString() === userId.toString()
      const other = isP1 ? fight.player2?.user : fight.player1?.user

      if (fight.status === 'cancelled') {
        notifications.push({
          id:      `fight-cancel-${fight._id}`,
          type:    'fight_cancelled',
          title:   'Challenge Cancelled',
          message: `The 1v1 challenge with ${other?.username} was cancelled`,
          data:    { fightId: fight._id, user: other },
          time:    fight.updatedAt,
          action:  false,
        })
      } else if (fight.status === 'accepted') {
        notifications.push({
          id:      `fight-acc-${fight._id}`,
          type:    'fight_accepted',
          title:   'Challenge Accepted!',
          message: `${other?.username} accepted your 1v1 challenge!`,
          data:    { fightId: fight._id, user: other },
          time:    fight.updatedAt,
          action:  false,
        })
      }
    }

    // Sort by time, newest first
    notifications.sort((a, b) => new Date(b.time) - new Date(a.time))

    res.status(200).json({ success: true, data: notifications })
  } catch (err) { next(err) }
}

// ── POST /api/notifications/mark-read ────────────────────
// No-op for now (could mark fight/request as seen in future)
export const markRead = async (req, res, next) => {
  res.status(200).json({ success: true })
}
