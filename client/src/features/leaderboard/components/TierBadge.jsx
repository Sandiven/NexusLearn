import { motion } from 'framer-motion'
import { TIERS, getTier } from '@/data/leaderboardData'

/**
 * TierBadge
 * @param {string}  tier     — 'S+' | 'S' | 'A' | 'B' | 'C'
 * @param {number}  rank     — alternatively derive tier from rank
 * @param {boolean} showName — show full tier name (Elite, Pro…)
 * @param {string}  size     — 'sm' | 'md' | 'lg'
 */
export default function TierBadge({ tier, rank, showName = false, size = 'md', animate: shouldAnimate = true }) {
  const tierKey = tier || (rank ? getTier(rank).label : 'C')
  const config  = TIERS[tierKey] || TIERS['C']
  const isElite = tierKey === 'S+'

  const sizes = {
    sm: { padding: '2px 7px',  fontSize: '0.65rem', gap: '4px', borderRadius: '6px' },
    md: { padding: '4px 10px', fontSize: '0.72rem', gap: '5px', borderRadius: '8px' },
    lg: { padding: '6px 14px', fontSize: '0.82rem', gap: '7px', borderRadius: '10px' },
  }
  const s = sizes[size] || sizes.md

  return (
    <motion.div
      animate={shouldAnimate && isElite ? {
        boxShadow: [`0 0 8px ${config.glow}`, `0 0 18px ${config.glow}`, `0 0 8px ${config.glow}`],
      } : {}}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        display:        'inline-flex',
        alignItems:     'center',
        gap:            s.gap,
        background:     config.bg,
        border:         `1px solid ${config.border}`,
        borderRadius:   s.borderRadius,
        padding:        s.padding,
        boxShadow:      tierKey !== 'C' ? `0 0 8px ${config.glow}` : 'none',
        flexShrink:     0,
      }}
    >
      {/* Tier label */}
      <span style={{
        fontFamily:    '"Syne", sans-serif',
        fontWeight:    800,
        fontSize:      s.fontSize,
        color:         config.color,
        letterSpacing: '0.02em',
        lineHeight:    1,
      }}>
        {config.label}
      </span>

      {/* Optional name */}
      {showName && (
        <span style={{
          fontFamily:    '"DM Sans", sans-serif',
          fontWeight:    600,
          fontSize:      `calc(${s.fontSize} - 0.04rem)`,
          color:         `${config.color}99`,
          letterSpacing: '0.03em',
        }}>
          {config.name}
        </span>
      )}
    </motion.div>
  )
}
