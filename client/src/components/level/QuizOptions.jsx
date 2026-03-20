// import { motion } from 'framer-motion'

// const OPTION_LABELS = ['A', 'B', 'C', 'D']

// /**
//  * QuizOptions
//  * @param {array}    options        — string array of choices
//  * @param {number}   selectedIndex  — which the user picked (null = none)
//  * @param {number}   correctIndex   — the correct answer (null = not revealed yet)
//  * @param {function} onSelect       — (index) => void
//  * @param {boolean}  revealed       — whether to show correct/wrong state
//  */
// export default function QuizOptions({ options, selectedIndex, correctIndex, onSelect, revealed, accentColor = '#00F5FF' }) {

//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
//       {options.map((opt, i) => {
//         const isSelected = selectedIndex === i
//         const isCorrect  = revealed && i === correctIndex
//         const isWrong    = revealed && isSelected && i !== correctIndex
//         const isOther    = revealed && !isSelected && i !== correctIndex

//         let borderColor = 'rgba(255,255,255,0.09)'
//         let bgColor     = 'rgba(255,255,255,0.03)'
//         let textColor   = 'rgba(255,255,255,0.75)'
//         let glowColor   = 'none'
//         let labelBg     = 'rgba(255,255,255,0.06)'
//         let labelColor  = 'rgba(255,255,255,0.4)'

//         if (!revealed && isSelected) {
//           borderColor = accentColor
//           bgColor     = `${accentColor}12`
//           textColor   = '#fff'
//           labelBg     = `${accentColor}20`
//           labelColor  = accentColor
//           glowColor   = `0 0 20px ${accentColor}20`
//         }

//         if (isCorrect) {
//           borderColor = '#00FF88'
//           bgColor     = 'rgba(0,255,136,0.08)'
//           textColor   = '#00FF88'
//           glowColor   = '0 0 24px rgba(0,255,136,0.25)'
//           labelBg     = 'rgba(0,255,136,0.15)'
//           labelColor  = '#00FF88'
//         }

//         if (isWrong) {
//           borderColor = '#FF5050'
//           bgColor     = 'rgba(255,80,80,0.08)'
//           textColor   = '#FF5050'
//           glowColor   = '0 0 24px rgba(255,80,80,0.2)'
//           labelBg     = 'rgba(255,80,80,0.15)'
//           labelColor  = '#FF5050'
//         }

//         if (isOther) {
//           borderColor = 'rgba(255,255,255,0.04)'
//           bgColor     = 'rgba(255,255,255,0.01)'
//           textColor   = 'rgba(255,255,255,0.3)'
//           labelBg     = 'rgba(255,255,255,0.03)'
//           labelColor  = 'rgba(255,255,255,0.2)'
//         }

//         return (
//           <motion.button
//             key={i}
//             onClick={() => !revealed && onSelect(i)}
//             animate={{
//               background: bgColor,
//               borderColor,
//               boxShadow: glowColor,
//             }}
//             whileHover={!revealed ? {
//               borderColor: accentColor,
//               background: `${accentColor}08`,
//               y: -2,
//               transition: { duration: 0.18 },
//             } : {}}
//             whileTap={!revealed ? { scale: 0.99 } : {}}

//             // Shake animation for wrong
//             variants={isWrong ? {
//               shake: {
//                 x: [0, -8, 8, -6, 6, -3, 3, 0],
//                 transition: { duration: 0.4, ease: 'easeInOut' },
//               }
//             } : {}}
//             animate={isWrong ? 'shake' : undefined}

//             style={{
//               width: '100%',
//               display: 'flex', alignItems: 'center', gap: '14px',
//               padding: '14px 16px',
//               background: bgColor,
//               border: `1.5px solid ${borderColor}`,
//               borderRadius: '12px',
//               cursor: revealed ? 'default' : 'pointer',
//               textAlign: 'left',
//               transition: 'background 0.2s, border-color 0.2s',
//             }}
//           >
//             {/* Option label */}
//             <div style={{
//               width: '30px', height: '30px', borderRadius: '8px',
//               background: labelBg,
//               border: `1px solid ${borderColor}40`,
//               display: 'flex', alignItems: 'center', justifyContent: 'center',
//               fontFamily: '"Syne", sans-serif', fontWeight: 800,
//               fontSize: '0.78rem', color: labelColor,
//               flexShrink: 0,
//               transition: 'background 0.2s, color 0.2s',
//             }}>
//               {isCorrect ? (
//                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00FF88" strokeWidth="3">
//                   <polyline points="20 6 9 17 4 12" />
//                 </svg>
//               ) : isWrong ? (
//                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF5050" strokeWidth="3">
//                   <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
//                 </svg>
//               ) : OPTION_LABELS[i]}
//             </div>

