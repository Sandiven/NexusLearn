import { motion } from 'framer-motion'

const MOCK_ACTIVITY = [
  { id: 1,  type: 'level',      text: 'Completed Level 5: Hash Tables',       sub: 'Data Structures', time: '2 hours ago',  xp: 200,  accent: '#00F5FF' },
  { id: 2,  type: 'contest',    text: 'Entered Data Structures Sprint',        sub: 'Contest',        time: '5 hours ago',  xp: 50,   accent: '#0080FF' },
  { id: 3,  type: 'achievement',text: 'Unlocked "Week Warrior"',               sub: 'Achievement',    time: 'Yesterday',    xp: 100,  accent: '#FFB800' },
  { id: 4,  type: 'level',      text: 'Completed Level 4: Queues',             sub: 'Data Structures', time: 'Yesterday',   xp: 200,  accent: '#00F5FF' },
  { id: 5,  type: 'fight',      text: 'Won fight against NightOwl',            sub: 'Custom Fight',   time: '2 days ago',   xp: 150,  accent: '#FF4060' },
  { id: 6,  type: 'friend',     text: 'Added CyberMind as a friend',           sub: 'Social',         time: '3 days ago',   xp: 25,   accent: '#8B5CF6' },
  { id: 7,  type: 'level',      text: 'Completed Level 3: Stacks',             sub: 'Data Structures', time: '4 days ago',  xp: 200,  accent: '#00F5FF' },
  { id: 8,  type: 'purchase',   text: 'Purchased 2× XP Boost from Store',     sub: 'Store',          time: '5 days ago',   xp: 0,    accent: '#FFB800' },
]

const TYPE_ICONS = {
  level:       <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z" /></svg>,
  contest:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" /></svg>,
  achievement: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" /></svg>,
  fight:       <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>,
  friend:      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>,
  purchase:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /></svg>,
}

export default function ActivityFeed({ activities }) {
  const data = activities || MOCK_ACTIVITY

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.25 }}
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '18px', padding: '24px',
        position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0,128,255,0.5), transparent)' }} />

      <h3 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1rem', color: '#fff', marginBottom: '18px' }}>Recent Activity</h3>

      <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* Vertical timeline line */}
        <div style={{ position: 'absolute', left: '18px', top: '20px', bottom: '8px', width: '1px', background: 'rgba(255,255,255,0.07)', zIndex: 0 }} />

        {data.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 + i * 0.06, duration: 0.35 }}
            style={{ display: 'flex', gap: '14px', paddingBottom: i < data.length - 1 ? '16px' : 0, position: 'relative', zIndex: 1 }}
          >
            {/* Icon dot */}
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
              background: `${item.accent}14`, border: `1px solid ${item.accent}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: item.accent, boxShadow: `0 0 8px ${item.accent}20`,
            }}>
              {TYPE_ICONS[item.type]}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                <div>
                  <div style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 500, fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.4 }}>{item.text}</div>
                  <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>
                    {item.sub} · {item.time}
                  </div>
                </div>
                {item.xp > 0 && (
                  <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.75rem', color: '#00F5FF', flexShrink: 0 }}>
                    +{item.xp} XP
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
