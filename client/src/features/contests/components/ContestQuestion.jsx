import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ContestOptions from './ContestOptions'

const DIFFICULTY_CONFIG = {
  easy:   { color: '#00FF88', label: 'Easy'   },
  medium: { color: '#FFB800', label: 'Medium' },
  hard:   { color: '#FF5050', label: 'Hard'   },
}

export default function ContestQuestion({
  question,
  questionIndex,
  totalQuestions,
  onAnswer,
  accentColor = '#00F5FF',
  autoAdvanceMs = 1200,
}) {
  const [selected,   setSelected]   = useState(null)
  const [revealed,   setRevealed]   = useState(false)

  // Reset on question change
  useEffect(() => {
    setSelected(null)
    setRevealed(false)
  }, [questionIndex])

  const handleSelect = (i) => {
    if (revealed) return
    setSelected(i)
    setRevealed(true)

    const isCorrect = i === question.correctIndex
    // Auto-advance after brief reveal
    setTimeout(() => onAnswer(i, isCorrect), autoAdvanceMs)
  }

  const diff = DIFFICULTY_CONFIG[question.difficulty] || DIFFICULTY_CONFIG.medium

  return (
    <motion.div
      key={questionIndex}
      initial={{ opacity: 0, x: 30, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -30, scale: 0.97 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '18px',
        padding: '28px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top glow accent */}
      <div style={{
        position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px',
        background: `linear-gradient(90deg, transparent, ${accentColor}50, transparent)`,
      }} />

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        {/* Question counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Question {questionIndex + 1} of {totalQuestions}
          </span>
        </div>

        {/* Difficulty badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          background: `${diff.color}10`, border: `1px solid ${diff.color}25`,
          borderRadius: '8px', padding: '3px 10px',
        }}>
          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: diff.color }} />
          <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.7rem', fontWeight: 600, color: diff.color }}>
            {diff.label}
          </span>
        </div>
      </div>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: '5px', marginBottom: '22px', flexWrap: 'wrap' }}>
        {Array.from({ length: totalQuestions }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              background: i < questionIndex
                ? '#00FF88'
                : i === questionIndex
                ? accentColor
                : 'rgba(255,255,255,0.1)',
              scale: i === questionIndex ? 1.2 : 1,
            }}
            transition={{ duration: 0.25 }}
            style={{
              width: '8px', height: '8px', borderRadius: '50%',
              boxShadow: i === questionIndex ? `0 0 8px ${accentColor}` : 'none',
            }}
          />
        ))}
      </div>

      {/* Question text */}
      <h2 style={{
        fontFamily: '"Syne", sans-serif', fontWeight: 700,
        fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
        color: '#fff', lineHeight: 1.45,
        letterSpacing: '-0.015em',
        marginBottom: '22px',
      }}>
        {question.questionText}
      </h2>

      {/* Options */}
      <ContestOptions
        options={question.options}
        selectedIndex={selected}
        correctIndex={revealed ? question.correctIndex : null}
        revealed={revealed}
        onSelect={handleSelect}
        accentColor={accentColor}
      />

      {/* Feedback banner */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 14 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              background: selected === question.correctIndex
                ? 'rgba(0,255,136,0.07)'
                : 'rgba(255,80,80,0.07)',
              border: `1px solid ${selected === question.correctIndex ? 'rgba(0,255,136,0.2)' : 'rgba(255,80,80,0.2)'}`,
              borderRadius: '10px', padding: '11px 14px',
              display: 'flex', alignItems: 'center', gap: '9px',
            }}
          >
            {selected === question.correctIndex ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00FF88" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF5050" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            )}
            <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.83rem', color: 'rgba(255,255,255,0.65)' }}>
              {selected === question.correctIndex
                ? 'Correct! Moving to next question...'
                : `Incorrect. Next question coming up...`}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
