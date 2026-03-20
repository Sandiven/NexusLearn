import { motion } from 'framer-motion'

// ── Grand Door half panels ────────────────────────────────
function GrandHalf({ side, isOpen }) {
  const isLeft = side === 'left'
  return (
    <motion.div
      animate={{ rotateY: isOpen ? (isLeft ? -100 : 100) : 0, opacity: isOpen ? 0 : 1 }}
      transition={{ duration: 0.65, ease: [0.4, 0, 0.15, 1] }}
      style={{
        position: 'absolute', top: 0, bottom: 0,
        [isLeft ? 'left' : 'right']: 0,
        width: '50%',
        transformOrigin: isLeft ? 'left center' : 'right center',
        background: isLeft
          ? 'linear-gradient(160deg, rgba(30,15,50,0.97) 0%, rgba(15,8,28,0.99) 100%)'
          : 'linear-gradient(200deg, rgba(15,8,28,0.99) 0%, rgba(30,15,50,0.97) 100%)',
        border: `1px solid rgba(180,100,255,0.25)`,
        borderRadius: isLeft ? '8px 0 0 8px' : '0 8px 8px 0',
        overflow: 'hidden',
        zIndex: 3,
        backfaceVisibility: 'hidden',
      }}
    >
      {/* Vertical line details */}
      <div style={{
        position: 'absolute',
        [isLeft ? 'right' : 'left']: '20%',
        top: '8%', bottom: '8%', width: '1px',
        background: 'linear-gradient(180deg, transparent, rgba(180,100,255,0.25), transparent)',
      }} />
      <div style={{
        position: 'absolute',
        [isLeft ? 'right' : 'left']: '38%',
        top: '15%', bottom: '15%', width: '1px',
        background: 'linear-gradient(180deg, transparent, rgba(180,100,255,0.12), transparent)',
      }} />
      {/* Inner gradient overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at ${isLeft ? '85%' : '15%'} 50%, rgba(180,100,255,0.1) 0%, transparent 60%)`,
      }} />
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────
// FinalDoor
// Props:
//   isOpen   — boolean
//   onClick  — triggered when door is clicked (idle state)
// ─────────────────────────────────────────────────────────
export default function FinalDoor({ isOpen, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '64px' }}
    >
      {/* Door container */}
      <motion.div
        onClick={!isOpen ? onClick : undefined}
        whileHover={!isOpen ? { scale: 1.025, y: -4 } : {}}
        transition={{ duration: 0.3 }}
        style={{
          position: 'relative',
          width: '240px',
          height: '340px',
          cursor: isOpen ? 'default' : 'pointer',
          userSelect: 'none',
        }}
      >
        {/* Multi-layer outer glow */}
        <div style={{
          position: 'absolute', inset: '-20px',
          borderRadius: '20px',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(160,80,255,0.35) 0%, transparent 65%)',
          filter: 'blur(16px)',
          pointerEvents: 'none',
          zIndex: 0,
        }} />
        <motion.div
          animate={{ opacity: isOpen ? 1 : 0.5, scale: isOpen ? 1.2 : 1 }}
          transition={{ duration: 0.6 }}
          style={{
            position: 'absolute', inset: '-30px',
            borderRadius: '24px',
            background: 'radial-gradient(ellipse at 50% 50%, rgba(100,50,255,0.2) 0%, transparent 65%)',
            filter: 'blur(20px)',
            pointerEvents: 'none', zIndex: 0,
          }}
        />

        {/* Frame */}
        <div style={{
          position: 'absolute', inset: 0,
          border: '1.5px solid rgba(180,100,255,0.35)',
          borderRadius: '12px',
          background: 'rgba(12,6,24,0.98)',
          overflow: 'hidden',
          zIndex: 1,
        }}>
          {/* Inner open-state light */}
          <motion.div
            animate={{ opacity: isOpen ? 1 : 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse at 50% 40%, rgba(180,100,255,0.5) 0%, rgba(100,50,255,0.15) 40%, transparent 70%)',
            }}
          />
          {/* Opened center orb */}
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <div style={{
                width: '70px', height: '70px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(200,140,255,0.7) 0%, rgba(140,80,255,0.2) 50%, transparent 70%)',
                boxShadow: '0 0 60px rgba(180,100,255,0.7), 0 0 20px rgba(200,140,255,0.4)',
              }} />
            </motion.div>
          )}
          {/* Decorative arch at top */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '40px',
            background: 'linear-gradient(180deg, rgba(180,100,255,0.08) 0%, transparent 100%)',
          }} />
        </div>

        {/* Handle */}
        {!isOpen && (
          <div style={{
            position: 'absolute', right: '26%', top: '50%',
            transform: 'translateY(-50%)', zIndex: 4,
            width: '12px', height: '12px', borderRadius: '50%',
            background: '#C06AFF',
            boxShadow: '0 0 12px rgba(180,100,255,0.8)',
          }} />
        )}

        {/* Door halves */}
        <GrandHalf side="left"  isOpen={isOpen} />
        <GrandHalf side="right" isOpen={isOpen} />

        {/* Crown ornament */}
        <div style={{
          position: 'absolute', top: '-18px', left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 4, display: 'flex', gap: '6px', alignItems: 'flex-end',
        }}>
          {[6, 10, 14, 10, 6].map((h, i) => (
            <div key={i} style={{
              width: '4px', height: `${h}px`,
              background: `rgba(180,100,255,${0.3 + i * 0.08})`,
              borderRadius: '2px',
              boxShadow: i === 2 ? '0 0 8px rgba(180,100,255,0.6)' : 'none',
            }} />
          ))}
        </div>
      </motion.div>

      {/* Label */}
      <div style={{ textAlign: 'center', position: 'absolute', bottom: '-60px', left: 0, right: 0 }}>
        <div style={{
          fontFamily: '"Syne", sans-serif', fontWeight: 800,
          fontSize: '1.05rem', color: '#C06AFF',
          letterSpacing: '0.04em', marginBottom: '4px',
          textShadow: '0 0 20px rgba(180,100,255,0.4)',
        }}>
          Grand Door
        </div>
        <div style={{
          fontFamily: '"DM Sans", sans-serif', fontSize: '0.75rem',
          color: 'rgba(180,100,255,0.55)',
        }}>
          The final challenge awaits
        </div>
      </div>
    </motion.div>
  )
}
