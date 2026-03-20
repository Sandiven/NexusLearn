import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Navigate, Link } from 'react-router-dom'
import useAuthStore from '@store/authStore'
import useGamificationStore from '@store/gamificationStore'
import DashboardNavbar from '@components/layout/DashboardNavbar'
import Sidebar from '@components/layout/Sidebar'
import AvatarAssistant from '@components/avatar/AvatarAssistant'
import XPProgressBar from '@features/gamification/components/XPProgressBar'
import TierBadge from '@features/leaderboard/components/TierBadge'
import { getTier } from '@/data/leaderboardData'
import api from '@services/api'
import { SUBJECT_ACCENTS } from '@/data/levelData'
import eventBus, { EVENTS } from '@/eventBus'
import { ACHIEVEMENTS as BASE_ACHIEVEMENTS } from '@/data/achievementsData'
import { PROBLEMS } from '@/data/problemsData'

// ── Problem totals derived from the static data file ──────
const TOTAL_ALL    = PROBLEMS.length
const TOTAL_EASY   = PROBLEMS.filter(p => p.difficulty === 'easy').length
const TOTAL_MEDIUM = PROBLEMS.filter(p => p.difficulty === 'medium').length
const TOTAL_HARD   = PROBLEMS.filter(p => p.difficulty === 'hard').length

const PLAN_ACHIEVEMENTS = [
  { key: 'js_foundations', name: 'JS Founder',    desc: 'Completed the JavaScript Foundations plan.',       icon: '🏅', category: 'special', rarity: 'rare',  xpReward: 500,  coinReward: 50,  badgeColor: '#FFB800' },
  { key: 'dsa_master',     name: 'DSA Master',    desc: 'Completed the DSA Mastery plan (150 questions).', icon: '🏅', category: 'special', rarity: 'epic',  xpReward: 1500, coinReward: 150, badgeColor: '#00F5FF' },
  { key: 'db_expert',      name: 'DB Expert',     desc: 'Completed the Database Deep Dive plan.',          icon: '🏅', category: 'special', rarity: 'rare',  xpReward: 750,  coinReward: 75,  badgeColor: '#0080FF' },
  { key: 'algo_sprinter',  name: 'Algo Sprinter', desc: 'Completed the Algorithm Sprint plan.',            icon: '🏅', category: 'special', rarity: 'epic',  xpReward: 1000, coinReward: 100, badgeColor: '#8B5CF6' },
  { key: 'os_pro',         name: 'OS Pro',        desc: 'Completed the OS Essentials plan.',               icon: '🏅', category: 'special', rarity: 'rare',  xpReward: 600,  coinReward: 60,  badgeColor: '#00FF88' },
]
const ALL_ACHIEVEMENTS = [...BASE_ACHIEVEMENTS, ...PLAN_ACHIEVEMENTS]

const FALLBACK_SUBJECTS = [
  { name: 'Data Structures',   slug: 'data-structures',   accent: '#00F5FF', completed: 0, total: 10, xp: 0 },
  { name: 'Algorithms',        slug: 'algorithms',        accent: '#8B5CF6', completed: 0, total: 10, xp: 0 },
  { name: 'Databases',         slug: 'databases',         accent: '#0080FF', completed: 0, total: 10, xp: 0 },
  { name: 'Operating Systems', slug: 'operating-systems', accent: '#FFB800', completed: 0, total: 10, xp: 0 },
  { name: 'Networks',          slug: 'networks',          accent: '#00FF88', completed: 0, total: 10, xp: 0 },
  { name: 'System Design',     slug: 'system-design',     accent: '#FF6B35', completed: 0, total: 10, xp: 0 },
]

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.35 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
}

