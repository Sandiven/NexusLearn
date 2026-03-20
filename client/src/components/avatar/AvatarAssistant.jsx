import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore from '@store/authStore'

const MESSAGES = [
  "You're close to unlocking the next level! Keep going.",
  "You haven't completed today's challenge yet.",
  "Your streak is at {streak} days — don't break it!",
  "Try a contest to boost your ranking.",
  "You've earned {xp} XP so far. Amazing progress!",
]

function SpeechBubble({ message, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.95 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position: 'absolute',
        bottom: 'calc(100% + 12px)',
        right: 0,
        width: '240px',
        background: 'rgba(18,18,26,0.96)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0,245,255,0.2)',
        borderRadius: '14px',
        padding: '14px 16px',
        boxShadow: '0 8px 32px rgba(0,245,255,0.12)',
        zIndex: 200,
      }}
    >
      {/* Tail */}
      <div style={{
        position: 'absolute', bottom: '-6px', right: '22px',
        width: '12px', height: '12px',
        background: 'rgba(18,18,26,0.96)',
        border: '1px solid rgba(0,245,255,0.2)',
        borderTop: 'none', borderLeft: 'none',
        transform: 'rotate(45deg)',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00F5FF', boxShadow: '0 0 6px #00F5FF' }}
          />
          <span style={{ fontFamily: '"Syne", sans-serif', fontSize: '0.72rem', fontWeight: 700, color: '#00F5FF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Nexus AI
          </span>
        </div>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'rgba(255,255,255,0.3)', padding: '2px',
          display: 'flex', alignItems: 'center',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <p style={{
        fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem',
        color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, margin: 0,
      }}>
        {message}
      </p>
    </motion.div>
  )
}

// Animated hex avatar SVG
function HexAvatar({ glowing }) {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      {/* Glow ring when active */}
      {glowing && (
        <motion.circle
          cx="24" cy="24" r="22"
          stroke="#00F5FF" strokeWidth="1"
          strokeOpacity="0.4"
          fill="none"
          animate={{ r: [22, 24, 22], strokeOpacity: [0.4, 0.1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      {/* Hex shape */}
      <polygon
        points="24,4 40,14 40,34 24,44 8,34 8,14"
        fill="rgba(0,245,255,0.12)"
        stroke="#00F5FF"
        strokeWidth="1.5"
      />
      <polygon
        points="24,10 36,17 36,31 24,38 12,31 12,17"
        fill="rgba(0,245,255,0.06)"
        stroke="#00F5FF"
        strokeWidth="1"
        strokeOpacity="0.5"
      />
      {/* Face / core */}
      <circle cx="24" cy="24" r="5" fill="#00F5FF" opacity="0.9" />
      <circle cx="22" cy="22" r="1.5" fill="rgba(0,0,0,0.4)" />
      <circle cx="26" cy="22" r="1.5" fill="rgba(0,0,0,0.4)" />
      {/* Smile */}
      <path d="M21 26 Q24 29 27 26" stroke="rgba(0,0,0,0.4)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}

export default function AvatarAssistant() {
  const [open, setOpen] = useState(false)
  const [msgIndex, setMsgIndex] = useState(0)

  const user = useAuthStore(s => s.user)
  const xp     = user?.xp     ?? 2450
  const streak = user?.streak ?? 5

  const getMessage = () =>
    MESSAGES[msgIndex]
      .replace('{streak}', streak)
      .replace('{xp}', xp.toLocaleString())

  const handleClick = () => {
    if (!open) {
      setMsgIndex(Math.floor(Math.random() * MESSAGES.length))
    }
    setOpen(!open)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position: 'fixed', bottom: '24px', right: '24px',
        zIndex: 150,
      }}
    >
      {/* Speech bubble */}
      <div style={{ position: 'relative' }}>
        <AnimatePresence>
          {open && (
            <SpeechBubble message={getMessage()} onClose={() => setOpen(false)} />
          )}
        </AnimatePresence>

        {/* Floating avatar button */}
        <motion.button
          onClick={handleClick}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.94 }}
          style={{
            background: 'rgba(15,15,20,0.9)',
            backdropFilter: 'blur(20px)',
            border: open ? '1px solid rgba(0,245,255,0.4)' : '1px solid rgba(0,245,255,0.2)',
            borderRadius: '50%',
            width: '60px', height: '60px',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: open
              ? '0 8px 32px rgba(0,245,255,0.3)'
              : '0 4px 20px rgba(0,245,255,0.15)',
            transition: 'box-shadow 0.25s, border-color 0.25s',
          }}
        >
          <HexAvatar glowing={open} />
        </motion.button>

        {/* Notification dot */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
          style={{
            position: 'absolute', top: '2px', right: '2px',
            width: '10px', height: '10px', borderRadius: '50%',
            background: '#FFB800',
            border: '2px solid rgba(15,15,20,0.9)',
            boxShadow: '0 0 6px rgba(255,184,0,0.6)',
          }}
        />
      </div>
    </motion.div>
  )
}
