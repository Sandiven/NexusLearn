import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navigate } from 'react-router-dom'
import useAuthStore from '@store/authStore'
import useGamificationStore from '@store/gamificationStore'
import DashboardNavbar from '@components/layout/DashboardNavbar'
import Sidebar from '@components/layout/Sidebar'
import AvatarAssistant from '@components/avatar/AvatarAssistant'

const STORE_ITEMS = [
  { id: 'streak_freeze', name: 'Streak Freeze', desc: 'Protect your streak for one missed day.', cost: 100, category: 'power', icon: '❄', color: '#00F5FF', stock: 3 },
  { id: 'xp_boost_2x',  name: '2× XP Boost',  desc: '24 hours of double XP on all activities.', cost: 250, category: 'power', icon: '⚡', color: '#FFB800', stock: 1 },
  { id: 'hint_pack',    name: 'Hint Pack',     desc: '5 hints to use during levels.',          cost: 80,  category: 'power', icon: '💡', color: '#8B5CF6', stock: 10 },
  { id: 'avatar_cyber', name: 'Cyber Avatar',  desc: 'Exclusive cyberpunk avatar frame.',      cost: 400, category: 'avatar', icon: '◈', color: '#00F5FF', stock: null },
  { id: 'avatar_neon',  name: 'Neon Frame',    desc: 'Glowing neon border for your profile.',  cost: 300, category: 'avatar', icon: '◉', color: '#00FF88', stock: null },
  { id: 'theme_violet', name: 'Violet Theme',  desc: 'Unlock violet accent for your dashboard.',cost: 200, category: 'theme', icon: '◆', color: '#8B5CF6', stock: null },
]

const CATEGORIES = [
  { key: 'all',    label: 'All Items' },
  { key: 'power',  label: 'Power-Ups' },
  { key: 'avatar', label: 'Avatars'   },
  { key: 'theme',  label: 'Themes'    },
]

const pageVariants = { initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: 0.35 } } }

export default function StorePage() {
  const { isAuthenticated } = useAuthStore()
  const { coins, addCoinsLocal } = useGamificationStore()
  const [sidebar,  setSidebar]  = useState(true)
  const [category, setCategory] = useState('all')
  const [owned,    setOwned]    = useState(new Set())
  const [flash,    setFlash]    = useState(null)   // item id that just got purchased

  if (!isAuthenticated) return <Navigate to="/login" replace />

  const filtered = STORE_ITEMS.filter(i => category === 'all' || i.category === category)

  const handleBuy = (item) => {
    if (coins < item.cost || owned.has(item.id)) return
    addCoinsLocal(-item.cost)
    setOwned(prev => new Set([...prev, item.id]))
    setFlash(item.id)
    setTimeout(() => setFlash(null), 1800)
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate"
      style={{ minHeight: '100vh', background: '#0F0F14', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 60% 35% at 50% 0%, rgba(255,184,0,0.05) 0%, transparent 60%)' }} />
      <DashboardNavbar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        <Sidebar collapsed={sidebar} onToggle={() => setSidebar(!sidebar)} />
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
          <div style={{ maxWidth: '860px', margin: '0 auto' }}>

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h1 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: '#fff', letterSpacing: '-0.025em', marginBottom: '4px' }}>Store</h1>
                <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.88rem', color: 'rgba(255,255,255,0.38)' }}>Spend your coins on power-ups, avatars, and themes.</p>
              </div>
              <div style={{ background: 'rgba(255,184,0,0.08)', border: '1px solid rgba(255,184,0,0.25)', borderRadius: '14px', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="rgba(255,184,0,0.15)" stroke="#FFB800" strokeWidth="1.5" /></svg>
                <div>
                  <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Balance</div>
                  <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.2rem', color: '#FFB800' }}>{coins.toLocaleString()} Coins</div>
                </div>
              </div>
            </motion.div>

            {/* Category tabs */}
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '4px', marginBottom: '24px', width: 'fit-content' }}>
              {CATEGORIES.map(cat => (
                <button key={cat.key} onClick={() => setCategory(cat.key)} style={{
                  padding: '7px 16px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                  background: category === cat.key ? 'rgba(255,184,0,0.12)' : 'transparent',
                  color: category === cat.key ? '#FFB800' : 'rgba(255,255,255,0.4)',
                  fontFamily: '"DM Sans", sans-serif', fontSize: '0.83rem', fontWeight: 600,
                  boxShadow: category === cat.key ? '0 0 0 1px rgba(255,184,0,0.22)' : 'none',
                  transition: 'all 0.15s',
                }}>{cat.label}</button>
              ))}
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
              {filtered.map((item, i) => {
                const isOwned     = owned.has(item.id)
                const canAfford   = coins >= item.cost
                const isFlashing  = flash === item.id

                return (
                  <motion.div key={item.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -4, boxShadow: `0 12px 32px ${item.color}18`, borderColor: `${item.color}28`, transition: { duration: 0.2 } }}
                    style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '22px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px', background: `linear-gradient(90deg, transparent, ${item.color}50, transparent)` }} />

                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${item.color}12`, border: `1px solid ${item.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: '14px' }}>
                      {item.icon}
                    </div>

                    <h3 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#fff', marginBottom: '6px' }}>{item.name}</h3>
                    <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, marginBottom: '16px' }}>{item.desc}</p>

                    {item.stock !== null && (
                      <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginBottom: '10px' }}>
                        {item.stock} left in stock
                      </div>
                    )}

                    <motion.button
                      whileHover={!isOwned && canAfford ? { scale: 1.03, boxShadow: `0 6px 20px ${item.color}35` } : {}}
                      whileTap={!isOwned && canAfford ? { scale: 0.97 } : {}}
                      onClick={() => handleBuy(item)}
                      disabled={isOwned || !canAfford}
                      style={{
                        width: '100%', padding: '11px',
                        background: isOwned ? 'rgba(0,255,136,0.08)' : canAfford ? `linear-gradient(135deg, ${item.color}, ${item.color}CC)` : 'rgba(255,255,255,0.05)',
                        border: isOwned ? '1px solid rgba(0,255,136,0.25)' : 'none',
                        borderRadius: '10px', cursor: isOwned || !canAfford ? 'default' : 'pointer',
                        fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.85rem',
                        color: isOwned ? '#00FF88' : canAfford ? '#000' : 'rgba(255,255,255,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        transition: 'all 0.2s',
                      }}
                    >
                      {isOwned ? (
                        <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg> Owned</>
                      ) : !canAfford ? (
                        `Need ${(item.cost - coins).toLocaleString()} more`
                      ) : (
                        <><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="rgba(0,0,0,0.2)" stroke="currentColor" strokeWidth="1.5" /></svg> {item.cost} Coins</>
                      )}
                    </motion.button>

                    {/* Purchase flash */}
                    <AnimatePresence>
                      {isFlashing && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          style={{ position: 'absolute', inset: 0, background: `${item.color}12`, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                          <span style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1rem', color: item.color }}>Purchased!</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </main>
      </div>
      <AvatarAssistant />
    </motion.div>
  )
}
