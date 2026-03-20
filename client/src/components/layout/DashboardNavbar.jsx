import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore from '@store/authStore'
import useGamificationStore from '@store/gamificationStore'
import { useAuth } from '@features/auth/useAuth'
import XPProgressBar from '@features/gamification/components/XPProgressBar'
import api from '@services/api'
import ProfileModal from './ProfileModal'

// ── Logo ─────────────────────────────────────────────────
function NexusLogo() {
  return (
    <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '9px', textDecoration: 'none', flexShrink: 0 }}>
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
        <polygon points="16,2 28,9 28,23 16,30 4,23 4,9" fill="none" stroke="#00F5FF" strokeWidth="1.5" />
        <polygon points="16,8 23,12 23,20 16,24 9,20 9,12" fill="rgba(0,245,255,0.12)" stroke="#00F5FF" strokeWidth="1" strokeOpacity="0.5" />
        <circle cx="16" cy="16" r="2.5" fill="#00F5FF" />
      </svg>
      <span style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1rem', color: '#fff', letterSpacing: '-0.02em' }}>
        NEXUS<span style={{ color: '#00F5FF' }}>LEARN</span>
      </span>
    </Link>
  )
}

// ── Stat pill ─────────────────────────────────────────────
function StatPill({ icon, value, label, accent, pulse }) {
  return (
    <motion.div whileHover={{ scale: 1.04 }} transition={{ duration: 0.18 }}
      style={{ display: 'flex', alignItems: 'center', gap: '7px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${accent}25`, borderRadius: '10px', padding: '6px 12px', cursor: 'default' }}>
      <span style={{ color: accent, display: 'flex', alignItems: 'center' }}>
        {pulse ? (<motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.8, repeat: Infinity }}>{icon}</motion.span>) : icon}
      </span>
      <div>
        <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '0.9rem', color: '#fff', lineHeight: 1 }}>{value}</div>
        <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1, marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      </div>
    </motion.div>
  )
}

// ── Notification type config ──────────────────────────────
const NOTIF_CONFIG = {
  friend_request:  { accent: '#8B5CF6', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg> },
  friend_accepted: { accent: '#00FF88', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> },
  friend_declined: { accent: '#FF4060', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> },
  fight_invite:    { accent: '#FF4060', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg> },
  fight_accepted:  { accent: '#00F5FF', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> },
  fight_cancelled: { accent: '#FFB800', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> },
}

