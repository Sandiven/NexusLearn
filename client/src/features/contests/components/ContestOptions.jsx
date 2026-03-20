// import { motion } from 'framer-motion'

// const LABELS = ['A', 'B', 'C', 'D']

// export default function ContestOptions({
//   options,
//   selectedIndex,
//   correctIndex,
//   revealed,
//   onSelect,
//   accentColor = '#00F5FF',
//   disabled = false,
// }) {
//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
//       {options.map((opt, i) => {
//         const isSelected = selectedIndex === i
//         const isCorrect  = revealed && i === correctIndex
//         const isWrong    = revealed && isSelected && i !== correctIndex
//         const isDimmed   = revealed && !isSelected && i !== correctIndex

//         let borderColor = 'rgba(255,255,255,0.09)'
//         let bgColor     = 'rgba(255,255,255,0.03)'
//         let textColor   = 'rgba(255,255,255,0.75)'
//         let shadow      = 'none'
//         let labelBg     = 'rgba(255,255,255,0.06)'
//         let labelColor  = 'rgba(255,255,255,0.35)'

//         if (!revealed && isSelected) {
//           borderColor = accentColor
//           bgColor     = `${accentColor}10`
//           textColor   = '#fff'
//           shadow      = `0 0 18px ${accentColor}20`
//           labelBg     = `${accentColor}18`
//           labelColor  = accentColor
//         }
//         if (isCorrect) {
//           borderColor = '#00FF88'; bgColor = 'rgba(0,255,136,0.08)'
//           textColor = '#00FF88'; shadow = '0 0 22px rgba(0,255,136,0.25)'
//           labelBg = 'rgba(0,255,136,0.14)'; labelColor = '#00FF88'
//         }
//         if (isWrong) {
//           borderColor = '#FF5050'; bgColor = 'rgba(255,80,80,0.08)'
//           textColor = '#FF5050'; shadow = '0 0 22px rgba(255,80,80,0.2)'
//           labelBg = 'rgba(255,80,80,0.14)'; labelColor = '#FF5050'
//         }
//         if (isDimmed) {
//           borderColor = 'rgba(255,255,255,0.04)'
//           bgColor = 'rgba(255,255,255,0.01)'
//           textColor = 'rgba(255,255,255,0.28)'
//           labelBg = 'rgba(255,255,255,0.03)'; labelColor = 'rgba(255,255,255,0.18)'
//         }

//         return (
//           <motion.button
//             key={i}
//             onClick={() => !revealed && !disabled && onSelect(i)}
//             animate={{ background: bgColor, borderColor, boxShadow: shadow }}
//             whileHover={!revealed && !disabled ? {
//               borderColor: accentColor,
//               background: `${accentColor}08`,
//               y: -2,
//               transition: { duration: 0.18 },
//             } : {}}
//             whileTap={!revealed && !disabled ? { scale: 0.99 } : {}}
//             variants={isWrong ? {
//               shake: { x: [0, -8, 8, -5, 5, -2, 2, 0], transition: { duration: 0.4 } }
//             } : {}}
//             animate={isWrong ? 'shake' : undefined}
//             style={{
//               width: '100%',
//               display: 'flex', alignItems: 'center', gap: '14px',
//               padding: '14px 16px',
//               border: `1.5px solid ${borderColor}`,
//               borderRadius: '12px',
//               cursor: revealed || disabled ? 'default' : 'pointer',
//               textAlign: 'left',
//               transition: 'background 0.2s, border-color 0.2s',
//             }}
//           >
//             {/* Label badge */}
//             <div style={{
//               width: '32px', height: '32px', borderRadius: '8px',
//               background: labelBg, border: `1px solid ${borderColor}40`,
//               display: 'flex', alignItems: 'center', justifyContent: 'center',
//               fontFamily: '"Syne", sans-serif', fontWeight: 800,
//               fontSize: '0.8rem', color: labelColor,
//               flexShrink: 0, transition: 'all 0.2s',
//             }}>
//               {isCorrect ? (
//                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00FF88" strokeWidth="3">
//                   <polyline points="20 6 9 17 4 12" />
//                 </svg>
//               ) : isWrong ? (
//                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF5050" strokeWidth="3">
//                   <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
//                 </svg>
//               ) : LABELS[i]}
//             </div>

