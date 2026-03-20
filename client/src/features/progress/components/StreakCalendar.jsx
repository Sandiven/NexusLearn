import { useMemo } from 'react'
import { motion } from 'framer-motion'

// Generate last 91 days (13 weeks)
function buildCalendarData(activeSet) {
  const days = []
  const today = new Date()
  for (let i = 90; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toISOString().split('T')[0]
    days.push({ date: key, active: activeSet.has(key), dayOfWeek: d.getDay() })
  }
  return days
}

// Mock active days (last 90 days with some gaps)
function buildMockActiveSet() {
  const s = new Set()
  const today = new Date()
  for (let i = 0; i < 90; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    if (Math.random() > 0.28) s.add(d.toISOString().split('T')[0])
  }
  return s
}

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function StreakCalendar({ activeDays, streak = 7, longestStreak = 34 }) {
  const activeSet = useMemo(() => activeDays || buildMockActiveSet(), [activeDays])
  const days      = useMemo(() => buildCalendarData(activeSet), [activeSet])

  // Group into weeks (columns)
  const weeks = useMemo(() => {
    const result = []
    let week = []
    days.forEach((day, i) => {
      week.push(day)
      if (week.length === 7 || i === days.length - 1) {
        result.push(week)
        week = []
      }
    })
    return result
  }, [days])

  const totalActive = days.filter(d => d.active).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '18px', padding: '24px',
        position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,107,53,0.5), transparent)' }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1rem', color: '#fff', margin: 0, marginBottom: '4px' }}>Streak Calendar</h3>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.38)', margin: 0 }}>Last 90 days of activity</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          {[
            { label: 'Current', value: `${streak}d`, color: '#FF6B35' },
            { label: 'Best',    value: `${longestStreak}d`, color: '#FFB800' },
            { label: 'Active Days', value: totalActive, color: '#00FF88' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '0.95rem', color: s.color }}>{s.value}</div>
              <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Day-of-week labels */}
      <div style={{ display: 'flex', gap: '3px', marginBottom: '4px', paddingLeft: '0px' }}>
        {DAY_LABELS.map(d => (
          <div key={d} style={{ width: '13px', fontFamily: '"DM Sans", sans-serif', fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)', textAlign: 'center', flexShrink: 0 }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'flex', gap: '3px', overflowX: 'auto', paddingBottom: '4px' }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {week.map((day, di) => (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: wi * 0.02 + di * 0.005, duration: 0.2 }}
                title={`${day.date}${day.active ? ' · Active' : ''}`}
                style={{
                  width: '13px', height: '13px', borderRadius: '3px',
                  background: day.active ? '#FF6B35' : 'rgba(255,255,255,0.07)',
                  boxShadow: day.active ? '0 0 4px rgba(255,107,53,0.5)' : 'none',
                  flexShrink: 0, cursor: 'default',
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
        <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)' }}>Less</span>
        {['rgba(255,255,255,0.07)', 'rgba(255,107,53,0.3)', 'rgba(255,107,53,0.6)', '#FF6B35'].map((c, i) => (
          <div key={i} style={{ width: '11px', height: '11px', borderRadius: '2px', background: c }} />
        ))}
        <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)' }}>More</span>
      </div>
    </motion.div>
  )
}
