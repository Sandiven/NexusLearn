// import { useEffect, useState } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'

// // ── Confetti ──────────────────────────────────────────────
// function Particle({ angle, color, dist, delay }) {
//   const rad = (angle * Math.PI) / 180
//   return (
//     <motion.div
//       initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
//       animate={{ x: Math.cos(rad) * dist, y: Math.sin(rad) * dist, opacity: 0, scale: 0.3 }}
//       transition={{ duration: 0.9, delay, ease: [0.1, 0.7, 0.3, 1] }}
//       style={{
//         position: 'absolute', left: '50%', top: '30%',
//         width: `${4 + Math.random() * 5}px`, height: `${4 + Math.random() * 5}px`,
//         borderRadius: Math.random() > 0.5 ? '50%' : '2px',
//         background: color, pointerEvents: 'none',
//       }}
//     />
//   )
// }
// function Confetti({ active }) {
//   const colors = ['#FFB800', '#00F5FF', '#00FF88', '#8B5CF6', '#FF4060']
//   if (!active) return null
//   return (
//     <>
//       {Array.from({ length: 28 }, (_, i) => ({
//         angle: (i / 28) * 360,
//         color: colors[i % colors.length],
//         dist:  70 + Math.random() * 60,
//         delay: Math.random() * 0.2,
//       })).map((p, i) => <Particle key={i} {...p} />)}
//     </>
//   )
// }

// function StatBox({ label, value, sub, accent }) {
//   return (
//     <div style={{
//       flex: 1, textAlign: 'center', padding: '14px 10px',
//       background: 'rgba(255,255,255,0.03)',
//       border: `1px solid ${accent || 'rgba(255,255,255,0.07)'}`,
//       borderRadius: '12px',
//     }}>
//       <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 900, fontSize: '1.5rem', color: accent || '#fff', lineHeight: 1 }}>{value}</div>
//       <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
//       {sub && <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', marginTop: '2px' }}>{sub}</div>}
//     </div>
//   )
// }

// function PlayerCard({ player, isWinner, isDraw, correct, total, timeMs, isCurrentUser }) {
//   const accent = isWinner && !isDraw ? '#00FF88' : isDraw ? '#FFB800' : '#FF4060'
//   const label  = isWinner && !isDraw ? 'WINNER' : isDraw ? 'DRAW' : 'LOSER'
//   const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0
//   const timeSec  = timeMs > 0 ? (timeMs / 1000).toFixed(1) : '—'

//   return (
//     <div style={{
//       flex: 1, padding: '16px',
//       background: `${accent}08`,
//       border: `1px solid ${accent}30`,
//       borderRadius: '14px',
//       display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
//     }}>
//       {/* Badge */}
//       <div style={{
//         background: `${accent}18`, border: `1px solid ${accent}40`,
//         borderRadius: '8px', padding: '3px 12px',
//         fontFamily: '"Syne", sans-serif', fontWeight: 800,
//         fontSize: '0.65rem', color: accent,
//         textTransform: 'uppercase', letterSpacing: '0.1em',
//       }}>
//         {label}
//       </div>

//       {/* Avatar */}
//       <div style={{
//         width: '56px', height: '56px', borderRadius: '50%',
//         background: `${accent}15`, border: `2px solid ${accent}50`,
//         display: 'flex', alignItems: 'center', justifyContent: 'center',
//         fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.1rem', color: accent,
//         boxShadow: `0 0 20px ${accent}30`,
//       }}>
//         {(player?.username || '??').slice(0,2).toUpperCase()}
//       </div>

//       {/* Name */}
//       <div style={{ textAlign: 'center' }}>
//         <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
//           {player?.username || 'Unknown'}
//           {isCurrentUser && <span style={{ color: accent, fontSize: '0.6rem', marginLeft: '5px' }}>(you)</span>}
//         </div>
//       </div>

//       {/* Stats */}
//       <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
//         <StatBox label="Correct" value={`${correct}/${total}`} accent={accent} />
//         <StatBox label="Accuracy" value={`${accuracy}%`} accent={accent} />
//       </div>
//       <div style={{ width: '100%' }}>
//         <StatBox label="Total Time" value={`${timeSec}s`} accent="rgba(255,255,255,0.3)" />
//       </div>
//     </div>
//   )
// }

// /**
//  * FightResultModal
//  * result: { winnerId, isDraw, scores, accuracy, timeTotals, totalQuestions }
//  */
// export default function FightResultModal({ result, player1, player2, currentUserId, totalQuestions, show, onClose }) {
//   const [burst, setBurst] = useState(false)

