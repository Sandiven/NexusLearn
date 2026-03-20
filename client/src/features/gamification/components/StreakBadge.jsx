import { motion, AnimatePresence } from 'framer-motion'
import useGamificationStore, { getStreakMilestoneLabel } from '@store/gamificationStore'

const STREAK_TIERS = [
  { min: 0,  max: 2,   color: 'rgba(255,255,255,0.4)', glow: 'none',                         size: 'sm' },
  { min: 3,  max: 6,   color: '#FFB800',               glow: 'rgba(255,184,0,0.3)',           size: 'md' },
  { min: 7,  max: 13,  color: '#FF6B35',               glow: 'rgba(255,107,53,0.4)',          size: 'md' },
  { min: 14, max: 29,  color: '#8B5CF6',               glow: 'rgba(139,92,246,0.4)',          size: 'lg' },
  { min: 30, max: 99,  color: '#00F5FF',               glow: 'rgba(0,245,255,0.4)',           size: 'lg' },
  { min: 100,max: 999, color: '#00FF88',               glow: 'rgba(0,255,136,0.5)',           size: 'xl' },
]

function getTier(streak) {
  return STREAK_TIERS.find(t => streak >= t.min && streak <= t.max) || STREAK_TIERS[0]
}

/**
 * StreakBadge
 * @param {boolean} compact   — small pill vs full card
 * @param {boolean} showFlame — show animated fire icon
 */
export default function StreakBadge({ compact = false, showFlame = true }) {
  const streak        = useGamificationStore(s => s.streak)
  const longestStreak = useGamificationStore(s => s.longestStreak)

  const tier      = getTier(streak)
  const milestone = getStreakMilestoneLabel(streak)
  const isActive  = streak > 0

  if (compact) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: `${tier.color}12`,
          border: `1px solid ${tier.color}30`,
          borderRadius: '10px', padding: '5px 12px',
          boxShadow: streak >= 3 ? `0 0 12px ${tier.glow}` : 'none',
          cursor: 'default',
        }}
      >
        <FlameIcon color={tier.color} size={14} animate={streak >= 3} />
        <span style={{
          fontFamily: '"Syne", sans-serif', fontWeight: 800,
          fontSize: '0.82rem', color: tier.color,
        }}>
          {streak}d
        </span>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: `${tier.color}08`,
        border: `1px solid ${tier.color}25`,
        borderRadius: '16px',
        padding: '18px 20px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: streak >= 3 ? `0 4px 24px ${tier.glow}` : 'none',
      }}
    >
      {/* Ambient glow top */}
      {streak >= 3 && (
        <div style={{
          position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px',
          background: `linear-gradient(90deg, transparent, ${tier.color}70, transparent)`,
        }} />
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <motion.div
            animate={streak >= 3 ? {
              filter: [
                `drop-shadow(0 0 4px ${tier.color})`,
                `drop-shadow(0 0 10px ${tier.color})`,
                `drop-shadow(0 0 4px ${tier.color})`,
              ],
            } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <FlameIcon color={tier.color} size={28} animate={streak >= 3} />
          </motion.div>

          <div>
            <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>
              {isActive ? 'Active Streak' : 'No Streak'}
            </div>
            <motion.div
              key={streak}
              initial={{ scale: 1.2, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                fontFamily: '"Syne", sans-serif', fontWeight: 800,
                fontSize: '1.5rem', color: tier.color,
                letterSpacing: '-0.02em', lineHeight: 1,
              }}
            >
              {streak} {streak === 1 ? 'Day' : 'Days'}
            </motion.div>
          </div>
        </div>

        {/* Longest streak */}
        {longestStreak > 0 && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', marginBottom: '2px' }}>
              Best
            </div>
            <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>
              {longestStreak}d
            </div>
          </div>
        )}
      </div>

      {/* Milestone badge */}
      <AnimatePresence>
        {milestone && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 10 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: `${milestone.accent}15`,
              border: `1px solid ${milestone.accent}35`,
              borderRadius: '8px', padding: '4px 10px',
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              style={{ width: '5px', height: '5px', borderRadius: '50%', background: milestone.accent }}
            />
            <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', fontWeight: 600, color: milestone.accent }}>
              {milestone.label}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Streak progress to next milestone */}
      <StreakProgressBar streak={streak} tierColor={tier.color} />
    </motion.div>
  )
}

function StreakProgressBar({ streak, tierColor }) {
  const MILESTONES = [3, 7, 14, 30, 60, 100]
  const nextMilestone = MILESTONES.find(m => m > streak) || null
  if (!nextMilestone) return null

  const prevMilestone = MILESTONES.slice().reverse().find(m => m <= streak) || 0
  const progress = ((streak - prevMilestone) / (nextMilestone - prevMilestone)) * 100

  return (
    <div style={{ marginTop: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
        <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)' }}>
          {streak - prevMilestone} / {nextMilestone - prevMilestone} days to next milestone
        </span>
        <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.68rem', color: tierColor }}>
          {nextMilestone}d
        </span>
      </div>
      <div style={{ height: '4px', background: 'rgba(255,255,255,0.07)', borderRadius: '2px', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          style={{ height: '100%', background: `linear-gradient(90deg, ${tierColor}80, ${tierColor})`, borderRadius: '2px' }}
        />
      </div>
    </div>
  )
}

function FlameIcon({ color, size = 20, animate: shouldAnimate }) {
  return (
    <motion.svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      animate={shouldAnimate ? { scaleY: [1, 1.06, 1], scaleX: [1, 0.97, 1] } : {}}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      style={{ transformOrigin: 'bottom center' }}
    >
      <path
        d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"
        fill={`${color}30`}
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.svg>
  )
}
