import { useEffect, useRef, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
import useGamificationStore, { getXPProgress } from '@store/gamificationStore'

/**
 * XPProgressBar
 * @param {boolean} compact      — slim version for navbar
 * @param {boolean} showLabel    — show level/XP text
 * @param {string}  accentColor
 */
export default function XPProgressBar({
  compact = false,
  showLabel = true,
  accentColor = '#00F5FF',
  style = {},
}) {
  const rawXp       = useGamificationStore(s => s.xp)
  const rawProgress  = useGamificationStore(s => s.progress)
  // Guard: ensure all fields have safe defaults even during initial hydration
  const xp       = rawXp       ?? 0
  const progress = {
    currentLevel: rawProgress?.currentLevel ?? 1,
    xpIntoLevel:  rawProgress?.xpIntoLevel  ?? 0,
    xpNeeded:     rawProgress?.xpNeeded     ?? 250,
    xpToNext:     rawProgress?.xpToNext     ?? 250,
    percentage:   rawProgress?.percentage   ?? 0,
  }
  const prevXpRef   = useRef(xp)
  const [flash, setFlash] = useState(false)

  // Spring-animated percentage value
  const springPct = useSpring(progress.percentage, {
    stiffness: 60,
    damping: 15,
    mass: 0.8,
  })

  useEffect(() => {
    springPct.set(progress.percentage)
    if (xp > prevXpRef.current) {
      setFlash(true)
      setTimeout(() => setFlash(false), 600)
    }
    prevXpRef.current = xp
  }, [progress.percentage, xp])

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', ...style }}>
        <div style={{
          width: '80px', height: '6px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '3px', overflow: 'hidden',
          flexShrink: 0,
        }}>
          <motion.div
            style={{
              height: '100%',
              width: useTransform(springPct, v => `${v}%`),
              background: `linear-gradient(90deg, ${accentColor}, ${accentColor}99)`,
              borderRadius: '3px',
              boxShadow: flash ? `0 0 8px ${accentColor}` : 'none',
              transition: 'box-shadow 0.3s',
            }}
          />
        </div>
        <span style={{
          fontFamily: '"Syne", sans-serif', fontWeight: 700,
          fontSize: '0.7rem', color: accentColor,
          whiteSpace: 'nowrap',
        }}>
          L{progress.currentLevel}
        </span>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', ...style }}>
      {showLabel && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          {/* Level badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <motion.div
              key={progress.currentLevel}
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                background: `${accentColor}18`,
                border: `1px solid ${accentColor}35`,
                borderRadius: '8px',
                padding: '3px 10px',
                fontFamily: '"Syne", sans-serif',
                fontWeight: 800, fontSize: '0.8rem', color: accentColor,
              }}
            >
              Level {progress.currentLevel}
            </motion.div>
            <motion.span
              animate={{ color: flash ? accentColor : 'rgba(255,255,255,0.9)' }}
              style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.9rem' }}
            >
              {xp.toLocaleString()} XP
            </motion.span>
          </div>

          {/* Next level */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
              {progress.xpToNext.toLocaleString()} to Level {progress.currentLevel + 1}
            </span>
          </div>
        </div>
      )}

      {/* Track */}
      <div style={{
        height: compact ? 5 : 10,
        background: 'rgba(255,255,255,0.07)',
        borderRadius: '6px',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Filled bar */}
        <motion.div
          style={{
            position: 'absolute', top: 0, left: 0, bottom: 0,
            width: useTransform(springPct, v => `${v}%`),
            background: `linear-gradient(90deg, ${accentColor}CC, ${accentColor})`,
            borderRadius: '6px',
            boxShadow: flash ? `0 0 14px ${accentColor}` : `0 0 6px ${accentColor}60`,
            transition: 'box-shadow 0.35s',
          }}
        />

        {/* Shimmer overlay */}
        <motion.div
          animate={{ x: ['−100%', '200%'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
          style={{
            position: 'absolute', top: 0, bottom: 0,
            width: '40%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
            borderRadius: '6px',
          }}
        />
      </div>

      {/* XP tick marks for sub-level context */}
      {!compact && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
          {[0, 25, 50, 75, 100].map(tick => (
            <div key={tick} style={{
              fontFamily: '"DM Sans", sans-serif', fontSize: '0.62rem',
              color: progress.percentage >= tick ? `${accentColor}80` : 'rgba(255,255,255,0.15)',
              transition: 'color 0.3s',
            }}>
              {tick}%
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
