// import { motion } from 'framer-motion'

// // ── Door panel halves (open animation) ───────────────────
// function DoorHalf({ side, color, isOpen, innerLight }) {
//   const isLeft = side === 'left'
//   return (
//     <motion.div
//       animate={{ rotateY: isOpen ? (isLeft ? -90 : 90) : 0, opacity: isOpen ? 0 : 1 }}
//       transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
//       style={{
//         position: 'absolute',
//         top: 0,
//         bottom: 0,
//         [isLeft ? 'left' : 'right']: 0,
//         width: '50%',
//         transformOrigin: isLeft ? 'left center' : 'right center',
//         background: `linear-gradient(${isLeft ? '135deg' : '225deg'}, ${color.bgFrom}, ${color.bgTo})`,
//         border: `1px solid ${color.borderColor}`,
//         borderRadius: isLeft ? '6px 0 0 6px' : '0 6px 6px 0',
//         overflow: 'hidden',
//         zIndex: 2,
//         backfaceVisibility: 'hidden',
//       }}
//     >
//       {/* Vertical panel line detail */}
//       <div style={{
//         position: 'absolute',
//         [isLeft ? 'right' : 'left']: '18%',
//         top: '12%', bottom: '12%', width: '1px',
//         background: `linear-gradient(180deg, transparent, ${color.rimColor}30, transparent)`,
//       }} />
//       {/* Inner glow */}
//       <div style={{
//         position: 'absolute', inset: 0,
//         background: `radial-gradient(ellipse at ${isLeft ? '80%' : '20%'} 50%, ${innerLight} 0%, transparent 70%)`,
//       }} />
//     </motion.div>
//   )
// }

// // ─────────────────────────────────────────────────────────
// // DoorCard
// // Props:
// //   config      — DOOR_CONFIG entry
// //   state       — 'idle' | 'focused' | 'unfocused' | 'open'
// //   onClick
// // ─────────────────────────────────────────────────────────
// export default function DoorCard({ config, state, onClick }) {
//   const isOpen      = state === 'open'
//   const isFocused   = state === 'focused'
//   const isUnfocused = state === 'unfocused'
//   const isIdle      = state === 'idle'

//   return (
//     <motion.div
//       onClick={isUnfocused || isOpen ? undefined : onClick}
//       animate={{
//         scale:   isFocused ? 1.04 : isUnfocused ? 0.94 : 1,
//         opacity: isUnfocused ? 0.45 : 1,
//         filter:  isUnfocused ? 'blur(1.5px)' : 'blur(0px)',
//       }}
//       whileHover={isIdle ? { scale: 1.03, y: -4 } : {}}
//       transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
//       style={{
//         position: 'relative',
//         width: '200px',
//         height: '280px',
//         cursor: isUnfocused || isOpen ? 'default' : 'pointer',
//         userSelect: 'none',
//         flexShrink: 0,
//       }}
//     >
//       {/* Outer glow ring */}
//       <motion.div
//         animate={{ opacity: isFocused || isOpen ? 1 : 0.3 }}
//         transition={{ duration: 0.3 }}
//         style={{
//           position: 'absolute',
//           inset: '-8px',
//           borderRadius: '16px',
//           background: `radial-gradient(ellipse at 50% 50%, ${config.glowColor} 0%, transparent 70%)`,
//           filter: 'blur(12px)',
//           pointerEvents: 'none',
//           zIndex: 0,
//         }}
//       />

//       {/* Door frame */}
//       <div style={{
//         position: 'absolute', inset: 0,
//         border: `1.5px solid ${config.borderColor}`,
//         borderRadius: '10px',
//         background: config.bgTo,
//         overflow: 'hidden',
//         zIndex: 1,
//       }}>
//         {/* Inner light when open */}
//         <motion.div
//           animate={{ opacity: isOpen ? 1 : 0 }}
//           transition={{ duration: 0.4, delay: 0.25 }}
//           style={{
//             position: 'absolute', inset: 0,
//             background: `radial-gradient(ellipse at 50% 40%, ${config.glowColor} 0%, transparent 65%)`,
//             filter: 'blur(6px)',
//           }}
//         />
//         {/* Open state inner rays */}
//         {isOpen && (
//           <motion.div
//             initial={{ opacity: 0, scale: 0.7 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ duration: 0.45, delay: 0.3 }}
//             style={{
//               position: 'absolute', inset: 0,
//               display: 'flex', alignItems: 'center', justifyContent: 'center',
//             }}
//           >
//             <div style={{
//               width: '60px', height: '60px', borderRadius: '50%',
//               background: `radial-gradient(circle, ${config.rimColor}55 0%, transparent 70%)`,
//               boxShadow: `0 0 40px ${config.glowColor}`,
//             }} />
//           </motion.div>
//         )}
//       </div>

//       {/* Left door half */}
//       <DoorHalf side="left"  color={config} isOpen={isOpen} innerLight={config.innerLight} />
//       {/* Right door half */}
//       <DoorHalf side="right" color={config} isOpen={isOpen} innerLight={config.innerLight} />

//       {/* Door handle (left side) */}
//       {!isOpen && (
//         <motion.div
//           animate={{ opacity: isFocused ? 1 : 0.6 }}
//           style={{
//             position: 'absolute',
//             right: '22%', top: '50%',
//             transform: 'translateY(-50%)',
//             zIndex: 3,
//             width: '10px', height: '10px', borderRadius: '50%',
//             background: config.rimColor,
//             boxShadow: `0 0 8px ${config.rimColor}`,
//           }}
//         />
//       )}

