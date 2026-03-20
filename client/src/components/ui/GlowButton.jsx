import { motion } from 'framer-motion'

/**
 * GlowButton
 * variant: 'primary' | 'ghost' | 'violet'
 */
export default function GlowButton({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  className = '',
  disabled = false,
  type = 'button',
  as: Tag = 'button',
  ...rest
}) {
  const sizes = {
    sm: { padding: '8px 20px', fontSize: '0.85rem' },
    md: { padding: '12px 28px', fontSize: '0.95rem' },
    lg: { padding: '15px 36px', fontSize: '1.05rem' },
  }

  const variants = {
    primary: {
      base: {
        background: 'linear-gradient(135deg, #00F5FF, #0080FF)',
        color: '#000',
        border: 'none',
        fontWeight: 700,
      },
      glow: '0 8px 32px rgba(0,245,255,0.4)',
      hoverBg: 'linear-gradient(135deg, #00F5FF, #0060CC)',
    },
    ghost: {
      base: {
        background: 'transparent',
        color: 'rgba(255,255,255,0.88)',
        border: '1px solid rgba(255,255,255,0.15)',
        fontWeight: 500,
      },
      glow: '0 8px 32px rgba(255,255,255,0.08)',
      hoverBg: null,
    },
    violet: {
      base: {
        background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
        color: '#fff',
        border: 'none',
        fontWeight: 700,
      },
      glow: '0 8px 32px rgba(139,92,246,0.4)',
      hoverBg: null,
    },
  }

  const v = variants[variant]
  const s = sizes[size]

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{
        ...v.base,
        ...s,
        borderRadius: '12px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: '"Syne", sans-serif',
        letterSpacing: '0.01em',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        opacity: disabled ? 0.5 : 1,
        position: 'relative',
        overflow: 'hidden',
      }}
      whileHover={
        !disabled
          ? {
              scale: 1.03,
              boxShadow: v.glow,
              transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
            }
          : {}
      }
      whileTap={!disabled ? { scale: 0.97 } : {}}
      {...rest}
    >
      {children}
    </motion.button>
  )
}
