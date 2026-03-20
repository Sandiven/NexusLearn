import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navigate } from 'react-router-dom'
import useAuthStore from '@store/authStore'
import DashboardNavbar from '@components/layout/DashboardNavbar'
import Sidebar         from '@components/layout/Sidebar'
import AvatarAssistant from '@components/avatar/AvatarAssistant'
import { PROBLEMS, SUBJECTS_LIST } from '@/data/problemsData'
import api from '@services/api'

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.35 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
}

const DIFFICULTY_COLOR = {
  easy:   { text: '#00FF88', bg: 'rgba(0,255,136,0.08)',  border: 'rgba(0,255,136,0.25)' },
  medium: { text: '#FFB800', bg: 'rgba(255,184,0,0.08)',  border: 'rgba(255,184,0,0.25)' },
  hard:   { text: '#FF6B6B', bg: 'rgba(255,107,107,0.08)', border: 'rgba(255,107,107,0.25)' },
}

// ── Persist attempt state per user in localStorage (keyed by userId) ──
function getAttemptStore(userId) {
  try {
    const raw = localStorage.getItem(`nexus_problem_attempts_${userId}`)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}
function saveAttemptStore(userId, store) {
  try {
    localStorage.setItem(`nexus_problem_attempts_${userId}`, JSON.stringify(store))
  } catch {}
}

// ── Problem attempt modal ──────────────────────────────────────────────
function ProblemModal({ problem, accentColor, attempted, onClose, onAttempt }) {
  const [selected,  setSelected]  = useState(null)
  const [revealed,  setRevealed]  = useState(false)

  const isCorrect = selected === problem.correct

  const handleConfirm = () => {
    if (selected === null) return
    setRevealed(true)
    onAttempt(problem.id)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        onClick={e => e.stopPropagation()}
        style={{ background: '#13131A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '32px', maxWidth: '620px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                #{problem.id} · {SUBJECTS_LIST.find(s => s.key === problem.subject)?.label || problem.subject}
              </span>
              <span style={{
                fontFamily: '"DM Sans", sans-serif', fontSize: '0.7rem', fontWeight: 700,
                padding: '2px 8px', borderRadius: '6px', textTransform: 'capitalize',
                color: DIFFICULTY_COLOR[problem.difficulty]?.text,
                background: DIFFICULTY_COLOR[problem.difficulty]?.bg,
                border: `1px solid ${DIFFICULTY_COLOR[problem.difficulty]?.border}`,
              }}>{problem.difficulty}</span>
            </div>
            <h2 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#fff', margin: 0, lineHeight: 1.4 }}>
              {problem.question}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', padding: '4px', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {problem.options.map((opt, i) => {
            let bg = 'rgba(255,255,255,0.03)'
            let border = 'rgba(255,255,255,0.08)'
            let color = 'rgba(255,255,255,0.75)'
            if (selected === i && !revealed) { bg = `${accentColor}12`; border = accentColor; color = '#fff' }
            if (revealed && i === problem.correct) { bg = 'rgba(0,255,136,0.08)'; border = '#00FF88'; color = '#00FF88' }
            if (revealed && i === selected && i !== problem.correct) { bg = 'rgba(255,80,80,0.08)'; border = '#FF5050'; color = '#FF5050' }
            return (
              <motion.button
                key={i}
                whileHover={!revealed ? { scale: 1.01 } : {}}
                whileTap={!revealed ? { scale: 0.99 } : {}}
                onClick={() => !revealed && setSelected(i)}
                style={{
                  background: bg, border: `1px solid ${border}`, borderRadius: '10px',
                  padding: '12px 16px', cursor: revealed ? 'default' : 'pointer',
                  fontFamily: '"DM Sans", sans-serif', fontSize: '0.9rem', color, textAlign: 'left',
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '10px',
                }}
              >
                <span style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                  {String.fromCharCode(65 + i)}.
                </span>
                {opt}
              </motion.button>
            )
          })}
        </div>

        {/* Explanation */}
        {revealed && problem.explanation && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: isCorrect ? 'rgba(0,255,136,0.06)' : 'rgba(255,80,80,0.06)', border: `1px solid ${isCorrect ? 'rgba(0,255,136,0.2)' : 'rgba(255,80,80,0.2)'}`, borderRadius: '10px', padding: '14px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1rem', flexShrink: 0 }}>{isCorrect ? '✓' : '✗'}</span>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.86rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, margin: 0 }}>
                {problem.explanation}
              </p>
            </div>
          </motion.div>
        )}

        {/* Action */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          {!revealed ? (
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleConfirm} disabled={selected === null}
              style={{ padding: '11px 28px', background: selected !== null ? `linear-gradient(135deg, ${accentColor}, #0080FF)` : 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '10px', cursor: selected !== null ? 'pointer' : 'not-allowed', fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.9rem', color: selected !== null ? '#000' : 'rgba(255,255,255,0.25)' }}>
              Check Answer
            </motion.button>
          ) : (
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onClose}
              style={{ padding: '11px 28px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', cursor: 'pointer', fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
              Close
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Problem row ───────────────────────────────────────────────────────
function ProblemRow({ problem, index, accentColor, attempted, onOpen }) {
  const diff = DIFFICULTY_COLOR[problem.difficulty] || DIFFICULTY_COLOR.medium
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.025 }}
      whileHover={{ background: 'rgba(255,255,255,0.04)' }}
      onClick={() => onOpen(problem)}
      style={{
        display: 'flex', alignItems: 'center', gap: '16px',
        padding: '14px 18px', cursor: 'pointer',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        transition: 'background 0.15s',
      }}
    >
      {/* Attempted indicator */}
      <div style={{ width: '20px', flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
        {attempted ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00FF88" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
        ) : (
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)' }} />
        )}
      </div>

      {/* Number */}
      <span style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '0.85rem', color: 'rgba(255,255,255,0.35)', width: '32px', flexShrink: 0 }}>
        {problem.id}.
      </span>

      {/* Title */}
      <span style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 500, fontSize: '0.9rem', color: '#fff', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {problem.title}
      </span>

      {/* Subject chip (only shown in "All" view) */}
      <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', color: accentColor, background: `${accentColor}10`, border: `1px solid ${accentColor}25`, borderRadius: '6px', padding: '2px 8px', flexShrink: 0, display: 'none' }}>
        {SUBJECTS_LIST.find(s => s.key === problem.subject)?.label}
      </span>

      {/* Difficulty */}
      <span style={{
        fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', fontWeight: 700,
        padding: '3px 10px', borderRadius: '6px', textTransform: 'capitalize', flexShrink: 0,
        color: diff.text, background: diff.bg, border: `1px solid ${diff.border}`,
      }}>
        {problem.difficulty}
      </span>
    </motion.div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────
export default function ProblemsPage() {
  const { isAuthenticated, user } = useAuthStore()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Filters
  const [activeSubject,    setActiveSubject]    = useState('all')
  const [diffFilter,       setDiffFilter]       = useState('all')
  const [statusFilter,     setStatusFilter]     = useState('all')
  const [searchQuery,      setSearchQuery]      = useState('')

  // Attempt tracking (per-user, persisted in localStorage)
  const userId = user?._id || user?.id || 'guest'
  const [attempted, setAttempted] = useState(() => getAttemptStore(userId))

  // Selected problem for modal
  const [activeProblem, setActiveProblem] = useState(null)

  // Persist attempts — localStorage for instant UI + backend for streak/calendar
  const markAttempted = (problemId) => {
    const updated = { ...attempted, [problemId]: true }
    setAttempted(updated)
    saveAttemptStore(userId, updated)

    // Find the problem to get subject + difficulty for backend
    const problem = PROBLEMS.find(p => p.id === problemId)
    if (problem) {
      api.post('/problems/solve', {
        problemId:  problem.id,
        subject:    problem.subject,
        difficulty: problem.difficulty,
      }).catch(() => {}) // silent — UI already updated optimistically
    }
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />

  const activeSubjectData = SUBJECTS_LIST.find(s => s.key === activeSubject) || SUBJECTS_LIST[0]
  const accent = activeSubject === 'all' ? '#00F5FF' : activeSubjectData.accent

  // Filtered problems
  const filtered = useMemo(() => {
    return PROBLEMS.filter(p => {
      if (activeSubject !== 'all' && p.subject !== activeSubject) return false
      if (diffFilter !== 'all' && p.difficulty !== diffFilter) return false
      if (statusFilter === 'attempted'     && !attempted[p.id]) return false
      if (statusFilter === 'not-attempted' &&  attempted[p.id]) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        if (!p.title.toLowerCase().includes(q) && !p.question.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [activeSubject, diffFilter, statusFilter, searchQuery, attempted])

  const attemptedCount  = PROBLEMS.filter(p => attempted[p.id]).length
  const totalCount      = PROBLEMS.length

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"
      style={{ minHeight: '100vh', background: '#0F0F14', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: `radial-gradient(ellipse 70% 30% at 50% 0%, ${accent}05 0%, transparent 60%)` }} />

      <DashboardNavbar />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(p => !p)} />

        <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

          {/* ── Subject tabs ── */}
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 24px', overflowX: 'auto' }}>
            <div style={{ display: 'flex', gap: '2px', paddingTop: '18px', paddingBottom: '0', minWidth: 'max-content' }}>
              {SUBJECTS_LIST.map(s => {
                const isActive = activeSubject === s.key
                return (
                  <motion.button
                    key={s.key}
                    whileHover={{ color: '#fff' }}
                    onClick={() => setActiveSubject(s.key)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontFamily: '"DM Sans", sans-serif', fontWeight: isActive ? 700 : 500,
                      fontSize: '0.85rem',
                      color: isActive ? s.accent : 'rgba(255,255,255,0.4)',
                      padding: '10px 16px 12px',
                      borderBottom: isActive ? `2px solid ${s.accent}` : '2px solid transparent',
                      transition: 'all 0.18s',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {s.label}
                    <span style={{ marginLeft: '6px', fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', color: isActive ? s.accent : 'rgba(255,255,255,0.2)', background: isActive ? `${s.accent}15` : 'rgba(255,255,255,0.04)', padding: '1px 6px', borderRadius: '4px' }}>
                      {s.key === 'all' ? totalCount : PROBLEMS.filter(p => p.subject === s.key).length}
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* ── Filter bar ── */}
          <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: '1', minWidth: '180px', maxWidth: '280px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search questions…"
                style={{ width: '100%', padding: '8px 12px 8px 32px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', color: '#fff', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Difficulty filter */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {['all', 'easy', 'medium', 'hard'].map(d => {
                const isActive = diffFilter === d
                const color = d === 'all' ? '#fff' : DIFFICULTY_COLOR[d]?.text || '#fff'
                return (
                  <motion.button
                    key={d}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setDiffFilter(d)}
                    style={{
                      background: isActive ? (d === 'all' ? 'rgba(255,255,255,0.1)' : DIFFICULTY_COLOR[d]?.bg) : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isActive ? (d === 'all' ? 'rgba(255,255,255,0.25)' : DIFFICULTY_COLOR[d]?.border) : 'rgba(255,255,255,0.07)'}`,
                      borderRadius: '7px', padding: '5px 12px', cursor: 'pointer',
                      fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', fontWeight: isActive ? 700 : 500,
                      color: isActive ? color : 'rgba(255,255,255,0.4)',
                      textTransform: 'capitalize', transition: 'all 0.15s',
                    }}
                  >
                    {d === 'all' ? 'All Levels' : d}
                  </motion.button>
                )
              })}
            </div>

            {/* Status filter */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {[
                { key: 'all',          label: 'All' },
                { key: 'attempted',    label: '✓ Attempted' },
                { key: 'not-attempted', label: '○ Not Attempted' },
              ].map(s => {
                const isActive = statusFilter === s.key
                return (
                  <motion.button
                    key={s.key}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setStatusFilter(s.key)}
                    style={{
                      background: isActive ? 'rgba(0,245,255,0.08)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isActive ? 'rgba(0,245,255,0.3)' : 'rgba(255,255,255,0.07)'}`,
                      borderRadius: '7px', padding: '5px 12px', cursor: 'pointer',
                      fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', fontWeight: isActive ? 700 : 500,
                      color: isActive ? '#00F5FF' : 'rgba(255,255,255,0.4)',
                      transition: 'all 0.15s',
                    }}
                  >
                    {s.label}
                  </motion.button>
                )
              })}
            </div>

            {/* Solved counter */}
            <div style={{ marginLeft: 'auto', fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap' }}>
              <span style={{ color: '#00FF88', fontWeight: 700 }}>{attemptedCount}</span>/{totalCount} attempted
            </div>
          </div>

          {/* ── Problems list ── */}
          <div style={{ flex: 1 }}>
            {/* Table header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '10px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ width: '20px' }} />
              <div style={{ width: '32px', fontFamily: '"DM Sans", sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>#</div>
              <div style={{ flex: 1, fontFamily: '"DM Sans", sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Title</div>
              <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.05em', width: '72px', textAlign: 'center' }}>Difficulty</div>
            </div>

            {filtered.length === 0 ? (
              <div style={{ padding: '60px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🔍</div>
                <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.35)' }}>No problems match the current filters.</p>
              </div>
            ) : (
              <div>
                {filtered.map((problem, i) => (
                  <ProblemRow
                    key={problem.id}
                    problem={problem}
                    index={i}
                    accentColor={activeSubject === 'all' ? (SUBJECTS_LIST.find(s => s.key === problem.subject)?.accent || '#00F5FF') : accent}
                    attempted={!!attempted[problem.id]}
                    onOpen={setActiveProblem}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Problem modal */}
      <AnimatePresence>
        {activeProblem && (
          <ProblemModal
            problem={activeProblem}
            accentColor={SUBJECTS_LIST.find(s => s.key === activeProblem.subject)?.accent || '#00F5FF'}
            attempted={!!attempted[activeProblem.id]}
            onClose={() => setActiveProblem(null)}
            onAttempt={markAttempted}
          />
        )}
      </AnimatePresence>

      <AvatarAssistant />
    </motion.div>
  )
}
