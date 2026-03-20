import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AchievementCard from './AchievementCard'
import { CATEGORIES, CATEGORY_CONFIG, RARITY_CONFIG } from '@/data/achievementsData'

export default function AchievementGrid({
  achievements,
  unlockedKeys,
  unlockDates,
  newKeys,
  onCardClick,
}) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeRarity,   setActiveRarity]   = useState('all')
  const [showLocked,     setShowLocked]      = useState(true)
  const [search,         setSearch]          = useState('')

  const filtered = useMemo(() => {
    return achievements.filter(a => {
      if (activeCategory !== 'all' && a.category !== activeCategory) return false
      if (activeRarity   !== 'all' && a.rarity   !== activeRarity)   return false
      if (!showLocked && !unlockedKeys.has(a.key))                    return false
      if (search && !a.name.toLowerCase().includes(search.toLowerCase())
                 && !a.desc.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [achievements, activeCategory, activeRarity, showLocked, search, unlockedKeys])

  const totalCount    = achievements.length
  const unlockedCount = achievements.filter(a => unlockedKeys.has(a.key)).length
  const pct           = Math.round((unlockedCount / totalCount) * 100)

  const rarities = ['all', 'common', 'rare', 'epic', 'legendary']

  return (
    <div>
      {/* Overall progress strip */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '14px', padding: '16px 20px',
          marginBottom: '22px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
            <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)' }}>
              Overall Completion
            </span>
            <span style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.82rem', color: '#00F5FF' }}>
              {unlockedCount} / {totalCount}
            </span>
          </div>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.07)', borderRadius: '3px', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
              style={{ height: '100%', background: 'linear-gradient(90deg, #00F5FF80, #00F5FF)', borderRadius: '3px' }}
            />
          </div>
        </div>

        {/* Rarity counts */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {(['common', 'rare', 'epic', 'legendary']).map(r => {
            const cfg   = RARITY_CONFIG[r]
            const total = achievements.filter(a => a.rarity === r).length
            const has   = achievements.filter(a => a.rarity === r && unlockedKeys.has(a.key)).length
            return (
              <div key={r} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: cfg.color }} />
                <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
                  {has}/{total}
                </span>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Filters row */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Category filter */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '11px', padding: '3px', flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => {
            const count = cat.key === 'all' ? achievements.length : achievements.filter(a => a.category === cat.key).length
            const isActive = activeCategory === cat.key
            return (
              <button key={cat.key} onClick={() => setActiveCategory(cat.key)} style={{
                padding: '5px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                background: isActive ? 'rgba(0,245,255,0.1)' : 'transparent',
                color: isActive ? '#00F5FF' : 'rgba(255,255,255,0.4)',
                fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', fontWeight: 600,
                transition: 'all 0.15s',
                boxShadow: isActive ? '0 0 0 1px rgba(0,245,255,0.2)' : 'none',
              }}>
                {cat.label} <span style={{ opacity: 0.6, fontSize: '0.7rem' }}>({count})</span>
              </button>
            )
          })}
        </div>

        {/* Show locked toggle */}
        <button onClick={() => setShowLocked(!showLocked)} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '6px 12px', borderRadius: '9px', border: '1px solid rgba(255,255,255,0.1)',
          background: showLocked ? 'rgba(255,255,255,0.05)' : 'rgba(255,80,80,0.08)',
          color: showLocked ? 'rgba(255,255,255,0.5)' : '#FF5050',
          fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.18s',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          {showLocked ? 'Hide Locked' : 'Show Locked'}
        </button>

        {/* Search */}
        <div style={{ flex: 1, minWidth: '160px', position: 'relative' }}>
          <div style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search achievements…"
            style={{
              width: '100%', padding: '7px 11px 7px 32px',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: '10px', outline: 'none',
              fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(0,245,255,0.3)'}
            onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.09)'}
          />
        </div>
      </div>

      {/* Results count */}
      <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginBottom: '14px' }}>
        Showing {filtered.length} of {totalCount} achievements
      </div>

      {/* Grid */}
      <AnimatePresence mode="popLayout">
        {filtered.length > 0 ? (
          <motion.div
            key={`${activeCategory}-${activeRarity}-${showLocked}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '14px' }}
          >
            {filtered.map((ach, i) => (
              <AchievementCard
                key={ach.key}
                achievement={ach}
                unlocked={unlockedKeys.has(ach.key)}
                unlockedAt={unlockDates?.[ach.key]}
                isNew={newKeys?.has(ach.key)}
                index={i}
                onClick={onCardClick}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: '48px 20px' }}>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.3)' }}>
              No achievements match your filters.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
