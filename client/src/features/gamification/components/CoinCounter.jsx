import { useEffect, useRef } from 'react'
import { motion, useSpring, useTransform, animate } from 'framer-motion'
import useGamificationStore from '@store/gamificationStore'

/**
 * CoinCounter
 * @param {boolean} compact      — inline pill vs full display
 * @param {boolean} showLabel
 * @param {boolean} animated     — enable count-up animation
 */
export default function CoinCounter({ compact = false, showLabel = true, animated = true }) {
  const coins      = useGamificationStore(s => s.coins)
  const prevRef    = useRef(coins)
  const displayRef = useRef(null)

  useEffect(() => {
    if (!animated || !displayRef.current) {
      prevRef.current = coins
      return
    }

    const from = prevRef.current
    const to   = coins

    if (from === to) return

    const ctrl = animate(from, to, {
      duration: 0.7,
      ease: [0.4, 0, 0.2, 1],
      onUpdate: (v) => {
        if (displayRef.current) {
          displayRef.current.textContent = Math.round(v).toLocaleString()
        }
      },
    })

    prevRef.current = coins
    return () => ctrl.stop()
  }, [coins, animated])

  const gained = coins > prevRef.current

  if (compact) {
    return (
      <motion.div
        animate={gained ? { scale: [1, 1.15, 1] } : {}}
        transition={{ duration: 0.3 }}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          background: 'rgba(255,184,0,0.08)',
          border: '1px solid rgba(255,184,0,0.2)',
          borderRadius: '8px', padding: '3px 10px',
        }}
      >
        <CoinIcon size={12} />
        <span
          ref={displayRef}
          style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '0.82rem', color: '#FFB800' }}
        >
          {coins.toLocaleString()}
        </span>
      </motion.div>
    )
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '14px',
      background: 'rgba(255,184,0,0.06)',
      border: '1px solid rgba(255,184,0,0.15)',
      borderRadius: '14px', padding: '14px 18px',
    }}>
      {/* Coin icon with pulse */}
      <motion.div
        animate={gained ? {
          scale:  [1, 1.3, 1],
          rotate: [0, 15, -10, 0],
          filter: ['drop-shadow(0 0 4px #FFB800)', 'drop-shadow(0 0 12px #FFB800)', 'drop-shadow(0 0 4px #FFB800)'],
        } : {}}
        transition={{ duration: 0.5 }}
        style={{ flexShrink: 0 }}
      >
        <CoinIcon size={28} />
      </motion.div>

      <div>
        {showLabel && (
          <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>
            Coins
          </div>
        )}
        <span
          ref={displayRef}
          style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.4rem', color: '#FFB800', letterSpacing: '-0.02em' }}
        >
          {coins.toLocaleString()}
        </span>
      </div>
    </div>
  )
}

function CoinIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="rgba(255,184,0,0.15)" stroke="#FFB800" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="7"  fill="rgba(255,184,0,0.1)"  stroke="#FFB800" strokeWidth="1" strokeOpacity="0.5" />
      <text x="12" y="16" textAnchor="middle" fill="#FFB800" fontSize="8" fontWeight="bold" fontFamily="Syne, sans-serif">
        C
      </text>
    </svg>
  )
}
