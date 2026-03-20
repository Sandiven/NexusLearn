import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import api from '@services/api'
import { ACHIEVEMENTS, RARITY_CONFIG } from '@/data/achievementsData'

export default function AchievementSummary() {
  const [unlockedKeys, setUnlockedKeys] = useState(new Set())
  const [loading,      setLoading]      = useState(true)

  useEffect(() => {
    api.get('/achievements/mine')
      .then(res => {
        const keys = new Set((res.data.data || []).map(a => a.key))
        setUnlockedKeys(keys)
      })
      .catch(() => setUnlockedKeys(new Set()))
      .finally(() => setLoading(false))
  }, [])

  const unlocked = ACHIEVEMENTS.filter(a => unlockedKeys.has(a.key))
  const locked   = ACHIEVEMENTS.filter(a => !unlockedKeys.has(a.key))
  const pct      = ACHIEVEMENTS.length > 0 ? Math.round((unlocked.length / ACHIEVEMENTS.length) * 100) : 0

  const byRarity = { legendary: 0, epic: 0, rare: 0, common: 0 }
  unlocked.forEach(a => { byRarity[a.rarity] = (byRarity[a.rarity] || 0) + 1 })

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.2 }}
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '18px', padding: '24px',
        position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,184,0,0.5), transparent)' }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div>
          <h3 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1rem', color: '#fff', margin: 0, marginBottom: '3px' }}>Achievements</h3>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.38)', margin: 0 }}>
            {loading ? '…' : `${unlocked.length}/${ACHIEVEMENTS.length} unlocked (${pct}%)`}
          </p>
        </div>
        <Link to="/achievements" style={{ textDecoration: 'none' }}>
          <motion.span whileHover={{ color: '#00F5FF' }} style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.38)', cursor: 'pointer', transition: 'color 0.18s', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View all
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </motion.span>
        </Link>
      </div>

      {/* Progress bar */}
      <div style={{ height: '5px', background: 'rgba(255,255,255,0.07)', borderRadius: '3px', overflow: 'hidden', marginBottom: '16px' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: [0.4,0,0.2,1] }}
          style={{ height: '100%', background: 'linear-gradient(90deg, #FFB80080, #FFB800)', borderRadius: '3px' }}
        />
      </div>

      {/* Rarity breakdown */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '18px', flexWrap: 'wrap' }}>
        {['legendary','epic','rare','common'].map(r => {
          const cfg   = RARITY_CONFIG[r]
          const count = byRarity[r] || 0
          const total = ACHIEVEMENTS.filter(a => a.rarity === r).length
          return (
            <div key={r} style={{
              flex: '1 1 80px',
              background: `${cfg.color}08`, border: `1px solid ${cfg.border}`,
              borderRadius: '10px', padding: '9px 12px', textAlign: 'center',
            }}>
              <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1rem', color: count > 0 ? cfg.color : 'rgba(255,255,255,0.2)' }}>{loading ? '…' : count}</div>
              <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{cfg.label}</div>
              <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', marginTop: '1px' }}>/{total}</div>
            </div>
          )
        })}
      </div>

      {/* Recent badges grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(54px, 1fr))', gap: '8px' }}>
        {unlocked.slice(0, 12).map((ach, i) => {
          const cfg = RARITY_CONFIG[ach.rarity]
          return (
            <motion.div
              key={ach.key}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.04, duration: 0.3, ease: [0.34,1.3,0.64,1] }}
              title={ach.name}
              style={{
                width: '54px', height: '54px', borderRadius: '12px',
                background: `${ach.badgeColor}12`,
                border: `1px solid ${ach.badgeColor}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.3rem', cursor: 'default',
                boxShadow: ach.rarity === 'legendary' ? `0 0 10px ${ach.badgeColor}35` : 'none',
              }}
            >
              {ach.icon}
            </motion.div>
          )
        })}
        {locked.slice(0, 3).map((ach, i) => (
          <div key={ach.key} style={{
            width: '54px', height: '54px', borderRadius: '12px',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
