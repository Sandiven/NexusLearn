import { motion } from 'framer-motion'

const STEPS = [
  {
    number: '01',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    title: 'Learn',
    description: 'Pick a subject and work through structured levels at your own pace.',
    accent: '#00F5FF',
  },
  {
    number: '02',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    title: 'Practice',
    description: 'Reinforce knowledge with daily challenges and timed drills that sharpen recall.',
    accent: '#FFB800',
  },
  {
    number: '03',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
    ),
    title: 'Compete',
    description: 'Enter contests and 1v1 battles. Test your edge against learners worldwide.',
    accent: '#8B5CF6',
  },
  {
    number: '04',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
    ),
    title: 'Earn Rewards',
    description: 'XP, coins, achievements, and badges. Progress that means something.',
    accent: '#00FF88',
  },
]

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      style={{
        padding: '100px 24px',
        position: 'relative',
        background: 'rgba(255,255,255,0.01)',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: '72px' }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(0,245,255,0.08)',
              border: '1px solid rgba(0,245,255,0.2)',
              borderRadius: '100px',
              padding: '6px 14px',
              marginBottom: '20px',
            }}
          >
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
              The Loop
            </span>
          </div>
          <h2
            style={{
              fontFamily: '"Syne", sans-serif',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 800,
              color: '#fff',
              letterSpacing: '-0.025em',
              lineHeight: 1.1,
              marginBottom: '16px',
            }}
          >
            How it works
          </h2>
          <p
            style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '1rem',
              color: 'rgba(255,255,255,0.45)',
              maxWidth: '420px',
              margin: '0 auto',
            }}
          >
            Four simple steps. One powerful loop that keeps you coming back.
          </p>
        </motion.div>

        {/* Steps */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '0',
            position: 'relative',
          }}
        >
          {/* Connector line */}
          <div
            className="hidden lg:block"
            style={{
              position: 'absolute',
              top: '52px',
              left: '12.5%',
              right: '12.5%',
              height: '1px',
              background: 'linear-gradient(90deg, rgba(0,245,255,0.3), rgba(139,92,246,0.3), rgba(0,255,136,0.3))',
              zIndex: 0,
            }}
          />

          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                padding: '0 24px',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {/* Step circle */}
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: `${step.accent}12`,
                  border: `1.5px solid ${step.accent}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: step.accent,
                  marginBottom: '24px',
                  position: 'relative',
                  boxShadow: `0 0 32px ${step.accent}18`,
                }}
              >
                {step.icon}
                {/* Step number badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: step.accent,
                    color: '#000',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    fontFamily: '"Syne", sans-serif',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {i + 1}
                </div>
              </div>

              <h3
                style={{
                  fontFamily: '"Syne", sans-serif',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: '#fff',
                  marginBottom: '10px',
                  letterSpacing: '-0.01em',
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: '0.88rem',
                  color: 'rgba(255,255,255,0.45)',
                  lineHeight: 1.65,
                  maxWidth: '200px',
                }}
              >
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
