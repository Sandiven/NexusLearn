import { motion } from 'framer-motion'
import { getTier } from '@/data/leaderboardData'
import { getActivityColor } from '@/data/friendsData'
import TierBadge from '@features/leaderboard/components/TierBadge'

/**
 * FriendCard
 * @param {object}   friend        — friend data object
 * @param {function} onClick       — open profile modal
 * @param {function} onRemove      — remove friend
 * @param {number}   index         — stagger delay index
 */
export default function FriendCard({ friend, onClick, onRemove, index = 0 }) {
  const tier         = getTier(friend.rank || 99)
  const activityColor = getActivityColor(friend.lastActive)
  const xpPct        = Math.min((friend.xp % 3000) / 3000 * 100, 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: index * 0.06 }}
      whileHover={{ y: -4, boxShadow: `0 12px 36px ${tier.color}15`, borderColor: `${tier.color}28`, transition: { duration: 0.22 } }}
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px', padding: '20px',
        cursor: 'pointer', position: 'relative', overflow: 'hidden',
      }}
      onClick={() => onClick(friend)}
    >
      {/* Top tier accent */}
      <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px', background: `linear-gradient(90deg, transparent, ${tier.color}50, transparent)` }} />

      {/* Header: avatar + name + tier */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
        {/* Avatar with activity dot */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '50%',
            background: `${tier.color}14`, border: `1.5px solid ${tier.color}35`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '0.82rem', color: tier.color,
          }}>
            {friend.avatar?.slice(0, 2) || '??'}
          </div>
          {/* Activity indicator */}
          <div style={{
            position: 'absolute', bottom: 0, right: 0,
            width: '11px', height: '11px', borderRadius: '50%',
            background: activityColor,
            border: '2px solid rgba(15,15,20,0.9)',
            boxShadow: activityColor !== 'rgba(255,255,255,0.25)' ? `0 0 6px ${activityColor}` : 'none',
          }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '3px' }}>
            <span style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {friend.username}
            </span>
            <TierBadge tier={tier.label} size="sm" />
          </div>
          <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.73rem', color: 'rgba(255,255,255,0.35)' }}>
            Level {friend.level} · {friend.lastActive}
          </div>
        </div>

        {/* Remove button */}
        <motion.button
          whileHover={{ background: 'rgba(255,80,80,0.12)', color: '#FF5050' }}
          onClick={e => { e.stopPropagation(); onRemove?.(friend._id) }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px', color: 'rgba(255,255,255,0.2)', display: 'flex', flexShrink: 0, transition: 'all 0.18s' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            <line x1="23" y1="11" x2="17" y2="11" />
          </svg>
        </motion.button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: '14px', marginBottom: '12px' }}>
        {[
          { label: 'XP', value: friend.xp?.toLocaleString(), color: '#00F5FF', icon: '⚡' },
          { label: 'Streak', value: `${friend.streak}d`, color: '#FF6B35', icon: '🔥' },
          { label: 'Coins', value: friend.coins?.toLocaleString(), color: '#FFB800', icon: '●' },
        ].map(stat => (
          <div key={stat.label} style={{ flex: 1 }}>
            <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
              {stat.label}
            </div>
            <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.82rem', color: stat.color }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* XP progress bar */}
      <div>
        <div style={{ height: '4px', background: 'rgba(255,255,255,0.07)', borderRadius: '2px', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${xpPct}%` }}
            transition={{ duration: 0.8, delay: index * 0.06 + 0.2, ease: [0.4, 0, 0.2, 1] }}
            style={{ height: '100%', background: `linear-gradient(90deg, ${tier.color}80, ${tier.color})`, borderRadius: '2px' }}
          />
        </div>
        <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.63rem', color: 'rgba(255,255,255,0.2)', marginTop: '3px' }}>
          {Math.round(xpPct)}% to Level {friend.level + 1}
        </div>
      </div>
    </motion.div>
  )
}
