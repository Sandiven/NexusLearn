import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useGamificationStore from '@store/gamificationStore'

// ── Floating reward chip ─────────────────────────────────
function FloatingChip({ value, label, color, x, y, onDone }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 0, x, scale: 0.7 }}
      animate={{ opacity: [0, 1, 1, 0], y: -80, scale: [0.7, 1.1, 1, 0.9] }}
      transition={{ duration: 1.4, ease: [0.2, 0.8, 0.4, 1] }}
      onAnimationComplete={onDone}
      style={{
        position: 'fixed',
        bottom: '80px',
        right: `${60 + x}px`,
        zIndex: 9999,
        pointerEvents: 'none',
        display: 'flex', alignItems: 'center', gap: '5px',
        background: `${color}18`,
        border: `1px solid ${color}50`,
        borderRadius: '20px',
        padding: '5px 12px',
        boxShadow: `0 4px 20px ${color}30`,
      }}
    >
      <span style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '0.9rem', color }}>
        {value}
      </span>
      <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', color: `${color}99`, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </span>
    </motion.div>
  )
}

// ── Level-up burst overlay ────────────────────────────────
function LevelUpBurst({ fromLevel, toLevel, onDone }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 1, 0] }}
      transition={{ duration: 2.5, times: [0, 0.1, 0.5, 0.8, 1] }}
      onAnimationComplete={onDone}
      style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      {/* Radial burst */}
      <motion.div
        initial={{ scale: 0, opacity: 0.8 }}
        animate={{ scale: 4, opacity: 0 }}
        transition={{ duration: 1.2, ease: [0.2, 0.8, 0.4, 1] }}
        style={{
          position: 'absolute',
          width: '200px', height: '200px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,184,0,0.3) 0%, transparent 70%)',
        }}
      />

      {/* Text */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5, ease: [0.34, 1.4, 0.64, 1] }}
        style={{ textAlign: 'center' }}
      >
        <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.8rem', fontWeight: 600, color: '#FFB800', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
          Level Up!
        </div>
        <div style={{
          fontFamily: '"Syne", sans-serif', fontWeight: 800,
          fontSize: 'clamp(3rem, 8vw, 5rem)', color: '#fff',
          letterSpacing: '-0.03em', lineHeight: 1,
          textShadow: '0 0 40px rgba(255,184,0,0.5)',
        }}>
          {toLevel}
        </div>
        <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>
          {fromLevel} → {toLevel}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Main RewardAnimation controller ──────────────────────
export default function RewardAnimation() {
  const { pendingReward, levelUpData, clearPendingReward, clearLevelUp } = useGamificationStore()
  const [chips, setChips] = useState([])
  const [showLevelUp, setShowLevelUp] = useState(false)

  useEffect(() => {
    if (!pendingReward) return

    const newChips = []

    if (pendingReward.xp > 0) {
      newChips.push({
        id:    `xp-${Date.now()}`,
        value: `+${pendingReward.xp}`,
        label: 'XP',
        color: '#00F5FF',
        x:     Math.random() * 40 - 20,
      })
    }

    if (pendingReward.coins > 0) {
      newChips.push({
        id:    `coins-${Date.now()}`,
        value: `+${pendingReward.coins}`,
        label: 'Coins',
        color: '#FFB800',
        x:     Math.random() * 40 + 60,
      })
    }

    if (pendingReward.streakMilestone) {
      newChips.push({
        id:    `streak-${Date.now()}`,
        value: `+${pendingReward.streakMilestone.xp}`,
        label: pendingReward.streakMilestone.label,
        color: '#00FF88',
        x:     Math.random() * 40 + 30,
      })
    }

    setChips(prev => [...prev, ...newChips])
    clearPendingReward()
  }, [pendingReward])

  useEffect(() => {
    if (levelUpData?.leveledUp) {
      setShowLevelUp(true)
    }
  }, [levelUpData])

  const removeChip = (id) => setChips(prev => prev.filter(c => c.id !== id))

  return (
    <>
      {/* Floating chips */}
      <AnimatePresence>
        {chips.map(chip => (
          <FloatingChip
            key={chip.id}
            value={chip.value}
            label={chip.label}
            color={chip.color}
            x={chip.x}
            y={0}
            onDone={() => removeChip(chip.id)}
          />
        ))}
      </AnimatePresence>

      {/* Level-up burst */}
      <AnimatePresence>
        {showLevelUp && levelUpData && (
          <LevelUpBurst
            key="levelup"
            fromLevel={levelUpData.fromLevel}
            toLevel={levelUpData.toLevel}
            onDone={() => {
              setShowLevelUp(false)
              clearLevelUp()
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}
