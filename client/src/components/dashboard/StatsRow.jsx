import { motion } from 'framer-motion'
import StatCard from '@components/ui/StatCard'
import useGamificationStore from '@store/gamificationStore'

// ── Icons ─────────────────────────────────────────────────
const XPIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
)
const CoinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
)
const StreakIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
)

/**
 * StatsRow — shows XP, Coins, Streak pulled from gamificationStore
 * which is hydrated from the logged-in user's DB record in App.jsx.
 * Level card and XP-to-next-level removed per design spec.
 */
export default function StatsRow() {
  // Values come from gamificationStore which mirrors the server DB state
  const xp     = useGamificationStore(s => s.xp)
  const coins  = useGamificationStore(s => s.coins)
  const streak = useGamificationStore(s => s.streak)

  const stats = [
    {
      label:  'Total XP',
      value:  xp.toLocaleString(),
      icon:   <XPIcon />,
      accent: '#00F5FF',
      sub:    null,
    },
    {
      label:  'Coins',
      value:  coins.toLocaleString(),
      icon:   <CoinIcon />,
      accent: '#FFB800',
      sub:    null,
    },
    {
      label:  'Streak',
      value:  `${streak} days`,
      icon:   <StreakIcon />,
      accent: '#FF6B35',
      sub:    streak >= 7 ? '🔥 On fire!' : streak > 0 ? `${7 - streak} days to milestone` : 'Start your streak!',
    },
  ]

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ marginBottom: '14px' }}
      >
        <h2 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1.05rem', color: '#fff', margin: 0 }}>
          Your Stats
        </h2>
      </motion.div>

      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
        {stats.map((stat, i) => (
          <div key={stat.label} style={{ flex: '1 1 140px' }}>
            <StatCard
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              accent={stat.accent}
              sub={stat.sub}
              index={i}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
