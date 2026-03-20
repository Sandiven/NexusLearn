import { useState, useCallback, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navigate } from 'react-router-dom'

import useAuthStore         from '@store/authStore'
import useGamificationStore from '@store/gamificationStore'
import DashboardNavbar      from '@components/layout/DashboardNavbar'
import Sidebar              from '@components/layout/Sidebar'
import AvatarAssistant      from '@components/avatar/AvatarAssistant'
import api                  from '@services/api'

import AchievementGrid  from '../components/AchievementGrid'
import AchievementPopup from '../components/AchievementPopup'
import AchievementCard  from '../components/AchievementCard'

import {
  ACHIEVEMENTS,
  RARITY_CONFIG,
} from '@/data/achievementsData'

// ── Plan badge definitions (shown in Achievements if earned) ──
const PLAN_ACHIEVEMENTS = [
  { key: 'js_foundations', name: 'JS Founder',    desc: 'Completed the JavaScript Foundations plan.',    icon: '🏅', category: 'special', rarity: 'rare',      xpReward: 500,  coinReward: 50,  badgeColor: '#FFB800' },
  { key: 'dsa_master',     name: 'DSA Master',    desc: 'Completed the DSA Mastery plan (150 questions).', icon: '🏅', category: 'special', rarity: 'epic',      xpReward: 1500, coinReward: 150, badgeColor: '#00F5FF' },
  { key: 'db_expert',      name: 'DB Expert',     desc: 'Completed the Database Deep Dive plan.',        icon: '🏅', category: 'special', rarity: 'rare',      xpReward: 750,  coinReward: 75,  badgeColor: '#0080FF' },
  { key: 'algo_sprinter',  name: 'Algo Sprinter', desc: 'Completed the Algorithm Sprint plan.',          icon: '🏅', category: 'special', rarity: 'epic',      xpReward: 1000, coinReward: 100, badgeColor: '#8B5CF6' },
  { key: 'os_pro',         name: 'OS Pro',        desc: 'Completed the OS Essentials plan.',             icon: '🏅', category: 'special', rarity: 'rare',      xpReward: 600,  coinReward: 60,  badgeColor: '#00FF88' },
]

// Combined catalogue — standard achievements + plan badges
const ALL_ACHIEVEMENTS = [...ACHIEVEMENTS, ...PLAN_ACHIEVEMENTS]

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.35 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
}

function ShowcaseRow({ unlocked, unlockedKeys, unlockDates }) {
  if (!unlocked.length) return null
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FFB800', boxShadow: '0 0 8px rgba(255,184,0,0.6)' }} />
        <h2 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#fff', margin: 0 }}>
          Recently Unlocked
        </h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
        {unlocked.map((ach, i) => (
          <AchievementCard key={ach.key} achievement={ach} unlocked unlockedAt={unlockDates[ach.key]} index={i} />
        ))}
      </div>
    </motion.div>
  )
}

