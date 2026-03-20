import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Navigate } from 'react-router-dom'
import useAuthStore from '@store/authStore'
import DashboardNavbar from '@components/layout/DashboardNavbar'
import Sidebar from '@components/layout/Sidebar'
import AvatarAssistant from '@components/avatar/AvatarAssistant'
import SubjectCard from '@components/dashboard/SubjectCard'
import api from '@services/api'

const ACCENT_COLORS = ['#00F5FF','#8B5CF6','#0080FF','#FFB800','#00FF88','#FF6B35','#FF4060']

function subjectIcon(slug) {
  const s = (slug || '').toLowerCase()
  if (s.includes('data'))    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
  if (s.includes('algo'))    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
  if (s.includes('db') || s.includes('database')) return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>
  if (s.includes('os') || s.includes('operat')) return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
  if (s.includes('network')) return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
}

const FALLBACK_SUBJECTS = [
  { id: 'ds',  name: 'Data Structures',   slug: 'data-structures',   accentColor: '#00F5FF', totalLevels: 12, level: 1, xpEarned: 0, levelsCompleted: 0 },
  { id: 'al',  name: 'Algorithms',        slug: 'algorithms',        accentColor: '#8B5CF6', totalLevels: 15, level: 1, xpEarned: 0, levelsCompleted: 0 },
  { id: 'db',  name: 'Databases',         slug: 'databases',         accentColor: '#0080FF', totalLevels: 10, level: 1, xpEarned: 0, levelsCompleted: 0 },
  { id: 'os',  name: 'Operating Systems', slug: 'operating-systems', accentColor: '#FFB800', totalLevels: 10, level: 1, xpEarned: 0, levelsCompleted: 0 },
  { id: 'net', name: 'Computer Networks', slug: 'networks',          accentColor: '#00FF88', totalLevels: 8,  level: 1, xpEarned: 0, levelsCompleted: 0 },
  { id: 'sys', name: 'System Design',     slug: 'system-design',     accentColor: '#FF6B35', totalLevels: 8,  level: 1, xpEarned: 0, levelsCompleted: 0 },
]

export default function SubjectsPage() {
  const { isAuthenticated } = useAuthStore()
  const [subjects,  setSubjects]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [sidebar,   setSidebar]   = useState(false)

  if (!isAuthenticated) return <Navigate to="/login" replace />

  useEffect(() => {
    api.get('/subjects/progress/me')
      .then(r => {
        const data = r.data.data || []
        setSubjects(data.length > 0 ? data : FALLBACK_SUBJECTS)
      })
      .catch(() => setSubjects(FALLBACK_SUBJECTS))
      .finally(() => setLoading(false))
  }, [])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ minHeight: '100vh', background: '#0F0F14', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 70% 35% at 50% 0%, rgba(0,245,255,0.04) 0%, transparent 60%)' }} />
      <DashboardNavbar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        <Sidebar collapsed={sidebar} onToggle={() => setSidebar(p => !p)} />
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '28px' }}>
              <h1 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: '#fff', letterSpacing: '-0.025em', marginBottom: '4px' }}>
                All Subjects
              </h1>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.88rem', color: 'rgba(255,255,255,0.38)' }}>
                Browse every subject. Your progress is saved per subject.
              </p>
            </motion.div>

            {loading && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} style={{ height: '160px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }} />
                ))}
              </div>
            )}


            {!loading && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
                {subjects.map((s, i) => (
                  <SubjectCard
                    key={s.id || s.slug}
                    subject={{
                      ...s,
                      completedLevels: s.levelsCompleted ?? 0,
                      xp:              s.xpEarned        ?? 0,
                      accentColor:     s.accentColor     || ACCENT_COLORS[i % ACCENT_COLORS.length],
                      icon:            subjectIcon(s.slug || s.name),
                    }}
                    index={i}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      <AvatarAssistant />
    </motion.div>
  )
}
