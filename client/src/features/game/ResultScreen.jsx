import { motion } from 'framer-motion'

// ─────────────────────────────────────────────────────────
// ResultScreen
// Props:
//   outcome     — 'win' | 'lose'
//   xpAwarded   — number (shown on win)
//   coinsAwarded— number (shown on win)
//   onRestart   — callback to reset game
//   onExit      — callback to navigate away
// ─────────────────────────────────────────────────────────
export default function ResultScreen({ outcome, xpAwarded, coinsAwarded, onRestart, onExit }) {
  const isWin = outcome === 'win'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
      style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '28px', padding: '48px 32px',
        maxWidth: '440px', width: '100%',
        position: 'relative',
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', inset: '-40px',
        background: isWin
          ? 'radial-gradient(ellipse at 50% 50%, rgba(0,255,136,0.08) 0%, transparent 65%)'
          : 'radial-gradient(ellipse at 50% 50%, rgba(255,80,80,0.06) 0%, transparent 65%)',
        filter: 'blur(20px)', pointerEvents: 'none',
      }} />

      {/* Icon */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
        style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: isWin ? 'rgba(0,255,136,0.08)' : 'rgba(255,80,80,0.08)',
          border: `1.5px solid ${isWin ? 'rgba(0,255,136,0.3)' : 'rgba(255,80,80,0.3)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: isWin ? '0 0 40px rgba(0,255,136,0.15)' : '0 0 30px rgba(255,80,80,0.12)',
        }}
      >
        {isWin ? (
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#00FF88" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        ) : (
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#FF5050" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        )}
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        style={{ textAlign: 'center' }}
      >
        <h2 style={{
          fontFamily: '"Syne", sans-serif', fontWeight: 800,
          fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
          color: isWin ? '#00FF88' : '#FF6B6B',
          letterSpacing: '-0.025em', margin: '0 0 8px',
          textShadow: isWin ? '0 0 30px rgba(0,255,136,0.25)' : 'none',
        }}>
          {isWin ? 'Quest Complete' : 'Quest Failed'}
        </h2>
        <p style={{
          fontFamily: '"DM Sans", sans-serif', fontSize: '0.88rem',
          color: 'rgba(255,255,255,0.45)', margin: 0,
        }}>
          {isWin
            ? 'You conquered all the doors. Well done.'
            : 'The doors remain. Try again.'}
        </p>
      </motion.div>

      {/* Reward display (win only) */}
      {isWin && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.32 }}
          style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}
        >
          {[
            { label: 'XP Earned', value: `+${xpAwarded}`, color: '#00F5FF', icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00F5FF" strokeWidth="2.5">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
              </svg>
            )},
            { label: 'Coins Earned', value: `+${coinsAwarded}`, color: '#FFB800', icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFB800" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/>
              </svg>
            )},
          ].map(item => (
            <motion.div
              key={item.label}
              whileHover={{ y: -2 }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
                background: `${item.color}08`,
                border: `1px solid ${item.color}25`,
                borderRadius: '14px', padding: '16px 24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                {item.icon}
                <span style={{
                  fontFamily: '"Syne", sans-serif', fontWeight: 800,
                  fontSize: '1.3rem', color: item.color,
                }}>
                  {item.value}
                </span>
              </div>
              <span style={{
                fontFamily: '"DM Sans", sans-serif', fontSize: '0.7rem',
                color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                {item.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.45 }}
        style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}
      >
        <motion.button
          whileHover={{ scale: 1.04, boxShadow: isWin ? '0 6px 20px rgba(0,245,255,0.2)' : '0 6px 20px rgba(255,80,80,0.15)' }}
          whileTap={{ scale: 0.97 }}
          onClick={onRestart}
          style={{
            padding: '12px 28px',
            background: isWin
              ? 'linear-gradient(135deg, rgba(0,245,255,0.18), rgba(0,245,255,0.08))'
              : 'linear-gradient(135deg, rgba(255,80,80,0.18), rgba(255,80,80,0.08))',
            border: `1px solid ${isWin ? 'rgba(0,245,255,0.35)' : 'rgba(255,80,80,0.35)'}`,
            borderRadius: '12px',
            cursor: 'pointer',
            fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.9rem',
            color: isWin ? '#00F5FF' : '#FF7070',
            letterSpacing: '0.02em',
          }}
        >
          {isWin ? 'Play Again' : 'Try Again'}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03, background: 'rgba(255,255,255,0.07)' }}
          whileTap={{ scale: 0.97 }}
          onClick={onExit}
          style={{
            padding: '12px 28px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            cursor: 'pointer',
            fontFamily: '"Syne", sans-serif', fontWeight: 600, fontSize: '0.9rem',
            color: 'rgba(255,255,255,0.55)',
            transition: 'background 0.2s',
          }}
        >
          Exit
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
