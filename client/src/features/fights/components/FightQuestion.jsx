// import { useState, useEffect, useRef } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'

// const LABELS = ['A', 'B', 'C', 'D']

// function QuestionTimer({ seconds, totalSeconds }) {
//   const pct  = (seconds / totalSeconds) * 100
//   const r    = 22
//   const circ = 2 * Math.PI * r

//   const isUrgent   = seconds <= 5
//   const isCritical = seconds <= 3
//   const color = isCritical ? '#FF5050' : isUrgent ? '#FFB800' : '#00F5FF'

//   return (
//     <div style={{ position: 'relative', width: '56px', height: '56px', flexShrink: 0 }}>
//       <svg width="56" height="56" viewBox="0 0 56 56" style={{ transform: 'rotate(-90deg)' }}>
//         <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3.5" />
//         <motion.circle
//           cx="28" cy="28" r={r}
//           fill="none" stroke={color} strokeWidth="3.5"
//           strokeLinecap="round"
//           animate={{ strokeDashoffset: circ * (1 - pct / 100) }}
//           transition={{ duration: 0.9, ease: 'linear' }}
//           strokeDasharray={circ}
//           style={{ filter: `drop-shadow(0 0 4px ${color}80)` }}
//         />
//       </svg>
//       <motion.div
//         animate={isCritical ? { scale: [1, 1.15, 1] } : {}}
//         transition={{ duration: 0.4, repeat: isCritical ? Infinity : 0 }}
//         style={{
//           position: 'absolute', inset: 0,
//           display: 'flex', alignItems: 'center', justifyContent: 'center',
//           fontFamily: '"Syne", sans-serif', fontWeight: 900,
//           fontSize: '1rem', color,
//         }}
//       >
//         {seconds}
//       </motion.div>
//     </div>
//   )
// }

// export default function FightQuestion({
//   question,
//   questionIndex,
//   totalQuestions,
//   timePerQuestion,
//   onAnswer,
//   onTimeout,
// }) {
//   const [selected,   setSelected]   = useState(null)
//   const [revealed,   setRevealed]   = useState(false)
//   const [timeLeft,   setTimeLeft]   = useState(timePerQuestion)
//   const startTimeRef = useRef(Date.now())
//   const intervalRef  = useRef(null)
//   const hasAnswered  = useRef(false)

//   // Reset on question change
//   useEffect(() => {
//     setSelected(null)
//     setRevealed(false)
//     setTimeLeft(timePerQuestion)
//     startTimeRef.current = Date.now()
//     hasAnswered.current  = false

//     intervalRef.current = setInterval(() => {
//       setTimeLeft(prev => {
//         if (prev <= 1) {
//           clearInterval(intervalRef.current)
//           if (!hasAnswered.current) {
//             hasAnswered.current = true
//             const ms = Date.now() - startTimeRef.current
//             onTimeout?.()
//             onAnswer(-1, false, ms)
//           }
//           return 0
//         }
//         return prev - 1
//       })
//     }, 1000)

//     return () => clearInterval(intervalRef.current)
//   }, [questionIndex, timePerQuestion])

//   const handleSelect = (i) => {
//     if (revealed || hasAnswered.current) return
//     clearInterval(intervalRef.current)
//     hasAnswered.current = true

//     const ms        = Date.now() - startTimeRef.current
//     const isCorrect = i === question.correctIndex

//     setSelected(i)
//     setRevealed(true)

//     // Brief visual delay before advancing
//     setTimeout(() => onAnswer(i, isCorrect, ms), 900)
//   }

//   const DIFF = {
//     easy:   { color: '#00FF88', label: 'Easy' },
//     medium: { color: '#FFB800', label: 'Medium' },
//     hard:   { color: '#FF5050', label: 'Hard' },
//   }
//   const diff = DIFF[question?.difficulty] || DIFF.medium

//   if (!question) return null

