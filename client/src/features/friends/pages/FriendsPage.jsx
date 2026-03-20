import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navigate } from 'react-router-dom'

import useAuthStore from '@store/authStore'
import DashboardNavbar from '@components/layout/DashboardNavbar'
import Sidebar from '@components/layout/Sidebar'
import AvatarAssistant from '@components/avatar/AvatarAssistant'
import api from '@services/api'

import FriendCard from '../components/FriendCard'
import FriendRequestCard from '../components/FriendRequestCard'
import FriendProfileModal from '../components/FriendProfileModal'
import FriendSearchBar from '../components/FriendSearchBar'

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.35 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
}

const TABS = [
  { key: 'friends',  label: 'Friends'      },
  { key: 'requests', label: 'Requests'     },
  { key: 'pending',  label: 'Pending'      },
  { key: 'search',   label: 'Find Players' },
]

function EmptyState({ icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        textAlign: 'center', padding: '60px 24px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '18px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>{icon}</div>
      <h3 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1rem', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>{title}</h3>
      <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)', maxWidth: '300px', margin: '0 auto 20px', lineHeight: 1.6 }}>{description}</p>
      {action && (
        <motion.button
          whileHover={{ scale: 1.03, boxShadow: '0 6px 24px rgba(139,92,246,0.3)' }}
          whileTap={{ scale: 0.97 }}
          onClick={action.onClick}
          style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', border: 'none', borderRadius: '10px', cursor: 'pointer', fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.88rem', color: '#fff' }}
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  )
}

