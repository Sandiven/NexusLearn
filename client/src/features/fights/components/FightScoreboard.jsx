// import { motion } from 'framer-motion'

// export default function FightScoreboard({ player1, player2, currentUserId, questionIndex, totalQuestions }) {
//   const meIsP1 = player1?.userId === currentUserId
//   const me     = meIsP1 ? player1 : player2
//   const them   = meIsP1 ? player2 : player1

//   const maxScore  = totalQuestions * 120
//   const mePct     = Math.min(((me?.score || 0) / maxScore) * 100, 100)
//   const themPct   = Math.min(((them?.score || 0) / maxScore) * 100, 100)
//   const meLeading = (me?.score || 0) >= (them?.score || 0)

//   return (
//     <div style={{
//       background: 'rgba(255,255,255,0.03)',
//       border: '1px solid rgba(255,255,255,0.07)',
//       borderRadius: '16px', padding: '16px 20px',
//       marginBottom: '20px',
//     }}>
//       {/* Question progress */}
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
//         <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
//           Question {questionIndex + 1} of {totalQuestions}
//         </span>
//         <div style={{ display: 'flex', gap: '4px' }}>
//           {Array.from({ length: totalQuestions }).map((_, i) => (
//             <div key={i} style={{
//               width: '8px', height: '8px', borderRadius: '50%',
//               background: i < questionIndex ? '#00FF88' : i === questionIndex ? '#00F5FF' : 'rgba(255,255,255,0.1)',
//               boxShadow: i === questionIndex ? '0 0 8px #00F5FF' : 'none',
//               transition: 'all 0.3s',
//             }} />
//           ))}
//         </div>
//       </div>

//       {/* Score comparison */}
//       <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
//         {/* Me */}
//         <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '90px' }}>
//           <div style={{
//             width: '30px', height: '30px', borderRadius: '50%',
//             background: 'rgba(0,245,255,0.12)', border: '1px solid rgba(0,245,255,0.3)',
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//             fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '0.65rem', color: '#00F5FF', flexShrink: 0,
//           }}>
//             {me?.avatar?.slice(0, 2) || 'ME'}
//           </div>
//           <div>
//             <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '0.85rem', color: '#00F5FF' }}>
//               {me?.score || 0}
//             </div>
//             <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)' }}>
//               {me?.username || 'You'}
//             </div>
//           </div>
//         </div>

//         {/* Dual progress bar */}
//         <div style={{ flex: 1, position: 'relative' }}>
//           <div style={{ height: '8px', background: 'rgba(255,255,255,0.07)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
//             {/* Me — from left */}
//             <motion.div
//               animate={{ width: `${mePct / 2}%` }}
//               transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
//               style={{
//                 height: '100%',
//                 background: 'linear-gradient(90deg, #00F5FF80, #00F5FF)',
//                 borderRadius: '4px 0 0 4px',
//                 transformOrigin: 'left',
//               }}
//             />
//             {/* Them — from right */}
//             <motion.div
//               animate={{ width: `${themPct / 2}%` }}
//               transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
//               style={{
//                 height: '100%',
//                 background: 'linear-gradient(90deg, #FF406080, #FF4060)',
//                 borderRadius: '0 4px 4px 0',
//                 marginLeft: 'auto',
//               }}
//             />
//           </div>

//           {/* Lead indicator */}
//           {me?.score !== them?.score && (
//             <div style={{
//               position: 'absolute', top: '-18px', left: '50%', transform: 'translateX(-50%)',
//               fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '0.6rem',
//               color: meLeading ? '#00FF88' : '#FF4060',
//             }}>
//               {meLeading ? '▲ You lead' : '▼ Behind'}
//             </div>
//           )}
//         </div>

//         {/* Them */}
//         <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '90px', justifyContent: 'flex-end', flexDirection: 'row-reverse' }}>
//           <div style={{
//             width: '30px', height: '30px', borderRadius: '50%',
//             background: 'rgba(255,64,96,0.12)', border: '1px solid rgba(255,64,96,0.3)',
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//             fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '0.65rem', color: '#FF4060', flexShrink: 0,
//           }}>
//             {them?.avatar?.slice(0, 2) || '??'}
//           </div>
//           <div style={{ textAlign: 'right' }}>
//             <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '0.85rem', color: '#FF4060' }}>
//               {them?.score || 0}
//             </div>
//             <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)' }}>
//               {them?.username || 'Opponent'}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
import { motion } from 'framer-motion'

export default function FightScoreboard({ player1, player2, currentUserId, questionIndex, totalQuestions }) {
  const meIsP1 = player1?.userId === currentUserId
  const me     = meIsP1 ? player1 : player2
  const them   = meIsP1 ? player2 : player1

  const maxScore  = totalQuestions * 120
  const mePct     = Math.min(((me?.score || 0) / maxScore) * 100, 100)
  const themPct   = Math.min(((them?.score || 0) / maxScore) * 100, 100)
  const meLeading = (me?.score || 0) >= (them?.score || 0)

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '16px', padding: '16px 20px',
      marginBottom: '20px',
    }}>
      {/* Question progress */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Question {questionIndex + 1} of {totalQuestions}
        </span>
        <div style={{ display: 'flex', gap: '4px' }}>
          {Array.from({ length: totalQuestions }).map((_, i) => (
            <div key={i} style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: i < questionIndex ? '#00FF88' : i === questionIndex ? '#00F5FF' : 'rgba(255,255,255,0.1)',
              boxShadow: i === questionIndex ? '0 0 8px #00F5FF' : 'none',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>
      </div>

      {/* Score comparison */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Me */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '90px' }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '50%',
            background: 'rgba(0,245,255,0.12)', border: '1px solid rgba(0,245,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '0.65rem', color: '#00F5FF', flexShrink: 0,
          }}>
            {me?.avatar?.slice(0, 2) || 'ME'}
          </div>
          <div>
            <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '0.85rem', color: '#00F5FF' }}>
              {me?.score || 0}
            </div>
            <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)' }}>
              {me?.username || 'You'}
            </div>
          </div>
        </div>

        {/* Dual progress bar */}
        <div style={{ flex: 1, position: 'relative' }}>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.07)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
            {/* Me — from left */}
            <motion.div
              animate={{ width: `${mePct / 2}%` }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #00F5FF80, #00F5FF)',
                borderRadius: '4px 0 0 4px',
                transformOrigin: 'left',
              }}
            />
            {/* Them — from right */}
            <motion.div
              animate={{ width: `${themPct / 2}%` }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #FF406080, #FF4060)',
                borderRadius: '0 4px 4px 0',
                marginLeft: 'auto',
              }}
            />
          </div>

          {/* Lead indicator */}
          {me?.score !== them?.score && (
            <div style={{
              position: 'absolute', top: '-18px', left: '50%', transform: 'translateX(-50%)',
              fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '0.6rem',
              color: meLeading ? '#00FF88' : '#FF4060',
            }}>
              {meLeading ? '▲ You lead' : '▼ Behind'}
            </div>
          )}
        </div>

        {/* Them */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '90px', justifyContent: 'flex-end', flexDirection: 'row-reverse' }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '50%',
            background: 'rgba(255,64,96,0.12)', border: '1px solid rgba(255,64,96,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '0.65rem', color: '#FF4060', flexShrink: 0,
          }}>
            {them?.avatar?.slice(0, 2) || '??'}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '0.85rem', color: '#FF4060' }}>
              {them?.score || 0}
            </div>
            <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)' }}>
              {them?.username || 'Opponent'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
