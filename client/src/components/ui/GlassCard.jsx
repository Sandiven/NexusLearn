import { motion } from 'framer-motion'

/**
 * GlassCard — base glass morphism card
 * @param {string}  className   — extra Tailwind classes
 * @param {boolean} hoverable   — enable lift + glow on hover
 * @param {string}  glowColor   — rgba glow colour for hover shadow
 * @param {object}  style       — inline style overrides
 */
export default function GlassCard({
  children,
  className = '',
  hoverable = false,
  glowColor = 'rgba(0,245,255,0.12)',
  style = {},
  onClick,
  ...rest
}) {
  const base = {
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    ...style,
  }

  if (!hoverable) {
    return (
      <div className={className} style={base} onClick={onClick} {...rest}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      className={className}
      style={base}
      onClick={onClick}
      whileHover={{
        y: -4,
        boxShadow: `0 10px 40px ${glowColor}`,
        borderColor: 'rgba(0,245,255,0.2)',
        transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
      }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
