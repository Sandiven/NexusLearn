import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RARITY_CONFIG } from '@/data/storeData'

// Floating coin particle
function CoinParticle({ delay }) {
  const x = (Math.random() - 0.5) * 120
  return (
    <motion.div
      initial={{ opacity: 0, y: 0, x: 0, scale: 0.6 }}
      animate={{ opacity: [0, 1, 1, 0], y: -70, x, scale: [0.6, 1, 0.8] }}
      transition={{ duration: 0.9, delay, ease: [0.2, 0.8, 0.4, 1] }}
      style={{
        position: 'absolute', left: '50%', bottom: '20px',
        width: '14px', height: '14px', borderRadius: '50%',
        background: 'radial-gradient(circle, #FFD700, #FFB800)',
        boxShadow: '0 0 8px rgba(255,184,0,0.7)',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    />
  )
}

export default function PurchaseModal({ item, userCoins, onConfirm, onCancel }) {
  const [confirming, setConfirming] = useState(false)
  const [showCoins,  setShowCoins]  = useState(false)
  const [done,       setDone]       = useState(false)

  if (!item) return null

  const rarity    = RARITY_CONFIG[item.rarity] || RARITY_CONFIG.common
  const accent    = item.accentColor || '#00F5FF'
  const newBalance = userCoins - item.price
  const canAfford  = userCoins >= item.price

  const handleConfirm = async () => {
    if (!canAfford || confirming) return
    setConfirming(true)
    setShowCoins(true)
    await new Promise(r => setTimeout(r, 700))
    setDone(true)
    await new Promise(r => setTimeout(r, 500))
    onConfirm?.(item)
  }

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={!confirming ? onCancel : undefined}
        style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(10px)' }}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.38, ease: [0.34, 1.12, 0.64, 1] }}
        style={{
          position: 'fixed', inset: 0, zIndex: 201,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px', pointerEvents: 'none',
        }}
      >
        <div style={{
          width: '100%', maxWidth: '400px',
          background: 'rgba(12,12,20,0.98)',
          backdropFilter: 'blur(24px)',
          border: `1px solid ${accent}30`,
          borderRadius: '20px',
          overflow: 'hidden',
          pointerEvents: 'all',
          position: 'relative',
        }}>
          {/* Top accent */}
          <div style={{ height: '2px', background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />

          {/* Coin particles */}
          {showCoins && Array.from({ length: 8 }, (_, i) => (
            <CoinParticle key={i} delay={i * 0.07} />
          ))}

          <div style={{ padding: '28px' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                Confirm Purchase
              </div>
              <h2 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.4rem', color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
                {item.name}
              </h2>
            </div>

            {/* Item preview */}
            <motion.div
              animate={item.rarity === 'legendary' ? { boxShadow: [`0 0 16px ${accent}30`, `0 0 30px ${accent}50`, `0 0 16px ${accent}30`] } : {}}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{
                background: item.previewGradient || `${accent}0A`,
                border: `1px solid ${rarity.border}`,
                borderRadius: '14px', padding: '20px',
                display: 'flex', alignItems: 'center', gap: '14px',
                marginBottom: '20px',
              }}
            >
              <div style={{
                width: '52px', height: '52px', borderRadius: '12px',
                background: `${accent}14`, border: `1px solid ${accent}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', flexShrink: 0,
              }}>
                {item.icon}
              </div>
              <div>
                <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#fff', marginBottom: '4px' }}>
                  {item.name}
                </div>
                <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>
                  {item.description}
                </div>
              </div>
            </motion.div>

            {/* Cost breakdown */}
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '12px', padding: '14px 16px', marginBottom: '20px',
            }}>
              {[
                { label: 'Current Balance', value: userCoins.toLocaleString(), color: '#FFB800' },
                { label: 'Item Cost',       value: `-${item.price.toLocaleString()}`, color: '#FF5050' },
                { label: 'New Balance',     value: newBalance.toLocaleString(), color: newBalance >= 0 ? '#00FF88' : '#FF5050', bold: true },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: row.bold ? '1px solid rgba(255,255,255,0.06)' : 'none', paddingTop: row.bold ? '10px' : '5px', marginTop: row.bold ? '4px' : 0 }}>
                  <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', fontWeight: row.bold ? 600 : 400 }}>
                    {row.label}
                  </span>
                  <span style={{ fontFamily: '"Syne", sans-serif', fontWeight: row.bold ? 800 : 700, fontSize: '0.88rem', color: row.color }}>
                    {row.value} <span style={{ fontSize: '0.65rem', fontFamily: '"DM Sans", sans-serif', fontWeight: 400, color: 'rgba(255,255,255,0.3)' }}>coins</span>
                  </span>
                </div>
              ))}
            </div>

            {!canAfford && (
              <div style={{ background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.2)', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF5050" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem', color: '#FF5050' }}>
                  You need {(item.price - userCoins).toLocaleString()} more coins.
                </span>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <motion.button
                whileHover={{ background: 'rgba(255,255,255,0.07)' }}
                onClick={onCancel}
                disabled={confirming}
                style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '12px', cursor: confirming ? 'default' : 'pointer', fontFamily: '"DM Sans", sans-serif', fontSize: '0.88rem', color: 'rgba(255,255,255,0.5)', transition: 'background 0.18s' }}
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={canAfford && !confirming ? { scale: 1.02, boxShadow: `0 6px 24px ${accent}35` } : {}}
                whileTap={canAfford && !confirming ? { scale: 0.97 } : {}}
                onClick={handleConfirm}
                disabled={!canAfford || confirming}
                style={{
                  flex: 2, padding: '12px',
                  background: !canAfford || confirming ? 'rgba(255,255,255,0.06)' : `linear-gradient(135deg, ${accent}, ${accent}BB)`,
                  border: 'none', borderRadius: '12px',
                  cursor: !canAfford || confirming ? 'not-allowed' : 'pointer',
                  fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.92rem',
                  color: !canAfford ? 'rgba(255,255,255,0.25)' : '#000',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'all 0.2s',
                }}
              >
                {confirming ? (
                  <><motion.svg animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(0,0,0,0.2)" strokeWidth="3" /><path d="M12 2a10 10 0 0 1 10 10" stroke="#000" strokeWidth="3" strokeLinecap="round" /></motion.svg> Purchasing…</>
                ) : (
                  <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /></svg> Confirm Purchase</>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
