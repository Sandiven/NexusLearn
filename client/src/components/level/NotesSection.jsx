import { motion } from 'framer-motion'

export default function NotesSection({ notes, accentColor, onComplete }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
      >
        <div style={{
          width: '40px', height: '40px', borderRadius: '10px',
          background: `${accentColor}12`, border: `1px solid ${accentColor}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: accentColor,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>
        <div>
          <h2 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1.2rem', color: '#fff', margin: 0 }}>
            Key Points
          </h2>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            Review these before the test
          </p>
        </div>
      </motion.div>

      {/* Notes list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {notes.map((note, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: i * 0.07, ease: [0.4, 0, 0.2, 1] }}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: '14px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '12px',
              padding: '14px 16px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Left accent */}
            <div style={{
              position: 'absolute', left: 0, top: '15%', bottom: '15%',
              width: '2px', borderRadius: '2px',
              background: `linear-gradient(180deg, ${accentColor}80, ${accentColor}20)`,
            }} />

            {/* Number badge */}
            <div style={{
              width: '22px', height: '22px', borderRadius: '6px',
              background: `${accentColor}15`,
              border: `1px solid ${accentColor}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: '"Syne", sans-serif', fontWeight: 800,
              fontSize: '0.7rem', color: accentColor,
              flexShrink: 0,
            }}>
              {i + 1}
            </div>

            <p style={{
              fontFamily: '"DM Sans", sans-serif', fontSize: '0.9rem',
              color: 'rgba(255,255,255,0.75)', lineHeight: 1.55, margin: 0,
            }}>
              {note.point}
            </p>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 + notes.length * 0.07 }}
        style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}
      >
        <motion.button
          whileHover={{ scale: 1.03, boxShadow: '0 8px 28px rgba(139,92,246,0.4)' }}
          whileTap={{ scale: 0.97 }}
          onClick={onComplete}
          style={{
            background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
            color: '#fff', border: 'none', borderRadius: '12px',
            padding: '13px 32px',
            fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.95rem',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
          }}
        >
          Start Content Test
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </motion.button>
      </motion.div>
    </div>
  )
}
