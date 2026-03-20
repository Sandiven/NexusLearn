import { useState } from 'react'
import { motion } from 'framer-motion'

/**
 * InputField
 * @param {string}    label
 * @param {string}    type       — 'text' | 'email' | 'password'
 * @param {string}    value
 * @param {function}  onChange
 * @param {string}    placeholder
 * @param {string}    error      — error message string
 * @param {ReactNode} icon       — optional left icon SVG
 * @param {string}    accentColor — focus ring colour
 * @param {boolean}   disabled
 */
export default function InputField({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  icon,
  accentColor = '#00F5FF',
  disabled = false,
  autoComplete,
  name,
}) {
  const [focused, setFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {/* Label */}
      {label && (
        <label
          style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </label>
      )}

      {/* Input wrapper */}
      <motion.div
        animate={{
          boxShadow: error
            ? '0 0 0 1.5px rgba(255,80,80,0.6), 0 0 16px rgba(255,80,80,0.1)'
            : focused
            ? `0 0 0 1.5px ${accentColor}99, 0 0 20px ${accentColor}22`
            : '0 0 0 1px rgba(255,255,255,0.08)',
        }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'relative',
          borderRadius: '12px',
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          overflow: 'hidden',
        }}
      >
        {/* Left icon */}
        {icon && (
          <div
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: focused ? accentColor : 'rgba(255,255,255,0.3)',
              transition: 'color 0.2s ease',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {icon}
          </div>
        )}

        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          name={name}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            padding: icon ? '14px 44px 14px 44px' : '14px 44px 14px 16px',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '0.95rem',
            color: disabled ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.92)',
            cursor: disabled ? 'not-allowed' : 'text',
          }}
        />

        {/* Show/hide password toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: 'rgba(255,255,255,0.35)',
              display: 'flex',
              alignItems: 'center',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = accentColor)}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
          >
            {showPassword ? (
              // Eye-off
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              // Eye
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </motion.div>

      {/* Error message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '0.78rem',
            color: '#FF5050',
            margin: 0,
          }}
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}