//             <span style={{
//               fontFamily: '"DM Sans", sans-serif', fontSize: '0.92rem',
//               color: textColor, fontWeight: isSelected ? 500 : 400,
//               transition: 'color 0.2s', flex: 1,
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

const LABELS = ['A', 'B', 'C', 'D']

export default function ContestOptions({
  options,
  selectedIndex,
  correctIndex,
  revealed,
  onSelect,
  accentColor = '#00F5FF',
  disabled = false,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {options.map((opt, i) => {
        const isSelected = selectedIndex === i
        const isCorrect  = revealed && i === correctIndex
        const isWrong    = revealed && isSelected && i !== correctIndex
        const isDimmed   = revealed && !isSelected && i !== correctIndex

        let borderColor = 'rgba(255,255,255,0.09)'
        let bgColor     = 'rgba(255,255,255,0.03)'
        let textColor   = 'rgba(255,255,255,0.75)'
        let shadow      = 'none'
        let labelBg     = 'rgba(255,255,255,0.06)'
        let labelColor  = 'rgba(255,255,255,0.35)'

        if (!revealed && isSelected) {
          borderColor = accentColor
          bgColor     = `${accentColor}10`
          textColor   = '#fff'
          shadow      = `0 0 18px ${accentColor}20`
          labelBg     = `${accentColor}18`
          labelColor  = accentColor
        }
        if (isCorrect) {
          borderColor = '#00FF88'
          bgColor = 'rgba(0,255,136,0.08)'
          textColor = '#00FF88'
          shadow = '0 0 22px rgba(0,255,136,0.25)'
          labelBg = 'rgba(0,255,136,0.14)'
          labelColor = '#00FF88'
        }
        if (isWrong) {
          borderColor = '#FF5050'
          bgColor = 'rgba(255,80,80,0.08)'
          textColor = '#FF5050'
          shadow = '0 0 22px rgba(255,80,80,0.2)'
          labelBg = 'rgba(255,80,80,0.14)'
          labelColor = '#FF5050'
        }
        if (isDimmed) {
          borderColor = 'rgba(255,255,255,0.04)'
          bgColor = 'rgba(255,255,255,0.01)'
          textColor = 'rgba(255,255,255,0.28)'
          labelBg = 'rgba(255,255,255,0.03)'
          labelColor = 'rgba(255,255,255,0.18)'
        }

        return (
          <motion.button
            key={i}
            onClick={() => !revealed && !disabled && onSelect(i)}

            // ✅ FIXED animate (merged)
            animate={
              isWrong
                ? 'shake'
                : {
                    background: bgColor,
                    borderColor,
                    boxShadow: shadow,
                  }
            }

            whileHover={!revealed && !disabled ? {
              borderColor: accentColor,
              background: `${accentColor}08`,
              y: -2,
              transition: { duration: 0.18 },
            } : {}}

            whileTap={!revealed && !disabled ? { scale: 0.99 } : {}}

            variants={isWrong ? {
              shake: {
                x: [0, -8, 8, -5, 5, -2, 2, 0],
                transition: { duration: 0.4 }
              }
            } : {}}

            style={{
              width: '100%',
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '14px 16px',
              border: `1.5px solid ${borderColor}`,
              borderRadius: '12px',
              cursor: revealed || disabled ? 'default' : 'pointer',
              textAlign: 'left',
              transition: 'background 0.2s, border-color 0.2s',
            }}
          >
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: labelBg,
              border: `1px solid ${borderColor}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: '"Syne", sans-serif', fontWeight: 800,
              fontSize: '0.8rem', color: labelColor,
              flexShrink: 0, transition: 'all 0.2s',
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
              ) : LABELS[i]}
            </div>

            <span style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '0.92rem',
              color: textColor,
              fontWeight: isSelected ? 500 : 400,
              transition: 'color 0.2s',
              flex: 1,
            }}>
              {opt}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}