import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Individual option button ──────────────────────────────
function OptionButton({ label, text, index, selected, revealed, correct, onSelect, accentColor }) {
  let bg     = 'rgba(255,255,255,0.04)'
  let border = 'rgba(255,255,255,0.1)'
  let color  = 'rgba(255,255,255,0.75)'

  if (!revealed) {
    if (selected === index) {
      bg = `${accentColor}18`; border = accentColor; color = '#fff'
    }
  } else {
    if (index === correct) {
      bg = 'rgba(0,255,136,0.08)'; border = '#00FF88'; color = '#00FF88'
    } else if (selected === index && index !== correct) {
      bg = 'rgba(255,80,80,0.08)'; border = '#FF5050'; color = '#FF5050'
    }
  }

  return (
    <motion.button
      whileHover={!revealed && selected !== index ? { x: 3 } : {}}
      whileTap={!revealed ? { scale: 0.99 } : {}}
      onClick={() => !revealed && onSelect(index)}
      style={{
        width: '100%',
        display: 'flex', alignItems: 'center', gap: '12px',
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: '10px',
        padding: '12px 16px',
        cursor: revealed ? 'default' : 'pointer',
        transition: 'all 0.18s',
        textAlign: 'left',
      }}
    >
      <span style={{
        fontFamily: '"Syne", sans-serif',
        fontWeight: 800, fontSize: '0.78rem',
        color: revealed ? color : (selected === index ? accentColor : 'rgba(255,255,255,0.28)'),
        flexShrink: 0, width: '18px',
      }}>
        {label}.
      </span>
      <span style={{
        fontFamily: '"DM Sans", sans-serif',
        fontSize: '0.9rem',
        color, lineHeight: 1.45,
      }}>
        {text}
      </span>
      {revealed && index === correct && (
        <svg style={{ marginLeft: 'auto', flexShrink: 0 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00FF88" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      )}
      {revealed && selected === index && index !== correct && (
        <svg style={{ marginLeft: 'auto', flexShrink: 0 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF5050" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      )}
    </motion.button>
  )
}

// ─────────────────────────────────────────────────────────
// QuestionPanel
// Props:
//   question     — { question, options, correctAnswer, difficulty }
//   accentColor  — door's accent color
//   isFinal      — boolean, for final grand door styling
//   onCorrect    — callback when answered correctly
//   onWrong      — callback when answered wrong
// ─────────────────────────────────────────────────────────
export default function QuestionPanel({ question, accentColor, isFinal = false, onCorrect, onWrong }) {
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const isCorrect = selected === question.correctAnswer

  const handleSubmit = () => {
    if (selected === null || submitting) return
    setRevealed(true)
    setSubmitting(true)
    // Brief pause so user sees the result highlight before callback
    setTimeout(() => {
      if (selected === question.correctAnswer) {
        onCorrect()
      } else {
        onWrong()
      }
    }, 1100)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      style={{
        background: 'rgba(14,14,22,0.94)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: `1px solid ${accentColor}28`,
        borderRadius: '20px',
        padding: '32px',
        width: '100%',
        maxWidth: '580px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: '10%', right: '10%', height: '1.5px',
        background: `linear-gradient(90deg, transparent, ${accentColor}70, transparent)`,
      }} />

      {/* Ambient glow behind panel */}
      <div style={{
        position: 'absolute', top: '-20%', left: '-10%', right: '-10%', bottom: '-20%',
        background: `radial-gradient(ellipse at 50% 0%, ${accentColor}06 0%, transparent 65%)`,
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ marginBottom: '20px', position: 'relative' }}>
        {isFinal && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              background: `${accentColor}12`,
              border: `1px solid ${accentColor}30`,
              borderRadius: '8px',
              padding: '3px 12px',
              marginBottom: '12px',
            }}
          >
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: accentColor, boxShadow: `0 0 6px ${accentColor}` }} />
            <span style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.72rem', color: accentColor, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Final Challenge
            </span>
          </motion.div>
        )}

        <h3 style={{
          fontFamily: '"Syne", sans-serif',
          fontWeight: 700,
          fontSize: '1rem',
          color: '#fff',
          lineHeight: 1.55,
          margin: 0,
        }}>
          {question.question}
        </h3>
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', marginBottom: '20px' }}>
        {question.options.map((opt, i) => (
          <OptionButton
            key={i}
            label={String.fromCharCode(65 + i)}
            text={opt}
            index={i}
            selected={selected}
            revealed={revealed}
            correct={question.correctAnswer}
            onSelect={setSelected}
            accentColor={accentColor}
          />
        ))}
      </div>

      {/* Result feedback */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
            style={{
              background: isCorrect ? 'rgba(0,255,136,0.06)' : 'rgba(255,80,80,0.06)',
              border: `1px solid ${isCorrect ? 'rgba(0,255,136,0.22)' : 'rgba(255,80,80,0.22)'}`,
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '16px',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isCorrect ? '#00FF88' : '#FF5050'} strokeWidth="2.5">
              {isCorrect
                ? <polyline points="20 6 9 17 4 12"/>
                : <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
              }
            </svg>
            <span style={{
              fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem',
              color: isCorrect ? '#00FF88' : '#FF7070',
              fontWeight: 600,
            }}>
              {isCorrect ? 'Correct — moving forward…' : 'Incorrect — see the answer above'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit button */}
      {!revealed && (
        <motion.button
          whileHover={selected !== null ? { scale: 1.02, boxShadow: `0 6px 20px ${accentColor}30` } : {}}
          whileTap={selected !== null ? { scale: 0.98 } : {}}
          onClick={handleSubmit}
          disabled={selected === null}
          style={{
            width: '100%', padding: '13px',
            background: selected !== null
              ? `linear-gradient(135deg, ${accentColor}CC, ${accentColor}88)`
              : 'rgba(255,255,255,0.05)',
            border: `1px solid ${selected !== null ? `${accentColor}50` : 'rgba(255,255,255,0.08)'}`,
            borderRadius: '12px',
            cursor: selected !== null ? 'pointer' : 'not-allowed',
            fontFamily: '"Syne", sans-serif',
            fontWeight: 700, fontSize: '0.92rem',
            color: selected !== null ? '#fff' : 'rgba(255,255,255,0.22)',
            transition: 'all 0.2s',
            letterSpacing: '0.02em',
          }}
        >
          Confirm Answer
        </motion.button>
      )}
    </motion.div>
  )
}
