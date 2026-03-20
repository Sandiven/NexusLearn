import { motion } from 'framer-motion'

const STATS = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00F5FF" strokeWidth="2">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
    ),
    label: 'XP Earned',
    value: '+2,400 XP',
    accent: '#00F5FF',
    glow: 'rgba(0,245,255,0.2)',
    delay: 0,
    floatOffset: 12,
    position: { top: '10%', right: '-5%' },
    mobilePosition: { top: '8%', right: '4%' },
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFB800" strokeWidth="2">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    label: 'Current Streak',
    value: '🔥 7 Days',
    accent: '#FFB800',
    glow: 'rgba(255,184,0,0.2)',
    delay: 0.6,
    floatOffset: 9,
    position: { top: '52%', right: '-8%' },
    mobilePosition: { top: '50%', right: '2%' },
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2">
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
    ),
    label: 'Global Rank',
    value: '# 12',
    accent: '#8B5CF6',
    glow: 'rgba(139,92,246,0.2)',
    delay: 1.2,
    floatOffset: 14,
    position: { top: '80%', right: '-4%' },
    mobilePosition: { top: '78%', right: '4%' },
  },
]

function FloatCard({ stat, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ delay: 0.8 + stat.delay, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position: 'absolute',
        ...stat.position,
      }}
      className="hidden lg:block"
    >
      <motion.div
        animate={{ y: [0, -stat.floatOffset, 0] }}
        transition={{
          duration: 3.5 + index * 0.7,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: stat.delay,
        }}
        style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${stat.accent}33`,
          borderRadius: '14px',
          padding: '14px 18px',
          minWidth: '148px',
          boxShadow: `0 8px 32px ${stat.glow}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          {stat.icon}
          <span
            style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '0.72rem',
              color: 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontWeight: 600,
            }}
          >
            {stat.label}
          </span>
        </div>
        <div
          style={{
            fontFamily: '"Syne", sans-serif',
            fontSize: '1.15rem',
            fontWeight: 800,
            color: stat.accent,
            letterSpacing: '-0.01em',
          }}
        >
          {stat.value}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function FloatingStats() {
  return (
    <>
      {STATS.map((stat, i) => (
        <FloatCard key={stat.label} stat={stat} index={i} />
      ))}
    </>
  )
}
