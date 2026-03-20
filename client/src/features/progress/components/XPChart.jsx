import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'

const MOCK_XP_DATA = [
  { week: 'W1',  xp: 200,  total: 200  },
  { week: 'W2',  xp: 400,  total: 600  },
  { week: 'W3',  xp: 600,  total: 1200 },
  { week: 'W4',  xp: 350,  total: 1550 },
  { week: 'W5',  xp: 720,  total: 2270 },
  { week: 'W6',  xp: 480,  total: 2750 },
  { week: 'W7',  xp: 850,  total: 3600 },
  { week: 'W8',  xp: 290,  total: 3890 },
]

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'rgba(12,12,20,0.96)',
      border: '1px solid rgba(0,245,255,0.25)',
      borderRadius: '12px', padding: '12px 16px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
    }}>
      <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', marginBottom: '6px' }}>{label}</div>
      {payload.map((entry) => (
        <div key={entry.dataKey} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: entry.color }} />
          <span style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.88rem', color: '#fff' }}>
            {entry.value.toLocaleString()} XP
          </span>
        </div>
      ))}
    </div>
  )
}

export default function XPChart({ data }) {
  const chartData = data || MOCK_XP_DATA

  const totalGain = chartData.reduce((s, d) => s + d.xp, 0)
  const avgWeekly = Math.round(totalGain / chartData.length)
  const peak      = Math.max(...chartData.map(d => d.xp))

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '18px', padding: '24px',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Top accent */}
      <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.5), transparent)' }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1rem', color: '#fff', margin: 0, marginBottom: '4px' }}>XP Growth</h3>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.38)', margin: 0 }}>Weekly earned XP</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          {[
            { label: 'Total', value: totalGain.toLocaleString() },
            { label: 'Avg / Week', value: avgWeekly.toLocaleString() },
            { label: 'Best Week', value: peak.toLocaleString() },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '0.95rem', color: '#00F5FF' }}>{s.value}</div>
              <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: '200px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#00F5FF" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#00F5FF" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="week" tick={{ fontFamily: '"DM Sans", sans-serif', fontSize: 11, fill: 'rgba(255,255,255,0.35)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontFamily: '"DM Sans", sans-serif', fontSize: 11, fill: 'rgba(255,255,255,0.35)' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(0,245,255,0.2)', strokeWidth: 1 }} />
            <Area
              type="monotone" dataKey="xp"
              stroke="#00F5FF" strokeWidth={2.5}
              fill="url(#xpGradient)"
              dot={{ fill: '#00F5FF', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: '#00F5FF', boxShadow: '0 0 8px #00F5FF' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
