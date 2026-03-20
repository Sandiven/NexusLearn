import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatTime } from '@/data/contestData'

/**
 * ContestTimer
 * @param {number}   totalSeconds   — total contest time
 * @param {number}   remaining      — seconds left
 * @param {boolean}  isRunning
 * @param {function} onExpire       — called when timer hits 0
 */
export default function ContestTimer({ totalSeconds, remaining, isRunning, onExpire, compact = false }) {
  const prevRef  = useRef(remaining)
  const hasExpired = useRef(false)

  useEffect(() => {
    if (remaining <= 0 && isRunning && !hasExpired.current) {
      hasExpired.current = true
      onExpire?.()
    }
    prevRef.current = remaining
  }, [remaining, isRunning])

  const pct       = totalSeconds > 0 ? (remaining / totalSeconds) * 100 : 0
  const isUrgent  = remaining <= 60  && remaining > 0
  const isCritical= remaining <= 15  && remaining > 0
  const isDone    = remaining <= 0

  const color = isDone     ? '#FF5050'
    : isCritical           ? '#FF5050'
    : isUrgent             ? '#FFB800'
    : '#00F5FF'

  const circumference = 2 * Math.PI * 22  // r=22

  if (compact) {
    return (
      <motion.div
        animate={isCritical ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 0.5, repeat: isCritical ? Infinity : 0 }}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '7px',
          background: `${color}12`,
          border: `1px solid ${color}35`,
          borderRadius: '10px', padding: '6px 14px',
          boxShadow: isUrgent ? `0 0 16px ${color}30` : 'none',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
        </svg>
        <span style={{
          fontFamily: '"Syne", sans-serif', fontWeight: 800,
          fontSize: '0.95rem',
          color,
          letterSpacing: '0.02em',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {formatTime(Math.max(0, remaining))}
        </span>
      </motion.div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
      {/* Circular progress ring */}
      <div style={{ position: 'relative', width: '64px', height: '64px' }}>
        <svg width="64" height="64" viewBox="0 0 64 64" style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle cx="32" cy="32" r="22" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
          {/* Progress */}
          <motion.circle
            cx="32" cy="32" r="22"
            fill="none" stroke={color} strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: circumference * (1 - pct / 100) }}
            transition={{ duration: 0.8, ease: 'linear' }}
            style={{ filter: `drop-shadow(0 0 6px ${color}90)` }}
          />
        </svg>

        {/* Critical flash */}
        {isCritical && (
          <motion.div
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: `radial-gradient(circle, ${color}40, transparent 70%)`,
            }}
          />
        )}

        {/* Time text in center */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column',
        }}>
          <motion.span
            key={remaining}
            animate={isCritical ? { scale: [1, 1.12, 1] } : {}}
            transition={{ duration: 0.3 }}
            style={{
              fontFamily: '"Syne", sans-serif', fontWeight: 800,
              fontSize: '0.82rem', color,
              letterSpacing: '-0.01em',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {formatTime(Math.max(0, remaining))}
          </motion.span>
        </div>
      </div>

      {/* Label */}
      <span style={{
        fontFamily: '"DM Sans", sans-serif', fontSize: '0.7rem',
        color: isUrgent ? color : 'rgba(255,255,255,0.35)',
        textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600,
      }}>
        {isDone ? 'Time Up' : isUrgent ? 'Hurry!' : 'Remaining'}
      </span>
    </div>
  )
}
