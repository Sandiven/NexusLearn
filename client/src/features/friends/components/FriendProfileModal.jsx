import { motion, AnimatePresence } from 'framer-motion'
import TierBadge from '@features/leaderboard/components/TierBadge'
import { getTier } from '@/data/leaderboardData'

const BADGE_COLORS = [
  '#00F5FF', '#FFB800', '#8B5CF6', '#00FF88', '#FF6B35', '#0080FF',
]

function StatBox({ label, value, color, icon }) {
  return (
    <div style={{
      background: `${color}08`, border: `1px solid ${color}20`,
      borderRadius: '12px', padding: '14px 16px', flex: 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '6px' }}>
        <span style={{ color, fontSize: '0.9rem' }}>{icon}</span>
        <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      </div>
      <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.2rem', color, letterSpacing: '-0.01em' }}>{value}</div>
    </div>
  )
}

export default function FriendProfileModal({ friend, onClose }) {
  if (!friend) return null

  const tier  = getTier(friend.rank || 99)
  const xpPct = Math.min((friend.xp % 3000) / 3000 * 100, 100)

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, x: 48, scale: 0.97 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 32, scale: 0.98 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        onClick={e => e.stopPropagation()}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: '100%', maxWidth: '380px', zIndex: 201,
          background: 'rgba(12,12,20,0.98)',
          backdropFilter: 'blur(24px)',
          borderLeft: `1px solid ${tier.color}20`,
          overflowY: 'auto',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Top accent */}
        <div style={{ height: '2px', background: `linear-gradient(90deg, transparent, ${tier.color}, transparent)`, flexShrink: 0 }} />

        <div style={{ padding: '24px', flex: 1 }}>
          {/* Close button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
            <motion.button
              whileHover={{ background: 'rgba(255,255,255,0.08)' }}
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '8px', color: 'rgba(255,255,255,0.4)', display: 'flex' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </motion.button>
          </div>

          {/* Hero section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ textAlign: 'center', marginBottom: '28px' }}
          >
            {/* Large avatar */}
            <motion.div
              animate={{ boxShadow: [`0 0 16px ${tier.color}30`, `0 0 32px ${tier.color}50`, `0 0 16px ${tier.color}30`] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 16px',
                background: `${tier.color}18`, border: `2px solid ${tier.color}50`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.4rem', color: tier.color,
              }}
            >
              {friend.avatar?.slice(0, 2) || '??'}
            </motion.div>

            <h2 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.4rem', color: '#fff', letterSpacing: '-0.02em', marginBottom: '8px' }}>
              {friend.username}
            </h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
              <TierBadge tier={tier.label} showName size="md" />
              {friend.rank && (
                <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '4px 10px', fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)' }}>
                  Rank #{friend.rank}
                </div>
              )}
            </div>
            <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>
              Level {friend.level} · {friend.lastActive}
            </div>
          </motion.div>

          {/* XP Progress */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px', marginBottom: '20px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1rem', color: tier.color }}>{friend.xp?.toLocaleString()} XP</span>
              <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>{Math.round(3000 - friend.xp % 3000)} to Lv.{friend.level + 1}</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${xpPct}%` }}
                transition={{ duration: 1, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
                style={{ height: '100%', background: `linear-gradient(90deg, ${tier.color}80, ${tier.color})`, borderRadius: '3px' }}
              />
            </div>
          </motion.div>

          {/* Stats grid */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}
          >
            <StatBox label="Streak"  value={`${friend.streak}d`}               color="#FF6B35" icon="🔥" />
            <StatBox label="Best"    value={`${friend.longestStreak || 0}d`}   color="#FFB800" icon="⚡" />
            <StatBox label="Coins"   value={(friend.coins || 0).toLocaleString()} color="#FFB800" icon="●" />
            <StatBox label="Levels"  value={friend.totalLevels || 0}           color="#8B5CF6" icon="▲" />
          </motion.div>

          {/* Badges */}
          {friend.badges?.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              style={{ marginBottom: '24px' }}
            >
              <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
                Badges
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                {friend.badges.map((badge, i) => (
                  <div key={badge} style={{
                    background: `${BADGE_COLORS[i % BADGE_COLORS.length]}10`,
                    border: `1px solid ${BADGE_COLORS[i % BADGE_COLORS.length]}25`,
                    borderRadius: '8px', padding: '4px 10px',
                    fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', fontWeight: 600,
                    color: BADGE_COLORS[i % BADGE_COLORS.length],
                  }}>
                    {badge}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer actions */}
        <div style={{ padding: '16px 24px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '10px', flexShrink: 0 }}>
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 6px 24px rgba(255,80,96,0.3)' }}
            whileTap={{ scale: 0.97 }}
            style={{
              width: '100%', padding: '13px', background: 'linear-gradient(135deg, #FF4060, #CC2040)',
              border: 'none', borderRadius: '12px', cursor: 'pointer',
              fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              opacity: 0.7,  // disabled until fight system ships
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" />
            </svg>
            Challenge to Fight
            <span style={{ fontSize: '0.68rem', background: 'rgba(255,255,255,0.15)', borderRadius: '4px', padding: '1px 6px' }}>Soon</span>
          </motion.button>
          <motion.button
            whileHover={{ background: 'rgba(255,80,80,0.1)', borderColor: 'rgba(255,80,80,0.3)', color: '#FF5050' }}
            onClick={onClose}
            style={{ width: '100%', padding: '11px', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', transition: 'all 0.18s' }}
          >
            Close
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
