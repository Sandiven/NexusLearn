import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import GlowButton from '@components/ui/GlowButton'
import FloatingStats from './FloatingStats'

// Stagger animation helpers
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
}

// ── Abstract orb / visual element ───────────────────────
function HeroOrb() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '420px' }}>
      {/* Outer ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          inset: '10%',
          border: '1px solid rgba(0,245,255,0.12)',
          borderRadius: '50%',
        }}
      />
      {/* Middle ring */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          inset: '22%',
          border: '1px dashed rgba(139,92,246,0.2)',
          borderRadius: '50%',
        }}
      />
      {/* Inner ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          inset: '34%',
          border: '1px solid rgba(0,128,255,0.15)',
          borderRadius: '50%',
        }}
      />

      {/* Central glow */}
      <div
        style={{
          position: 'absolute',
          inset: '38%',
          background: 'radial-gradient(circle, rgba(0,245,255,0.3) 0%, rgba(0,128,255,0.15) 40%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(8px)',
        }}
      />

      {/* Central hex icon */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <motion.svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <polygon
            points="32,4 56,18 56,46 32,60 8,46 8,18"
            fill="rgba(0,245,255,0.1)"
            stroke="#00F5FF"
            strokeWidth="1.5"
          />
          <polygon
            points="32,16 46,24 46,40 32,48 18,40 18,24"
            fill="rgba(0,245,255,0.08)"
            stroke="#00F5FF"
            strokeWidth="1"
            strokeOpacity="0.5"
          />
          <circle cx="32" cy="32" r="6" fill="#00F5FF" />
        </motion.svg>
      </div>

      {/* Orbiting dots */}
      {[
        { angle: 0, color: '#00F5FF', ring: '10%', size: 6 },
        { angle: 120, color: '#8B5CF6', ring: '22%', size: 5 },
        { angle: 240, color: '#FFB800', ring: '22%', size: 5 },
        { angle: 60, color: '#0080FF', ring: '10%', size: 4 },
      ].map((dot, i) => {
        const rad = (dot.angle * Math.PI) / 180
        const ringPct = parseFloat(dot.ring) / 100
        const r = (1 - ringPct * 2) * 50 // percent of container
        const cx = 50 + r * Math.cos(rad)
        const cy = 50 + r * Math.sin(rad)
        return (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: dot.size,
              height: dot.size,
              borderRadius: '50%',
              background: dot.color,
              left: `${cx}%`,
              top: `${cy}%`,
              boxShadow: `0 0 10px ${dot.color}`,
            }}
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.4,
            }}
          />
        )
      })}
    </div>
  )
}

export default function HeroSection() {
  return (
    <section
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        padding: '100px 24px 60px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background mesh gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 80% 60% at 60% 40%, rgba(0,245,255,0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 20% 80%, rgba(139,92,246,0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '60px',
          alignItems: 'center',
          position: 'relative',
        }}
        className="grid-cols-1 lg:grid-cols-2"
      >
        {/* Left — text content */}
        <motion.div variants={container} initial="hidden" animate="show">
          {/* Badge */}
          <motion.div variants={item}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(0,245,255,0.08)',
                border: '1px solid rgba(0,245,255,0.2)',
                borderRadius: '100px',
                padding: '6px 14px',
                marginBottom: '28px',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#00F5FF',
                  boxShadow: '0 0 8px #00F5FF',
                  display: 'inline-block',
                }}
              />
              <span
                style={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#00F5FF',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Gamified Learning Platform
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={item}
            style={{
              fontFamily: '"Syne", sans-serif',
              fontSize: 'clamp(2.6rem, 5.5vw, 4.2rem)',
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              color: '#fff',
              marginBottom: '20px',
            }}
          >
            Level Up Your
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #00F5FF 0%, #0080FF 50%, #8B5CF6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Learning.
            </span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            variants={item}
            style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
              fontWeight: 400,
              color: 'rgba(255,255,255,0.55)',
              lineHeight: 1.7,
              marginBottom: '40px',
              maxWidth: '420px',
            }}
          >
            Master subjects through structured levels, daily challenges, and
            real-time competitions. Earn XP, climb leaderboards, beat your friends.
          </motion.p>

          {/* Buttons */}
          <motion.div
            variants={item}
            style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}
          >
            <Link to="/signup">
              <GlowButton variant="primary" size="lg">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
                Start Learning
              </GlowButton>
            </Link>
            <a href="#features">
              <GlowButton variant="ghost" size="lg">
                See Features
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </GlowButton>
            </a>
          </motion.div>

          {/* Social proof strip */}
          <motion.div
            variants={item}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              marginTop: '48px',
              paddingTop: '24px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {[
              { value: '40K+', label: 'Learners' },
              { value: '200+', label: 'Subjects' },
              { value: '98%', label: 'Completion Rate' },
            ].map((stat) => (
              <div key={stat.label}>
                <div
                  style={{
                    fontFamily: '"Syne", sans-serif',
                    fontWeight: 800,
                    fontSize: '1.3rem',
                    color: '#fff',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: '0.78rem',
                    color: 'rgba(255,255,255,0.4)',
                    fontWeight: 500,
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right — orb + floating cards */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
          style={{ position: 'relative', height: '480px' }}
          className="hidden lg:block"
        >
          <HeroOrb />
          <FloatingStats />
        </motion.div>
      </div>
    </section>
  )
}