export default function FriendsPage() {
  const { isAuthenticated, user } = useAuthStore()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [activeTab,        setActiveTab]         = useState('friends')
  const [selectedFriend,   setSelectedFriend]    = useState(null)

  // ── Dynamic state (all empty by default — populated from API) ──
  const [friends,          setFriends]           = useState([])
  const [incomingRequests, setIncomingRequests]  = useState([])
  const [sentRequests,     setSentRequests]      = useState([])
  const [loading,          setLoading]           = useState(true)

  if (!isAuthenticated) return <Navigate to="/login" replace />

  // ── Load all data from real API ───────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [friendsRes, incomingRes, sentRes] = await Promise.all([
        api.get('/friends/list'),
        api.get('/friends/requests'),
        api.get('/friends/requests/sent'),
      ])
      setFriends(friendsRes.data.data || [])
      setIncomingRequests(incomingRes.data.data || [])
      setSentRequests(sentRes.data.data || [])
    } catch (err) {
      console.error('Failed to load friends data:', err)
      // Stay empty on error — do not show mock data
      setFriends([])
      setIncomingRequests([])
      setSentRequests([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  // ── Accept incoming request ───────────────────────────
  const handleAccept = useCallback(async (requestId) => {
    try {
      const res = await api.post('/friends/accept', { requestId })
      const newFriend = res.data.data?.newFriend
      // Remove from incoming, add to friends list
      setIncomingRequests(prev => prev.filter(r => r._id !== requestId))
      if (newFriend) {
        setFriends(prev => {
          const exists = prev.some(f => f._id === newFriend._id)
          return exists ? prev : [...prev, newFriend]
        })
      } else {
        // Re-fetch to be sure
        const friendsRes = await api.get('/friends/list')
        setFriends(friendsRes.data.data || [])
      }
    } catch (err) {
      console.error('Failed to accept request:', err)
    }
  }, [])

  // ── Reject incoming request ───────────────────────────
  const handleReject = useCallback(async (requestId) => {
    try {
      await api.post('/friends/reject', { requestId })
      setIncomingRequests(prev => prev.filter(r => r._id !== requestId))
    } catch (err) {
      console.error('Failed to reject request:', err)
    }
  }, [])

  // ── Remove friend ─────────────────────────────────────
  const handleRemoveFriend = useCallback(async (friendId) => {
    try {
      await api.delete(`/friends/${friendId}`)
      setFriends(prev => prev.filter(f => f._id !== friendId))
    } catch (err) {
      console.error('Failed to remove friend:', err)
    }
  }, [])

  // ── Withdraw a sent request ──────────────────────────
  const handleWithdraw = useCallback(async (requestId) => {
    try {
      await api.delete(`/friends/request/${requestId}`)
      setSentRequests(prev => prev.filter(r => r._id !== requestId))
    } catch (err) {
      console.error('Failed to withdraw request:', err)
    }
  }, [])
  const handleRequestSent = useCallback(async () => {
    // Re-fetch sent requests to reflect new pending state
    try {
      const sentRes = await api.get('/friends/requests/sent')
      setSentRequests(sentRes.data.data || [])
    } catch (err) {
      console.error('Failed to refresh sent requests:', err)
    }
  }, [])

  const tabBadges = {
    requests: incomingRequests.length,
    pending:  sentRequests.length,
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial" animate="animate" exit="exit"
      style={{ minHeight: '100vh', background: '#0F0F14', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(139,92,246,0.05) 0%, transparent 60%)' }} />

      <DashboardNavbar />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <main style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
          <div style={{ maxWidth: '860px', margin: '0 auto' }}>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}
            >
              <div>
                <h1 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: 'clamp(1.5rem, 3vw, 1.9rem)', color: '#fff', letterSpacing: '-0.025em', marginBottom: '5px' }}>
                  Friends
                </h1>
                <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.88rem', color: 'rgba(255,255,255,0.4)' }}>
                  {friends.length} {friends.length === 1 ? 'connection' : 'connections'}
                </p>
              </div>

              {/* Quick stats */}
              <div style={{ display: 'flex', gap: '10px' }}>
                {[
                  { label: 'Friends',  value: friends.length,          color: '#8B5CF6' },
                  { label: 'Requests', value: incomingRequests.length, color: '#FFB800' },
                  { label: 'Pending',  value: sentRequests.length,     color: '#00F5FF' },
                ].map(stat => (
                  <div key={stat.label} style={{
                    background: `${stat.color}08`, border: `1px solid ${stat.color}20`,
                    borderRadius: '12px', padding: '10px 16px', textAlign: 'center',
                  }}>
                    <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.2rem', color: stat.color }}>{stat.value}</div>
                    <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Tabs */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '4px', marginBottom: '24px', width: 'fit-content', flexWrap: 'wrap' }}
            >
              {TABS.map(tab => (
                <motion.button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 16px', borderRadius: '9px', border: 'none',
                    background: activeTab === tab.key ? 'rgba(139,92,246,0.15)' : 'transparent',
                    color: activeTab === tab.key ? '#8B5CF6' : 'rgba(255,255,255,0.4)',
                    fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.15s',
                    boxShadow: activeTab === tab.key ? '0 0 0 1px rgba(139,92,246,0.25)' : 'none',
                  }}
                >
                  {tab.label}
                  {tabBadges[tab.key] > 0 && (
                    <motion.span
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{
                        background: tab.key === 'requests' ? '#FF4060' : '#00F5FF',
                        color: tab.key === 'requests' ? '#fff' : '#000',
                        borderRadius: '10px', padding: '1px 6px',
                        fontSize: '0.65rem', fontWeight: 800,
                        fontFamily: '"Syne", sans-serif',
                      }}
                    >
                      {tabBadges[tab.key]}
                    </motion.span>
                  )}
                </motion.button>
              ))}
            </motion.div>

            {/* Loading skeleton */}
            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ height: '80px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', animation: 'pulse 1.5s infinite' }} />
                ))}
              </div>
            )}

            {/* Tab content */}
            {!loading && (
              <AnimatePresence mode="wait">

                {/* ── Friends list ── */}
                {activeTab === 'friends' && (
                  <motion.div key="friends" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                    {friends.length === 0 ? (
                      <EmptyState
                        icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
                        title="No friends yet"
                        description="Search for players and send friend requests to connect."
                        action={{ label: 'Find Players', onClick: () => setActiveTab('search') }}
                      />
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
                        {friends.map((friend, i) => (
                          <FriendCard
                            key={friend._id}
                            friend={friend}
                            index={i}
                            onClick={setSelectedFriend}
                            onRemove={handleRemoveFriend}
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ── Incoming requests ── */}
                {activeTab === 'requests' && (
                  <motion.div key="requests" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                    {incomingRequests.length === 0 ? (
                      <EmptyState
                        icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /><line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" /></svg>}
                        title="No incoming requests"
                        description="When someone sends you a friend request, it will appear here."
                      />
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', marginBottom: '4px' }}>
                          {incomingRequests.length} incoming {incomingRequests.length === 1 ? 'request' : 'requests'}
                        </div>
                        {incomingRequests.map((req, i) => (
                          <FriendRequestCard
                            key={req._id}
                            request={req}
                            index={i}
                            onAccept={handleAccept}
                            onReject={handleReject}
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ── Sent / pending requests ── */}
                {activeTab === 'pending' && (
                  <motion.div key="pending" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                    {sentRequests.length === 0 ? (
                      <EmptyState
                        icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>}
                        title="No pending requests"
                        description="Requests you send to other players will appear here while awaiting a response."
                        action={{ label: 'Find Players', onClick: () => setActiveTab('search') }}
                      />
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', marginBottom: '4px' }}>
                          {sentRequests.length} pending {sentRequests.length === 1 ? 'request' : 'requests'}
                        </div>
                        {sentRequests.map((req, i) => {
                          const recipient = req.recipient
                          return (
                            <PendingRequestRow key={req._id} request={req} recipient={recipient} index={i} onWithdraw={handleWithdraw} />
                          )
                        })}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ── Search ── */}
                {activeTab === 'search' && (
                  <motion.div key="search" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                    <div style={{ marginBottom: '8px' }}>
                      <FriendSearchBar
                        currentUserId={user?._id}
                        friendIds={new Set(friends.map(f => f._id?.toString()))}
                        onRequestSent={handleRequestSent}
                      />
                    </div>
                    <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.25)', marginTop: '10px' }}>
                      Type at least 2 characters to search. Existing friends won't appear.
                    </p>
                  </motion.div>
                )}

              </AnimatePresence>
            )}
          </div>
        </main>
      </div>

      {/* Friend profile modal */}
      <AnimatePresence>
        {selectedFriend && (
          <FriendProfileModal
            friend={selectedFriend}
            onClose={() => setSelectedFriend(null)}
          />
        )}
      </AnimatePresence>

      <AvatarAssistant />
    </motion.div>
  )
}

// ── Sent request row (pending tab) — with Withdraw button ─
function PendingRequestRow({ request, recipient, index, onWithdraw }) {
  const [withdrawing, setWithdrawing] = useState(false)
  const [withdrawn,   setWithdrawn]   = useState(false)

  if (!recipient || withdrawn) return null
  const initials = recipient.username?.slice(0, 2).toUpperCase() || '??'
  const xp       = recipient.xp || 0

  const handleWithdrawClick = async () => {
    setWithdrawing(true)
    try {
      await onWithdraw(request._id)
      setWithdrawn(true)
    } catch {
      setWithdrawing(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ delay: index * 0.05 }}
      style={{
        display: 'flex', alignItems: 'center', gap: '14px',
        padding: '14px 16px', borderRadius: '14px',
        background: 'rgba(0,245,255,0.04)',
        border: '1px solid rgba(0,245,255,0.12)',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Left accent */}
      <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: '3px', borderRadius: '2px', background: '#00F5FF', boxShadow: '0 0 6px rgba(0,245,255,0.5)' }} />

      {/* Avatar */}
      <div style={{
        width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
        background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '0.78rem', color: '#00F5FF',
      }}>
        {initials}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#fff', marginBottom: '3px' }}>
          {recipient.username}
        </div>
        <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.73rem', color: 'rgba(255,255,255,0.4)' }}>
          Lv.{recipient.level || '—'} · {xp.toLocaleString()} XP
        </div>
      </div>

      {/* Pending chip */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.2)',
        borderRadius: '20px', padding: '4px 11px', flexShrink: 0,
        fontFamily: '"DM Sans", sans-serif', fontSize: '0.73rem', fontWeight: 600, color: '#00F5FF',
      }}>
        <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
          style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00F5FF' }} />
        Pending
      </div>

      {/* Withdraw button */}
      <motion.button
        whileHover={!withdrawing ? { color: '#FF5050', borderColor: 'rgba(255,80,80,0.35)', background: 'rgba(255,80,80,0.08)' } : {}}
        whileTap={!withdrawing ? { scale: 0.95 } : {}}
        onClick={handleWithdrawClick}
        disabled={withdrawing}
        style={{
          padding: '7px 12px', borderRadius: '9px',
          background: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
          cursor: withdrawing ? 'default' : 'pointer',
          fontFamily: '"DM Sans", sans-serif', fontSize: '0.76rem', fontWeight: 600,
          color: 'rgba(255,255,255,0.45)',
          display: 'flex', alignItems: 'center', gap: '5px',
          flexShrink: 0, transition: 'all 0.18s',
        }}
      >
        {withdrawing
          ? <><motion.svg animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.15)" strokeWidth="2.5" /><path d="M12 2a10 10 0 0 1 10 10" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round" /></motion.svg> Withdrawing…</>
          : <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg> Withdraw</>
        }
      </motion.button>
    </motion.div>
  )
}

