import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import GlowButton from '@components/ui/GlowButton'
import InputField from '@components/ui/InputField'
import { useAuth } from '@features/auth/useAuth'

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
}
const cardVariants = {
  initial: { opacity: 0, y: 32, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1], delay: 0.1 } },
}
const formContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } },
}
const formItem = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
}

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)
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

function Spinner() {
  return (
    <motion.svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
    >
      <circle cx="12" cy="12" r="10" stroke="rgba(0,0,0,0.3)" strokeWidth="3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="#000" strokeWidth="3" strokeLinecap="round" />
    </motion.svg>
  )
}

// Password strength meter
function StrengthMeter({ password }) {
  const getStrength = (pw) => {
    if (!pw) return { score: 0, label: '', color: 'transparent' }
    let score = 0
    if (pw.length >= 8)  score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    const map = [
      { label: '',        color: 'transparent' },
      { label: 'Weak',    color: '#FF5050' },
      { label: 'Fair',    color: '#FFB800' },
      { label: 'Good',    color: '#0080FF' },
      { label: 'Strong',  color: '#00FF88' },
    ]
    return { score, ...map[score] }
  }

  const { score, label, color } = getStrength(password)

  if (!password) return null

  return (
    <div style={{ marginTop: '6px' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            animate={{ background: i <= score ? color : 'rgba(255,255,255,0.1)' }}
            transition={{ duration: 0.25 }}
            style={{ flex: 1, height: '3px', borderRadius: '2px' }}
          />
        ))}
      </div>
      {label && (
        <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', color, fontWeight: 600 }}>
          {label} password
        </span>
      )}
    </div>
  )
}

export default function SignupPage() {
  const { signup, loading, error, clearError } = useAuth()
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' })
  const [fieldErrors, setFieldErrors] = useState({})

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: '' }))
    if (error) clearError()
  }

  const validate = () => {
    const errs = {}
    if (!form.username)
      errs.username = 'Username is required'
    else if (form.username.length < 3)
      errs.username = 'At least 3 characters'
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username))
      errs.username = 'Letters, numbers, underscores only'

    if (!form.email)
      errs.email = 'Email is required'
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      errs.email = 'Enter a valid email'

    if (!form.password)
      errs.password = 'Password is required'
    else if (form.password.length < 8)
      errs.password = 'At least 8 characters'

    if (!form.confirmPassword)
      errs.confirmPassword = 'Please confirm your password'
    else if (form.password !== form.confirmPassword)
      errs.confirmPassword = 'Passwords do not match'

    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    await signup(form)
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
      {/* BG glows */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 50% at 70% 20%, rgba(139,92,246,0.06) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 20% 80%, rgba(0,128,255,0.05) 0%, transparent 70%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(139,92,246,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.02) 1px, transparent 1px)',
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
          maxWidth: '460px',
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
        {/* Top accent — violet for signup */}
        <div style={{
          position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.6), transparent)',
        }} />

        {/* Logo */}
        <motion.div variants={formItem} initial="hidden" animate="show" style={{ textAlign: 'center', marginBottom: '28px' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
              <polygon points="16,2 28,9 28,23 16,30 4,23 4,9" fill="none" stroke="#8B5CF6" strokeWidth="1.5" />
              <polygon points="16,8 23,12 23,20 16,24 9,20 9,12" fill="rgba(139,92,246,0.12)" stroke="#8B5CF6" strokeWidth="1" strokeOpacity="0.6" />
              <circle cx="16" cy="16" r="3" fill="#8B5CF6" />
            </svg>
            <span style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#fff', letterSpacing: '-0.02em' }}>
              NEXUS<span style={{ color: '#8B5CF6' }}>LEARN</span>
            </span>
          </Link>
        </motion.div>

        {/* Heading */}
        <motion.div variants={formContainer} initial="hidden" animate="show">
          <motion.div variants={formItem} style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h1 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.7rem', color: '#fff', letterSpacing: '-0.025em', marginBottom: '6px' }}>
              Join Nexus Learn
            </h1>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.45)' }}>
              Create your account and start levelling up
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
              <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.88rem', color: '#FF5050' }}>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <motion.div variants={formItem}>
              <InputField
                label="Username"
                type="text"
                value={form.username}
                onChange={handleChange('username')}
                placeholder="your_username"
                error={fieldErrors.username}
                icon={<UserIcon />}
                autoComplete="username"
                name="username"
                accentColor="#8B5CF6"
                disabled={loading}
              />
            </motion.div>

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
                accentColor="#8B5CF6"
                disabled={loading}
              />
            </motion.div>

            <motion.div variants={formItem}>
              <InputField
                label="Password"
                type="password"
                value={form.password}
                onChange={handleChange('password')}
                placeholder="Min. 8 characters"
                error={fieldErrors.password}
                icon={<LockIcon />}
                autoComplete="new-password"
                name="password"
                accentColor="#8B5CF6"
                disabled={loading}
              />
              <StrengthMeter password={form.password} />
            </motion.div>

            <motion.div variants={formItem}>
              <InputField
                label="Confirm Password"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange('confirmPassword')}
                placeholder="Repeat your password"
                error={fieldErrors.confirmPassword}
                icon={<LockIcon />}
                autoComplete="new-password"
                name="confirmPassword"
                accentColor="#8B5CF6"
                disabled={loading}
              />
            </motion.div>

            {/* Terms note */}
            <motion.p
              variants={formItem}
              style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center', margin: 0 }}
            >
              By signing up, you agree to our{' '}
              <span style={{ color: '#8B5CF6', cursor: 'pointer' }}>Terms</span>
              {' '}and{' '}
              <span style={{ color: '#8B5CF6', cursor: 'pointer' }}>Privacy Policy</span>.
            </motion.p>

            {/* Submit */}
            <motion.div variants={formItem}>
              <GlowButton
                type="submit"
                variant="violet"
                size="md"
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <SpinnerViolet />
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </GlowButton>
            </motion.div>
          </form>

          {/* Divider */}
          <motion.div variants={formItem} style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)' }}>
              Already have an account?
            </span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
          </motion.div>

          <motion.div variants={formItem}>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <GlowButton variant="ghost" size="md" style={{ width: '100%', justifyContent: 'center' }}>
                Sign In
              </GlowButton>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

function SpinnerViolet() {
  return (
    <motion.svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
    >
      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    </motion.svg>
  )
}