//             {/* Option text */}
//             <span style={{
//               fontFamily: '"DM Sans", sans-serif', fontSize: '0.92rem',
//               fontWeight: isSelected || isCorrect ? 500 : 400,
//               color: textColor,
//               transition: 'color 0.2s',
//             }}>
//               {opt}
//             </span>
//           </motion.button>
//         )
//       })}
//     </div>
//   )
// }








import { motion } from 'framer-motion'

const OPTION_LABELS = ['A', 'B', 'C', 'D']

export default function QuizOptions({ options, selectedIndex, correctIndex, onSelect, revealed, accentColor = '#00F5FF' }) {

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {options.map((opt, i) => {
        const isSelected = selectedIndex === i
        const isCorrect  = revealed && i === correctIndex
        const isWrong    = revealed && isSelected && i !== correctIndex
        const isOther    = revealed && !isSelected && i !== correctIndex

        let borderColor = 'rgba(255,255,255,0.09)'
        let bgColor     = 'rgba(255,255,255,0.03)'
        let textColor   = 'rgba(255,255,255,0.75)'
        let glowColor   = 'none'
        let labelBg     = 'rgba(255,255,255,0.06)'
        let labelColor  = 'rgba(255,255,255,0.4)'

        if (!revealed && isSelected) {
          borderColor = accentColor
          bgColor     = `${accentColor}12`
          textColor   = '#fff'
          labelBg     = `${accentColor}20`
          labelColor  = accentColor
          glowColor   = `0 0 20px ${accentColor}20`
        }

        if (isCorrect) {
          borderColor = '#00FF88'
          bgColor     = 'rgba(0,255,136,0.08)'
          textColor   = '#00FF88'
          glowColor   = '0 0 24px rgba(0,255,136,0.25)'
          labelBg     = 'rgba(0,255,136,0.15)'
          labelColor  = '#00FF88'
        }

        if (isWrong) {
          borderColor = '#FF5050'
          bgColor     = 'rgba(255,80,80,0.08)'
          textColor   = '#FF5050'
          glowColor   = '0 0 24px rgba(255,80,80,0.2)'
          labelBg     = 'rgba(255,80,80,0.15)'
          labelColor  = '#FF5050'
        }

        if (isOther) {
          borderColor = 'rgba(255,255,255,0.04)'
          bgColor     = 'rgba(255,255,255,0.01)'
          textColor   = 'rgba(255,255,255,0.3)'
          labelBg     = 'rgba(255,255,255,0.03)'
          labelColor  = 'rgba(255,255,255,0.2)'
        }

        return (
          <motion.button
            key={i}
            onClick={() => !revealed && onSelect(i)}

            // ✅ FIXED animate (merged)
            animate={
              isWrong
                ? 'shake'
                : {
                    background: bgColor,
                    borderColor,
                    boxShadow: glowColor,
                  }
            }

            whileHover={!revealed ? {
              borderColor: accentColor,
              background: `${accentColor}08`,
              y: -2,
              transition: { duration: 0.18 },
            } : {}}

            whileTap={!revealed ? { scale: 0.99 } : {}}

            variants={isWrong ? {
              shake: {
                x: [0, -8, 8, -6, 6, -3, 3, 0],
                transition: { duration: 0.4, ease: 'easeInOut' },
              }
            } : {}}

            style={{
              width: '100%',
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '14px 16px',
              background: bgColor,
              border: `1.5px solid ${borderColor}`,
              borderRadius: '12px',
              cursor: revealed ? 'default' : 'pointer',
              textAlign: 'left',
              transition: 'background 0.2s, border-color 0.2s',
            }}
          >
            {/* Option label */}
            <div style={{
              width: '30px', height: '30px', borderRadius: '8px',
              background: labelBg,
              border: `1px solid ${borderColor}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: '"Syne", sans-serif', fontWeight: 800,
              fontSize: '0.78rem', color: labelColor,
              flexShrink: 0,
              transition: 'background 0.2s, color 0.2s',
            }}>
              {isCorrect ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00FF88" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : isWrong ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF5050" strokeWidth="3">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : OPTION_LABELS[i]}
            </div>

            {/* Option text */}
            <span style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '0.92rem',
              fontWeight: isSelected || isCorrect ? 500 : 400,
              color: textColor,
              transition: 'color 0.2s',
            }}>
              {opt}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
