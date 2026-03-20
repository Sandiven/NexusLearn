import { motion } from 'framer-motion'

/**
 * StatCard
 * @param {string}   label       — e.g. "Total XP"
 * @param {string}   value       — e.g. "2,450"
 * @param {ReactNode} icon       — SVG icon
 * @param {string}   accent      — hex colour for glow + icon tint
 * @param {string}   sub         — optional subtitle / trend text
 * @param {number}   index       — stagger delay index
 */
export default function StatCard({ label, value, icon, accent = '#00F5FF', sub, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: index * 0.07 }}
      whileHover={{
        y: -4,
        boxShadow: `0 12px 40px ${accent}20`,
        borderColor: `${accent}30`,
        transition: { duration: 0.22 },
      }}
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '22px 24px',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
        flex: 1,
        minWidth: '140px',
      }}
    >
      {/* Subtle top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: '20%', right: '20%', height: '1px',
        background: `linear-gradient(90deg, transparent, ${accent}55, transparent)`,
      }} />

      {/* Icon + label row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <span style={{
          fontFamily: '"DM Sans", sans-serif',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'rgba(255,255,255,0.4)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          {label}
        </span>
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: `${accent}12`,
          border: `1px solid ${accent}25`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: accent,
        }}>
          {icon}
        </div>
      </div>

      {/* Value */}
      <div style={{
        fontFamily: '"Syne", sans-serif',
        fontSize: '1.75rem',
        fontWeight: 800,
        color: '#fff',
        letterSpacing: '-0.02em',
        lineHeight: 1,
        marginBottom: sub ? '8px' : 0,
      }}>
        {value}
      </div>

      {/* Sub / trend */}
      {sub && (
        <div style={{
          fontFamily: '"DM Sans", sans-serif',
          fontSize: '0.75rem',
          color: accent,
          fontWeight: 500,
        }}>
          {sub}
        </div>
      )}
    </motion.div>
  )
}
