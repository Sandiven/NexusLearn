import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import GlowButton from '@components/ui/GlowButton'

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Leaderboard', href: '#leaderboard' },
]

// ── Logo mark ────────────────────────────────────────────
function NexusLogo() {
  return (
    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
      {/* Geometric hex logo */}
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <polygon
          points="16,2 28,9 28,23 16,30 4,23 4,9"
          fill="none"
          stroke="#00F5FF"
          strokeWidth="1.5"
        />
        <polygon
          points="16,8 23,12 23,20 16,24 9,20 9,12"
          fill="rgba(0,245,255,0.12)"
          stroke="#00F5FF"
          strokeWidth="1"
          strokeOpacity="0.6"
        />
        <circle cx="16" cy="16" r="3" fill="#00F5FF" />
      </svg>
      <span
        style={{
          fontFamily: '"Syne", sans-serif',
          fontWeight: 800,
          fontSize: '1.15rem',
          letterSpacing: '-0.02em',
          color: '#fff',
        }}
      >
        NEXUS<span style={{ color: '#00F5FF' }}>LEARN</span>
      </span>
    </Link>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleAnchor = (e, href) => {
    e.preventDefault()
    setMobileOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: '0 24px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: scrolled ? 'rgba(15,15,20,0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(24px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(24px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
          transition: 'background 0.35s ease, border-color 0.35s ease, backdrop-filter 0.35s ease',
        }}
      >
        <NexusLogo />

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '36px' }} className="hidden md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleAnchor(e, link.href)}
              style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: 'rgba(255,255,255,0.6)',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
                position: 'relative',
              }}
              onMouseEnter={e => (e.target.style.color = '#00F5FF')}
              onMouseLeave={e => (e.target.style.color = 'rgba(255,255,255,0.6)')}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className="hidden md:flex">
          <Link to="/login">
            <GlowButton variant="ghost" size="sm">Log In</GlowButton>
          </Link>
          <Link to="/signup">
            <GlowButton variant="primary" size="sm">Get Started</GlowButton>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
          }}
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              animate={
                mobileOpen
                  ? i === 0
                    ? { rotate: 45, y: 10 }
                    : i === 1
                    ? { opacity: 0, scaleX: 0 }
                    : { rotate: -45, y: -10 }
                  : { rotate: 0, y: 0, opacity: 1, scaleX: 1 }
              }
              style={{
                display: 'block',
                width: '22px',
                height: '2px',
                background: 'rgba(255,255,255,0.8)',
                borderRadius: '2px',
                transformOrigin: 'center',
              }}
            />
          ))}
        </button>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'fixed',
              top: '64px',
              left: 0,
              right: 0,
              zIndex: 99,
              background: 'rgba(15,15,20,0.96)',
              backdropFilter: 'blur(24px)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              padding: '20px 24px 28px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleAnchor(e, link.href)}
                  style={{
                    fontFamily: '"Syne", sans-serif',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.8)',
                    textDecoration: 'none',
                  }}
                >
                  {link.label}
                </a>
              ))}
              <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                <Link to="/login" style={{ flex: 1 }}>
                  <GlowButton variant="ghost" style={{ width: '100%', justifyContent: 'center' }}>
                    Log In
                  </GlowButton>
                </Link>
                <Link to="/signup" style={{ flex: 1 }}>
                  <GlowButton variant="primary" style={{ width: '100%', justifyContent: 'center' }}>
                    Get Started
                  </GlowButton>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
