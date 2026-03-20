import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navigate, Link } from 'react-router-dom'
import useAuthStore         from '@store/authStore'
import useGamificationStore from '@store/gamificationStore'
import DashboardNavbar      from '@components/layout/DashboardNavbar'
import Sidebar              from '@components/layout/Sidebar'
import AvatarAssistant      from '@components/avatar/AvatarAssistant'
import XPProgressBar        from '@features/gamification/components/XPProgressBar'
import api                  from '@services/api'
import { SUBJECT_ACCENTS }  from '@/data/levelData'
import { SUBJECTS_META }    from '@/data/levelData'
import eventBus, { EVENTS } from '@/eventBus'
import { ACHIEVEMENTS as BASE_ACHIEVEMENTS } from '@/data/achievementsData'
import { PROBLEMS }         from '@/data/problemsData'
import DailyChallengeCard   from '@components/dashboard/DailyChallengeCard'

// ── Problem pool totals from static data ─────────────────
const TOTAL_ALL    = PROBLEMS.length
const TOTAL_EASY   = PROBLEMS.filter(p => p.difficulty === 'easy').length
const TOTAL_MEDIUM = PROBLEMS.filter(p => p.difficulty === 'medium').length
const TOTAL_HARD   = PROBLEMS.filter(p => p.difficulty === 'hard').length

// ── Plan achievements catalogue (mirrors AchievementsPage) ─
const PLAN_ACHIEVEMENTS = [
  { key: 'js_foundations', name: 'JS Founder',    desc: 'Completed the JavaScript Foundations plan.',       icon: '🏅', category: 'special', rarity: 'rare',  xpReward: 500,  coinReward: 50,  badgeColor: '#FFB800' },
  { key: 'dsa_master',     name: 'DSA Master',    desc: 'Completed the DSA Mastery plan (150 questions).', icon: '🏅', category: 'special', rarity: 'epic',  xpReward: 1500, coinReward: 150, badgeColor: '#00F5FF' },
  { key: 'db_expert',      name: 'DB Expert',     desc: 'Completed the Database Deep Dive plan.',          icon: '🏅', category: 'special', rarity: 'rare',  xpReward: 750,  coinReward: 75,  badgeColor: '#0080FF' },
  { key: 'algo_sprinter',  name: 'Algo Sprinter', desc: 'Completed the Algorithm Sprint plan.',            icon: '🏅', category: 'special', rarity: 'epic',  xpReward: 1000, coinReward: 100, badgeColor: '#8B5CF6' },
  { key: 'os_pro',         name: 'OS Pro',        desc: 'Completed the OS Essentials plan.',               icon: '🏅', category: 'special', rarity: 'rare',  xpReward: 600,  coinReward: 60,  badgeColor: '#00FF88' },
]
const ALL_ACHIEVEMENTS = [...BASE_ACHIEVEMENTS, ...PLAN_ACHIEVEMENTS]

const FALLBACK_SUBJECTS = [
  { name: 'Data Structures',   slug: 'data-structures',   accent: '#00F5FF', completed: 0, total: 10, xpEarned: 0 },
  { name: 'Algorithms',        slug: 'algorithms',        accent: '#8B5CF6', completed: 0, total: 10, xpEarned: 0 },
  { name: 'Databases',         slug: 'databases',         accent: '#0080FF', completed: 0, total: 10, xpEarned: 0 },
  { name: 'Operating Systems', slug: 'operating-systems', accent: '#FFB800', completed: 0, total: 10, xpEarned: 0 },
  { name: 'Networks',          slug: 'networks',          accent: '#00FF88', completed: 0, total: 10, xpEarned: 0 },
  { name: 'System Design',     slug: 'system-design',     accent: '#FF6B35', completed: 0, total: 10, xpEarned: 0 },
]

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.35 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
}

