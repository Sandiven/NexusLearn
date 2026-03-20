import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getTier } from '@/data/leaderboardData'
import { getRelativeTime } from '@/data/friendsData'
import TierBadge from '@features/leaderboard/components/TierBadge'

export default function FriendRequestCard({ request, onAccept, onReject, index = 0 }) {
  const [status, setStatus] = useState('idle') // idle | accepting | rejecting | accepted | rejected
  const sender = request.sender
  const tier   = getTier(sender.rank || 99)

  const handleAccept = async () => {
    setStatus('accepting')
    await onAccept?.(request._id)
    setStatus('accepted')
  }

  const handleReject = async () => {
    setStatus('rejecting')
    await onReject?.(request._id)
    setStatus('rejected')
  }

  const isDone = status === 'accepted' || status === 'rejected'

  return (
    <AnimatePresence>
      {!isDone ? (
        <motion.div
          key="card"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40, scale: 0.95, height: 0, marginBottom: 0, padding: 0 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1], delay: index * 0.06 }}
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px', padding: '16px 18px',
            display: 'flex', alignItems: 'center', gap: '14px',
            position: 'relative', overflow: 'hidden',
          }}
        >
          {/* Left accent */}
          <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: '3px', borderRadius: '2px', background: '#8B5CF6', boxShadow: '0 0 8px rgba(139,92,246,0.6)' }} />

          {/* Avatar */}
          <div style={{
            width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
            background: `${tier.color}14`, border: `1.5px solid ${tier.color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '0.82rem', color: tier.color,
          }}>
            {sender.avatar?.slice(0, 2) || '??'}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '3px' }}>
              <span style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>
                {sender.username}
              </span>
              <TierBadge tier={tier.label} size="sm" />
            </div>
            <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.73rem', color: 'rgba(255,255,255,0.4)' }}>
              Lv.{sender.level} · {sender.xp?.toLocaleString()} XP · {getRelativeTime(request.createdAt)}
            </div>
            {request.message && (
              <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', marginTop: '5px', fontStyle: 'italic' }}>
                "{request.message}"
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 4px 16px rgba(0,255,136,0.3)' }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAccept}
              disabled={status !== 'idle'}
              style={{
                padding: '8px 16px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #00FF88, #00CC6A)',
                color: '#000', fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.8rem',
                display: 'flex', alignItems: 'center', gap: '5px',
              }}
            >
              {status === 'accepting' ? (
                <motion.svg animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="rgba(0,0,0,0.2)" strokeWidth="3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="#000" strokeWidth="3" strokeLinecap="round" />
                </motion.svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
              )}
              Accept
            </motion.button>

            <motion.button
              whileHover={{ background: 'rgba(255,80,80,0.12)', borderColor: 'rgba(255,80,80,0.35)', color: '#FF5050', scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReject}
              disabled={status !== 'idle'}
              style={{
                padding: '8px 12px', borderRadius: '9px',
                background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer',
                color: 'rgba(255,255,255,0.45)', fontFamily: '"DM Sans", sans-serif', fontSize: '0.8rem',
                display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.18s',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              Decline
            </motion.button>
          </div>
        </motion.div>
      ) : (
        /* Accepted/rejected feedback flash */
        <motion.div
          key="done"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, height: 0 }}
          style={{
            background: status === 'accepted' ? 'rgba(0,255,136,0.06)' : 'rgba(255,80,80,0.05)',
            border: `1px solid ${status === 'accepted' ? 'rgba(0,255,136,0.2)' : 'rgba(255,80,80,0.15)'}`,
            borderRadius: '14px', padding: '14px 18px',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}
        >
          {status === 'accepted' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00FF88" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,80,80,0.7)" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          )}
          <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', color: status === 'accepted' ? '#00FF88' : 'rgba(255,80,80,0.7)' }}>
            {status === 'accepted' ? `You and ${sender.username} are now friends!` : `Request from ${sender.username} declined.`}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