// ── Individual notification row ───────────────────────────
function NotifRow({ notif, onAcceptFriend, onDeclineFriend, onAcceptFight, navigate }) {
  const cfg = NOTIF_CONFIG[notif.type] || { accent: '#00F5FF', icon: '●' }
  const [acting, setActing] = useState(false)

  const timeLabel = (() => {
    const diff = Date.now() - new Date(notif.time).getTime()
    const m = Math.floor(diff / 60000), h = Math.floor(diff / 3600000), d = Math.floor(diff / 86400000)
    if (m < 1) return 'just now'
    if (m < 60) return `${m}m ago`
    if (h < 24) return `${h}h ago`
    return `${d}d ago`
  })()

  return (
    <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: `${cfg.accent}14`, border: `1px solid ${cfg.accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cfg.accent, flexShrink: 0, marginTop: '1px' }}>
        {cfg.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.8rem', color: '#fff', marginBottom: '2px' }}>{notif.title}</div>
        <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.4, marginBottom: notif.action ? '8px' : 0 }}>{notif.message}</div>
        {notif.action && notif.type === 'friend_request' && (
          <div style={{ display: 'flex', gap: '6px' }}>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }} disabled={acting}
              onClick={async () => { setActing(true); await onAcceptFriend(notif.data.requestId); setActing(false) }}
              style={{ padding: '4px 12px', background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', border: 'none', borderRadius: '7px', cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', fontWeight: 700, fontSize: '0.72rem', color: '#fff' }}>
              {acting ? '…' : 'Accept'}
            </motion.button>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }} disabled={acting}
              onClick={async () => { setActing(true); await onDeclineFriend(notif.data.requestId); setActing(false) }}
              style={{ padding: '4px 10px', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '7px', cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
              {acting ? '…' : 'Decline'}
            </motion.button>
          </div>
        )}
        {notif.action && notif.type === 'fight_invite' && (
          <div style={{ display: 'flex', gap: '6px' }}>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }} disabled={acting}
              onClick={async () => {
                setActing(true)
                try {
                  await onAcceptFight(notif.data.fightId)
                  navigate('/fight', { state: { acceptedFightId: notif.data.fightId, subjectSlug: notif.data.subjectSlug } })
                } catch {}
                setActing(false)
              }}
              style={{ padding: '4px 12px', background: 'linear-gradient(135deg, #FF4060, #CC2040)', border: 'none', borderRadius: '7px', cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', fontWeight: 700, fontSize: '0.72rem', color: '#fff' }}>
              {acting ? '…' : 'Accept ⚔'}
            </motion.button>
          </div>
        )}
        <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', marginTop: '4px' }}>{timeLabel}</div>
      </div>
    </div>
  )
}

// ── Notification Bell + Panel ─────────────────────────────
function NotificationBell() {
  const [open,     setOpen]    = useState(false)
  const [notifs,   setNotifs]  = useState([])
  const [loading,  setLoading] = useState(false)
  const navigate = useNavigate()
  const panelRef = useRef(null)
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)

  const loadNotifs = useCallback(async () => {
    // Do not poll when user is not authenticated — prevents 401 loop
    if (!isAuthenticated) return
    try {
      const res = await api.get('/notifications')
      setNotifs(res.data.data || [])
    } catch (err) {
      // Silently ignore errors (401 handled globally in api.js interceptor)
    }
  }, [isAuthenticated])

  // Poll every 20s; stop automatically when isAuthenticated becomes false
  useEffect(() => {
    if (!isAuthenticated) return
    loadNotifs()
    const t = setInterval(loadNotifs, 20000)
    return () => clearInterval(t)
  }, [loadNotifs, isAuthenticated])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const unread = notifs.length

  const handleAcceptFriend = async (requestId) => {
    try { await api.post('/friends/accept', { requestId }); await loadNotifs() } catch {}
  }
  const handleDeclineFriend = async (requestId) => {
    try { await api.post('/friends/reject', { requestId }); await loadNotifs() } catch {}
  }
  const handleAcceptFight = async (fightId) => {
    try { await api.post('/fights/accept', { fightId }); await loadNotifs() } catch {}
  }

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }} onClick={() => { setOpen(p => !p); if (!open) loadNotifs() }}
        style={{ width: '36px', height: '36px', borderRadius: '50%', background: unread > 0 ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.04)', border: `1.5px solid ${unread > 0 ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
        <motion.svg animate={unread > 0 ? { rotate: [0, 10, -10, 8, -6, 0] } : {}} transition={{ duration: 0.6, repeat: unread > 0 ? Infinity : 0, repeatDelay: 4 }}
          width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={unread > 0 ? '#8B5CF6' : 'rgba(255,255,255,0.5)'} strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </motion.svg>
        {unread > 0 && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            style={{ position: 'absolute', top: '-3px', right: '-3px', width: '16px', height: '16px', borderRadius: '50%', background: '#FF4060', border: '2px solid #0F0F14', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '0.58rem', color: '#fff' }}>
            {unread > 9 ? '9+' : unread}
          </motion.div>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4, scale: 0.97 }} transition={{ duration: 0.18 }}
            style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: '320px', zIndex: 200, background: 'rgba(14,14,22,0.97)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}>
            {/* Header */}
            <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.88rem', color: '#fff' }}>Notifications</div>
              {unread > 0 && <div style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '8px', padding: '2px 8px', fontFamily: '"DM Sans", sans-serif', fontSize: '0.7rem', fontWeight: 700, color: '#8B5CF6' }}>{unread} new</div>}
            </div>

            {/* Notification list */}
            <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
              {notifs.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🔔</div>
                  No notifications yet
                </div>
              ) : (
                notifs.map(n => (
                  <NotifRow key={n.id} notif={n} navigate={navigate}
                    onAcceptFriend={handleAcceptFriend}
                    onDeclineFriend={handleDeclineFriend}
                    onAcceptFight={handleAcceptFight}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Toast notification (global popup) ────────────────────
export function useNotificationToast() {
  const [toast, setToast] = useState(null)
  const prevCountRef = useRef(0)

  const showToast = useCallback((notif) => {
    setToast(notif)
    setTimeout(() => setToast(null), 5000)
  }, [])

  return { toast, showToast }
}

// ── Avatar circle (reused in navbar) ─────────────────────
function NavAvatarCircle({ user }) {
  const [imgErr, setImgErr] = useState(false)
  const avatar = user?.avatar
  const initial = user?.username?.[0]?.toUpperCase() || '?'
  const isCustom = avatar && avatar !== 'default' && !imgErr

  return isCustom ? (
    <img
      src={`/avatars/${avatar}.png`}
      alt="avatar"
      onError={() => setImgErr(true)}
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: '50%' }}
    />
  ) : (
    <span style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '0.88rem', color: '#00F5FF' }}>
      {initial}
    </span>
  )
}