export default function AchievementsPage() {
  const { isAuthenticated } = useAuthStore()
  const { xp }              = useGamificationStore()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [popupAch,   setPopupAch]   = useState(null)
  const [showPopup,  setShowPopup]  = useState(false)
  const [newKeys,    setNewKeys]    = useState(new Set())

  // ── Load real unlocked achievements from DB ─────────
  const [unlockedKeys,  setUnlockedKeys]  = useState(new Set())
  const [unlockDates,   setUnlockDates]   = useState({})
  const [loading,       setLoading]       = useState(true)

  useEffect(() => {
    api.get('/achievements/mine')
      .then(res => {
        const data = res.data.data || []
        const keys    = new Set(data.map(a => a.key))
        const dates   = {}
        data.forEach(a => { dates[a.key] = a.unlockedAt })
        setUnlockedKeys(keys)
        setUnlockDates(dates)
      })
      .catch(() => {
        // Fallback: empty — no mock data
        setUnlockedKeys(new Set())
        setUnlockDates({})
      })
      .finally(() => setLoading(false))
  }, [])

  if (!isAuthenticated) return <Navigate to="/login" replace />

  // Simulate unlock demo
  const triggerDemo = useCallback(() => {
    const locked = ALL_ACHIEVEMENTS.filter(a => !unlockedKeys.has(a.key))
    if (!locked.length) return
    const ach = locked[Math.floor(Math.random() * locked.length)]
    setPopupAch(ach)
    setShowPopup(true)
    setNewKeys(prev => new Set([...prev, ach.key]))
  }, [unlockedKeys])

  const recentlyUnlocked = useMemo(() =>
    ALL_ACHIEVEMENTS.filter(a => unlockedKeys.has(a.key))
      .sort((a, b) => new Date(unlockDates[b.key] || 0) - new Date(unlockDates[a.key] || 0))
      .slice(0, 3),
    [unlockedKeys, unlockDates]
  )

  const totalXPFromAch = useMemo(() =>
    ALL_ACHIEVEMENTS.filter(a => unlockedKeys.has(a.key))
      .reduce((sum, a) => sum + (a.xpReward || 0), 0),
    [unlockedKeys]
  )

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"
      style={{ minHeight: '100vh', background: '#0F0F14', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 65% 35% at 50% 0%, rgba(255,184,0,0.05) 0%, transparent 60%)' }} />
      <DashboardNavbar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(p => !p)} />
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h1 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: '#fff', letterSpacing: '-0.025em', marginBottom: '4px' }}>
                  Achievements
                </h1>
                <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.88rem', color: 'rgba(255,255,255,0.38)' }}>
                  {loading ? '…' : `${unlockedKeys.size} of ${ALL_ACHIEVEMENTS.length} unlocked · ${totalXPFromAch.toLocaleString()} XP earned`}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {[
                  { label: 'Unlocked',  value: loading ? '…' : unlockedKeys.size,                           color: '#00F5FF' },
                  { label: 'Remaining', value: loading ? '…' : ALL_ACHIEVEMENTS.length - unlockedKeys.size, color: 'rgba(255,255,255,0.35)' },
                  { label: 'XP Earned', value: loading ? '…' : `${totalXPFromAch.toLocaleString()} XP`,    color: '#FFB800' },
                ].map(stat => (
                  <div key={stat.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '10px 16px', textAlign: 'center' }}>
                    <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.1rem', color: stat.color }}>{stat.value}</div>
                    <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Demo button */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={{ marginBottom: '28px' }}>
              <motion.button whileHover={{ scale: 1.03, boxShadow: '0 6px 24px rgba(255,184,0,0.3)' }} whileTap={{ scale: 0.97 }} onClick={triggerDemo}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,184,0,0.08)', border: '1px solid rgba(255,184,0,0.25)', borderRadius: '12px', padding: '10px 20px', fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.82rem', color: '#FFB800', cursor: 'pointer' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" /></svg>
                Simulate Achievement Unlock
              </motion.button>
            </motion.div>

            {!loading && recentlyUnlocked.length > 0 && (
              <ShowcaseRow unlocked={recentlyUnlocked} unlockedKeys={unlockedKeys} unlockDates={unlockDates} />
            )}

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
              <h2 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1rem', color: '#fff', marginBottom: '16px' }}>
                All Achievements
              </h2>
              {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '14px' }}>
                  {[1,2,3,4,5,6].map(i => <div key={i} style={{ height: '180px', background: 'rgba(255,255,255,0.03)', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.06)' }} />)}
                </div>
              ) : (
                <AchievementGrid
                  achievements={ALL_ACHIEVEMENTS}
                  unlockedKeys={unlockedKeys}
                  unlockDates={unlockDates}
                  newKeys={newKeys}
                  onCardClick={(ach) => {
                    if (unlockedKeys.has(ach.key)) {
                      setPopupAch(ach)
                      setShowPopup(true)
                    }
                  }}
                />
              )}
            </motion.div>
          </div>
        </main>
      </div>

      <AchievementPopup achievement={popupAch} show={showPopup} onClose={() => setShowPopup(false)} />
      <AvatarAssistant />
    </motion.div>
  )
}