//   return (
//     <motion.div
//       key={questionIndex}
//       initial={{ opacity: 0, x: 30, scale: 0.97 }}
//       animate={{ opacity: 1, x: 0, scale: 1 }}
//       exit={{ opacity: 0, x: -30, scale: 0.97 }}
//       transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
//       style={{
//         background: 'rgba(255,255,255,0.03)',
//         border: '1px solid rgba(255,255,255,0.08)',
//         borderRadius: '18px', padding: '26px',
//         position: 'relative', overflow: 'hidden',
//       }}
//     >
//       <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,64,96,0.5), transparent)' }} />

//       {/* Header */}
//       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//           <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.76rem', color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
//             Q{questionIndex + 1}/{totalQuestions}
//           </span>
//           <div style={{ background: `${diff.color}12`, border: `1px solid ${diff.color}28`, borderRadius: '7px', padding: '3px 9px' }}>
//             <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.68rem', fontWeight: 600, color: diff.color }}>{diff.label}</span>
//           </div>
//         </div>
//         <QuestionTimer seconds={timeLeft} totalSeconds={timePerQuestion} />
//       </div>

//       {/* Question text */}
//       <h2 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)', color: '#fff', lineHeight: 1.45, letterSpacing: '-0.01em', marginBottom: '20px' }}>
//         {question.questionText}
//       </h2>

//       {/* Options */}
//       <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
//         {question.options?.map((opt, i) => {
//           const isSelected = selected === i
//           const isCorrect  = revealed && i === question.correctIndex
//           const isWrong    = revealed && isSelected && !isCorrect
//           const isDimmed   = revealed && !isSelected && i !== question.correctIndex

//           let border = 'rgba(255,255,255,0.09)'
//           let bg     = 'rgba(255,255,255,0.03)'
//           let text   = 'rgba(255,255,255,0.75)'
//           let shadow = 'none'

//           if (!revealed && isSelected) { border = '#FF4060'; bg = 'rgba(255,64,96,0.1)'; text = '#fff'; shadow = '0 0 16px rgba(255,64,96,0.2)' }
//           if (isCorrect)               { border = '#00FF88'; bg = 'rgba(0,255,136,0.08)'; text = '#00FF88'; shadow = '0 0 20px rgba(0,255,136,0.25)' }
//           if (isWrong)                 { border = '#FF5050'; bg = 'rgba(255,80,80,0.08)'; text = '#FF5050'; shadow = '0 0 16px rgba(255,80,80,0.2)' }
//           if (isDimmed)                { border = 'rgba(255,255,255,0.04)'; bg = 'transparent'; text = 'rgba(255,255,255,0.25)' }

//           return (
//             <motion.button
//               key={i}
//               onClick={() => handleSelect(i)}
//               animate={{ background: bg, borderColor: border, boxShadow: shadow }}
//               whileHover={!revealed ? { borderColor: '#FF4060', background: 'rgba(255,64,96,0.06)', y: -2, transition: { duration: 0.15 } } : {}}
//               whileTap={!revealed ? { scale: 0.99 } : {}}
//               style={{
//                 display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 16px',
//                 border: `1.5px solid ${border}`, borderRadius: '12px',
//                 cursor: revealed ? 'default' : 'pointer', textAlign: 'left',
//                 transition: 'background 0.15s, border-color 0.15s',
//               }}
//             >
//               <div style={{
//                 width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
//                 background: isCorrect ? 'rgba(0,255,136,0.15)' : isWrong ? 'rgba(255,80,80,0.15)' : 'rgba(255,255,255,0.05)',
//                 border: `1px solid ${isCorrect ? 'rgba(0,255,136,0.3)' : isWrong ? 'rgba(255,80,80,0.3)' : 'rgba(255,255,255,0.1)'}`,
//                 display: 'flex', alignItems: 'center', justifyContent: 'center',
//                 fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '0.78rem',
//                 color: isCorrect ? '#00FF88' : isWrong ? '#FF5050' : 'rgba(255,255,255,0.35)',
//               }}>
//                 {isCorrect
//                   ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#00FF88" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
//                   : isWrong
//                   ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF5050" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
//                   : LABELS[i]}
//               </div>
//               <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.9rem', color: text, fontWeight: isSelected ? 500 : 400, transition: 'color 0.15s', flex: 1 }}>
//                 {opt}
//               </span>
//             </motion.button>
//           )
//         })}
//       </div>

