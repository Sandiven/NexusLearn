import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import SubjectCard from './SubjectCard'
import api from '@services/api'
import eventBus, { EVENTS } from '@/eventBus'

// ── Icon map by slug / name ───────────────────────────────
function subjectIcon(slug) {
  const s = (slug || '').toLowerCase()
  if (s.includes('data'))    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
  if (s.includes('algo'))    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
  if (s.includes('db') || s.includes('database')) return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>
  if (s.includes('os') || s.includes('operat')) return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
  if (s.includes('network')) return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
  if (s.includes('system'))  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" /></svg>
  if (s.includes('js') || s.includes('javascript')) return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
}

const ACCENT_COLORS = ['#00F5FF','#8B5CF6','#0080FF','#FFB800','#00FF88','#FF6B35','#FF4060']

// ── Default subjects shown when API isn't seeded yet ──────
// These are matched 1:1 with what the backend seeds, so once
// the DB is populated the API response will take over seamlessly.
const FALLBACK_SUBJECTS = [
  { id: 'ds',   name: 'Data Structures',   slug: 'data-structures',   accentColor: '#00F5FF', totalLevels: 10, level: 1, xpEarned: 0, levelsCompleted: 0 },
  { id: 'al',   name: 'Algorithms',        slug: 'algorithms',        accentColor: '#8B5CF6', totalLevels: 10, level: 1, xpEarned: 0, levelsCompleted: 0 },
  { id: 'db',   name: 'Databases',         slug: 'databases',         accentColor: '#0080FF', totalLevels: 10, level: 1, xpEarned: 0, levelsCompleted: 0 },
  { id: 'os',   name: 'Operating Systems', slug: 'operating-systems', accentColor: '#FFB800', totalLevels: 10, level: 1, xpEarned: 0, levelsCompleted: 0 },
  { id: 'net',  name: 'Computer Networks', slug: 'networks',          accentColor: '#00FF88', totalLevels: 10, level: 1, xpEarned: 0, levelsCompleted: 0 },
  { id: 'sys',  name: 'System Design',     slug: 'system-design',     accentColor: '#FF6B35', totalLevels: 10, level: 1, xpEarned: 0, levelsCompleted: 0 },
]

export default function SubjectsGrid() {
  const navigate = useNavigate()
  const [subjects,  setSubjects]  = useState([])
  const [loading,   setLoading]   = useState(true)

  const fetchSubjects = () => {
    api.get('/subjects/progress/me')
      .then(res => {
        const data = res.data.data || []
        setSubjects(data.length > 0 ? data : FALLBACK_SUBJECTS)
      })
      .catch(() => setSubjects(FALLBACK_SUBJECTS))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchSubjects()

    // Re-fetch immediately when a level is completed so home page updates without refresh
    const unsub = eventBus.on(EVENTS.LEVEL_COMPLETED, fetchSubjects)
    return () => unsub()
  }, [])

  const displaySubjects = subjects

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}
      >
        <h2 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1.05rem', color: '#fff', margin: 0 }}>
          Your Subjects
        </h2>
        <motion.button
          whileHover={{ color: '#00F5FF' }}
          onClick={() => navigate('/subjects')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem',
            color: 'rgba(255,255,255,0.4)', fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: '4px',
          }}
        >
          Browse all
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </motion.button>
      </motion.div>

      {/* Loading skeleton */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ height: '160px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px' }} />
          ))}
        </div>
      )}

      {/* Grid — always shown once loaded */}
      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
          {displaySubjects.map((subject, i) => (
            <SubjectCard
              key={subject.id || subject.slug}
              subject={{
                ...subject,
                completedLevels: subject.levelsCompleted ?? 0,
                totalLevels:     10,   // standardised: all subjects have 10 levels
                xp:              subject.xpEarned        ?? 0,
                accentColor:     subject.accentColor     || ACCENT_COLORS[i % ACCENT_COLORS.length],
                icon:            subjectIcon(subject.slug || subject.name),
              }}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  )
}
