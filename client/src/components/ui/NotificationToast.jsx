import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@services/api'
import useAuthStore from '@store/authStore'

const TYPE_ACCENT = {
  friend_request:  '#8B5CF6',
  friend_accepted: '#00FF88',
  friend_declined: '#FF4060',
  fight_invite:    '#FF4060',
  fight_accepted:  '#00F5FF',
  fight_cancelled: '#FFB800',
}

function Toast({ notif, onClose }) {
  const accent = TYPE_ACCENT[notif.type] || '#00F5FF'
  useEffect(() => { const t = setTimeout(onClose, 6000); return () => clearTimeout(t) }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0, x: 60, scale: 0.92 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.88 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{
        width: '300px',
        background: 'rgba(14,14,22,0.97)',
        backdropFilter: 'blur(24px)',
        border: `1px solid ${accent}35`,
        borderRadius: '14px',
        overflow: 'hidden',
        boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${accent}20`,
        cursor: 'pointer',
      }}
      onClick={onClose}
    >
      {/* Accent bar */}
      <div style={{ height: '2px', background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
      <div style={{ padding: '12px 14px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: `${accent}14`, border: `1px solid ${accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.8rem' }}>
          {notif.type.startsWith('friend') ? '👥' : '⚔'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.82rem', color: accent, marginBottom: '3px' }}>{notif.title}</div>
          <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.76rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>{notif.message}</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: '2px', flexShrink: 0, lineHeight: 1 }}>✕</button>
      </div>
    </motion.div>
  )
}

/**
 * GlobalNotificationToast — placed once near app root.
 * Polls /api/notifications every 15s and shows toasts for new actionable items.
 */
export default function GlobalNotificationToast() {
  const { isAuthenticated } = useAuthStore()
  const [toasts,  setToasts]  = useState([])
  const seenRef = useRef(new Set())
  const intervalRef = useRef(null)
  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return

    const check = async () => {
      try {
        const res = await api.get('/notifications')
        const notifs = res.data.data || []
        // Show toast only for actionable items not yet seen
        for (const n of notifs) {
          if (n.action && !seenRef.current.has(n.id)) {
            seenRef.current.add(n.id)
            setToasts(prev => {
              // Max 3 toasts at once
              const next = [...prev, n]
              return next.slice(-3)
            })
          }
        }
      } catch {}
    }

    check()
    const t = setInterval(check, 15000)
    return () => clearInterval(t)
  }, [isAuthenticated])

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
      <AnimatePresence>
        {toasts.map(t => (
          <Toast key={t.id} notif={t} onClose={() => dismiss(t.id)} />
        ))}
      </AnimatePresence>
    </div>
  )
}
