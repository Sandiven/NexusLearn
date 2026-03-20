import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import GlowButton from '@components/ui/GlowButton'

export default function CTASection() {
  return (
    <section
      style={{
        padding: '120px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background orb glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,245,255,0.06) 0%, rgba(139,92,246,0.04) 50%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Decorative grid lines */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(0,245,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.03) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          pointerEvents: 'none',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 80%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        style={{
          maxWidth: '700px',
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* Badge */}
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
          <motion.span
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#00F5FF',
              display: 'inline-block',
            }}
          />
          <span
            style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#00F5FF',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            Free to start
          </span>
        </div>

        {/* Headline */}
        <h2
          style={{
            fontFamily: '"Syne", sans-serif',
            fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-0.03em',
            lineHeight: 1.06,
            marginBottom: '20px',
          }}
        >
          Start your
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #00F5FF 0%, #0080FF 50%, #8B5CF6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            learning adventure.
          </span>
        </h2>

        <p
          style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '1.05rem',
            color: 'rgba(255,255,255,0.45)',
            lineHeight: 1.7,
            marginBottom: '44px',
            maxWidth: '440px',
            margin: '0 auto 44px',
          }}
        >
          Join thousands of learners who earn XP, compete globally,
          and actually enjoy studying. No credit card needed.
        </p>

        {/* Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '14px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Link to="/signup">
            <GlowButton variant="primary" size="lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              Start Learning — It's Free
            </GlowButton>
          </Link>
        </div>

        {/* Trust strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            marginTop: '48px',
            flexWrap: 'wrap',
          }}
        >
          {[
            { icon: '✓', text: 'No credit card' },
            { icon: '✓', text: 'Free tier forever' },
            { icon: '✓', text: 'Cancel anytime' },
          ].map((item) => (
            <div
              key={item.text}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '0.85rem',
                color: 'rgba(255,255,255,0.4)',
              }}
            >
              <span style={{ color: '#00FF88', fontWeight: 700 }}>{item.icon}</span>
              {item.text}
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