//   useEffect(() => {
//     if (show) setTimeout(() => setBurst(true), 400)
//     else setBurst(false)
//   }, [show])

//   if (!result || !show) return null

//   const { winnerId, isDraw, accuracy = {}, timeTotals = {} } = result
//   const total = totalQuestions || 15

//   const p1Id = player1?.userId
//   const p2Id = player2?.userId

//   const p1Correct = accuracy[p1Id] ?? 0
//   const p2Correct = accuracy[p2Id] ?? 0
//   const p1Time    = timeTotals[p1Id] ?? 0
//   const p2Time    = timeTotals[p2Id] ?? 0

//   const iWon   = !isDraw && winnerId === currentUserId
//   const iDraw  = isDraw

//   // Tie-break info
//   const tiedAccuracy = !isDraw && p1Correct === p2Correct
//   const headColor    = iDraw ? '#FFB800' : iWon ? '#00FF88' : '#FF4060'
//   const headline     = iDraw ? "It's a Draw!" : iWon ? 'Victory!' : 'Defeat'
//   const subText      = iDraw
//     ? tiedAccuracy
//       ? `Tied on accuracy — decided by speed`
//       : 'Both fighters matched equally.'
//     : iWon
//     ? 'You outfought your opponent!'
//     : `${(p1Id === currentUserId ? player2 : player1)?.username || 'Opponent'} wins this round.`

//   return (
//     <AnimatePresence>
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(14px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
//       >
//         <motion.div
//           initial={{ opacity: 0, scale: 0.82, y: 28 }}
//           animate={{ opacity: 1, scale: 1, y: 0 }}
//           exit={{ opacity: 0, scale: 0.9, y: 16 }}
//           transition={{ duration: 0.45, ease: [0.34, 1.15, 0.64, 1] }}
//           style={{ width: '100%', maxWidth: '480px', background: 'rgba(12,12,20,0.98)', backdropFilter: 'blur(24px)', border: `1px solid ${headColor}30`, borderRadius: '22px', overflow: 'hidden', position: 'relative' }}
//         >
//           <div style={{ height: '2px', background: `linear-gradient(90deg, transparent, ${headColor}, transparent)` }} />
//           <div style={{ position: 'relative' }}>
//             <Confetti active={burst && iWon && !iDraw} />
//           </div>

//           <div style={{ padding: '28px' }}>
//             {/* Result headline */}
//             <motion.div
//               initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
//               style={{ textAlign: 'center', marginBottom: '22px' }}
//             >
//               <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', fontWeight: 700, color: headColor, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px' }}>
//                 Fight Complete
//               </div>
//               <h2 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 900, fontSize: '2.2rem', color: headColor, letterSpacing: '-0.03em', marginBottom: '6px', textShadow: `0 0 30px ${headColor}50` }}>
//                 {headline}
//               </h2>
//               <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
//                 {subText}
//               </p>
//               {/* Tie-break note */}
//               {!isDraw && tiedAccuracy && (
//                 <div style={{ marginTop: '8px', background: 'rgba(255,184,0,0.08)', border: '1px solid rgba(255,184,0,0.2)', borderRadius: '8px', padding: '5px 12px', display: 'inline-block' }}>
//                   <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.75rem', color: '#FFB800' }}>
//                     ⚡ Tie-break: faster total response time won
//                   </span>
//                 </div>
//               )}
//             </motion.div>

//             {/* Player cards side by side */}
//             <motion.div
//               initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
//               style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}
//             >
//               <PlayerCard
//                 player={player1}
//                 isWinner={winnerId === p1Id}
//                 isDraw={isDraw}
//                 correct={p1Correct}
//                 total={total}
//                 timeMs={p1Time}
//                 isCurrentUser={p1Id === currentUserId}
//               />
//               <PlayerCard
//                 player={player2}
//                 isWinner={winnerId === p2Id}
//                 isDraw={isDraw}
//                 correct={p2Correct}
//                 total={total}
//                 timeMs={p2Time}
//                 isCurrentUser={p2Id === currentUserId}
//               />
//             </motion.div>

//             {/* Winner summary row */}
//             {!isDraw && (
//               <motion.div
//                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
//                 style={{ background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.15)', borderRadius: '12px', padding: '12px 16px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '12px' }}
//               >
//                 <div style={{ fontFamily: '"Syne", sans-serif', fontSize: '1.1rem' }}>🏆</div>
//                 <div>
//                   <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.88rem', color: '#fff' }}>
//                     {winnerId === p1Id ? player1?.username : player2?.username} wins!
//                   </div>
//                   <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
//                     {winnerId === p1Id ? p1Correct : p2Correct}/{total} correct
//                     {tiedAccuracy && ` · faster by ${Math.abs(p1Time - p2Time) > 0 ? ((Math.abs(p1Time - p2Time)) / 1000).toFixed(1) : '?'}s`}
//                   </div>
//                 </div>
//               </motion.div>
//             )}

//             {/* Actions */}
//             <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
//               <motion.button
//                 whileHover={{ scale: 1.02, boxShadow: '0 8px 28px rgba(255,64,96,0.35)' }}
//                 whileTap={{ scale: 0.97 }}
//                 onClick={onClose}
//                 style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #FF4060, #CC2040)', border: 'none', borderRadius: '12px', cursor: 'pointer', fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
//               >
//                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3" /></svg>
//                 Play Again
//               </motion.button>
//             </div>
//           </div>
//         </motion.div>
//       </motion.div>
//     </AnimatePresence>
//   )
// }
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Confetti ──────────────────────────────────────────────
function Particle({ angle, color, dist, delay }) {
  const rad = (angle * Math.PI) / 180
  return (
    <motion.div
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{ x: Math.cos(rad) * dist, y: Math.sin(rad) * dist, opacity: 0, scale: 0.3 }}
      transition={{ duration: 0.9, delay, ease: [0.1, 0.7, 0.3, 1] }}
      style={{
        position: 'absolute', left: '50%', top: '30%',
        width: `${4 + Math.random() * 5}px`, height: `${4 + Math.random() * 5}px`,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
        background: color, pointerEvents: 'none',
      }}
    />
  )
}
function Confetti({ active }) {
  const colors = ['#FFB800', '#00F5FF', '#00FF88', '#8B5CF6', '#FF4060']
  if (!active) return null
  return (
    <>
      {Array.from({ length: 28 }, (_, i) => ({
        angle: (i / 28) * 360,
        color: colors[i % colors.length],
        dist:  70 + Math.random() * 60,
        delay: Math.random() * 0.2,
      })).map((p, i) => <Particle key={i} {...p} />)}
    </>
  )
}

