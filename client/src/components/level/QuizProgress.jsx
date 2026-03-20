import { motion } from 'framer-motion'
import { PHASE } from '@/data/quizData'

const ALL_PHASES = [
  { key: PHASE.LECTURE,      label: 'Lecture',    icon: '▶' },
  { key: PHASE.NOTES,        label: 'Notes',      icon: '≡' },
  { key: PHASE.CONTENT_TEST, label: 'Test',       icon: '✎' },
  { key: PHASE.CUMULATIVE,   label: 'Final Test', icon: '★' },
]

/**
 * QuizProgress — phase stepper with clickable unlocked steps
 */
export default function QuizProgress({
  currentPhase,
  accentColor = '#00F5FF',
  hasCumulative = true,
  lectureUnlocked = true,
  notesUnlocked = false,
  testUnlocked = false,
  cumulativeUnlocked = false,
  onPhaseSelect,
}) {
  const phases = hasCumulative ? ALL_PHASES : ALL_PHASES.slice(0, 3)
  const currentIdx = phases.findIndex(p => p.key === currentPhase)

  const isUnlocked = (key) => {
    if (key === PHASE.LECTURE)      return lectureUnlocked
    if (key === PHASE.NOTES)        return notesUnlocked
    if (key === PHASE.CONTENT_TEST) return testUnlocked
    if (key === PHASE.CUMULATIVE)   return cumulativeUnlocked
    return false
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 0,
      padding: '0 32px', height: '52px',
      background: 'rgba(255,255,255,0.02)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      flexShrink: 0, overflowX: 'auto',
    }}>
      {phases.map((phase, i) => {
        const isDone    = i < currentIdx
        const isActive  = i === currentIdx
        const unlocked  = isUnlocked(phase.key)
        const clickable = unlocked && !!onPhaseSelect

        return (
          <div key={phase.key} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <div
              onClick={clickable ? () => onPhaseSelect(phase.key) : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                cursor: clickable ? 'pointer' : 'default',
                padding: '4px 6px', borderRadius: '8px',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (clickable) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              <motion.div
                animate={{
                  background: isActive ? `${accentColor}20` : isDone ? 'rgba(0,255,136,0.12)' : unlocked ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.04)',
                  borderColor: isActive ? accentColor : isDone ? '#00FF88' : unlocked ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                  boxShadow: isActive ? `0 0 14px ${accentColor}50` : 'none',
                }}
                style={{
                  width: '28px', height: '28px', borderRadius: '50%', border: '1.5px solid',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.65rem',
                  color: isActive ? accentColor : isDone ? '#00FF88' : unlocked ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)',
                  flexShrink: 0,
                }}
              >
                {isDone
                  ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#00FF88" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                  : phase.icon}
              </motion.div>
              <span style={{
                fontFamily: '"DM Sans", sans-serif', fontSize: '0.75rem',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#fff' : isDone ? 'rgba(255,255,255,0.5)' : unlocked ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.22)',
                whiteSpace: 'nowrap',
              }}>
                {phase.label}
              </span>
              {unlocked && !isActive && (
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={isDone ? '#00FF88' : 'rgba(255,255,255,0.3)'} strokeWidth="2.5" style={{ opacity: 0.6 }}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              )}
            </div>
            {i < phases.length - 1 && (
              <div style={{
                width: '32px', height: '1px', margin: '0 4px', flexShrink: 0,
                background: isDone ? 'linear-gradient(90deg, #00FF88, rgba(0,255,136,0.3))' : 'rgba(255,255,255,0.08)',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}
