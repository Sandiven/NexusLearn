import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import api from '@services/api'
import eventBus, { EVENTS } from '@/eventBus'

const ACCENT_COLORS = ['#00F5FF','#8B5CF6','#0080FF','#FFB800','#00FF88','#FF6B35','#FF4060']

const FALLBACK_SUBJECTS = [
  { name: 'Data Structures',  slug: 'data-structures',  accentColor: '#00F5FF', levelsCompleted: 0, totalLevels: 10, xpEarned: 0 },
  { name: 'Algorithms',       slug: 'algorithms',        accentColor: '#8B5CF6', levelsCompleted: 0, totalLevels: 10, xpEarned: 0 },
  { name: 'Databases',        slug: 'databases',         accentColor: '#0080FF', levelsCompleted: 0, totalLevels: 10, xpEarned: 0 },
  { name: 'Operating Systems',slug: 'operating-systems', accentColor: '#FFB800', levelsCompleted: 0, totalLevels: 10, xpEarned: 0 },
  { name: 'Computer Networks',slug: 'networks',          accentColor: '#00FF88', levelsCompleted: 0, totalLevels: 10, xpEarned: 0 },
  { name: 'System Design',    slug: 'system-design',     accentColor: '#FF6B35', levelsCompleted: 0, totalLevels: 10, xpEarned: 0 },
]

function RadialRing({ pct, accent, size = 44 }) {
  const r    = (size - 5) / 2
  const circ = 2 * Math.PI * r
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
        <motion.circle
          cx={size/2} cy={size/2} r={r}
          fill="none" stroke={accent} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - pct / 100) }}
          transition={{ duration: 0.9, ease: [0.4,0,0.2,1] }}
          style={{ filter: `drop-shadow(0 0 3px ${accent}80)` }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '0.62rem', color: accent }}>
        {pct}%
      </div>
    </div>
  )
}

export default function SubjectProgressCard() {
  const [subjects, setSubjects] = useState([])
  const [loading,  setLoading]  = useState(true)

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
    const unsub = eventBus.on(EVENTS.LEVEL_COMPLETED, fetchSubjects)
    return () => unsub()
  }, [])

  const data = subjects.map((s, i) => ({
    name:      s.name,
    slug:      s.slug,
    accent:    s.accentColor || ACCENT_COLORS[i % ACCENT_COLORS.length],
    completed: s.levelsCompleted ?? 0,
    total:     10,
    xp:        s.xpEarned ?? 0,
  }))

  const totalXP = data.reduce((sum, d) => sum + d.xp, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.15 }}
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '18px', padding: '24px',
        position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.5), transparent)' }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div>
          <h3 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1rem', color: '#fff', margin: 0, marginBottom: '3px' }}>Subject Progress</h3>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.38)', margin: 0 }}>
            {loading ? '…' : `${data.filter(s => s.completed > 0).length}/${data.length} subjects started · ${totalXP.toLocaleString()} XP total`}
          </p>
        </div>
        <Link to="/subjects" style={{ textDecoration: 'none' }}>
          <motion.span whileHover={{ color: '#8B5CF6' }} style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.38)', cursor: 'pointer', transition: 'color 0.18s', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View all
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </motion.span>
        </Link>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ height: '44px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {data.map((s, i) => {
            const pct = s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0
            return (
              <motion.div
                key={s.slug}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + i * 0.05 }}
                style={{ display: 'flex', alignItems: 'center', gap: '14px' }}
              >
                <RadialRing pct={pct} accent={s.accent} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '5px' }}>
                    <span style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '0.85rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {s.name}
                    </span>
                    <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.38)', flexShrink: 0, marginLeft: '8px' }}>
                      {s.completed}/{s.total} · {s.xp.toLocaleString()} XP
                    </span>
                  </div>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.07)', borderRadius: '2px', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.1 + i * 0.05, ease: [0.4,0,0.2,1] }}
                      style={{ height: '100%', background: s.accent, borderRadius: '2px', boxShadow: `0 0 6px ${s.accent}60` }}
                    />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
