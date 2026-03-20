import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const STATE_CONFIG = {
  completed: { label: 'Completed',  accent: '#00F5FF', bg: 'rgba(0,245,255,0.08)',   border: 'rgba(0,245,255,0.2)'   },
  active:    { label: 'Ready',      accent: '#8B5CF6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.25)' },
  locked:    { label: 'Locked',     accent: '#555',    bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.08)' },
  contest:   { label: 'Contest',    accent: '#FFB800', bg: 'rgba(255,184,0,0.08)',  border: 'rgba(255,184,0,0.2)'   },
}

function StatChip({ icon, label, value, accent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: `${accent}0D`, border: `1px solid ${accent}25`, borderRadius: '12px', padding: '12px 16px', flex: 1 }}>
      <div style={{ color: accent }}>{icon}</div>
      <div>
        <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>{value}</div>
        <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      </div>
    </div>
  )
}

function ProgressPill({ label, done, accent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', background: done ? `${accent}15` : 'rgba(255,255,255,0.04)', border: `1px solid ${done ? accent + '40' : 'rgba(255,255,255,0.08)'}`, transition: 'all 0.2s' }}>
      {done ? (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
      ) : (
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
      )}
      <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.7rem', fontWeight: 500, color: done ? accent : 'rgba(255,255,255,0.35)' }}>{label}</span>
    </div>
  )
}

export default function LevelDetailsPanel({ level, accentColor, subjectSlug, onClose, onLevelComplete }) {
  const navigate = useNavigate()

  if (!level) return null

  const config      = STATE_CONFIG[level.state] || STATE_CONFIG.locked
  const isLocked    = level.state === 'locked'
  const isCompleted = level.state === 'completed'
  const isActive    = level.state === 'active'
  const lvlNum      = level.levelNumber || level.id

  // Progress detail from DB
  const p = level.progress
  const lectureCompleted    = p?.lectureCompleted    || isCompleted
  const notesCompleted      = p?.notesCompleted      || isCompleted
  const testCompleted       = p?.testCompleted       || isCompleted
  const cumulativeCompleted = p?.cumulativeCompleted || isCompleted
  const hasCumulative       = lvlNum > 1

  const handleStart = () => {
    navigate(`/subject/${subjectSlug}/level/${lvlNum}`)
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={level.id}
        initial={{ opacity: 0, x: 32 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 16 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        style={{ width: '320px', flexShrink: 0, background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderLeft: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}
      >
        {/* Top accent line */}
        <div style={{ height: '2px', background: `linear-gradient(90deg, transparent, ${config.accent}, transparent)` }} />

        <div style={{ padding: '24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: config.bg, border: `1px solid ${config.border}`, borderRadius: '8px', padding: '4px 10px' }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: config.accent }} />
              <span style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '0.72rem', color: config.accent, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{config.label}</span>
            </div>
            <motion.button whileHover={{ background: 'rgba(255,255,255,0.06)' }} onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px', color: 'rgba(255,255,255,0.4)', display: 'flex' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </motion.button>
          </div>

          {/* Level badge + title */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${accentColor}12`, border: `1px solid ${accentColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accentColor }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
              </div>
              <div>
                <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Level {lvlNum}</div>
                <h2 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#fff', margin: 0 }}>{level.title}</h2>
              </div>
            </div>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.88rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, margin: 0 }}>{level.description}</p>
          </div>

          {/* CTA button — positioned directly under description */}
          <motion.button
            whileHover={!isLocked ? { scale: 1.02, boxShadow: `0 8px 32px ${accentColor}35` } : {}}
            whileTap={!isLocked ? { scale: 0.97 } : {}}
            onClick={!isLocked ? handleStart : undefined}
            style={{ width: '100%', padding: '14px', background: isLocked ? 'rgba(255,255,255,0.04)' : isCompleted ? 'rgba(0,245,255,0.1)' : 'linear-gradient(135deg, #8B5CF6, #6D28D9)', border: isLocked ? '1px solid rgba(255,255,255,0.08)' : isCompleted ? '1px solid rgba(0,245,255,0.3)' : 'none', borderRadius: '12px', cursor: isLocked ? 'not-allowed' : 'pointer', fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.95rem', color: isLocked ? 'rgba(255,255,255,0.2)' : isCompleted ? '#00F5FF' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'box-shadow 0.2s' }}
          >
            {isLocked ? (<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>Locked</>)
            : isCompleted ? (<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3" /></svg>Replay Level</>)
            : (<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>Start Level</>)}
          </motion.button>

          {/* Level flow steps */}
          {!isLocked && (
            <div>
              <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Progress</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <ProgressPill label="Lecture" done={lectureCompleted} accent={accentColor} />
                <ProgressPill label="Notes"   done={notesCompleted}   accent={accentColor} />
                <ProgressPill label="Test"    done={testCompleted}    accent={accentColor} />
                {hasCumulative && <ProgressPill label="Final Test" done={cumulativeCompleted} accent="#FFB800" />}
              </div>
              {p?.contentTestScore != null && (
                <div style={{ marginTop: '8px', fontFamily: '"DM Sans", sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                  Test score: <span style={{ color: p.contentTestScore >= 70 ? '#00FF88' : '#FF6B6B', fontWeight: 600 }}>{p.contentTestScore}%</span>
                  {p.cumulativeScore != null && <> · Final: <span style={{ color: p.cumulativeScore >= 70 ? '#00FF88' : '#FF6B6B', fontWeight: 600 }}>{p.cumulativeScore}%</span></>}
                </div>
              )}
            </div>
          )}

          {/* Rewards */}
          <div>
            <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Rewards</div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <StatChip icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>} label="XP this level" value={`+${level.xpReward} XP`} accent={isCompleted ? 'rgba(0,245,255,0.5)' : '#00F5FF'} />
              {level.coinReward > 0 && (
                <StatChip icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>} label="Course coins" value={`+${level.coinReward}`} accent={isCompleted ? 'rgba(255,184,0,0.5)' : '#FFB800'} />
              )}
            </div>
            {level.coinReward === 0 && (
              <div style={{ marginTop: '8px', fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)' }}>
                🏆 Complete all levels to earn <span style={{ color: '#FFB800' }}>100 coins</span>
              </div>
            )}
          </div>

          {/* Completion badge */}
          {isCompleted && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00FF88" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
              <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', color: '#00FF88', fontWeight: 500 }}>Level complete — replay anytime</span>
            </motion.div>
          )}

          {/* Lock message */}
          {isLocked && (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.83rem', color: 'rgba(255,255,255,0.35)' }}>Complete previous levels to unlock</span>
            </div>
          )}
        </div>

      </motion.div>
    </AnimatePresence>
  )
}
