import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import GlowButton from '@components/ui/GlowButton'
import InputField from '@components/ui/InputField'
import { useAuth } from '@features/auth/useAuth'

// ── Page entrance animation ──────────────────────────────
const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
}

// ── Card entrance animation ──────────────────────────────
const cardVariants = {
  initial: { opacity: 0, y: 32, scale: 0.97 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1], delay: 0.1 },
  },
}

// ── Stagger children ──────────────────────────────────────
const formContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.25 } },
}
const formItem = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
}

// ── Inline SVG icons ──────────────────────────────────────
const EmailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
)
const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

export default function LoginPage() {
  const { login, loading, error, clearError } = useAuth()

  const [form, setForm] = useState({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({})

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: '' }))
    if (error) clearError()
  }

  const validate = () => {
    const errs = {}
    if (!form.email)    errs.email    = 'Email is required'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.password) errs.password = 'Password is required'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    await login({ email: form.email, password: form.password })
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0F0F14 0%, #12121A 60%, #1A1A24 100%)',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glows */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 50% at 30% 30%, rgba(0,245,255,0.05) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 70% 70%, rgba(139,92,246,0.05) 0%, transparent 70%)',
      }} />

      {/* Subtle grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(0,245,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.025) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 80%)',
        WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 80%)',
      }} />

      {/* Card */}
      <motion.div
        variants={cardVariants}
        initial="initial"
        animate="animate"
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px',
          padding: '40px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top accent line */}
        <div style={{
          position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.5), transparent)',
        }} />

        {/* Logo */}
        <motion.div variants={formItem} initial="hidden" animate="show" style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
              <polygon points="16,2 28,9 28,23 16,30 4,23 4,9" fill="none" stroke="#00F5FF" strokeWidth="1.5" />
              <polygon points="16,8 23,12 23,20 16,24 9,20 9,12" fill="rgba(0,245,255,0.12)" stroke="#00F5FF" strokeWidth="1" strokeOpacity="0.6" />
              <circle cx="16" cy="16" r="3" fill="#00F5FF" />
            </svg>
            <span style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#fff', letterSpacing: '-0.02em' }}>
              NEXUS<span style={{ color: '#00F5FF' }}>LEARN</span>
            </span>
          </Link>
        </motion.div>

        {/* Heading */}
        <motion.div variants={formContainer} initial="hidden" animate="show">
          <motion.div variants={formItem} style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h1 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.7rem', color: '#fff', letterSpacing: '-0.025em', marginBottom: '6px' }}>
              Welcome back
            </h1>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.45)' }}>
              Continue your learning journey
            </p>
          </motion.div>

          {/* Global error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(255,80,80,0.1)',
                border: '1px solid rgba(255,80,80,0.25)',
                borderRadius: '10px',
                padding: '12px 16px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF5050" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.88rem', color: '#FF5050' }}>
                {error}
              </span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <motion.div variants={formItem}>
              <InputField
                label="Email"
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                placeholder="you@example.com"
                error={fieldErrors.email}
                icon={<EmailIcon />}
                autoComplete="email"
                name="email"
                disabled={loading}
              />
            </motion.div>

            <motion.div variants={formItem}>
              <InputField
                label="Password"
                type="password"
                value={form.password}
                onChange={handleChange('password')}
                placeholder="Your password"
                error={fieldErrors.password}
                icon={<LockIcon />}
                autoComplete="current-password"
                name="password"
                disabled={loading}
              />
            </motion.div>

            {/* Forgot password */}
            <motion.div variants={formItem} style={{ textAlign: 'right', marginTop: '-6px' }}>
              <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem', color: '#00F5FF', cursor: 'pointer' }}>
                Forgot password?
              </span>
            </motion.div>

            {/* Submit */}
            <motion.div variants={formItem} style={{ marginTop: '4px' }}>
              <GlowButton
                type="submit"
                variant="primary"
                size="md"
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Spinner />
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </GlowButton>
            </motion.div>
          </form>

          {/* Divider */}
          <motion.div variants={formItem} style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)' }}>
              New to Nexus?
            </span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
          </motion.div>

          {/* Sign up link */}
          <motion.div variants={formItem}>
            <Link to="/signup" style={{ textDecoration: 'none' }}>
              <GlowButton
                variant="ghost"
                size="md"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Create an account
              </GlowButton>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

// ── Inline spinner ────────────────────────────────────────
function Spinner() {
  return (
    <motion.svg
      width="16" height="16" viewBox="0 0 24 24" fill="none"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
    >
      <circle cx="12" cy="12" r="10" stroke="rgba(0,0,0,0.3)" strokeWidth="3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="#000" strokeWidth="3" strokeLinecap="round" />
    </motion.svg>
  )
}
