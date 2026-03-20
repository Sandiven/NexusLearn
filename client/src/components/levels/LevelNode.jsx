import { motion, AnimatePresence } from 'framer-motion'
import { LEVEL_STATE } from '@/data/levelData'
import { NODE_SIZE, CELL_W, CELL_H } from './LevelPath'

const HALF = NODE_SIZE / 2

// ── State colour config ──────────────────────────────────
const STATE_STYLE = {
  [LEVEL_STATE.COMPLETED]: {
    border: '#00F5FF',
    bg:     'rgba(0,245,255,0.12)',
    glow:   'rgba(0,245,255,0.35)',
    textColor: '#00F5FF',
  },
  [LEVEL_STATE.ACTIVE]: {
    border: '#8B5CF6',
    bg:     'rgba(139,92,246,0.15)',
    glow:   'rgba(139,92,246,0.45)',
    textColor: '#8B5CF6',
  },
  [LEVEL_STATE.LOCKED]: {
    border: 'rgba(255,255,255,0.12)',
    bg:     'rgba(255,255,255,0.03)',
    glow:   'transparent',
    textColor: 'rgba(255,255,255,0.25)',
  },
  [LEVEL_STATE.CONTEST]: {
    border: '#FFB800',
    bg:     'rgba(255,184,0,0.12)',
    glow:   'rgba(255,184,0,0.4)',
    textColor: '#FFB800',
  },
}

// ── Type icons ───────────────────────────────────────────
function NodeIcon({ state, type }) {
  if (state === LEVEL_STATE.COMPLETED) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00F5FF" strokeWidth="2.5" strokeLinecap="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    )
  }
  if (state === LEVEL_STATE.LOCKED) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    )
  }
  if (type === 'contest' || type === 'boss') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
    )
  }
  // Active standard
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  )
}

export default function LevelNode({ level, accentColor, isSelected, onClick, animDelay = 0 }) {
  const { id, title, state, type, col, row } = level
  const style   = STATE_STYLE[state] || STATE_STYLE[LEVEL_STATE.LOCKED]
  const isActive     = state === LEVEL_STATE.ACTIVE
  const isCompleted  = state === LEVEL_STATE.COMPLETED
  const isLocked     = state === LEVEL_STATE.LOCKED
  const isContest    = type === 'contest' || type === 'boss'

  const cx = col * CELL_W     // center X of cell
  const cy = row * CELL_H     // center Y of cell

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1], delay: animDelay }}
      style={{ cursor: isLocked ? 'not-allowed' : 'pointer' }}
      onClick={() => !isLocked && onClick(level)}
    >
      {/* Outer pulse ring — active only */}
      {isActive && (
        <motion.circle
          cx={cx + HALF} cy={cy + HALF} r={HALF + 8}
          fill="none"
          stroke={style.border}
          strokeWidth="1.5"
          animate={{ r: [HALF + 8, HALF + 16, HALF + 8], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Selected ring */}
      {isSelected && (
        <motion.circle
          cx={cx + HALF} cy={cy + HALF} r={HALF + 5}
          fill="none"
          stroke={style.border}
          strokeWidth="2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        />
      )}

      {/* Contest/boss special outer hex */}
      {isContest && !isLocked && (
        <motion.polygon
          points={hexPoints(cx + HALF, cy + HALF, HALF + 10)}
          fill="none"
          stroke={style.border}
          strokeWidth="1"
          strokeOpacity="0.4"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: `${cx + HALF}px ${cy + HALF}px` }}
        />
      )}

      {/* Main circle */}
      <motion.circle
        cx={cx + HALF} cy={cy + HALF} r={HALF}
        fill={style.bg}
        stroke={isSelected ? style.border : style.border}
        strokeWidth={isSelected ? 2.5 : isActive ? 2 : 1.5}
        style={{
          filter: isLocked ? 'none' : `drop-shadow(0 0 10px ${style.glow})`,
        }}
        whileHover={!isLocked ? {
          r: HALF + 3,
          transition: { duration: 0.2 },
        } : {}}
      />

      {/* Inner glow fill — completed */}
      {isCompleted && (
        <circle
          cx={cx + HALF} cy={cy + HALF} r={HALF - 10}
          fill={`${style.border}15`}
        />
      )}

      {/* Icon (foreignObject for React SVG) */}
      <foreignObject
        x={cx + HALF - 12}
        y={cy + HALF - 12}
        width="24"
        height="24"
        style={{ color: isLocked ? 'rgba(255,255,255,0.2)' : style.border, overflow: 'visible' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', color: 'inherit' }}>
          <NodeIcon state={state} type={type} />
        </div>
      </foreignObject>

      {/* Level number badge */}
      <foreignObject
        x={cx + HALF + 22}
        y={cy - 4}
        width="28"
        height="18"
      >
        <div style={{
          background: isLocked ? 'rgba(255,255,255,0.06)' : style.bg,
          border: `1px solid ${isLocked ? 'rgba(255,255,255,0.1)' : style.border + '60'}`,
          borderRadius: '6px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: '"Syne", sans-serif', fontWeight: 800,
          fontSize: '0.62rem', color: style.textColor,
          width: '28px', height: '18px',
        }}>
          L{id}
        </div>
      </foreignObject>

      {/* Title below node */}
      <foreignObject
        x={cx - 30}
        y={cy + HALF + 8}
        width={NODE_SIZE + 60}
        height="36"
        style={{ overflow: 'visible' }}
      >
        <div style={{
          textAlign: 'center',
          fontFamily: '"DM Sans", sans-serif',
          fontSize: '0.72rem',
          fontWeight: isActive ? 600 : 400,
          color: isLocked ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
          lineHeight: 1.3,
          wordBreak: 'break-word',
          padding: '0 4px',
        }}>
          {title}
        </div>
      </foreignObject>

      {/* Contest badge */}
      {isContest && !isLocked && (
        <foreignObject x={cx} y={cy - 14} width="72" height="14">
          <div style={{
            background: `${style.border}20`,
            border: `1px solid ${style.border}50`,
            borderRadius: '4px',
            fontFamily: '"Syne", sans-serif', fontWeight: 700,
            fontSize: '0.58rem', color: style.border,
            textAlign: 'center', textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}>
            {type === 'boss' ? 'BOSS' : 'CONTEST'}
          </div>
        </foreignObject>
      )}
    </motion.g>
  )
}

// Hex points helper for contest nodes
function hexPoints(cx, cy, r) {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 6
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
  }).join(' ')
}
