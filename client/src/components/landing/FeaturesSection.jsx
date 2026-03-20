import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import GlassCard from '@components/ui/GlassCard'

const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00F5FF" strokeWidth="1.8">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    title: 'Level-Based Learning',
    description: 'Progress through carefully structured levels that build knowledge systematically. Unlock advanced content as you master the basics.',
    accent: '#00F5FF',
    glow: 'rgba(0,245,255,0.12)',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFB800" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    title: 'Daily Challenges',
    description: 'New challenges every day to keep your streak alive. Short, focused sessions that fit into any schedule.',
    accent: '#FFB800',
    glow: 'rgba(255,184,0,0.12)',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="1.8">
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
    ),
    title: 'Contest Leaderboards',
    description: 'Compete in timed contests against learners globally. See your ranking update in real time as scores pour in.',
    accent: '#8B5CF6',
    glow: 'rgba(139,92,246,0.12)',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0080FF" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: 'Friend Battles',
    description: 'Challenge friends to 1v1 real-time knowledge duels. Answer faster and score higher to claim victory.',
    accent: '#0080FF',
    glow: 'rgba(0,128,255,0.12)',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00FF88" strokeWidth="1.8">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
    ),
    title: 'XP Rewards System',
    description: 'Every question answered, streak maintained, and contest won earns XP and coins. Spend them in the store or flex your rank.',
    accent: '#00FF88',
    glow: 'rgba(0,255,136,0.12)',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00F5FF" strokeWidth="1.8">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Achievements & Streaks',
    description: 'Unlock achievements for milestones — 7-day streaks, perfect scores, contest wins. Show off your badges on your profile.',
    accent: '#00F5FF',
    glow: 'rgba(0,245,255,0.12)',
  },
]

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1], delay: i * 0.08 },
  }),
}

function FeatureCard({ feature, index }) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
    >
      <GlassCard
        hoverable
        glowColor={feature.glow}
        style={{
          padding: '28px',
          height: '100%',
          cursor: 'default',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle top accent line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '20%',
            right: '20%',
            height: '1px',
            background: `linear-gradient(90deg, transparent, ${feature.accent}66, transparent)`,
          }}
        />

        {/* Icon container */}
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: `${feature.accent}12`,
            border: `1px solid ${feature.accent}30`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '18px',
          }}
        >
          {feature.icon}
        </div>

        <h3
          style={{
            fontFamily: '"Syne", sans-serif',
            fontSize: '1.05rem',
            fontWeight: 700,
            color: '#fff',
            marginBottom: '10px',
            letterSpacing: '-0.01em',
          }}
        >
          {feature.title}
        </h3>
        <p
          style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '0.88rem',
            lineHeight: 1.65,
            color: 'rgba(255,255,255,0.5)',
          }}
        >
          {feature.description}
        </p>
      </GlassCard>
    </motion.div>
  )
}

export default function FeaturesSection() {
  return (
    <section
      id="features"
      style={{
        padding: '100px 24px',
        position: 'relative',
      }}
    >
      {/* Background accent */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '300px',
          background: 'radial-gradient(ellipse, rgba(139,92,246,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: '64px' }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(139,92,246,0.1)',
              border: '1px solid rgba(139,92,246,0.25)',
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
                color: '#8B5CF6',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              Platform Features
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
            Everything you need
            <br />
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>to master anything.</span>
          </h2>
          <p
            style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '1rem',
              color: 'rgba(255,255,255,0.45)',
              maxWidth: '480px',
              margin: '0 auto',
              lineHeight: 1.7,
            }}
          >
            Built for learners who want more than passive reading. 
            Compete, progress, and earn while you study.
          </p>
        </motion.div>

        {/* Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px',
          }}
        >
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
