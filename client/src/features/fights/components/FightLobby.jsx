// import { motion } from 'framer-motion'
// import { getTier } from '@/data/leaderboardData'

// function PlayerCard({ player, side, isReady, isYou }) {
//   const tier = getTier(isReady ? 4 : 50)

//   return (
//     <motion.div
//       initial={{ opacity: 0, x: side === 'left' ? -40 : 40 }}
//       animate={{ opacity: 1, x: 0 }}
//       transition={{ duration: 0.5, ease: [0.34, 1.1, 0.64, 1] }}
//       style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', flex: 1 }}
//     >
//       <motion.div
//         animate={isReady ? { boxShadow: ['0 0 20px rgba(0,245,255,0.3)', '0 0 40px rgba(0,245,255,0.6)', '0 0 20px rgba(0,245,255,0.3)'] } : {}}
//         transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
//         style={{
//           width: '88px', height: '88px', borderRadius: '50%',
//           background: isReady ? 'rgba(0,245,255,0.12)' : 'rgba(255,255,255,0.05)',
//           border: `2.5px solid ${isReady ? 'rgba(0,245,255,0.6)' : 'rgba(255,255,255,0.15)'}`,
//           display: 'flex', alignItems: 'center', justifyContent: 'center',
//           fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.5rem',
//           color: isReady ? '#00F5FF' : 'rgba(255,255,255,0.5)',
//           transition: 'all 0.4s',
//         }}
//       >
//         {player?.avatar?.slice(0, 2) || '??'}
//       </motion.div>
//       <div style={{ textAlign: 'center' }}>
//         <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1.05rem', color: '#fff', marginBottom: '3px' }}>
//           {player?.username || 'Waiting...'}
//           {isYou && <span style={{ color: '#00F5FF', fontSize: '0.65rem', marginLeft: '5px' }}>(you)</span>}
//         </div>
//         {player && <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.38)' }}>Lv.{player.level} · {player.xp?.toLocaleString()} XP</div>}
//       </div>
//       <div style={{
//         display: 'inline-flex', alignItems: 'center', gap: '6px',
//         background: isReady ? 'rgba(0,255,136,0.08)' : 'rgba(255,255,255,0.04)',
//         border: `1px solid ${isReady ? 'rgba(0,255,136,0.25)' : 'rgba(255,255,255,0.08)'}`,
//         borderRadius: '20px', padding: '5px 13px',
//       }}>
//         {isReady
//           ? <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.2, repeat: Infinity }} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00FF88' }} />
//           : <motion.svg animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.15)" strokeWidth="2.5" /><path d="M12 2a10 10 0 0 1 10 10" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round" /></motion.svg>
//         }
//         <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.73rem', fontWeight: 600, color: isReady ? '#00FF88' : 'rgba(255,255,255,0.28)' }}>
//           {isReady ? 'Ready' : 'Waiting…'}
//         </span>
//       </div>
//     </motion.div>
//   )
// }

// export default function FightLobby({ player1, player2, currentUserId, bothConnected, onCancel }) {
//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '65vh', gap: '36px' }}>
//       <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center' }}>
//         <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', fontWeight: 700, color: '#FF4060', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>⚔ Custom Fight</div>
//         <h1 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: '#fff', letterSpacing: '-0.025em', margin: 0 }}>Battle Lobby</h1>
//       </motion.div>

//       <div style={{ display: 'flex', alignItems: 'center', gap: '28px', width: '100%', maxWidth: '520px' }}>
//         <PlayerCard player={player1} side="left"  isReady={bothConnected || player1?.userId === currentUserId} isYou={player1?.userId === currentUserId} />
//         <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2.5, repeat: Infinity }}
//           style={{ flexShrink: 0, width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,64,96,0.1)', border: '1.5px solid rgba(255,64,96,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Syne", sans-serif', fontWeight: 900, fontSize: '0.95rem', color: '#FF4060', boxShadow: '0 0 20px rgba(255,64,96,0.18)' }}>
//           VS
//         </motion.div>
//         <PlayerCard player={player2} side="right" isReady={bothConnected} isYou={player2?.userId === currentUserId} />
//       </div>

//       <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
//         style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.88rem', color: bothConnected ? '#00FF88' : 'rgba(255,255,255,0.38)', textAlign: 'center' }}>
//         {bothConnected ? 'Both players connected — starting countdown…' : 'Waiting for opponent to connect…'}
//       </motion.p>

//       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
//         style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
//         {[['❓','5 Questions'],['⏱','15s Each'],['⚡','+20 Speed Bonus'],['🏆','+300 XP Winner']].map(([icon, text]) => (
//           <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '7px 13px' }}>
//             <span>{icon}</span>
//             <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.76rem', color: 'rgba(255,255,255,0.5)' }}>{text}</span>
//           </div>
//         ))}
//       </motion.div>