// ─────────────────────────────────────────────────────────────────────────────
// Daily Challenge Modal (same pattern as Dashboard)
// ─────────────────────────────────────────────────────────────────────────────
function DailyChallengeModal({ onClose }) {
  return (
    <motion.div
      key="dc-overlay"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
    >
      <motion.div
        key="dc-panel"
        initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: '560px', position: 'relative' }}
      >
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.93 }} onClick={onClose}
          style={{ position: 'absolute', top: '-14px', right: '-14px', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', zIndex: 2 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </motion.button>
        <DailyChallengeCard />
      </motion.div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Solved Problems Card
// ─────────────────────────────────────────────────────────────────────────────
function SolvedStatsCard({ solvedData, loading }) {
  const { solved, total } = solvedData
  const R = 40, CIRC = 2 * Math.PI * R
  const pct = total.all > 0 ? solved.all / total.all : 0

  const rows = [
    { label: 'Easy',   color: '#00FF88', bg: 'rgba(0,255,136,0.08)',   border: 'rgba(0,255,136,0.25)',   sv: solved.easy,   tv: total.easy   },
    { label: 'Medium', color: '#FFB800', bg: 'rgba(255,184,0,0.08)',   border: 'rgba(255,184,0,0.25)',   sv: solved.medium, tv: total.medium },
    { label: 'Hard',   color: '#FF6B6B', bg: 'rgba(255,107,107,0.08)', border: 'rgba(255,107,107,0.25)', sv: solved.hard,   tv: total.hard   },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.4), transparent)' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h3 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1rem', color: '#fff', margin: 0 }}>Problems Solved</h3>
        <Link to="/problems" style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.75rem', color: '#00F5FF', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
          Practice <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </Link>
      </div>
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[80,60,70,50].map((w,i) => <div key={i} style={{ height: '18px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', width: `${w}%` }} />)}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '28px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
              <motion.circle cx="50" cy="50" r={R} fill="none" stroke="#00F5FF" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={CIRC} initial={{ strokeDashoffset: CIRC }}
                animate={{ strokeDashoffset: CIRC * (1 - pct) }} transition={{ duration: 1, delay: 0.3, ease: [0.4,0,0.2,1] }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.3rem', color: '#00F5FF', lineHeight: 1 }}>{solved.all}</span>
              <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.62rem', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>/ {total.all}</span>
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', minWidth: '160px' }}>
            {rows.map(r => {
              const rPct = r.tv > 0 ? (r.sv / r.tv) * 100 : 0
              return (
                <div key={r.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', fontWeight: 700, color: r.color, background: r.bg, border: `1px solid ${r.border}`, borderRadius: '6px', padding: '1px 8px' }}>{r.label}</span>
                    <span style={{ fontFamily: '"Syne", sans-serif', fontSize: '0.78rem', fontWeight: 700, color: '#fff' }}>
                      {r.sv} <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>/ {r.tv}</span>
                    </span>
                  </div>
                  <div style={{ height: '5px', background: 'rgba(255,255,255,0.07)', borderRadius: '3px', overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${rPct}%` }} transition={{ duration: 0.9, delay: 0.4, ease: [0.4,0,0.2,1] }}
                      style={{ height: '100%', background: `linear-gradient(90deg,${r.color}80,${r.color})`, borderRadius: '3px' }} />
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

// ─────────────────────────────────────────────────────────────────────────────
// XP Trend Graph — smooth SVG area/line chart (no bars)
// ─────────────────────────────────────────────────────────────────────────────
function XPTrendGraph({ xpHistory, loading }) {
  const slice     = xpHistory.slice(-30)  // last 30 days
  const totalXP   = slice.reduce((s, d) => s + d.xp, 0)
  const activeDays = slice.filter(d => d.xp > 0).length

  // Build cumulative XP array for a rising trend feel
  // Each point = cumulative XP up to that day (shows overall growth)
  const cumulative = useMemo(() => {
    let running = 0
    return slice.map(d => { running += d.xp; return running })
  }, [slice])

  const maxVal = Math.max(...cumulative, 1)
  const W = 440, H = 100
  const PAD = { l: 8, r: 8, t: 12, b: 20 }
  const chartW = W - PAD.l - PAD.r
  const chartH = H - PAD.t - PAD.b

  // SVG path points
  const points = cumulative.map((v, i) => {
    const x = PAD.l + (slice.length > 1 ? (i / (slice.length - 1)) * chartW : chartW / 2)
    const y = PAD.t + chartH - (v / maxVal) * chartH
    return [x, y]
  })

  // Build smooth cubic bezier path
  const toSmoothPath = (pts) => {
    if (pts.length === 0) return ''
    if (pts.length === 1) return `M ${pts[0][0]} ${pts[0][1]}`
    let d = `M ${pts[0][0]} ${pts[0][1]}`
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1]
      const [x1, y1] = pts[i]
      const cpx = (x0 + x1) / 2
      d += ` C ${cpx} ${y0}, ${cpx} ${y1}, ${x1} ${y1}`
    }
    return d
  }

  const linePath = toSmoothPath(points)

  // Area path = line path + close bottom
  const areaPath = points.length > 0
    ? linePath + ` L ${points[points.length-1][0]} ${PAD.t + chartH} L ${points[0][0]} ${PAD.t + chartH} Z`
    : ''

  // X-axis day labels — show only first, middle, last
  const labelIdxs = slice.length > 2
    ? [0, Math.floor((slice.length - 1) / 2), slice.length - 1]
    : slice.map((_, i) => i)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1rem', color: '#fff', margin: 0 }}>XP Activity</h3>
        <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>Last 30 days</span>
      </div>

      {loading ? (
        <div style={{ height: '100px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px' }} />
      ) : slice.length === 0 || totalXP === 0 ? (
        <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem', color: 'rgba(255,255,255,0.2)' }}>
            No XP earned yet — start learning!
          </span>
        </div>
      ) : (
        <>
          <div style={{ position: 'relative', width: '100%' }}>
            <svg
              viewBox={`0 0 ${W} ${H}`}
              preserveAspectRatio="none"
              style={{ width: '100%', height: '100px', display: 'block', overflow: 'visible' }}
            >
              <defs>
                <linearGradient id="xpAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00F5FF" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#00F5FF" stopOpacity="0.01" />
                </linearGradient>
                <filter id="xpGlow">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>

              {/* Horizontal grid lines */}
              {[0.25, 0.5, 0.75, 1].map(f => (
                <line key={f}
                  x1={PAD.l} y1={PAD.t + chartH * (1 - f)}
                  x2={W - PAD.r} y2={PAD.t + chartH * (1 - f)}
                  stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="3 4"
                />
              ))}

              {/* Area fill */}
              <path d={areaPath} fill="url(#xpAreaGrad)" />

              {/* Line */}
              <motion.path
                d={linePath}
                fill="none"
                stroke="#00F5FF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#xpGlow)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
              />

              {/* End dot */}
              {points.length > 0 && (
                <motion.circle
                  cx={points[points.length-1][0]}
                  cy={points[points.length-1][1]}
                  r="4"
                  fill="#00F5FF"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.1, duration: 0.3 }}
                />
              )}

              {/* Day labels on x-axis */}
              {labelIdxs.map(i => {
                if (!slice[i]) return null
                const x = PAD.l + (slice.length > 1 ? (i / (slice.length - 1)) * chartW : chartW / 2)
                return (
                  <text key={i} x={x} y={H - 3}
                    textAnchor="middle"
                    style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '9px', fill: 'rgba(255,255,255,0.28)' }}>
                    {slice[i].day}
                  </text>
                )
              })}
            </svg>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
            <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
              {activeDays}/{slice.length} active days
            </span>
            <span style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.82rem', color: '#00F5FF' }}>
              {totalXP.toLocaleString()} XP earned
            </span>
          </div>
        </>
      )}
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// LeetCode-style Streak Calendar
// ─────────────────────────────────────────────────────────────────────────────
function StreakCalendar({ calData, loading }) {
  const { days = [], activeDays = 0, currentStreak = 0, bestStreak = 0 } = calData

  const weeks = useMemo(() => {
    if (!days.length) return []
    const firstDOW = new Date(days[0].date + 'T00:00:00Z').getUTCDay()
    const padded   = [...Array(firstDOW).fill(null), ...days]
    const result   = []
    for (let i = 0; i < padded.length; i += 7) result.push(padded.slice(i, i + 7))
    return result
  }, [days])

  const monthLabels = useMemo(() => {
    const labels = []
    let lastMonth = null
    weeks.forEach((week, wi) => {
      for (const d of week) {
        if (!d) continue
        const m = d.date.slice(0, 7)
        if (m !== lastMonth) {
          lastMonth = m
          const dt = new Date(d.date + 'T00:00:00Z')
          labels.push({ wi, label: dt.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }) })
          break
        }
      }
    })
    return labels
  }, [weeks])

  const cellBg = (count) => {
    if (!count) return 'rgba(255,255,255,0.06)'
    if (count === 1) return 'rgba(0,245,255,0.22)'
    if (count === 2) return 'rgba(0,245,255,0.42)'
    if (count <= 4)  return 'rgba(0,245,255,0.62)'
    return 'rgba(0,245,255,0.88)'
  }
  const cellBorder = (count) => count
    ? `1px solid rgba(0,245,255,${Math.min(0.1 + count * 0.1, 0.45)})`
    : '1px solid rgba(255,255,255,0.04)'

  const DOW = ['Sun', '', 'Tue', '', 'Thu', '', 'Sat']
  const CELL = 11, GAP = 3
  const totalSolves = days.reduce((s, d) => s + d.count, 0)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' }}>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1rem', color: '#fff', margin: '0 0 3px' }}>Activity Calendar</h3>
          {!loading && days.length > 0 && (
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.38)', margin: 0 }}>
              <span style={{ color: '#00F5FF', fontWeight: 700 }}>{totalSolves}</span> problems solved in the past year
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
              <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ height: '100px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px' }} />
      ) : days.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px', color: 'rgba(255,255,255,0.25)', fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem' }}>
          No activity yet — start solving problems to build your streak!
        </div>
      ) : (
        <div style={{ overflowX: 'auto', paddingBottom: '4px' }}>
          <div style={{ display: 'flex', gap: GAP + 'px', minWidth: 'max-content' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: GAP + 'px', marginTop: (CELL + GAP + 4) + 'px', marginRight: '4px', flexShrink: 0 }}>
              {DOW.map((l, i) => (
                <div key={i} style={{ height: CELL + 'px', fontFamily: '"DM Sans", sans-serif', fontSize: '0.58rem', color: l ? 'rgba(255,255,255,0.25)' : 'transparent', lineHeight: CELL + 'px' }}>{l}</div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: GAP + 'px', marginBottom: '4px', height: CELL + 'px', position: 'relative' }}>
                {weeks.map((_, wi) => {
                  const ml = monthLabels.find(m => m.wi === wi)
                  return (
                    <div key={wi} style={{ width: CELL + 'px', flexShrink: 0, position: 'relative' }}>
                      {ml && <span style={{ position: 'absolute', left: 0, fontFamily: '"DM Sans", sans-serif', fontSize: '0.62rem', color: 'rgba(255,255,255,0.38)', whiteSpace: 'nowrap' }}>{ml.label}</span>}
                    </div>
                  )
                })}
              </div>
              <div style={{ display: 'flex', gap: GAP + 'px' }}>
                {weeks.map((week, wi) => (
                  <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: GAP + 'px' }}>
                    {Array(7).fill(null).map((_, di) => {
                      const cell = week[di]
                      const count = cell ? cell.count : 0
                      return (
                        <div key={di}
                          title={cell ? `${cell.date}: ${count} problem${count !== 1 ? 's' : ''} solved` : ''}
                          style={{ width: CELL + 'px', height: CELL + 'px', borderRadius: '2px', background: !cell ? 'transparent' : cellBg(count), border: !cell ? 'none' : cellBorder(count), transition: 'background 0.15s' }}
                        />
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '10px', justifyContent: 'flex-end' }}>
            <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)' }}>Less</span>
            {[0,1,2,3,5].map(n => <div key={n} style={{ width: CELL + 'px', height: CELL + 'px', borderRadius: '2px', background: cellBg(n), border: cellBorder(n) }} />)}
            <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)' }}>More</span>
          </div>
        </div>
      )}
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main ProgressPage
// ─────────────────────────────────────────────────────────────────────────────
export default function ProgressPage() {
  const { isAuthenticated }         = useAuthStore()
  const { xp, coins, streak, fetchProgress } = useGamificationStore()
  const [sidebar, setSidebar]       = useState(true)
  const [showChallenge, setShowChallenge] = useState(false)
  const [subjects, setSubjects]     = useState(FALLBACK_SUBJECTS)

  // Dynamic data state
  const [solvedData, setSolvedData]   = useState({ solved: { all:0,easy:0,medium:0,hard:0 }, total: { all:TOTAL_ALL,easy:TOTAL_EASY,medium:TOTAL_MEDIUM,hard:TOTAL_HARD } })
  const [solvedLoading, setSolvedLoading] = useState(true)
  const [xpHistory, setXpHistory]     = useState([])
  const [xpLoading, setXpLoading]     = useState(true)
  const [calData, setCalData]         = useState({})
  const [calLoading, setCalLoading]   = useState(true)
  const [unlockedKeys, setUnlockedKeys] = useState(new Set())
  const [achLoading, setAchLoading]   = useState(true)

  if (!isAuthenticated) return <Navigate to="/login" replace />

  // ── Fetchers ─────────────────────────────────────────────
  const fetchSubjects = () => {
    api.get('/subjects/progress/me')
      .then(res => {
        const data = res.data.data || []
        if (data.length > 0) {
          setSubjects(data.map(s => {
            const meta = SUBJECTS_META[s.slug]
            return {
              name:      s.name,
              slug:      s.slug,
              accent:    s.accentColor || SUBJECT_ACCENTS[s.slug] || '#00F5FF',
              completed: s.levelsCompleted || 0,
              total:     s.totalLevels || 10,
              xpEarned:  s.xpEarned || 0,
              totalXP:   meta?.totalXP || 2800,
            }
          }))
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

  const fetchSolved = () => {
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
      .then(res => {
        const d = res.data.data || {}
        setCalData(d)
        // Sync problems-based streak back into gamification store so navbar matches
        if (typeof d.currentStreak === 'number' && d.currentStreak > 0) {
          const current = useGamificationStore.getState().streak
          if (d.currentStreak !== current) {
            useGamificationStore.setState({ streak: d.currentStreak })
          }
        }
      })
      .catch(() => {})
      .finally(() => setCalLoading(false))
  }

  useEffect(() => {
    // Refresh shared gamification store (ensures navbar XP/coins/streak are current)
    fetchProgress()

    fetchSubjects()
    fetchAchievements()
    fetchSolved()
    fetchXPHistory()
    fetchCalendar()

    const unsub = eventBus.on(EVENTS.LEVEL_COMPLETED, () => {
      fetchSubjects()
      fetchAchievements()
      fetchXPHistory()
      fetchProgress()
    })
    return () => unsub()
  }, [])

  // ── Achievements: show first 2 earned, else 2 locked defaults ──
  const achievementsToShow = useMemo(() => {
    const allMapped = ALL_ACHIEVEMENTS.map(a => ({ ...a, earned: unlockedKeys.has(a.key) }))
    const earned = allMapped.filter(a => a.earned)
    if (earned.length >= 2) return earned.slice(0, 2)
    if (earned.length === 1) {
      const firstLocked = allMapped.find(a => !a.earned)
      return firstLocked ? [earned[0], firstLocked] : earned
    }
    return allMapped.slice(0, 2) // no earned — show first 2 as locked
  }, [unlockedKeys])

  const totalEarned = unlockedKeys.size

  // Streak value: prefer problems-based if available, else store streak
  const displayStreak = calData.currentStreak ?? streak

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"
      style={{ minHeight: '100vh', background: '#0F0F14', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(0,245,255,0.04) 0%, transparent 60%)' }} />

      {/* Navbar with working Daily Challenge button */}
      <DashboardNavbar onOpenChallenge={() => setShowChallenge(true)} />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        <Sidebar collapsed={sidebar} onToggle={() => setSidebar(p => !p)} />

        <main style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
          <div style={{ maxWidth: '1040px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* ── Page header — NO TierBadge ─────────────────────── */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
              <h1 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: '#fff', letterSpacing: '-0.025em', marginBottom: '4px' }}>
                Progress
              </h1>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.88rem', color: 'rgba(255,255,255,0.38)', margin: 0 }}>
                Your complete learning analytics
              </p>
            </motion.div>

            {/* ── Top stat cards: ONLY XP / Coins / Streak ─────────
                No Level. No Active Days. No Tier/Beginner badge. ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
              {[
                { label: 'Total XP', value: xp.toLocaleString(),      color: '#00F5FF' },
                { label: 'Coins',    value: coins.toLocaleString(),    color: '#FFB800' },
                { label: 'Streak',   value: `${displayStreak}d`,       color: '#FF6B35' },
              ].map((s, i) => (
                <motion.div key={s.label}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  whileHover={{ y: -3, boxShadow: `0 10px 28px ${s.color}18`, transition: { duration: 0.2 } }}
                  style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '1px', background: `linear-gradient(90deg, transparent, ${s.color}55, transparent)` }} />
                  <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>{s.label}</div>
                  <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.7rem', color: s.color, letterSpacing: '-0.02em' }}>{s.value}</div>
                </motion.div>
              ))}
            </div>

            {/* ── XP level bar ─────────────────────────────────────── */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
              style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '22px' }}>
              <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.92rem', color: '#fff', marginBottom: '14px' }}>Level Progress</div>
              <XPProgressBar accentColor="#00F5FF" />
            </motion.div>

            {/* ── Two-column: Problems + XP Trend ─────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
              <SolvedStatsCard solvedData={solvedData} loading={solvedLoading} />
              <XPTrendGraph xpHistory={xpHistory} loading={xpLoading} />
            </div>

            {/* ── Activity Calendar ─────────────────────────────────── */}
            <StreakCalendar calData={calData} loading={calLoading} />

            {/* ── Subject + Achievements side-by-side ─────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,3fr) minmax(0,2fr)', gap: '20px', alignItems: 'start' }}>

              {/* Subject Progress — levels + XP earned / total XP */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' }}>
                <h3 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1rem', color: '#fff', marginBottom: '18px' }}>Subject Progress</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {subjects.map((s, i) => {
                    const lvlPct = s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0
                    const xpPct  = s.totalXP > 0 ? Math.min((s.xpEarned / s.totalXP) * 100, 100) : 0
                    return (
                      <Link key={s.slug} to={`/subject/${s.slug}`} style={{ textDecoration: 'none' }}>
                        <motion.div whileHover={{ x: 3 }}>
                          {/* Subject name + level count */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem', color: 'rgba(255,255,255,0.72)' }}>{s.name}</span>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                              <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.32)' }}>
                                {s.completed}/{s.total} levels
                              </span>
                              <span style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.72rem', color: s.accent }}>
                                {s.xpEarned} <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.3)' }}>/ {s.totalXP} XP</span>
                              </span>
                            </div>
                          </div>
                          {/* Level progress bar */}
                          <div style={{ height: '5px', background: 'rgba(255,255,255,0.07)', borderRadius: '3px', overflow: 'hidden' }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${lvlPct}%` }}
                              transition={{ duration: 0.8, delay: 0.4 + i * 0.06, ease: [0.4, 0, 0.2, 1] }}
                              style={{ height: '100%', background: `linear-gradient(90deg, ${s.accent}80, ${s.accent})`, borderRadius: '3px' }}
                            />
                          </div>
                        </motion.div>
                      </Link>
                    )
                  })}
                </div>
              </motion.div>

              {/* Achievements Preview — 2 items: earned first, else locked */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.32 }}
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                  <h3 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1rem', color: '#fff', margin: 0 }}>Achievements</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
                      {achLoading ? '…' : `${totalEarned}/${ALL_ACHIEVEMENTS.length}`}
                    </span>
                    <Link to="/achievements" style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', color: '#00F5FF', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      All <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </Link>
                  </div>
                </div>

                {achLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[1,2].map(i => <div key={i} style={{ height: '52px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px' }} />)}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {achievementsToShow.map((a, i) => (
                      <motion.div key={a.key}
                        initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.38 + i * 0.06 }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          background: a.earned ? `${a.badgeColor}0A` : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${a.earned ? `${a.badgeColor}25` : 'rgba(255,255,255,0.06)'}`,
                          borderRadius: '12px', padding: '12px 14px',
                          opacity: a.earned ? 1 : 0.45,
                        }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0,
                          background: a.earned ? `${a.badgeColor}18` : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${a.earned ? `${a.badgeColor}35` : 'rgba(255,255,255,0.08)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
                          {a.earned ? a.icon : '🔒'}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.82rem',
                            color: a.earned ? a.badgeColor : 'rgba(255,255,255,0.35)',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {a.earned && '✓ '}{a.name}
                          </div>
                          <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.7rem',
                            color: 'rgba(255,255,255,0.28)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {a.desc}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>

            </div>

          </div>
        </main>
      </div>

      {/* Daily Challenge modal — same as Dashboard */}
      <AnimatePresence>
        {showChallenge && <DailyChallengeModal onClose={() => setShowChallenge(false)} />}
      </AnimatePresence>

      <AvatarAssistant />
    </motion.div>
  )
}
