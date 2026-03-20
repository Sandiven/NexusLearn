import { motion } from 'framer-motion'
import { LEVEL_STATE } from '@/data/levelData'

const NODE_SIZE   = 72   // px — must match LevelNode
const CELL_W      = 160  // grid cell width
const CELL_H      = 140  // grid cell height
const HALF        = NODE_SIZE / 2

/**
 * LevelPath — draws an SVG path between two nodes.
 *
 * @param {object} from       — source level  { col, row, state }
 * @param {object} to         — target level  { col, row, state }
 * @param {string} accentColor
 */
export default function LevelPath({ from, to, accentColor }) {
  const x1 = from.col * CELL_W + HALF
  const y1 = from.row * CELL_H + HALF
  const x2 = to.col   * CELL_W + HALF
  const y2 = to.row   * CELL_H + HALF

  const isLit = from.state === LEVEL_STATE.COMPLETED

  // Bezier control points — curve nicely between nodes
  const dx = x2 - x1
  const dy = y2 - y1
  const cx1 = x1 + dx * 0.25
  const cy1 = y1 + dy * 0.6
  const cx2 = x2 - dx * 0.25
  const cy2 = y2 - dy * 0.4

  const d = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`

  // Approximate path length for dash animation
  const pathLen = Math.sqrt(dx * dx + dy * dy) * 1.3

  return (
    <g>
      {/* Shadow / base track */}
      <path
        d={d}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="2"
        strokeDasharray="6 6"
      />

      {/* Lit segment — animated draw-on */}
      {isLit && (
        <motion.path
          d={d}
          fill="none"
          stroke={accentColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
          style={{ filter: `drop-shadow(0 0 4px ${accentColor}80)` }}
        />
      )}

      {/* Travelling dot on completed paths */}
      {isLit && (
        <motion.circle
          r="4"
          fill={accentColor}
          style={{ filter: `drop-shadow(0 0 6px ${accentColor})` }}
          animate={{
            offsetDistance: ['0%', '100%'],
            opacity: [0, 1, 1, 0],
          }}
        >
          <animateMotion
            dur="2.5s"
            repeatCount="indefinite"
            begin="1s"
            path={d}
          />
        </motion.circle>
      )}
    </g>
  )
}

export { CELL_W, CELL_H, NODE_SIZE }