//       {/* Answer feedback */}
//       <AnimatePresence>
//         {revealed && (
//           <motion.div
//             initial={{ opacity: 0, height: 0, marginTop: 0 }}
//             animate={{ opacity: 1, height: 'auto', marginTop: 14 }}
//             style={{
//               background: selected === question.correctIndex ? 'rgba(0,255,136,0.06)' : 'rgba(255,80,80,0.06)',
//               border: `1px solid ${selected === question.correctIndex ? 'rgba(0,255,136,0.2)' : 'rgba(255,80,80,0.18)'}`,
//               borderRadius: '10px', padding: '10px 14px',
//               display: 'flex', alignItems: 'center', gap: '8px',
//             }}
//           >
//             <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>
//               {selected === question.correctIndex ? '✓ Correct! Moving on…' : '✗ Next question coming up…'}
//             </span>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </motion.div>
//   )
// }
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const LABELS = ['A', 'B', 'C', 'D']

function QuestionTimer({ seconds, totalSeconds }) {
  const pct  = (seconds / totalSeconds) * 100
  const r    = 22
  const circ = 2 * Math.PI * r

  const isUrgent   = seconds <= 5
  const isCritical = seconds <= 3
  const color = isCritical ? '#FF5050' : isUrgent ? '#FFB800' : '#00F5FF'

  return (
    <div style={{ position: 'relative', width: '56px', height: '56px', flexShrink: 0 }}>
      <svg width="56" height="56" viewBox="0 0 56 56" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3.5" />
        <motion.circle
          cx="28" cy="28" r={r}
          fill="none" stroke={color} strokeWidth="3.5"
          strokeLinecap="round"
          animate={{ strokeDashoffset: circ * (1 - pct / 100) }}
          transition={{ duration: 0.9, ease: 'linear' }}
          strokeDasharray={circ}
          style={{ filter: `drop-shadow(0 0 4px ${color}80)` }}
        />
      </svg>
      <motion.div
        animate={isCritical ? { scale: [1, 1.15, 1] } : {}}
        transition={{ duration: 0.4, repeat: isCritical ? Infinity : 0 }}
        style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: '"Syne", sans-serif', fontWeight: 900,
          fontSize: '1rem', color,
        }}
      >
        {seconds}
      </motion.div>
    </div>
  )
}

