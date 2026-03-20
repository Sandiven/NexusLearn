import { motion } from 'framer-motion'
import TierBadge from './TierBadge'
import { getTier, formatTime } from '@/data/leaderboardData'

const RANK_STYLE = {
  1: { color: '#FFB800', bg: 'rgba(255,184,0,0.15)', border: 'rgba(255,184,0,0.4)',  size: 40 },
  2: { color: '#C0C0C0', bg: 'rgba(192,192,192,0.1)', border: 'rgba(192,192,192,0.3)', size: 36 },
  3: { color: '#CD7F32', bg: 'rgba(205,127,50,0.12)', border: 'rgba(205,127,50,0.3)', size: 36 },
}
const DEFAULT_RANK_STYLE = { color: 'rgba(255,255,255,0.3)', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)', size: 32 }

function RankBadge({ rank }) {
  const s = RANK_STYLE[rank] || DEFAULT_RANK_STYLE
  return (
    <div style={{
      width: `${s.size}px`, height: `${s.size}px`,
      borderRadius: '50%',
      background: s.bg, border: `1px solid ${s.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: '"Syne", sans-serif', fontWeight: 800,
      fontSize: rank <= 3 ? '0.82rem' : '0.72rem',
      color: s.color, flexShrink: 0,
      boxShadow: rank <= 3 ? `0 0 12px ${s.border}` : 'none',
    }}>
      #{rank}
    </div>
  )
}

function AvatarCircle({ initials, tier }) {
  return (
    <div style={{
      width: '36px', height: '36px', borderRadius: '50%',
      background: `${tier.color}14`,
      border: `1px solid ${tier.color}30`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: '"Syne", sans-serif', fontWeight: 700,
      fontSize: '0.68rem', color: tier.color, flexShrink: 0,
      letterSpacing: '0.02em',
    }}>
      {(initials || '??').slice(0, 2).toUpperCase()}
    </div>
  )
}

/**
 * LeaderboardRow
 * @param {object}  entry          — leaderboard row data
 * @param {boolean} isCurrentUser  — highlight this row
 * @param {string}  mode           — 'global' | 'contest'
 * @param {number}  animDelay      — stagger delay
 */
export default function LeaderboardRow({ entry, isCurrentUser, mode = 'global', animDelay = 0 }) {
  const tier   = getTier(entry.rank)
  const isTop3 = entry.rank <= 3

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1], delay: animDelay }}
      whileHover={!isCurrentUser ? {
        background: 'rgba(255,255,255,0.04)',
        transition: { duration: 0.15 },
      } : {}}
      style={{
        display:       'flex',
        alignItems:    'center',
        gap:           '12px',
        padding:       '12px 16px',
        borderRadius:  '12px',
        background:    isCurrentUser ? `${tier.color}07` : 'transparent',
        border:        isCurrentUser ? `1px solid ${tier.color}22` : '1px solid transparent',
        boxShadow:     isCurrentUser ? `0 0 20px ${tier.color}12` : 'none',
        position:      'relative',
        overflow:      'hidden',
        cursor:        'default',
        transition:    'background 0.2s',
      }}
    >
      {/* Top-3 left accent bar */}
      {isTop3 && (
        <div style={{
          position: 'absolute', left: 0, top: '20%', bottom: '20%',
          width: '3px', borderRadius: '2px',
          background: `${RANK_STYLE[entry.rank]?.color}`,
          boxShadow:  `0 0 8px ${RANK_STYLE[entry.rank]?.color}`,
        }} />
      )}

      {/* Rank */}
      <RankBadge rank={entry.rank} />

      {/* Avatar */}
      <AvatarCircle initials={entry.avatar || entry.username} tier={tier} />

      {/* Name + tier */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '2px' }}>
          <span style={{
            fontFamily:     '"Syne", sans-serif',
            fontWeight:     700,
            fontSize:       '0.9rem',
            color:          isCurrentUser ? tier.color : '#fff',
            whiteSpace:     'nowrap',
            overflow:       'hidden',
            textOverflow:   'ellipsis',
            maxWidth:       '140px',
          }}>
            {entry.username}
          </span>
          {isCurrentUser && (
            <span style={{
              fontFamily: '"DM Sans", sans-serif', fontSize: '0.62rem',
              color: tier.color, fontWeight: 600, opacity: 0.7,
            }}>
              (you)
            </span>
          )}
          <TierBadge tier={tier.label} size="sm" />
        </div>

        {/* Sub-info */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {entry.level !== undefined && (
            <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.32)' }}>
              Lv.{entry.level}
            </span>
          )}
          {entry.streak > 0 && (
            <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.7rem', color: 'rgba(255,107,53,0.7)' }}>
              🔥{entry.streak}d
            </span>
          )}
          {mode === 'contest' && entry.correctAnswers !== undefined && (
            <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.32)' }}>
              {entry.correctAnswers}/{entry.totalQuestions} · {formatTime(entry.completionTime)}
            </span>
          )}
        </div>
      </div>

      {/* Right: primary metric */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        {mode === 'global' ? (
          <>
            <div style={{
              fontFamily:  '"Syne", sans-serif', fontWeight: 800,
              fontSize:    '0.92rem',
              color:       isTop3 ? RANK_STYLE[entry.rank]?.color : 'rgba(255,255,255,0.8)',
              letterSpacing: '-0.01em',
            }}>
              {(entry.xp || 0).toLocaleString()}
            </div>
            <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.65rem', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              XP
            </div>
          </>
        ) : (
          <>
            <div style={{
              fontFamily: '"Syne", sans-serif', fontWeight: 800,
              fontSize: '0.92rem', color: isTop3 ? RANK_STYLE[entry.rank]?.color : 'rgba(255,255,255,0.8)',
            }}>
              {(entry.score || 0).toLocaleString()}
            </div>
            <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.65rem', color: '#00F5FF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              +{entry.xpAwarded} XP
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}
