import { useState, useEffect, useCallback } from 'react'
import { useParams, Navigate, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore from '@store/authStore'

import DashboardNavbar    from '@components/layout/DashboardNavbar'
import Sidebar            from '@components/layout/Sidebar'
import SubjectHeader      from '@components/subjects/SubjectHeader'
import WorldMap           from '@components/levels/WorldMap'
import LevelDetailsPanel  from '@components/subjects/LevelDetailsPanel'
import AvatarAssistant    from '@components/avatar/AvatarAssistant'
import { SUBJECT_ACCENTS } from '@/data/levelData'
import api                from '@services/api'

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.35 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
}

export default function SubjectPage() {
  const { isAuthenticated } = useAuthStore()
  const { subjectId } = useParams()
  const navigate = useNavigate()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [selectedLevel,    setSelectedLevel]    = useState(null)
  const [levels,           setLevels]           = useState([])
  const [currentLevel,     setCurrentLevel]     = useState(1)
  const [subjectMeta,      setSubjectMeta]       = useState(null)
  const [subjectProgress,  setSubjectProgress]   = useState({ xpEarned: 0, levelsCompleted: 0 })
  const [loading,          setLoading]           = useState(true)
  const [error,            setError]             = useState(null)

  const slug   = subjectId || 'data-structures'
  const accent = SUBJECT_ACCENTS[slug] || subjectMeta?.accentColor || '#00F5FF'

  const fetchProgress = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch subject metadata
      const [subjectRes, progressRes] = await Promise.all([
        api.get(`/subjects/${slug}`).catch(() => ({ data: { data: null } })),
        api.get(`/levels/subject/${slug}/progress`),
      ])

      const subject = subjectRes.data?.data
      if (subject) setSubjectMeta(subject)

      const { levels: lvls, currentLevel: cur, subjectProgress: sp } = progressRes.data.data
      setLevels(lvls)
      setCurrentLevel(cur)
      setSubjectProgress(sp || { xpEarned: 0, levelsCompleted: 0 })

      // Auto-select the active level
      const activeLevel = lvls.find(l => l.state === 'active')
      if (activeLevel) setSelectedLevel(activeLevel)
    } catch (err) {
      console.error('Failed to load subject progress:', err)
      setError('Failed to load subject data')
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    fetchProgress()
  }, [fetchProgress])

  const handleSelectLevel = (level) => {
    setSelectedLevel(prev => prev?.id === level.id ? null : level)
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />

  const subjectName = subjectMeta?.name || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  const completed   = levels.filter(l => l.state === 'completed').length
  const totalXP     = levels.reduce((sum, l) => sum + (l.xpReward || 0), 0)
  const courseCoins = 100 // Fixed course-completion coin reward

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ minHeight: '100vh', background: '#0F0F14', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      {/* Ambient glow */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: `radial-gradient(ellipse 70% 40% at 50% 20%, ${accent}08 0%, transparent 60%)` }} />

      <DashboardNavbar />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <SubjectHeader
            subject={subjectName}
            completedCount={completed}
            totalCount={levels.length || 10}
            accentColor={accent}
            xpEarned={subjectProgress.xpEarned}
            totalXP={totalXP || 150}
            courseCoins={courseCoins}
          />

          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* Map area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
              {/* Legend */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '12px 28px 0', flexWrap: 'wrap' }}>
                {[
                  { color: '#00F5FF', label: 'Completed' },
                  { color: '#8B5CF6', label: 'Active' },
                  { color: 'rgba(255,255,255,0.2)', label: 'Locked' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color, boxShadow: `0 0 6px ${item.color}` }} />
                    <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{item.label}</span>
                  </div>
                ))}
              </div>

              {loading && (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontFamily: '"DM Sans", sans-serif', color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem' }}>Loading map…</div>
                </div>
              )}

              {error && (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontFamily: '"DM Sans", sans-serif', color: '#FF6B6B', fontSize: '0.9rem' }}>{error}</div>
                </div>
              )}

              {!loading && !error && levels.length > 0 && (
                <WorldMap
                  levels={levels}
                  accentColor={accent}
                  onSelectLevel={handleSelectLevel}
                  selectedId={selectedLevel?.id}
                />
              )}
            </div>

            {/* Level detail panel */}
            <AnimatePresence>
              {selectedLevel && (
                <LevelDetailsPanel
                  key={selectedLevel.id}
                  level={selectedLevel}
                  accentColor={accent}
                  subjectSlug={slug}
                  onClose={() => setSelectedLevel(null)}
                  onLevelComplete={fetchProgress}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AvatarAssistant />
    </motion.div>
  )
}