// ── Solved Problems Stats Card ────────────────────────────
function SolvedStatsCard({ solvedData, loading }) {
  const { solved, total } = solvedData
  const solvedPct = total.all > 0 ? Math.round((solved.all / total.all) * 100) : 0

  const rows = [
    { label: 'Easy',   color: '#00FF88', bgColor: 'rgba(0,255,136,0.08)', solved: solved.easy,   total: total.easy },
    { label: 'Medium', color: '#FFB800', bgColor: 'rgba(255,184,0,0.08)', solved: solved.medium, total: total.medium },
    { label: 'Hard',   color: '#FF6B6B', bgColor: 'rgba(255,107,107,0.08)', solved: solved.hard, total: total.hard },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.4), transparent)' }} />
      <h3 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1rem', color: '#fff', marginBottom: '20px' }}>
        Problems Solved
      </h3>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1,2,3,4].map(i => <div key={i} style={{ height: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', width: `${60 + i * 10}%` }} />)}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Circle */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ position: 'relative', width: '100px', height: '100px' }}>
              <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
                <motion.circle
                  cx="50" cy="50" r="40" fill="none"
                  stroke="#00F5FF" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - solvedPct / 100) }}
                  transition={{ duration: 1, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.3rem', color: '#00F5FF', lineHeight: 1 }}>{solved.all}</span>
                <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>/ {total.all}</span>
              </div>
            </div>
            <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginTop: '8px' }}>
              {solvedPct}% solved
            </span>
          </div>

          {/* Per-difficulty bars */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', minWidth: '160px', justifyContent: 'center' }}>
            {rows.map(r => {
              const pct = r.total > 0 ? (r.solved / r.total) * 100 : 0
              return (
                <div key={r.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', fontWeight: 700, color: r.color }}>{r.label}</span>
                    <span style={{ fontFamily: '"Syne", sans-serif', fontSize: '0.78rem', fontWeight: 700, color: '#fff' }}>
                      {r.solved} <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>/ {r.total}</span>
                    </span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.07)', borderRadius: '3px', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.9, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
                      style={{ height: '100%', background: `linear-gradient(90deg, ${r.color}80, ${r.color})`, borderRadius: '3px' }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </motion.div>
  )
}

// ── XP Activity Graph (real, per-user) ───────────────────
function XPActivityGraph({ xpHistory, loading }) {
  const maxXP = Math.max(...xpHistory.map(d => d.xp), 1)
  const totalWeekXP = xpHistory.reduce((s, d) => s + d.xp, 0)
  const activeDays  = xpHistory.filter(d => d.xp > 0).length

  // Show last 7 entries as "this week"
  const weekSlice = xpHistory.slice(-7)
  const maxWeek   = Math.max(...weekSlice.map(d => d.xp), 1)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h3 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1rem', color: '#fff', margin: 0 }}>XP Activity</h3>
        <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>Last 7 days</span>
      </div>

      {loading ? (
        <div style={{ height: '80px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px' }} />
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '80px' }}>
            {weekSlice.map((d, i) => (
              <div key={d.date || i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.xp / maxWeek) * 64}px` }}
                  transition={{ duration: 0.7, delay: i * 0.07, ease: [0.4, 0, 0.2, 1] }}
                  title={`${d.xp} XP`}
                  style={{
                    width: '100%', borderRadius: '4px 4px 2px 2px', minHeight: d.xp > 0 ? '6px' : '3px',
                    background: d.xp > 0 ? 'linear-gradient(180deg, #00F5FF, #00F5FF80)' : 'rgba(255,255,255,0.08)',
                    boxShadow: d.xp > 0 ? '0 0 10px rgba(0,245,255,0.3)' : 'none',
                  }}
                />
                <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.65rem', color: d.xp > 0 ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)' }}>{d.day}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
            <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
              {activeDays}/{weekSlice.length} active days
            </span>
            <span style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.82rem', color: '#00F5FF' }}>
              {totalWeekXP.toLocaleString()} XP earned
            </span>
          </div>
        </>
      )}
    </motion.div>
  )
}

// ── Streak Calendar (LeetCode-style heatmap) ─────────────
function StreakCalendar({ calendarData, loading }) {
  const { days = [], activeDays = 0, currentStreak = 0, bestStreak = 0 } = calendarData

  // Group days by week columns (Sun-Sat), Sunday first
  const weeks = useMemo(() => {
    if (!days.length) return []
    // Find the first Sunday on or before days[0]
    const startDate = new Date(days[0].date + 'T00:00:00Z')
    const dayOfWeek = startDate.getUTCDay() // 0=Sun
    const paddedDays = [
      ...Array(dayOfWeek).fill(null),
      ...days,
    ]
    const result = []
    for (let i = 0; i < paddedDays.length; i += 7) {
      result.push(paddedDays.slice(i, i + 7))
    }
    return result
  }, [days])

  // Month labels: figure out which column each month starts at
  const monthLabels = useMemo(() => {
    const labels = []
    let lastMonth = null
    weeks.forEach((week, wi) => {
      for (const d of week) {
        if (!d) continue
        const month = d.date.slice(0, 7) // YYYY-MM
        if (month !== lastMonth) {
          lastMonth = month
          const dt = new Date(d.date + 'T00:00:00Z')
          labels.push({ col: wi, label: dt.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }) })
          break
        }
      }
    })
    return labels
  }, [weeks])

  // Color intensity based on solve count
  const getCellColor = (count) => {
    if (!count || count === 0) return 'rgba(255,255,255,0.06)'
    if (count === 1) return 'rgba(0,245,255,0.25)'
    if (count === 2) return 'rgba(0,245,255,0.45)'
    if (count <= 4) return 'rgba(0,245,255,0.65)'
    return 'rgba(0,245,255,0.9)'
  }

  const DOW_LABELS = ['Sun', '', 'Tue', '', 'Thu', '', 'Sat']

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1rem', color: '#fff', margin: 0, marginBottom: '2px' }}>
            Activity Calendar
          </h3>
          {!loading && days.length > 0 && (
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
              {activeDays} active day{activeDays !== 1 ? 's' : ''} in the past year
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          {[
            { label: 'Current', value: `${currentStreak}d`, color: '#FF6B35' },
            { label: 'Best',    value: `${bestStreak}d`,    color: '#00FF88' },
            { label: 'Active',  value: `${activeDays}`,     color: '#00F5FF' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1rem', color: s.color }}>{s.value}</div>
              <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.63rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ height: '90px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px' }} />
      ) : days.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px', color: 'rgba(255,255,255,0.25)', fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem' }}>
          No activity yet. Start solving problems to build your streak!
        </div>
      ) : (
        <div style={{ overflowX: 'auto', paddingBottom: '4px' }}>
          <div style={{ display: 'flex', gap: '3px', position: 'relative', minWidth: 'max-content' }}>
            {/* DOW labels on left */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '18px', marginRight: '4px', flexShrink: 0 }}>
              {DOW_LABELS.map((l, i) => (
                <div key={i} style={{ height: '11px', fontFamily: '"DM Sans", sans-serif', fontSize: '0.6rem', color: l ? 'rgba(255,255,255,0.25)' : 'transparent', lineHeight: '11px' }}>
                  {l}
                </div>
              ))}
            </div>

            {/* Grid columns */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Month labels row */}
              <div style={{ display: 'flex', gap: '3px', marginBottom: '4px', height: '14px', position: 'relative' }}>
                {weeks.map((_, wi) => {
                  const ml = monthLabels.find(m => m.col === wi)
                  return (
                    <div key={wi} style={{ width: '11px', flexShrink: 0, position: 'relative' }}>
                      {ml && (
                        <span style={{ position: 'absolute', left: 0, fontFamily: '"DM Sans", sans-serif', fontSize: '0.62rem', color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap' }}>
                          {ml.label}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Week columns */}
              <div style={{ display: 'flex', gap: '3px' }}>
                {weeks.map((week, wi) => (
                  <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {Array(7).fill(null).map((_, di) => {
                      const cell = week[di]
                      const count = cell ? cell.count : 0
                      const isEmpty = !cell
                      return (
                        <div
                          key={di}
                          title={cell ? `${cell.date}: ${count} problem${count !== 1 ? 's' : ''} solved` : ''}
                          style={{
                            width: '11px', height: '11px', borderRadius: '2px',
                            background: isEmpty ? 'transparent' : getCellColor(count),
                            transition: 'background 0.15s',
                            cursor: cell ? 'default' : 'default',
                          }}
                        />
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', justifyContent: 'flex-end' }}>
            <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)' }}>Less</span>
            {[0, 1, 2, 3, 4, 5].map(n => (
              <div key={n} style={{ width: '11px', height: '11px', borderRadius: '2px', background: getCellColor(n) }} />
            ))}
            <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)' }}>More</span>
          </div>
        </div>
      )}
    </motion.div>
  )
}

// ── Main Page ─────────────────────────────────────────────
export default function ProgressPage() {
  const { isAuthenticated } = useAuthStore()
  const { xp, coins, streak } = useGamificationStore()
  const [sidebar, setSidebar] = useState(true)
  const [subjects, setSubjects] = useState(FALLBACK_SUBJECTS)

  // Achievement state
  const [unlockedKeys, setUnlockedKeys] = useState(new Set())
  const [achLoading, setAchLoading]     = useState(true)

  // Dynamic data state
  const [solvedData, setSolvedData]   = useState({ solved: { all: 0, easy: 0, medium: 0, hard: 0 }, total: { all: TOTAL_ALL, easy: TOTAL_EASY, medium: TOTAL_MEDIUM, hard: TOTAL_HARD } })
  const [solvedLoading, setSolvedLoading] = useState(true)

  const [xpHistory, setXpHistory]     = useState([])
  const [xpLoading, setXpLoading]     = useState(true)

  const [calendarData, setCalendarData] = useState({})
  const [calLoading, setCalLoading]     = useState(true)

  const fetchSubjects = () => {
    api.get('/subjects/progress/me')
      .then(res => {
        const data = res.data.data || []
        if (data.length > 0) {
          setSubjects(data.map(s => ({
            name:      s.name,
            slug:      s.slug,
            accent:    s.accentColor || SUBJECT_ACCENTS[s.slug] || '#00F5FF',
            completed: s.levelsCompleted || 0,
            total:     10,
            xp:        s.xpEarned || 0,
          })))
        }
      })
      .catch(() => {})
  }

  const fetchAchievements = () => {
    api.get('/achievements/mine')
      .then(res => setUnlockedKeys(new Set((res.data.data || []).map(a => a.key))))
      .catch(() => setUnlockedKeys(new Set()))
      .finally(() => setAchLoading(false))
  }

  const fetchSolvedStats = () => {
    setSolvedLoading(true)
    api.get(`/problems/progress?total=${TOTAL_ALL}&easy=${TOTAL_EASY}&medium=${TOTAL_MEDIUM}&hard=${TOTAL_HARD}`)
      .then(res => setSolvedData(res.data.data))
      .catch(() => {})
      .finally(() => setSolvedLoading(false))
  }

  const fetchXPHistory = () => {
    setXpLoading(true)
    api.get('/user/xp-history?days=30')
      .then(res => setXpHistory(res.data.data || []))
      .catch(() => {})
      .finally(() => setXpLoading(false))
  }

  const fetchCalendar = () => {
    setCalLoading(true)
    api.get('/problems/streak-calendar')
      .then(res => setCalendarData(res.data.data || {}))
      .catch(() => {})
      .finally(() => setCalLoading(false))
  }

  useEffect(() => {
    fetchSubjects()
    fetchAchievements()
    fetchSolvedStats()
    fetchXPHistory()
    fetchCalendar()

    const unsub = eventBus.on(EVENTS.LEVEL_COMPLETED, () => {
      fetchSubjects()
      fetchAchievements()
      fetchXPHistory()
    })
    return () => unsub()
  }, [])

  const achievementsToShow = useMemo(() =>
    ALL_ACHIEVEMENTS.slice(0, 6).map(a => ({ ...a, earned: unlockedKeys.has(a.key) })),
    [unlockedKeys]
  )
  const totalEarned = unlockedKeys.size
  const tier = getTier(50) // display tier based on progress level - leaderboard rank shown on leaderboard page

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"
      style={{ minHeight: '100vh', background: '#0F0F14', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 60% 35% at 50% 0%, rgba(0,245,255,0.04) 0%, transparent 60%)' }} />
      <DashboardNavbar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        <Sidebar collapsed={sidebar} onToggle={() => setSidebar(!sidebar)} />
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
              <h1 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: '#fff', letterSpacing: '-0.025em', marginBottom: '4px' }}>
                My Progress
              </h1>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.88rem', color: 'rgba(255,255,255,0.38)' }}>
                Track your learning journey across all subjects
              </p>
            </motion.div>

            {/* Top stats row — XP, Coins, Streak (NO generic Level) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
              {[
                { label: 'Total XP', value: xp.toLocaleString(),    color: '#00F5FF', icon: '⚡' },
                { label: 'Coins',    value: coins.toLocaleString(), color: '#FFB800', icon: '●' },
                { label: 'Streak',   value: `${streak}d`,           color: '#FF6B35', icon: '🔥' },
              ].map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  whileHover={{ y: -3, boxShadow: `0 10px 28px ${s.color}18`, borderColor: `${s.color}28`, transition: { duration: 0.2 } }}
                  style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '1px', background: `linear-gradient(90deg, transparent, ${s.color}55, transparent)` }} />
                  <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>{s.label}</div>
                  <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.7rem', color: s.color, letterSpacing: '-0.02em' }}>{s.value}</div>
                </motion.div>
              ))}
            </div>

            {/* XP progress bar */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1rem', color: '#fff', margin: 0 }}>XP Progression</h3>
                <TierBadge tier={tier.label} showName size="sm" />
              </div>
              <XPProgressBar accentColor="#00F5FF" />
            </motion.div>

            {/* Solved Problems Stats — dynamic, per-user */}
            <div style={{ position: 'relative' }}>
              <SolvedStatsCard solvedData={solvedData} loading={solvedLoading} />
            </div>

            {/* XP Activity graph — real, per-user */}
            <XPActivityGraph xpHistory={xpHistory} loading={xpLoading} />

            {/* Activity Calendar — LeetCode-style heatmap */}
            <StreakCalendar calendarData={calendarData} loading={calLoading} />

            {/* Subject progress */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1rem', color: '#fff', marginBottom: '18px' }}>Subject Progress</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {subjects.map((s, i) => {
                  const pct = Math.round((s.completed / s.total) * 100)
                  return (
                    <Link key={s.slug} to={`/subject/${s.slug}`} style={{ textDecoration: 'none' }}>
                      <motion.div whileHover={{ x: 3 }} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)', minWidth: '130px' }}>{s.name}</div>
                        <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.07)', borderRadius: '3px', overflow: 'hidden' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: 0.4 + i * 0.06, ease: [0.4, 0, 0.2, 1] }}
                            style={{ height: '100%', background: `linear-gradient(90deg, ${s.accent}80, ${s.accent})`, borderRadius: '3px' }}
                          />
                        </div>
                        <span style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.78rem', color: s.accent, minWidth: '36px', textAlign: 'right' }}>{pct}%</span>
                        <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', minWidth: '50px' }}>{s.completed}/{s.total}</span>
                      </motion.div>
                    </Link>
                  )
                })}
              </div>
            </motion.div>

            {/* Achievements */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <h3 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1rem', color: '#fff', margin: 0 }}>Achievements</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.38)' }}>
                    {achLoading ? '…' : `${totalEarned}/${ALL_ACHIEVEMENTS.length} earned`}
                  </span>
                  <Link to="/achievements" style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.75rem', color: '#00F5FF', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    View All
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </Link>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                {achievementsToShow.map((a, i) => (
                  <motion.div key={a.key} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + i * 0.04 }}
                    style={{ background: a.earned ? `${a.badgeColor}08` : 'rgba(255,255,255,0.02)', border: `1px solid ${a.earned ? `${a.badgeColor}25` : 'rgba(255,255,255,0.06)'}`, borderRadius: '12px', padding: '14px', opacity: a.earned ? 1 : 0.45 }}>
                    <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.85rem', color: a.earned ? a.badgeColor : 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>
                      {a.earned ? '✓ ' : '🔒 '}{a.name}
                    </div>
                    <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.73rem', color: 'rgba(255,255,255,0.3)' }}>{a.desc}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

          </div>
        </main>
      </div>
      <AvatarAssistant />
    </motion.div>
  )
}
