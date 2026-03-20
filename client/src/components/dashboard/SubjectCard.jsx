import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

// Circular progress ring
function ProgressRing({ progress, size = 40, strokeWidth = 3, color }) {
  const r = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - progress * circumference

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      {/* Track */}
      <circle cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={strokeWidth}
      />
      {/* Progress */}
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
        style={{ filter: `drop-shadow(0 0 4px ${color}80)` }}
      />
    </svg>
  )
}

/**
 * SubjectCard
 * @param {object} subject — { id, name, slug, completedLevels, totalLevels, xp, accentColor, icon }
 * @param {number} index   — for stagger animation
 */
export default function SubjectCard({ subject, index = 0 }) {
  const navigate = useNavigate()
  const {
    name = 'Subject',
    slug = 'subject',
    completedLevels = 0,
    totalLevels = 10,
    xp = 0,
    accentColor = '#00F5FF',
    icon,
  } = subject

  const progress = totalLevels > 0 ? completedLevels / totalLevels : 0
  const pct = Math.round(progress * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: index * 0.07 }}
      whileHover={{
        y: -5,
        boxShadow: `0 14px 40px ${accentColor}18`,
        borderColor: `${accentColor}30`,
        transition: { duration: 0.22 },
      }}
      onClick={() => navigate(`/subject/${slug}`)}
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '22px',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top accent */}
      <div style={{
        position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px',
        background: `linear-gradient(90deg, transparent, ${accentColor}50, transparent)`,
      }} />

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        {/* Icon + name */}
        <div>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: `${accentColor}12`,
            border: `1px solid ${accentColor}25`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: accentColor, marginBottom: '12px',
          }}>
            {icon || (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            )}
          </div>
          <h3 style={{
            fontFamily: '"Syne", sans-serif', fontWeight: 700,
            fontSize: '0.95rem', color: '#fff',
            letterSpacing: '-0.01em', margin: 0,
          }}>
            {name}
          </h3>
        </div>

        {/* Progress ring */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <ProgressRing progress={progress} size={44} strokeWidth={3} color={accentColor} />
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: '"Syne", sans-serif', fontWeight: 800,
            fontSize: '0.62rem', color: accentColor,
          }}>
            {pct}%
          </div>
        </div>
      </div>

      {/* Footer stats */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginBottom: '2px' }}>
            Levels
          </div>
          <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.88rem', color: 'rgba(255,255,255,0.8)' }}>
            {completedLevels} / {totalLevels}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginBottom: '2px' }}>
            XP Earned
          </div>
          <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.88rem', color: accentColor }}>
            {xp.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginTop: '14px', height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.07)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, delay: 0.2 + index * 0.07, ease: [0.4, 0, 0.2, 1] }}
          style={{ height: '100%', borderRadius: '2px', background: `linear-gradient(90deg, ${accentColor}, ${accentColor}80)` }}
        />
      </div>
    </motion.div>
  )
}