function StatBox({ label, value, sub, accent }) {
  return (
    <div style={{
      flex: 1, textAlign: 'center', padding: '14px 10px',
      background: 'rgba(255,255,255,0.03)',
      border: `1px solid ${accent || 'rgba(255,255,255,0.07)'}`,
      borderRadius: '12px',
    }}>
      <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 900, fontSize: '1.5rem', color: accent || '#fff', lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      {sub && <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', marginTop: '2px' }}>{sub}</div>}
    </div>
  )
}

function PlayerCard({ player, isWinner, isDraw, correct, total, timeMs, isCurrentUser }) {
  const accent = isWinner && !isDraw ? '#00FF88' : isDraw ? '#FFB800' : '#FF4060'
  const label  = isWinner && !isDraw ? 'WINNER' : isDraw ? 'DRAW' : 'LOSER'
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0
  const timeSec  = timeMs > 0 ? (timeMs / 1000).toFixed(1) : '—'

  return (
    <div style={{
      flex: 1, padding: '16px',
      background: `${accent}08`,
      border: `1px solid ${accent}30`,
      borderRadius: '14px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
    }}>
      {/* Badge */}
      <div style={{
        background: `${accent}18`, border: `1px solid ${accent}40`,
        borderRadius: '8px', padding: '3px 12px',
        fontFamily: '"Syne", sans-serif', fontWeight: 800,
        fontSize: '0.65rem', color: accent,
        textTransform: 'uppercase', letterSpacing: '0.1em',
      }}>
        {label}
      </div>

      {/* Avatar */}
      <div style={{
        width: '56px', height: '56px', borderRadius: '50%',
        background: `${accent}15`, border: `2px solid ${accent}50`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.1rem', color: accent,
        boxShadow: `0 0 20px ${accent}30`,
      }}>
        {(player?.username || '??').slice(0,2).toUpperCase()}
      </div>

      {/* Name */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
          {player?.username || 'Unknown'}
          {isCurrentUser && <span style={{ color: accent, fontSize: '0.6rem', marginLeft: '5px' }}>(you)</span>}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
        <StatBox label="Correct" value={`${correct}/${total}`} accent={accent} />
        <StatBox label="Accuracy" value={`${accuracy}%`} accent={accent} />
      </div>
      <div style={{ width: '100%' }}>
        <StatBox label="Total Time" value={`${timeSec}s`} accent="rgba(255,255,255,0.3)" />
      </div>
    </div>
  )
}

/**
 * FightResultModal
 * result: { winnerId, isDraw, scores, accuracy, timeTotals, totalQuestions }
 */
export default function FightResultModal({ result, player1, player2, currentUserId, totalQuestions, show, onClose }) {
  const [burst, setBurst] = useState(false)

  useEffect(() => {
    if (show) setTimeout(() => setBurst(true), 400)
    else setBurst(false)
  }, [show])

  if (!result || !show) return null

  const { winnerId, isDraw, accuracy = {}, timeTotals = {} } = result
  const total = totalQuestions || 15

  const p1Id = player1?.userId
  const p2Id = player2?.userId

  const p1Correct = accuracy[p1Id] ?? 0
  const p2Correct = accuracy[p2Id] ?? 0
  const p1Time    = timeTotals[p1Id] ?? 0
  const p2Time    = timeTotals[p2Id] ?? 0

  const iWon   = !isDraw && winnerId === currentUserId
  const iDraw  = isDraw

  // Tie-break info
  const tiedAccuracy = !isDraw && p1Correct === p2Correct
  const headColor    = iDraw ? '#FFB800' : iWon ? '#00FF88' : '#FF4060'
  const headline     = iDraw ? "It's a Draw!" : iWon ? 'Victory!' : 'Defeat'
  const subText      = iDraw
    ? tiedAccuracy
      ? `Tied on accuracy — decided by speed`
      : 'Both fighters matched equally.'
    : iWon
    ? 'You outfought your opponent!'
    : `${(p1Id === currentUserId ? player2 : player1)?.username || 'Opponent'} wins this round.`

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(14px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.82, y: 28 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 16 }}
          transition={{ duration: 0.45, ease: [0.34, 1.15, 0.64, 1] }}
          style={{ width: '100%', maxWidth: '480px', background: 'rgba(12,12,20,0.98)', backdropFilter: 'blur(24px)', border: `1px solid ${headColor}30`, borderRadius: '22px', overflow: 'hidden', position: 'relative' }}
        >
          <div style={{ height: '2px', background: `linear-gradient(90deg, transparent, ${headColor}, transparent)` }} />
          <div style={{ position: 'relative' }}>
            <Confetti active={burst && iWon && !iDraw} />
          </div>

          <div style={{ padding: '28px' }}>
            {/* Result headline */}
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              style={{ textAlign: 'center', marginBottom: '22px' }}
            >
              <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', fontWeight: 700, color: headColor, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px' }}>
                Fight Complete
              </div>
              <h2 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 900, fontSize: '2.2rem', color: headColor, letterSpacing: '-0.03em', marginBottom: '6px', textShadow: `0 0 30px ${headColor}50` }}>
                {headline}
              </h2>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
                {subText}
              </p>
              {/* Tie-break note */}
              {!isDraw && tiedAccuracy && (
                <div style={{ marginTop: '8px', background: 'rgba(255,184,0,0.08)', border: '1px solid rgba(255,184,0,0.2)', borderRadius: '8px', padding: '5px 12px', display: 'inline-block' }}>
                  <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.75rem', color: '#FFB800' }}>
                    ⚡ Tie-break: faster total response time won
                  </span>
                </div>
              )}
            </motion.div>

            {/* Player cards side by side */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
              style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}
            >
              <PlayerCard
                player={player1}
                isWinner={winnerId === p1Id}
                isDraw={isDraw}
                correct={p1Correct}
                total={total}
                timeMs={p1Time}
                isCurrentUser={p1Id === currentUserId}
              />
              <PlayerCard
                player={player2}
                isWinner={winnerId === p2Id}
                isDraw={isDraw}
                correct={p2Correct}
                total={total}
                timeMs={p2Time}
                isCurrentUser={p2Id === currentUserId}
              />
            </motion.div>

            {/* Winner summary row */}
            {!isDraw && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
                style={{ background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.15)', borderRadius: '12px', padding: '12px 16px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '12px' }}
              >
                <div style={{ fontFamily: '"Syne", sans-serif', fontSize: '1.1rem' }}>🏆</div>
                <div>
                  <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.88rem', color: '#fff' }}>
                    {winnerId === p1Id ? player1?.username : player2?.username} wins!
                  </div>
                  <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
                    {winnerId === p1Id ? p1Correct : p2Correct}/{total} correct
                    {tiedAccuracy && ` · faster by ${Math.abs(p1Time - p2Time) > 0 ? ((Math.abs(p1Time - p2Time)) / 1000).toFixed(1) : '?'}s`}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 8px 28px rgba(255,64,96,0.35)' }}
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #FF4060, #CC2040)', border: 'none', borderRadius: '12px', cursor: 'pointer', fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                Play Again
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