//       <motion.button whileHover={{ color: '#FF5050' }} onClick={onCancel}
//         style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem', color: 'rgba(255,255,255,0.28)', transition: 'color 0.2s' }}>
//         Cancel Fight
//       </motion.button>
//     </div>
//   )
// }
import { motion } from 'framer-motion'
import { getTier } from '@/data/leaderboardData'

function PlayerCard({ player, side, isReady, isYou }) {
  const tier = getTier(isReady ? 4 : 50)

  return (
    <motion.div
      initial={{ opacity: 0, x: side === 'left' ? -40 : 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.34, 1.1, 0.64, 1] }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', flex: 1 }}
    >
      <motion.div
        animate={isReady ? { boxShadow: ['0 0 20px rgba(0,245,255,0.3)', '0 0 40px rgba(0,245,255,0.6)', '0 0 20px rgba(0,245,255,0.3)'] } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: '88px', height: '88px', borderRadius: '50%',
          background: isReady ? 'rgba(0,245,255,0.12)' : 'rgba(255,255,255,0.05)',
          border: `2.5px solid ${isReady ? 'rgba(0,245,255,0.6)' : 'rgba(255,255,255,0.15)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.5rem',
          color: isReady ? '#00F5FF' : 'rgba(255,255,255,0.5)',
          transition: 'all 0.4s',
        }}
      >
        {player?.avatar?.slice(0, 2) || '??'}
      </motion.div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1.05rem', color: '#fff', marginBottom: '3px' }}>
          {player?.username || 'Waiting...'}
          {isYou && <span style={{ color: '#00F5FF', fontSize: '0.65rem', marginLeft: '5px' }}>(you)</span>}
        </div>
        {player && <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.38)' }}>Lv.{player.level} · {player.xp?.toLocaleString()} XP</div>}
      </div>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        background: isReady ? 'rgba(0,255,136,0.08)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${isReady ? 'rgba(0,255,136,0.25)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: '20px', padding: '5px 13px',
      }}>
        {isReady
          ? <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.2, repeat: Infinity }} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00FF88' }} />
          : <motion.svg animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.15)" strokeWidth="2.5" /><path d="M12 2a10 10 0 0 1 10 10" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round" /></motion.svg>
        }
        <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.73rem', fontWeight: 600, color: isReady ? '#00FF88' : 'rgba(255,255,255,0.28)' }}>
          {isReady ? 'Ready' : 'Waiting…'}
        </span>
      </div>
    </motion.div>
  )
}

export default function FightLobby({ player1, player2, currentUserId, bothConnected, onCancel }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '65vh', gap: '36px' }}>
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', fontWeight: 700, color: '#FF4060', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>⚔ Custom Fight</div>
        <h1 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: '#fff', letterSpacing: '-0.025em', margin: 0 }}>Battle Lobby</h1>
      </motion.div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '28px', width: '100%', maxWidth: '520px' }}>
        <PlayerCard player={player1} side="left"  isReady={bothConnected || player1?.userId === currentUserId} isYou={player1?.userId === currentUserId} />
        <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2.5, repeat: Infinity }}
          style={{ flexShrink: 0, width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,64,96,0.1)', border: '1.5px solid rgba(255,64,96,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Syne", sans-serif', fontWeight: 900, fontSize: '0.95rem', color: '#FF4060', boxShadow: '0 0 20px rgba(255,64,96,0.18)' }}>
          VS
        </motion.div>
        <PlayerCard player={player2} side="right" isReady={bothConnected} isYou={player2?.userId === currentUserId} />
      </div>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.88rem', color: bothConnected ? '#00FF88' : 'rgba(255,255,255,0.38)', textAlign: 'center' }}>
        {bothConnected ? 'Both players connected — starting countdown…' : 'Waiting for opponent to connect…'}
      </motion.p>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
        style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {[['❓','5 Questions'],['⏱','15s Each'],['⚡','+20 Speed Bonus'],['🏆','+300 XP Winner']].map(([icon, text]) => (
          <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '7px 13px' }}>
            <span>{icon}</span>
            <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.76rem', color: 'rgba(255,255,255,0.5)' }}>{text}</span>
          </div>
        ))}
      </motion.div>

      <motion.button whileHover={{ color: '#FF5050' }} onClick={onCancel}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem', color: 'rgba(255,255,255,0.28)', transition: 'color 0.2s' }}>
        Cancel Fight
      </motion.button>
    </div>
  )
}
