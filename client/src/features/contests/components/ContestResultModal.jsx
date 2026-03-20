import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import RankCircle from '@components/ui/RankCircle'
import { formatTime } from '@/data/contestData'
import { MOCK_LEADERBOARD } from '@/data/contestData'

function ScoreRing({ score, maxScore, accentColor }) {
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0
  const r   = 52
  const circ = 2 * Math.PI * r

  return (
    <div style={{ position: 'relative', width: '128px', height: '128px', flexShrink: 0 }}>
      <svg width="128" height="128" viewBox="0 0 128 128" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="64" cy="64" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6" />
        <motion.circle
          cx="64" cy="64" r={r}
          fill="none" stroke={accentColor} strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - pct / 100) }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
          style={{ filter: `drop-shadow(0 0 8px ${accentColor}80)` }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4, ease: [0.34, 1.3, 0.64, 1] }}
        >
          <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.6rem', color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>
            {score}
          </div>
          <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Score
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function ContestResultModal({ result, contest, onViewLeaderboard, onClose }) {
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  if (!result || !contest) return null

  const { score, correct, total, rank, completionTime, xpAwarded, coinsAwarded } = result
  const maxScore    = total * 130 // max with perfect time bonus
  const accuracy    = total > 0 ? Math.round((correct / total) * 100) : 0
  const isTop3      = rank && rank <= 3

  const leaderboard = MOCK_LEADERBOARD.slice(0, 5)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 12 }}
          transition={{ duration: 0.4, ease: [0.34, 1.1, 0.64, 1] }}
          style={{
            width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto',
            background: 'rgba(12,12,20,0.98)',
            border: `1px solid ${contest.accentColor}30`,
            borderRadius: '22px',
            position: 'relative', overflow: 'hidden',
          }}
        >
          {/* Top accent */}
          <div style={{ height: '2px', background: `linear-gradient(90deg, transparent, ${contest.accentColor}, transparent)` }} />

          {!showLeaderboard ? (
            /* ── Results view ── */
            <div style={{ padding: '32px' }}>
              {/* Header */}
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', fontWeight: 600, color: contest.accentColor, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                  Contest Complete
                </div>
                <h2 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.6rem', color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
                  {contest.title}
                </h2>
              </motion.div>

              {/* Score ring + stats row */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
                style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '28px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <ScoreRing score={score} maxScore={maxScore} accentColor={contest.accentColor} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '160px' }}>
                  {[
                    { label: 'Correct',  value: `${correct} / ${total}`, color: '#00FF88' },
                    { label: 'Accuracy', value: `${accuracy}%`,          color: contest.accentColor },
                    { label: 'Time',     value: formatTime(completionTime), color: '#8B5CF6' },
                    { label: 'Rank',     value: rank ? `#${rank}` : '—', color: '#FFB800' },
                  ].map(stat => (
                    <motion.div key={stat.label}
                      initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{stat.label}</span>
                      <span style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.9rem', color: stat.color }}>{stat.value}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Rewards */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                {[
                  { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>, value: `+${xpAwarded}`, label: 'XP', color: '#00F5FF' },
                  { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>, value: `+${coinsAwarded}`, label: 'Coins', color: '#FFB800' },
                ].map(r => (
                  <motion.div key={r.label}
                    initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.55, type: 'spring', stiffness: 240, damping: 16 }}
                    style={{
                      flex: 1, background: `${r.color}10`, border: `1px solid ${r.color}28`,
                      borderRadius: '14px', padding: '14px',
                      display: 'flex', alignItems: 'center', gap: '10px',
                      boxShadow: `0 0 16px ${r.color}12`,
                    }}
                  >
                    <div style={{ color: r.color }}>{r.icon}</div>
                    <div>
                      <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.3rem', color: r.color, lineHeight: 1 }}>{r.value}</div>
                      <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '3px' }}>{r.label}</div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: `0 8px 28px ${contest.accentColor}35` }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowLeaderboard(true)}
                  style={{
                    width: '100%', padding: '14px',
                    background: `linear-gradient(135deg, ${contest.accentColor}, #0080FF)`,
                    border: 'none', borderRadius: '12px', cursor: 'pointer',
                    fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#000',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 20V10M12 20V4M6 20v-6" /></svg>
                  View Leaderboard
                </motion.button>
                <motion.button
                  whileHover={{ background: 'rgba(255,255,255,0.07)' }}
                  onClick={onClose}
                  style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)' }}
                >
                  Back to Contests
                </motion.button>
              </div>
            </div>
          ) : (
            /* ── Leaderboard view ── */
            <div style={{ padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <button onClick={() => setShowLeaderboard(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: '4px', display: 'flex' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <h3 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#fff', margin: 0 }}>
                  Leaderboard
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {leaderboard.map((entry, i) => (
                  <motion.div key={entry.rank}
                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '12px 14px', borderRadius: '12px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <RankCircle rank={entry.rank} size={32} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>{entry.username}</div>
                      <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>
                        {entry.correctAnswers}/{entry.totalQuestions} correct · {formatTime(entry.completionTime)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.88rem', color: entry.rank === 1 ? '#FFB800' : 'rgba(255,255,255,0.7)' }}>{entry.score}</div>
                      <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.68rem', color: '#00F5FF' }}>+{entry.xpAwarded} XP</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
