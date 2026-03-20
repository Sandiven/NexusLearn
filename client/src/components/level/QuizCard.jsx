import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import QuizOptions from './QuizOptions'

/**
 * QuizCard — wraps one question for all quiz phases
 * @param {object}   question       — { id, text, options, correctIndex, explanation }
 * @param {number}   questionNumber — 1-indexed display
 * @param {number}   totalQuestions
 * @param {function} onAnswer       — (isCorrect, selectedIndex) => void
 * @param {string}   accentColor
 * @param {boolean}  isMidQuiz      — mid-lecture variant (inline, not fullscreen)
 */
export default function QuizCard({ question, questionNumber, totalQuestions, onAnswer, accentColor = '#00F5FF', isMidQuiz = false }) {
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const isCorrect = selected === question.correctIndex

  const handleSelect = (i) => {
    if (revealed) return
    setSelected(i)
  }

  const handleConfirm = () => {
    if (selected === null) return
    setRevealed(true)
  }

  const handleContinue = () => {
    setConfirmed(true)
    onAnswer(isCorrect, selected)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      style={{
        background: isMidQuiz
          ? `linear-gradient(135deg, rgba(139,92,246,0.06), rgba(0,245,255,0.04))`
          : 'rgba(255,255,255,0.03)',
        border: isMidQuiz ? '1px solid rgba(139,92,246,0.25)' : '1px solid rgba(255,255,255,0.07)',
        borderRadius: '16px',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top accent */}
      <div style={{
        position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px',
        background: isMidQuiz
          ? 'linear-gradient(90deg, transparent, rgba(139,92,246,0.6), transparent)'
          : `linear-gradient(90deg, transparent, ${accentColor}40, transparent)`,
      }} />

      {/* Mid-quiz badge */}
      {isMidQuiz && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)',
          borderRadius: '8px', padding: '4px 10px', marginBottom: '16px',
        }}>
          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#8B5CF6' }} />
          <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', fontWeight: 600, color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Check-In Quiz
          </span>
        </div>
      )}

      {/* Question counter */}
      {!isMidQuiz && totalQuestions > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Question {questionNumber} of {totalQuestions}
          </span>
          {/* Mini dots progress */}
          <div style={{ display: 'flex', gap: '5px' }}>
            {Array.from({ length: totalQuestions }).map((_, i) => (
              <div key={i} style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: i < questionNumber - 1 ? '#00FF88'
                  : i === questionNumber - 1 ? accentColor
                  : 'rgba(255,255,255,0.1)',
                transition: 'background 0.3s',
              }} />
            ))}
          </div>
        </div>
      )}

      {/* Question text */}
      <h3 style={{
        fontFamily: '"Syne", sans-serif', fontWeight: 700,
        fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', color: '#fff',
        lineHeight: 1.4, marginBottom: '20px',
        letterSpacing: '-0.01em',
      }}>
        {question.text}
      </h3>

      {/* Options */}
      <QuizOptions
        options={question.options}
        selectedIndex={selected}
        correctIndex={question.correctIndex}
        onSelect={handleSelect}
        revealed={revealed}
        accentColor={accentColor}
      />

      {/* Explanation */}
      <AnimatePresence>
        {revealed && question.explanation && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: '16px' }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background: isCorrect ? 'rgba(0,255,136,0.06)' : 'rgba(255,80,80,0.06)',
              border: `1px solid ${isCorrect ? 'rgba(0,255,136,0.2)' : 'rgba(255,80,80,0.2)'}`,
              borderRadius: '10px', padding: '12px 14px',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isCorrect ? '#00FF88' : '#FF5050'} strokeWidth="2.5" style={{ flexShrink: 0, marginTop: '2px' }}>
                {isCorrect
                  ? <polyline points="20 6 9 17 4 12" />
                  : <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>
                }
              </svg>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.55, margin: 0 }}>
                {question.explanation}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', gap: '10px' }}>
        {!revealed ? (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleConfirm}
            disabled={selected === null}
            style={{
              background: selected !== null ? `linear-gradient(135deg, ${accentColor}, #0080FF)` : 'rgba(255,255,255,0.06)',
              color: selected !== null ? '#000' : 'rgba(255,255,255,0.3)',
              border: 'none', borderRadius: '10px',
              padding: '11px 24px',
              fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.88rem',
              cursor: selected !== null ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s',
            }}
          >
            Check Answer
          </motion.button>
        ) : (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.03, boxShadow: isCorrect ? '0 6px 20px rgba(0,255,136,0.3)' : `0 6px 20px ${accentColor}30` }}
            whileTap={{ scale: 0.97 }}
            onClick={handleContinue}
            style={{
              background: isCorrect
                ? 'linear-gradient(135deg, #00FF88, #00CC6A)'
                : `linear-gradient(135deg, ${accentColor}, #0080FF)`,
              color: '#000', border: 'none', borderRadius: '10px',
              padding: '11px 24px',
              fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '7px',
            }}
          >
            {isCorrect ? (
              <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg> Continue</>
            ) : (
              <>Next<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg></>
            )}
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}