export default function FightQuestion({
  question,
  questionIndex,
  totalQuestions,
  timePerQuestion,
  questionStartedAt,   // ISO string — server timestamp when this question began
  onAnswer,
  onTimeout,
}) {
  const [selected,   setSelected]   = useState(null)
  const [revealed,   setRevealed]   = useState(false)
  const [timeLeft,   setTimeLeft]   = useState(timePerQuestion)
  const intervalRef  = useRef(null)
  const hasAnswered  = useRef(false)
  const startMsRef   = useRef(null)  // wall-clock ms when question started (for timeTaken calc)

  // Reset + start server-anchored timer whenever question changes
  useEffect(() => {
    setSelected(null)
    setRevealed(false)
    hasAnswered.current = false
    clearInterval(intervalRef.current)

    // Compute how many seconds have ALREADY elapsed on this question.
    // Uses server-provided questionStartedAt so the timer is correct after
    // page switches, refreshes, or remounts.
    let elapsed = 0
    if (questionStartedAt) {
      elapsed = Math.floor((Date.now() - new Date(questionStartedAt).getTime()) / 1000)
    }
    const remaining = Math.max(0, timePerQuestion - elapsed)

    // Store the real wall-clock start so timeTaken is accurate
    startMsRef.current = questionStartedAt
      ? new Date(questionStartedAt).getTime()
      : Date.now()

    if (remaining <= 0) {
      // Already timed out before we even rendered — report timeout immediately
      if (!hasAnswered.current) {
        hasAnswered.current = true
        const ms = timePerQuestion * 1000
        onTimeout?.()
        onAnswer(-1, false, ms)
      }
      setTimeLeft(0)
      return
    }

    setTimeLeft(remaining)

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          if (!hasAnswered.current) {
            hasAnswered.current = true
            const ms = Date.now() - startMsRef.current
            onTimeout?.()
            onAnswer(-1, false, ms)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }, [questionIndex, timePerQuestion, questionStartedAt])

  // const handleSelect = (i) => {
  //   if (revealed || hasAnswered.current) return
  //   clearInterval(intervalRef.current)
  //   hasAnswered.current = true

  //   const ms        = Date.now() - startMsRef.current
  //   const isCorrect = i === question.correctIndex

  //   setSelected(i)
  //   setRevealed(true)

  //   setTimeout(() => onAnswer(i, isCorrect, ms), 900)
  // }
const handleSelect = (i) => {
  if (revealed || hasAnswered.current) return
  clearInterval(intervalRef.current)
  hasAnswered.current = true

  const ms = Date.now() - startMsRef.current

  setSelected(i)
  setRevealed(true)

  // Do not evaluate correctness on frontend
  setTimeout(() => onAnswer(i, null, ms), 500)
}
  const DIFF = {
    easy:   { color: '#00FF88', label: 'Easy' },
    medium: { color: '#FFB800', label: 'Medium' },
    hard:   { color: '#FF5050', label: 'Hard' },
  }
  const diff = DIFF[question?.difficulty] || DIFF.medium

  if (!question) return null

  return (
    <motion.div
      key={questionIndex}
      initial={{ opacity: 0, x: 30, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -30, scale: 0.97 }}
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '18px', padding: '26px',
        position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,64,96,0.5), transparent)' }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.76rem', color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Q{questionIndex + 1}/{totalQuestions}
          </span>
          <div style={{ background: `${diff.color}12`, border: `1px solid ${diff.color}28`, borderRadius: '7px', padding: '3px 9px' }}>
            <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.68rem', fontWeight: 600, color: diff.color }}>{diff.label}</span>
          </div>
        </div>
        <QuestionTimer seconds={timeLeft} totalSeconds={timePerQuestion} />
      </div>

      {/* Question text */}
      <h2 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)', color: '#fff', lineHeight: 1.45, letterSpacing: '-0.01em', marginBottom: '20px' }}>
        {question.questionText}
      </h2>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {question.options?.map((opt, i) => {
          // const isSelected = selected === i
          // const isCorrect  = revealed && i === question.correctIndex
          // const isWrong    = revealed && isSelected && !isCorrect
          // const isDimmed   = revealed && !isSelected && i !== question.correctIndex

          // let border = 'rgba(255,255,255,0.09)'
          // let bg     = 'rgba(255,255,255,0.03)'
          // let text   = 'rgba(255,255,255,0.75)'
          // let shadow = 'none'

          // if (!revealed && isSelected) { border = '#FF4060'; bg = 'rgba(255,64,96,0.1)'; text = '#fff'; shadow = '0 0 16px rgba(255,64,96,0.2)' }
          // if (isCorrect)               { border = '#00FF88'; bg = 'rgba(0,255,136,0.08)'; text = '#00FF88'; shadow = '0 0 20px rgba(0,255,136,0.25)' }
          // if (isWrong)                 { border = '#FF5050'; bg = 'rgba(255,80,80,0.08)'; text = '#FF5050'; shadow = '0 0 16px rgba(255,80,80,0.2)' }
          // if (isDimmed)                { border = 'rgba(255,255,255,0.04)'; bg = 'transparent'; text = 'rgba(255,255,255,0.25)' }
            const isSelected = selected === i
    const isDimmed   = revealed && !isSelected

    let border = 'rgba(255,255,255,0.09)'
    let bg     = 'rgba(255,255,255,0.03)'
    let text   = 'rgba(255,255,255,0.75)'
    let shadow = 'none'

    if (!revealed && isSelected) {
      border = '#FF4060'
      bg = 'rgba(255,64,96,0.1)'
      text = '#fff'
      shadow = '0 0 16px rgba(255,64,96,0.2)'
    }

    if (revealed && isSelected) {
      border = '#00F5FF'
      bg = 'rgba(0,245,255,0.08)'
      text = '#fff'
      shadow = '0 0 16px rgba(0,245,255,0.18)'
    }

    if (isDimmed) {
      border = 'rgba(255,255,255,0.04)'
      bg = 'transparent'
      text = 'rgba(255,255,255,0.25)'
    }
          return (
            <motion.button
              key={i}
              onClick={() => handleSelect(i)}
              animate={{ background: bg, borderColor: border, boxShadow: shadow }}
              whileHover={!revealed ? { borderColor: '#FF4060', background: 'rgba(255,64,96,0.06)', y: -2, transition: { duration: 0.15 } } : {}}
              whileTap={!revealed ? { scale: 0.99 } : {}}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 16px',
                border: `1.5px solid ${border}`, borderRadius: '12px',
                cursor: revealed ? 'default' : 'pointer', textAlign: 'left',
                transition: 'background 0.15s, border-color 0.15s',
              }}
            >
              {/* <div style={{
                width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
                background: isCorrect ? 'rgba(0,255,136,0.15)' : isWrong ? 'rgba(255,80,80,0.15)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${isCorrect ? 'rgba(0,255,136,0.3)' : isWrong ? 'rgba(255,80,80,0.3)' : 'rgba(255,255,255,0.1)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '0.78rem',
                color: isCorrect ? '#00FF88' : isWrong ? '#FF5050' : 'rgba(255,255,255,0.35)',
              }}>
                {isCorrect
                  ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#00FF88" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                  : isWrong
                  ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF5050" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  : LABELS[i]}
              </div> */}
              <div style={{
  width: '30px',
  height: '30px',
  borderRadius: '8px',
  flexShrink: 0,
  background: isSelected ? 'rgba(0,245,255,0.14)' : 'rgba(255,255,255,0.05)',
  border: `1px solid ${isSelected ? 'rgba(0,245,255,0.3)' : 'rgba(255,255,255,0.1)'}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: '"Syne", sans-serif',
  fontWeight: 800,
  fontSize: '0.78rem',
  color: isSelected ? '#00F5FF' : 'rgba(255,255,255,0.35)',
}}>
  {LABELS[i]}
</div>
              <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.9rem', color: text, fontWeight: isSelected ? 500 : 400, transition: 'color 0.15s', flex: 1 }}>
                {opt}
              </span>
            </motion.button>
          )
        })}
      </div>

      {/* Answer feedback */}
      {/* <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 14 }}
            style={{
              background: selected === question.correctIndex ? 'rgba(0,255,136,0.06)' : 'rgba(255,80,80,0.06)',
              border: `1px solid ${selected === question.correctIndex ? 'rgba(0,255,136,0.2)' : 'rgba(255,80,80,0.18)'}`,
              borderRadius: '10px', padding: '10px 14px',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}
          >
            <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>
              {selected === question.correctIndex ? '✓ Correct! Moving on…' : '✗ Next question coming up…'}
            </span>
          </motion.div>
        )}
      </AnimatePresence> */}
      <AnimatePresence>
  {revealed && (
    <motion.div
      initial={{ opacity: 0, height: 0, marginTop: 0 }}
      animate={{ opacity: 1, height: 'auto', marginTop: 14 }}
      style={{
        background: 'rgba(0,245,255,0.06)',
        border: '1px solid rgba(0,245,255,0.18)',
        borderRadius: '10px',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>
        Answer locked… moving on…
      </span>
    </motion.div>
  )}
</AnimatePresence>
    </motion.div>
  )
}