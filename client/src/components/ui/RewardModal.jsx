import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

// Particle confetti burst
function Particle({ angle, color, delay }) {
  const rad = (angle * Math.PI) / 180
  const dist = 80 + Math.random() * 60

  return (
    <motion.div
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{
        x: Math.cos(rad) * dist,
        y: Math.sin(rad) * dist,
        opacity: 0,
        scale: 0.3,
      }}
      transition={{ duration: 0.9, delay, ease: [0.1, 0.7, 0.3, 1] }}
      style={{
        position: 'absolute',
        width: `${4 + Math.random() * 5}px`,
        height: `${4 + Math.random() * 5}px`,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
        background: color,
        left: '50%',
        top: '30%',
        pointerEvents: 'none',
      }}
    />
  )
}

function ConfettiBurst({ active }) {
  const colors = ['#00F5FF', '#FFB800', '#00FF88', '#8B5CF6', '#0080FF', '#FF6B35']
  const particles = Array.from({ length: 24 }, (_, i) => ({
    angle: (i / 24) * 360,
    color: colors[i % colors.length],
    delay: Math.random() * 0.15,
  }))

  if (!active) return null

  return (
    <>
      {particles.map((p, i) => (
        <Particle key={i} {...p} />
      ))}
    </>
  )
}

/**
 * RewardModal
 * @param {boolean}  show
 * @param {number}   xp
 * @param {number}   coins
 * @param {number}   score
 * @param {boolean}  passed
 * @param {string}   levelTitle
 * @param {function} onContinue
 */
export default function RewardModal({ show, xp, coins, score, passed, levelTitle, onContinue }) {
  const [burst, setBurst] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (show && passed) {
      const t = setTimeout(() => setBurst(true), 300)
      return () => clearTimeout(t)
    }
  }, [show, passed])

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)',
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 32 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 16 }}
            transition={{ duration: 0.4, ease: [0.34, 1.2, 0.64, 1] }}
            style={{
              position: 'fixed', inset: 0, zIndex: 201,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '24px',
              pointerEvents: 'none',
            }}
          >
            <div style={{
              width: '100%', maxWidth: '420px',
              background: 'rgba(15,15,20,0.96)',
              backdropFilter: 'blur(24px)',
              border: passed ? '1px solid rgba(0,255,136,0.25)' : '1px solid rgba(255,80,80,0.25)',
              borderRadius: '20px',
              padding: '36px 32px',
              position: 'relative',
              overflow: 'hidden',
              pointerEvents: 'all',
              textAlign: 'center',
            }}>

              {/* Top accent */}
              <div style={{
                position: 'absolute', top: 0, left: '10%', right: '10%', height: '2px',
                background: passed
                  ? 'linear-gradient(90deg, transparent, #00FF88, transparent)'
                  : 'linear-gradient(90deg, transparent, #FF5050, transparent)',
              }} />

              {/* Confetti burst */}
              <ConfettiBurst active={burst} />

              {/* Icon */}
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, duration: 0.5, ease: [0.34, 1.4, 0.64, 1] }}
                style={{
                  width: '72px', height: '72px', borderRadius: '50%',
                  background: passed ? 'rgba(0,255,136,0.12)' : 'rgba(255,80,80,0.12)',
                  border: passed ? '2px solid rgba(0,255,136,0.3)' : '2px solid rgba(255,80,80,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                  boxShadow: passed ? '0 0 32px rgba(0,255,136,0.2)' : '0 0 32px rgba(255,80,80,0.2)',
                }}
              >
                {passed ? (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00FF88" strokeWidth="2">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                  </svg>
                ) : (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF5050" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                )}
              </motion.div>

              {/* Title */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', color: passed ? '#00FF88' : '#FF5050', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                  {passed ? 'Level Complete' : 'Try Again'}
                </div>
                <h2 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.6rem', color: '#fff', letterSpacing: '-0.025em', marginBottom: '6px' }}>
                  {passed ? levelTitle : 'Not quite there'}
                </h2>
                <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '2rem', color: passed ? '#00FF88' : '#FF8080', marginBottom: '24px' }}>
                  {score}%
                </div>
              </motion.div>

              {/* Rewards */}
              {passed && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '28px' }}
                >
                  {[
                    { value: `+${xp}`, label: 'XP', color: '#00F5FF', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg> },
                    { value: `+${coins}`, label: 'COINS', color: '#FFB800', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg> },
                  ].map((reward) => (
                    <motion.div
                      key={reward.label}
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.45, type: 'spring', stiffness: 260, damping: 16 }}
                      style={{
                        background: `${reward.color}10`,
                        border: `1px solid ${reward.color}30`,
                        borderRadius: '14px', padding: '16px 24px',
                        color: reward.color,
                        minWidth: '110px',
                        boxShadow: `0 0 20px ${reward.color}15`,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '6px' }}>
                        {reward.icon}
                      </div>
                      <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.6rem', lineHeight: 1 }}>{reward.value}</div>
                      <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '4px' }}>
                        {reward.label}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {!passed && (
                <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginBottom: '24px' }}>
                  You need 70% to pass. Review the notes and try again.
                </p>
              )}

              {/* Button */}
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: passed ? '0 8px 32px rgba(0,255,136,0.3)' : '0 8px 32px rgba(139,92,246,0.3)' }}
                whileTap={{ scale: 0.97 }}
                onClick={onContinue}
                style={{
                  width: '100%', padding: '15px',
                  background: passed
                    ? 'linear-gradient(135deg, #00FF88, #00CC6A)'
                    : 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                  color: passed ? '#000' : '#fff',
                  border: 'none', borderRadius: '12px', cursor: 'pointer',
                  fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                {passed ? (
                  <>Return to Map <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg></>
                ) : (
                  <>Try Again <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg></>
                )}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
