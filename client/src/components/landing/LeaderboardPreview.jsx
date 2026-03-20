import { motion } from 'framer-motion'
import GlassCard from '@components/ui/GlassCard'

const LEADERS = [
  { rank: 1, name: 'CyberMind', xp: '48,200', subject: 'Mathematics', avatar: 'CM', streak: 34, accent: '#FFB800' },
  { rank: 2, name: 'NightOwl', xp: '41,500', subject: 'Physics', avatar: 'NO', streak: 21, accent: '#C0C0C0' },
  { rank: 3, name: 'QuantumCoder', xp: '38,900', subject: 'Computer Science', avatar: 'QC', streak: 15, accent: '#CD7F32' },
  { rank: 4, name: 'StellarMind', xp: '35,200', subject: 'Chemistry', avatar: 'SM', streak: 9, accent: null },
  { rank: 5, name: 'NovaSpark', xp: '29,800', subject: 'Biology', avatar: 'NS', streak: 7, accent: null },
]

const RANK_COLORS = {
  1: { bg: 'rgba(255,184,0,0.12)', border: 'rgba(255,184,0,0.3)', text: '#FFB800' },
  2: { bg: 'rgba(192,192,192,0.1)', border: 'rgba(192,192,192,0.2)', text: '#C0C0C0' },
  3: { bg: 'rgba(205,127,50,0.1)', border: 'rgba(205,127,50,0.2)', text: '#CD7F32' },
}

function RankBadge({ rank }) {
  const style = RANK_COLORS[rank] || { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', text: 'rgba(255,255,255,0.35)' }
  return (
    <div
      style={{
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        background: style.bg,
        border: `1px solid ${style.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Syne", sans-serif',
        fontWeight: 800,
        fontSize: '0.82rem',
        color: style.text,
        flexShrink: 0,
      }}
    >
      #{rank}
    </div>
  )
}

function AvatarCircle({ initials, accent }) {
  return (
    <div
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: accent
          ? `${accent}20`
          : 'rgba(0,245,255,0.08)',
        border: `1px solid ${accent ? `${accent}40` : 'rgba(0,245,255,0.15)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Syne", sans-serif',
        fontWeight: 700,
        fontSize: '0.72rem',
        color: accent || '#00F5FF',
        flexShrink: 0,
        letterSpacing: '0.02em',
      }}
    >
      {initials}
    </div>
  )
}

export default function LeaderboardPreview() {
  return (
    <section
      id="leaderboard"
      style={{ padding: '100px 24px', position: 'relative' }}
    >
      {/* bg glow */}
      <div
        style={{
          position: 'absolute',
          top: '30%',
          right: '10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(0,245,255,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '60px',
            alignItems: 'center',
          }}
          className="grid-cols-1 lg:grid-cols-2"
        >
          {/* Left — text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255,184,0,0.08)',
                border: '1px solid rgba(255,184,0,0.25)',
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
                  color: '#FFB800',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                Live Rankings
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
                marginBottom: '20px',
              }}
            >
              Compete for
              <br />
              <span
                style={{
                  background: 'linear-gradient(135deg, #FFB800, #FF8C00)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                the top spot.
              </span>
            </h2>
            <p
              style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '1rem',
                color: 'rgba(255,255,255,0.45)',
                lineHeight: 1.7,
                maxWidth: '380px',
              }}
            >
              Global leaderboards reset weekly. Each contest, each level, each
              daily challenge moves your rank. Every point matters.
            </p>

            {/* Stats row */}
            <div
              style={{
                display: 'flex',
                gap: '32px',
                marginTop: '36px',
              }}
            >
              {[
                { value: '12K+', label: 'Active This Week' },
                { value: 'Weekly', label: 'Resets' },
              ].map((s) => (
                <div key={s.label}>
                  <div
                    style={{
                      fontFamily: '"Syne", sans-serif',
                      fontSize: '1.4rem',
                      fontWeight: 800,
                      color: '#FFB800',
                    }}
                  >
                    {s.value}
                  </div>
                  <div
                    style={{
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: '0.8rem',
                      color: 'rgba(255,255,255,0.4)',
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — leaderboard */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <GlassCard style={{ padding: '8px', overflow: 'hidden' }}>
              {/* Table header */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '48px 40px 1fr auto',
                  gap: '12px',
                  padding: '12px 16px',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  alignItems: 'center',
                }}
              >
                {['Rank', '', 'Player', 'XP'].map((h) => (
                  <span
                    key={h}
                    style={{
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.3)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {h}
                  </span>
                ))}
              </div>

              {/* Rows */}
              {LEADERS.map((leader, i) => (
                <motion.div
                  key={leader.rank}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.07, duration: 0.4 }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '48px 40px 1fr auto',
                    gap: '12px',
                    padding: '14px 16px',
                    borderBottom: i < LEADERS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    alignItems: 'center',
                    background: leader.rank === 1 ? 'rgba(255,184,0,0.04)' : 'transparent',
                    borderRadius: leader.rank === 1 ? '10px' : '0',
                    transition: 'background 0.2s',
                  }}
                  whileHover={{ background: 'rgba(255,255,255,0.03)' }}
                >
                  <RankBadge rank={leader.rank} />
                  <AvatarCircle initials={leader.avatar} accent={leader.accent} />

                  <div>
                    <div
                      style={{
                        fontFamily: '"Syne", sans-serif',
                        fontSize: '0.92rem',
                        fontWeight: 700,
                        color: '#fff',
                        marginBottom: '2px',
                      }}
                    >
                      {leader.name}
                    </div>
                    <div
                      style={{
                        fontFamily: '"DM Sans", sans-serif',
                        fontSize: '0.75rem',
                        color: 'rgba(255,255,255,0.35)',
                      }}
                    >
                      {leader.subject} · 🔥 {leader.streak}d
                    </div>
                  </div>

                  <div
                    style={{
                      fontFamily: '"Syne", sans-serif',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: leader.rank === 1 ? '#FFB800' : 'rgba(255,255,255,0.7)',
                      textAlign: 'right',
                    }}
                  >
                    {leader.xp}
                    <span
                      style={{
                        fontFamily: '"DM Sans", sans-serif',
                        fontSize: '0.7rem',
                        fontWeight: 400,
                        color: 'rgba(255,255,255,0.35)',
                        marginLeft: '4px',
                      }}
                    >
                      xp
                    </span>
                  </div>
                </motion.div>
              ))}

              {/* Footer */}
              <div
                style={{
                  padding: '14px 16px',
                  textAlign: 'center',
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <span
                  style={{
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: '0.8rem',
                    color: '#00F5FF',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  View full leaderboard →
                </span>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