//       {/* Door label beneath */}
//       <div style={{
//         position: 'absolute',
//         bottom: '-52px', left: 0, right: 0,
//         textAlign: 'center',
//         pointerEvents: 'none',
//       }}>
//         <div style={{
//           fontFamily: '"Syne", sans-serif',
//           fontWeight: 700,
//           fontSize: '0.92rem',
//           color: isFocused || isOpen ? config.rimColor : 'rgba(255,255,255,0.65)',
//           marginBottom: '3px',
//           transition: 'color 0.3s',
//         }}>
//           {config.label}
//         </div>
//         <div style={{
//           display: 'inline-flex', alignItems: 'center', gap: '5px',
//           background: `${config.rimColor}12`,
//           border: `1px solid ${config.rimColor}30`,
//           borderRadius: '6px',
//           padding: '2px 10px',
//         }}>
//           <div style={{
//             width: '5px', height: '5px', borderRadius: '50%',
//             background: config.diffColor,
//             boxShadow: `0 0 5px ${config.diffColor}`,
//           }} />
//           <span style={{
//             fontFamily: '"DM Sans", sans-serif',
//             fontSize: '0.72rem',
//             fontWeight: 700,
//             color: config.diffColor,
//             textTransform: 'uppercase',
//             letterSpacing: '0.06em',
//           }}>
//             {config.difficulty}
//           </span>
//         </div>
//       </div>
//     </motion.div>
//   )
// }
import { motion } from 'framer-motion'

// ── Door panel halves (open animation) ───────────────────
function DoorHalf({ side, color, isOpen, innerLight }) {
  const isLeft = side === 'left'
  return (
    <motion.div
      animate={{ rotateY: isOpen ? (isLeft ? -90 : 90) : 0, opacity: isOpen ? 0 : 1 }}
      transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        [isLeft ? 'left' : 'right']: 0,
        width: '50%',
        transformOrigin: isLeft ? 'left center' : 'right center',
        background: `linear-gradient(${isLeft ? '135deg' : '225deg'}, ${color.bgFrom}, ${color.bgTo})`,
        border: `1px solid ${color.borderColor}`,
        borderRadius: isLeft ? '6px 0 0 6px' : '0 6px 6px 0',
        overflow: 'hidden',
        zIndex: 2,
        backfaceVisibility: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          [isLeft ? 'right' : 'left']: '18%',
          top: '12%',
          bottom: '12%',
          width: '1px',
          background: `linear-gradient(180deg, transparent, ${color.rimColor}30, transparent)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at ${isLeft ? '80%' : '20%'} 50%, ${innerLight} 0%, transparent 70%)`,
        }}
      />
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────
// DoorCard
// Props:
//   config      — DOOR_CONFIG entry
//   state       — 'idle' | 'focused' | 'unfocused' | 'open'
//   onClick
// ─────────────────────────────────────────────────────────
export default function DoorCard({ config, state, onClick }) {
  const isOpen = state === 'open'
  const isFocused = state === 'focused'
  const isUnfocused = state === 'unfocused'
  const isIdle = state === 'idle'

  return (
    <motion.div
      onClick={isUnfocused || isOpen ? undefined : onClick}
      animate={{
        scale: isFocused ? 1.04 : isUnfocused ? 0.94 : 1,
        opacity: isUnfocused ? 0.45 : 1,
        filter: isUnfocused ? 'blur(1.5px)' : 'blur(0px)',
      }}
      whileHover={isIdle ? { scale: 1.03, y: -4 } : {}}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position: 'relative',
        width: '200px',
        height: '280px',
        cursor: isUnfocused || isOpen ? 'default' : 'pointer',
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      <motion.div
        animate={{ opacity: isFocused || isOpen ? 1 : 0.3 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'absolute',
          inset: '-8px',
          borderRadius: '16px',
          background: `radial-gradient(ellipse at 50% 50%, ${config.glowColor} 0%, transparent 70%)`,
          filter: 'blur(12px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          border: `1.5px solid ${config.borderColor}`,
          borderRadius: '10px',
          background: config.bgTo,
          overflow: 'hidden',
          zIndex: 1,
        }}
      >
        <motion.div
          animate={{ opacity: isOpen ? 1 : 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse at 50% 40%, ${config.glowColor} 0%, transparent 65%)`,
            filter: 'blur(6px)',
          }}
        />

        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.3 }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${config.rimColor}55 0%, transparent 70%)`,
                boxShadow: `0 0 40px ${config.glowColor}`,
              }}
            />
          </motion.div>
        )}
      </div>

      <DoorHalf side="left" color={config} isOpen={isOpen} innerLight={config.innerLight} />
      <DoorHalf side="right" color={config} isOpen={isOpen} innerLight={config.innerLight} />

      {!isOpen && (
        <motion.div
          animate={{ opacity: isFocused ? 1 : 0.6 }}
          style={{
            position: 'absolute',
            right: '22%',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 3,
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: config.rimColor,
            boxShadow: `0 0 8px ${config.rimColor}`,
          }}
        />
      )}

      <div
        style={{
          position: 'absolute',
          bottom: '-34px',
          left: 0,
          right: 0,
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            fontFamily: '"Syne", sans-serif',
            fontWeight: 700,
            fontSize: '0.92rem',
            color: isFocused || isOpen ? config.rimColor : 'rgba(255,255,255,0.65)',
            transition: 'color 0.3s',
          }}
        >
          {config.label}
        </div>
      </div>
    </motion.div>
  )
}