// ── Profile dropdown ──────────────────────────────────────
function ProfileMenu({ user, onLogout }) {
  const [open,        setOpen]        = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  const handleProfileClick = () => {
    setOpen(false)
    setShowProfile(true)
  }

  return (
    <>
      <div style={{ position: 'relative' }}>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
          onClick={() => setOpen(!open)}
          style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #00F5FF22, #8B5CF622)', border: '1.5px solid rgba(0,245,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', padding: 0 }}
        >
          <NavAvatarCircle user={user} />
        </motion.button>

        <AnimatePresence>
          {open && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 98 }} onClick={() => setOpen(false)} />
              <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4, scale: 0.97 }} transition={{ duration: 0.18 }}
                style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, minWidth: '180px', zIndex: 99, background: 'rgba(18,18,26,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '8px', boxShadow: '0 16px 48px rgba(0,0,0,0.4)' }}>
                <div style={{ padding: '10px 12px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '6px' }}>
                  <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>{user?.username || 'User'}</div>
                  <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{user?.email}</div>
                </div>
                <button onClick={handleProfileClick}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', background: 'none', border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', fontFamily: '"DM Sans", sans-serif', fontSize: '0.88rem', transition: 'background 0.15s, color 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}>
                  <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>◈</span>Profile
                </button>
                <button
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', background: 'none', border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', fontFamily: '"DM Sans", sans-serif', fontSize: '0.88rem', transition: 'background 0.15s, color 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}>
                  <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>⚙</span>Settings
                </button>
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '6px 0' }} />
                <button onClick={onLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', background: 'none', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#FF5050', fontFamily: '"DM Sans", sans-serif', fontSize: '0.88rem', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,80,80,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Log Out
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </>
  )
}

export default function DashboardNavbar({ onOpenChallenge }) {
  const user    = useAuthStore(s => s.user)
  const { logout } = useAuth()
  const xp     = useGamificationStore(s => s.xp)
  const coins  = useGamificationStore(s => s.coins)
  const streak = useGamificationStore(s => s.streak)

  return (
    <motion.header initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      style={{ position: 'sticky', top: 0, zIndex: 50, height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', background: 'rgba(15,15,20,0.82)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', gap: '16px' }}>

      <NexusLogo />

      {/* Center: Daily Challenge — opens modal */}
      <motion.button
        whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(255,184,0,0.25)' }} whileTap={{ scale: 0.97 }}
        onClick={onOpenChallenge}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,184,0,0.08)', border: '1px solid rgba(255,184,0,0.25)', borderRadius: '10px', padding: '7px 16px', cursor: 'pointer', fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.82rem', color: '#FFB800' }}>
        <motion.div animate={{ rotate: [0, 15, -10, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 3 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        </motion.div>
        Daily Challenge
        <span style={{ background: 'rgba(255,184,0,0.2)', borderRadius: '6px', padding: '1px 6px', fontSize: '0.7rem' }}>NEW</span>
      </motion.button>

      {/* Right: Stats (XP, Coins, Streak — NO level) + Bell + Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <StatPill icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>} value={xp.toLocaleString()} label="XP" accent="#00F5FF" />
        <XPProgressBar compact showLabel={false} style={{ width: '100px' }} />
        <StatPill icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>} value={coins.toLocaleString()} label="COINS" accent="#FFB800" />
        <StatPill icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>} value={`${streak}d`} label="STREAK" accent="#FF6B35" pulse />
        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />
        <NotificationBell />
        <ProfileMenu user={user} onLogout={logout} />
      </div>
    </motion.header>
  )
}
