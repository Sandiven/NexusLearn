import { motion } from 'framer-motion'
import RankCircle from '@components/ui/RankCircle'
import GlassCard from '@components/ui/GlassCard'

const LEADERS = [
  { rank: 1, name: 'CyberMind',    xp: 48200, subject: 'Math',    avatar: 'CM', streak: 34 },
  { rank: 2, name: 'NightOwl',     xp: 41500, subject: 'Physics', avatar: 'NO', streak: 21 },
  { rank: 3, name: 'QuantumCoder', xp: 38900, subject: 'CS',      avatar: 'QC', streak: 15 },
  { rank: 4, name: 'StellarMind',  xp: 35200, subject: 'Chem',    avatar: 'SM', streak: 9  },
  { rank: 5, name: 'NovaSpark',    xp: 29800, subject: 'Bio',     avatar: 'NS', streak: 7  },
]

const RANK_AVATAR_COLORS = {
  1: { bg: 'rgba(255,184,0,0.15)',  border: 'rgba(255,184,0,0.3)',  text: '#FFB800' },
  2: { bg: 'rgba(192,192,192,0.1)', border: 'rgba(192,192,192,0.2)', text: '#C0C0C0' },
  3: { bg: 'rgba(205,127,50,0.1)',  border: 'rgba(205,127,50,0.2)', text: '#CD7F32' },
}

function LeaderRow({ leader, index, currentUserRank }) {
  const isCurrentUser = leader.rank === currentUserRank
  const avatarStyle = RANK_AVATAR_COLORS[leader.rank] || {
    bg: 'rgba(255,255,255,0.05)',
    border: 'rgba(255,255,255,0.1)',
    text: 'rgba(255,255,255,0.5)',
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      whileHover={{ background: 'rgba(255,255,255,0.03)' }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 12px',
        borderRadius: '10px',
        background: isCurrentUser ? 'rgba(0,245,255,0.04)' : 'transparent',
        border: isCurrentUser ? '1px solid rgba(0,245,255,0.15)' : '1px solid transparent',
        transition: 'background 0.18s',
        cursor: 'default',
      }}
    >
      <RankCircle rank={leader.rank} size={32} />

      {/* Avatar */}
      <div style={{
        width: '32px', height: '32px', borderRadius: '50%',
        background: avatarStyle.bg,
        border: `1px solid ${avatarStyle.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: '"Syne", sans-serif', fontWeight: 700,
        fontSize: '0.65rem', color: avatarStyle.text, flexShrink: 0,
      }}>
        {leader.avatar}
      </div>

      {/* Name + subject */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: '"Syne", sans-serif', fontWeight: 700,
          fontSize: '0.85rem', color: isCurrentUser ? '#00F5FF' : '#fff',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {leader.name}
          {isCurrentUser && <span style={{ color: '#00F5FF', fontSize: '0.65rem', marginLeft: '5px' }}>(you)</span>}
        </div>
        <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
          🔥 {leader.streak}d · {leader.subject}
        </div>
      </div>

      {/* XP */}
      <div style={{
        fontFamily: '"Syne", sans-serif', fontWeight: 700,
        fontSize: '0.82rem',
        color: leader.rank === 1 ? '#FFB800' : 'rgba(255,255,255,0.6)',
        flexShrink: 0, textAlign: 'right',
      }}>
        {(leader.xp / 1000).toFixed(1)}K
        <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)', fontWeight: 400 }}>xp</div>
      </div>
    </motion.div>
  )
}

export default function LeaderboardPreview({ currentUserRank = null }) {
  return (
    <div style={{ height: '100%' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}
      >
        <h2 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1.05rem', color: '#fff', margin: 0 }}>
          Leaderboard
        </h2>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          background: 'rgba(255,184,0,0.08)',
          border: '1px solid rgba(255,184,0,0.2)',
          borderRadius: '8px', padding: '3px 10px',
        }}>
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#FFB800' }}
          />
          <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.7rem', color: '#FFB800', fontWeight: 600 }}>
            LIVE
          </span>
        </div>
      </motion.div>

      {/* Card */}
      <GlassCard style={{ padding: '8px', overflow: 'hidden' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', padding: '4px', marginBottom: '4px',
          background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
          {['Global', 'Friends', 'Weekly'].map((tab, i) => (
            <button key={tab} style={{
              flex: 1, padding: '6px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: i === 0 ? 'rgba(0,245,255,0.1)' : 'transparent',
              color: i === 0 ? '#00F5FF' : 'rgba(255,255,255,0.35)',
              fontFamily: '"DM Sans", sans-serif', fontSize: '0.75rem', fontWeight: 600,
              transition: 'background 0.15s, color 0.15s',
            }}
              onMouseEnter={e => { if (i !== 0) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}}
              onMouseLeave={e => { if (i !== 0) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Rows */}
        {LEADERS.map((leader, i) => (
          <LeaderRow key={leader.rank} leader={leader} index={i} currentUserRank={currentUserRank} />
        ))}

        {/* Footer */}
        <div style={{ padding: '10px 12px 4px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '4px' }}>
          <motion.button
            whileHover={{ color: '#00F5FF' }}
            style={{ background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem',
              color: 'rgba(255,255,255,0.35)', fontWeight: 500,
              display: 'inline-flex', alignItems: 'center', gap: '4px',
            }}
          >
            View full leaderboard
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </motion.button>
        </div>
      </GlassCard>
    </div>
  )
}
