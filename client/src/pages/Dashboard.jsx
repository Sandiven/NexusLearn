import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navigate } from 'react-router-dom'
import useAuthStore from '@store/authStore'

import DashboardNavbar from '@components/layout/DashboardNavbar'
import Sidebar from '@components/layout/Sidebar'
import StatsRow from '@components/dashboard/StatsRow'
import SubjectsGrid from '@components/dashboard/SubjectsGrid'
import DailyChallengeCard from '@components/dashboard/DailyChallengeCard'
import AvatarAssistant from '@components/avatar/AvatarAssistant'

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
}

function DailyChallengeModal({ onClose }) {
  return (
    <motion.div
      key="dc-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 80,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
    >
      <motion.div
        key="dc-panel"
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: '560px', position: 'relative' }}
      >
        <motion.button
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.93 }}
          onClick={onClose}
          style={{
            position: 'absolute', top: '-14px', right: '-14px',
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'rgba(255,255,255,0.6)', zIndex: 2,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </motion.button>
        <DailyChallengeCard />
      </motion.div>
    </motion.div>
  )
}

export default function Dashboard() {
  const { isAuthenticated, user } = useAuthStore()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showChallenge, setShowChallenge] = useState(false)

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <motion.div
      variants={pageVariants} initial="initial" animate="animate" exit="exit"
      style={{ minHeight: '100vh', background: '#0F0F14', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}
    >
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 80% 40% at 60% 0%, rgba(0,245,255,0.04) 0%, transparent 60%), radial-gradient(ellipse 50% 30% at 10% 80%, rgba(139,92,246,0.04) 0%, transparent 60%)' }} />

      <DashboardNavbar onOpenChallenge={() => setShowChallenge(true)} />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '28px 28px 100px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
            <h1 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', color: '#fff', letterSpacing: '-0.025em', marginBottom: '4px' }}>
              Welcome back, <span style={{ color: '#00F5FF' }}>{user?.username || 'Learner'}</span>
            </h1>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)' }}>
              Ready to level up today?
            </p>
          </motion.div>

          <StatsRow />
          <SubjectsGrid />
        </main>
      </div>

      <AnimatePresence>
        {showChallenge && <DailyChallengeModal onClose={() => setShowChallenge(false)} />}
      </AnimatePresence>

      <AvatarAssistant />
    </motion.div>
  )
}
