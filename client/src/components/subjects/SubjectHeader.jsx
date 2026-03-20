import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function SubjectHeader({ subject, completedCount, totalCount, accentColor, xpEarned = 0, totalXP = 150, courseCoins = 100 }) {
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '20px 32px',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Ambient glow strip */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
        background: `linear-gradient(90deg, transparent 0%, ${accentColor}60 40%, ${accentColor}60 60%, transparent 100%)`,
      }} />

      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>

        {/* Left: breadcrumb + title */}
        <div>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Link to="/dashboard" style={{ textDecoration: 'none' }}>
              <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', cursor: 'pointer' }}
                onMouseEnter={e => e.target.style.color = accentColor}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.35)'}
              >
                Dashboard
              </span>
            </Link>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
            <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', color: accentColor }}>
              {subject}
            </span>
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: '"Syne", sans-serif',
            fontWeight: 800,
            fontSize: 'clamp(1.4rem, 3vw, 2rem)',
            color: '#fff',
            letterSpacing: '-0.025em',
            margin: 0,
          }}>
            {subject}
          </h1>
        </div>

        {/* Right: progress stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>

          {/* Level count */}
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontFamily: '"Syne", sans-serif', fontWeight: 800,
              fontSize: '1.5rem', color: accentColor, lineHeight: 1,
            }}>
              {completedCount} <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '1rem', fontWeight: 600 }}>/ {totalCount}</span>
            </div>
            <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Levels Done
            </div>
          </div>

          {/* Circular progress ring */}
          <div style={{ position: 'relative', width: '56px', height: '56px', flexShrink: 0 }}>
            <svg width="56" height="56" viewBox="0 0 56 56" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="28" cy="28" r="23" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
              <motion.circle
                cx="28" cy="28" r="23"
                fill="none" stroke={accentColor} strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 23}
                initial={{ strokeDashoffset: 2 * Math.PI * 23 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 23 * (1 - pct / 100) }}
                transition={{ duration: 1.2, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
                style={{ filter: `drop-shadow(0 0 4px ${accentColor}80)` }}
              />
            </svg>
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '0.8rem', color: '#fff',
            }}>
              {pct}%
            </div>
          </div>

          {/* XP earned pill */}
          <div style={{
            background: `${accentColor}10`,
            border: `1px solid ${accentColor}25`,
            borderRadius: '10px', padding: '8px 14px',
          }}>
            <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
              XP Earned
            </div>
            <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '0.95rem', color: accentColor }}>
              {xpEarned} <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', fontWeight: 600 }}>/ {totalXP}</span>
            </div>
          </div>

          {/* Course completion coins */}
          <div style={{
            background: 'rgba(255,184,0,0.08)',
            border: '1px solid rgba(255,184,0,0.2)',
            borderRadius: '10px', padding: '8px 14px',
          }}>
            <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
              Course Coins
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFB800" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
              <span style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '0.95rem', color: '#FFB800' }}>{courseCoins}</span>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  )
}
