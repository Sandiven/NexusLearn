import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@services/api'
import useGamificationStore from '@store/gamificationStore'

const DIFF_STYLE = {
  medium: { color: '#FFB800', bg: 'rgba(255,184,0,0.1)',  border: 'rgba(255,184,0,0.3)' },
  hard:   { color: '#FF6B6B', bg: 'rgba(255,107,107,0.1)', border: 'rgba(255,107,107,0.3)' },
}

// ── Skeleton loader ────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {[80, 100, 60, 60].map((w, i) => (
        <div key={i} style={{ height: '16px', width: `${w}%`, background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }} />
      ))}
    </div>
  )
}

// ── Option button ──────────────────────────────────────────────────────────
function Option({ label, text, index, selected, correctIndex, revealed, onSelect, accentColor }) {
  let bg     = 'rgba(255,255,255,0.03)'
  let border = 'rgba(255,255,255,0.08)'
  let color  = 'rgba(255,255,255,0.75)'

  if (!revealed) {
    if (selected === index) { bg = `${accentColor}15`; border = accentColor; color = '#fff' }
  } else {
    if (index === correctIndex)            { bg = 'rgba(0,255,136,0.08)'; border = '#00FF88'; color = '#00FF88' }
    if (index === selected && index !== correctIndex) { bg = 'rgba(255,80,80,0.08)'; border = '#FF5050'; color = '#FF5050' }
  }

  return (
    <motion.button
      whileHover={!revealed ? { scale: 1.01, background: `${accentColor}08` } : {}}
      whileTap={!revealed ? { scale: 0.99 } : {}}
      onClick={() => !revealed && onSelect(index)}
      style={{
        background: bg, border: `1px solid ${border}`, borderRadius: '10px',
        padding: '10px 14px', cursor: revealed ? 'default' : 'pointer',
        fontFamily: '"DM Sans", sans-serif', fontSize: '0.88rem', color,
        textAlign: 'left', transition: 'all 0.18s',
        display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
      }}
    >
      <span style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.78rem', flexShrink: 0, color: revealed ? color : (selected === index ? accentColor : 'rgba(255,255,255,0.3)') }}>
        {label}.
      </span>
      {text}
    </motion.button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main card
// ─────────────────────────────────────────────────────────────────────────────
export default function DailyChallengeCard() {
  const [challenge,   setChallenge]   = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [selected,    setSelected]    = useState(null)
  const [submitting,  setSubmitting]  = useState(false)
  const [result,      setResult]      = useState(null)   // { isCorrect, correctIndex, explanation, xpAwarded, coinsAwarded }
  const [error,       setError]       = useState(null)

  const addXPLocal    = useGamificationStore(s => s.addXPLocal)
  const addCoinsLocal = useGamificationStore(s => s.addCoinsLocal)

  useEffect(() => {
    api.get('/daily-challenge')
      .then(res => {
        const d = res.data.data
        setChallenge(d)
        // If already attempted, pre-fill result state
        if (d.attempted) {
          setSelected(d.selectedIndex)
          setResult({
            isCorrect:    d.isCorrect,
            correctIndex: d.correctIndex,
            explanation:  d.explanation,
            xpAwarded:    d.rewardGranted ? 10 : 0,
            coinsAwarded: d.rewardGranted ? 3  : 0,
            rewardGranted: d.rewardGranted,
          })
        }
      })
      .catch(() => setError('Could not load today\'s challenge.'))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async () => {
    if (selected === null || submitting || result) return
    setSubmitting(true)
    try {
      const res = await api.post('/daily-challenge/submit', { selectedIndex: selected })
      const d   = res.data.data
      setResult(d)
      // Optimistic UI update for XP/coins
      if (d.rewardGranted) {
        addXPLocal(d.xpAwarded)
        addCoinsLocal(d.coinsAwarded)
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Submission failed.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // ── Derived values ─────────────────────────────────────────────────────
  const accent     = challenge?.accentColor || '#00F5FF'
  const diffStyle  = DIFF_STYLE[challenge?.difficulty] || DIFF_STYLE.medium
  const isRevealed = !!result

  // ── State variants ─────────────────────────────────────────────────────

  // Already attempted: correct
  const showCorrect   = isRevealed && result?.isCorrect
  // Already attempted: incorrect
  const showIncorrect = isRevealed && result && !result.isCorrect

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${isRevealed ? (showCorrect ? 'rgba(0,255,136,0.2)' : 'rgba(255,107,107,0.2)') : `${accent}20`}`,
        borderRadius: '18px',
        padding: '22px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: '8%', right: '8%', height: '1px',
        background: `linear-gradient(90deg, transparent, ${isRevealed ? (showCorrect ? '#00FF88' : '#FF6B6B') : accent}60, transparent)`,
      }} />

      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: '-40%', left: '-10%', width: '50%', height: '120%',
        background: `radial-gradient(ellipse, ${accent}05 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Icon */}
          <div style={{
            width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
            background: `${accent}12`, border: `1px solid ${accent}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.68rem', color: accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1px' }}>
              Daily Challenge
            </div>
            <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
              {loading ? 'Loading…' : (challenge?.title || 'Daily Challenge')}
            </div>
          </div>
        </div>

        {/* Reward badge */}
        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.2)', borderRadius: '7px', padding: '4px 8px' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#00F5FF" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
            <span style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.72rem', color: '#00F5FF' }}>10 XP</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,184,0,0.08)', border: '1px solid rgba(255,184,0,0.2)', borderRadius: '7px', padding: '4px 8px' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#FFB800" strokeWidth="2"><circle cx="12" cy="12" r="10" /></svg>
            <span style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.72rem', color: '#FFB800' }}>3 Coins</span>
          </div>
        </div>
      </div>

      {/* ── Meta chips ──────────────────────────────────────────────────── */}
      {!loading && challenge && (
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', color: accent, background: `${accent}10`, border: `1px solid ${accent}25`, borderRadius: '6px', padding: '2px 9px' }}>
            {challenge.subjectLabel}
          </span>
          <span style={{
            fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', fontWeight: 700,
            color: diffStyle.color, background: diffStyle.bg, border: `1px solid ${diffStyle.border}`,
            borderRadius: '6px', padding: '2px 9px', textTransform: 'capitalize',
          }}>
            {challenge.difficulty}
          </span>
        </div>
      )}

      {/* ── Content ─────────────────────────────────────────────────────── */}
      {loading ? (
        <Skeleton />
      ) : error ? (
        <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', color: 'rgba(255,100,100,0.8)', margin: 0 }}>{error}</p>
      ) : (
        <>
          {/* Question text */}
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 500, fontSize: '0.92rem', color: 'rgba(255,255,255,0.88)', lineHeight: 1.6, margin: '0 0 14px' }}>
            {challenge.question}
          </p>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
            {challenge.options.map((opt, i) => (
              <Option
                key={i}
                label={String.fromCharCode(65 + i)}
                text={opt}
                index={i}
                selected={selected}
                correctIndex={result?.correctIndex ?? null}
                revealed={isRevealed}
                onSelect={setSelected}
                accentColor={accent}
              />
            ))}
          </div>

          {/* ── Result / Explanation ──────────────────────────────────── */}
          <AnimatePresence>
            {isRevealed && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  background: showCorrect ? 'rgba(0,255,136,0.06)' : 'rgba(255,80,80,0.06)',
                  border: `1px solid ${showCorrect ? 'rgba(0,255,136,0.2)' : 'rgba(255,80,80,0.2)'}`,
                  borderRadius: '10px', padding: '12px 14px', marginBottom: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ fontSize: '1rem', flexShrink: 0 }}>{showCorrect ? '✓' : '✗'}</span>
                  <div>
                    <p style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.88rem', color: showCorrect ? '#00FF88' : '#FF6B6B', margin: '0 0 4px' }}>
                      {showCorrect ? 'Correct! +10 XP, +3 Coins earned' : 'Incorrect — no reward this time'}
                    </p>
                    {result?.explanation && (
                      <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.83rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.55, margin: 0 }}>
                        {result.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Already attempted banner (no second attempt) ──────────── */}
          {isRevealed ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '10px', padding: '10px 14px',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)' }}>
                {showCorrect ? 'Challenge completed — come back tomorrow for a new one!' : 'Come back tomorrow for another chance!'}
              </span>
            </div>
          ) : (
            /* ── Submit button ── */
            <motion.button
              whileHover={selected !== null && !submitting ? { scale: 1.02, boxShadow: `0 6px 20px ${accent}25` } : {}}
              whileTap={selected !== null && !submitting ? { scale: 0.98 } : {}}
              onClick={handleSubmit}
              disabled={selected === null || submitting}
              style={{
                width: '100%', padding: '12px',
                background: selected !== null
                  ? `linear-gradient(135deg, ${accent}, #0080FF)`
                  : 'rgba(255,255,255,0.05)',
                border: `1px solid ${selected !== null ? 'transparent' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '12px', cursor: selected !== null && !submitting ? 'pointer' : 'not-allowed',
                fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.9rem',
                color: selected !== null ? '#000' : 'rgba(255,255,255,0.25)',
                transition: 'all 0.2s',
              }}
            >
              {submitting ? 'Submitting…' : 'Submit Answer'}
            </motion.button>
          )}
        </>
      )}
    </motion.div>
  )
}
