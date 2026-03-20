// import { motion, AnimatePresence } from 'framer-motion'

// const MESSAGES = { 3: 'Get Ready', 2: 'Focus', 1: 'Fight!', 0: 'GO!' }
// const COLORS   = { 3: '#FFB800', 2: '#0080FF', 1: '#FF4060', 0: '#00FF88' }

// export default function FightCountdown({ count }) {
//   const display = count > 0 ? count : 0
//   const color   = COLORS[display] || '#00F5FF'
//   const message = MESSAGES[display] || 'GO!'
//   const label   = display > 0 ? String(display) : '⚡'

//   return (
//     <div style={{
//       position: 'fixed', inset: 0, zIndex: 300,
//       display: 'flex', flexDirection: 'column',
//       alignItems: 'center', justifyContent: 'center',
//       background: 'rgba(10,10,16,0.92)',
//       backdropFilter: 'blur(16px)',
//     }}>
//       {/* Expanding ring */}
//       <motion.div
//         key={`ring-${display}`}
//         initial={{ scale: 0.4, opacity: 0.8 }}
//         animate={{ scale: 3, opacity: 0 }}
//         transition={{ duration: 0.9, ease: [0.2, 0.8, 0.3, 1] }}
//         style={{
//           position: 'absolute',
//           width: '160px', height: '160px', borderRadius: '50%',
//           border: `2px solid ${color}`,
//           pointerEvents: 'none',
//         }}
//       />

//       {/* Number / GO! */}
//       <AnimatePresence mode="wait">
//         <motion.div
//           key={display}
//           initial={{ scale: 0.4, opacity: 0, y: 20 }}
//           animate={{ scale: 1, opacity: 1, y: 0 }}
//           exit={{ scale: 1.4, opacity: 0, y: -20 }}
//           transition={{ duration: 0.35, ease: [0.34, 1.4, 0.64, 1] }}
//           style={{ textAlign: 'center' }}
//         >
//           <div style={{
//             fontFamily: '"Syne", sans-serif',
//             fontWeight: 900,
//             fontSize: display === 0 ? 'clamp(4rem, 14vw, 7rem)' : 'clamp(6rem, 18vw, 10rem)',
//             color,
//             lineHeight: 1,
//             letterSpacing: '-0.04em',
//             textShadow: `0 0 60px ${color}60`,
//           }}>
//             {label}
//           </div>
//           <motion.div
//             initial={{ opacity: 0, y: 8 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.15 }}
//             style={{
//               fontFamily: '"DM Sans", sans-serif',
//               fontSize: '1.1rem',
//               fontWeight: 600,
//               color: `${color}CC`,
//               letterSpacing: '0.08em',
//               textTransform: 'uppercase',
//               marginTop: '8px',
//             }}
//           >
//             {message}
//           </motion.div>
//         </motion.div>
//       </AnimatePresence>
//     </div>
//   )
// }
import { motion, AnimatePresence } from 'framer-motion'

const MESSAGES = { 3: 'Get Ready', 2: 'Focus', 1: 'Fight!', 0: 'GO!' }
const COLORS   = { 3: '#FFB800', 2: '#0080FF', 1: '#FF4060', 0: '#00FF88' }

export default function FightCountdown({ count }) {
  const display = count > 0 ? count : 0
  const color   = COLORS[display] || '#00F5FF'
  const message = MESSAGES[display] || 'GO!'
  const label   = display > 0 ? String(display) : '⚡'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'rgba(10,10,16,0.92)',
      backdropFilter: 'blur(16px)',
    }}>
      {/* Expanding ring */}
      <motion.div
        key={`ring-${display}`}
        initial={{ scale: 0.4, opacity: 0.8 }}
        animate={{ scale: 3, opacity: 0 }}
        transition={{ duration: 0.9, ease: [0.2, 0.8, 0.3, 1] }}
        style={{
          position: 'absolute',
          width: '160px', height: '160px', borderRadius: '50%',
          border: `2px solid ${color}`,
          pointerEvents: 'none',
        }}
      />

      {/* Number / GO! */}
      <AnimatePresence mode="wait">
        <motion.div
          key={display}
          initial={{ scale: 0.4, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 1.4, opacity: 0, y: -20 }}
          transition={{ duration: 0.35, ease: [0.34, 1.4, 0.64, 1] }}
          style={{ textAlign: 'center' }}
        >
          <div style={{
            fontFamily: '"Syne", sans-serif',
            fontWeight: 900,
            fontSize: display === 0 ? 'clamp(4rem, 14vw, 7rem)' : 'clamp(6rem, 18vw, 10rem)',
            color,
            lineHeight: 1,
            letterSpacing: '-0.04em',
            textShadow: `0 0 60px ${color}60`,
          }}>
            {label}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '1.1rem',
              fontWeight: 600,
              color: `${color}CC`,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginTop: '8px',
            }}
          >
            {message}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
