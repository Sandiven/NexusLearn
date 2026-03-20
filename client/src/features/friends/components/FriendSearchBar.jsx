import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import api from '@services/api'
import { getTier } from '@/data/leaderboardData'

function SearchResultRow({ user, onSendRequest, sentIds, currentUserId }) {
  const navigate   = useNavigate()
  const isSelf     = user._id === currentUserId
  const isSent     = sentIds.has(user._id) || user.requestPending
  const isFriend   = user.alreadyFriend
  const tier       = getTier(user.rank || 99)

  let buttonLabel, buttonDisabled, buttonStyle
  if (isSelf) {
    buttonLabel    = 'You'
    buttonDisabled = true
    buttonStyle    = { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.25)' }
  } else if (isFriend) {
    buttonLabel    = '✓ Friends'
    buttonDisabled = true
    buttonStyle    = { background: 'rgba(0,255,136,0.08)', color: '#00FF88', border: '1px solid rgba(0,255,136,0.2)' }
  } else if (isSent) {
    buttonLabel    = '✓ Sent'
    buttonDisabled = true
    buttonStyle    = { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }
  } else {
    buttonLabel    = '+ Add'
    buttonDisabled = false
    buttonStyle    = { background: 'linear-gradient(135deg, #00F5FF, #0080FF)', color: '#000' }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ background: 'rgba(255,255,255,0.04)' }}
      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '10px', cursor: 'default', transition: 'background 0.15s' }}
    >
      {/* Avatar */}
      <div style={{
        width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
        background: `${tier.color}14`, border: `1px solid ${tier.color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.7rem', color: tier.color,
      }}>
        {user.username?.slice(0, 2).toUpperCase() || '??'}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.88rem', color: '#fff' }}>
          {user.username}
        </div>
        <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>
          Lv.{user.level || '—'} · {(user.xp || 0).toLocaleString()} XP
        </div>
      </div>

      {/* Visit Profile */}
      <motion.button
        whileHover={!isSelf ? { scale: 1.05 } : {}}
        onClick={() => !isSelf && navigate(`/profile/${user._id}`)}
        style={{
          padding: '5px 10px', borderRadius: '8px',
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.5)',
          fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '0.7rem',
          cursor: isSelf ? 'default' : 'pointer', flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: '4px',
        }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
        Profile
      </motion.button>

      {/* Add / status button */}
      <motion.button
        whileHover={!buttonDisabled ? { scale: 1.05, boxShadow: '0 4px 16px rgba(0,245,255,0.3)' } : {}}
        whileTap={!buttonDisabled ? { scale: 0.96 } : {}}
        onClick={() => !buttonDisabled && onSendRequest(user)}
        disabled={buttonDisabled}
        style={{
          padding: '6px 14px', borderRadius: '8px', border: 'none',
          cursor: buttonDisabled ? 'default' : 'pointer',
          fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.72rem',
          flexShrink: 0, transition: 'all 0.2s',
          ...buttonStyle,
        }}
      >
        {buttonLabel}
      </motion.button>
    </motion.div>
  )
}

export default function FriendSearchBar({ onRequestSent, currentUserId, friendIds = new Set() }) {
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)
  const [sentIds, setSentIds] = useState(new Set())
  const [error,   setError]   = useState(null)
  const debounceRef = useRef(null)
  const wrapperRef  = useRef(null)

  // Debounced real API search
  useEffect(() => {
    clearTimeout(debounceRef.current)
    if (!query.trim() || query.trim().length < 2) {
      setResults([])
      setLoading(false)
      setError(null)
      return
    }
    setLoading(true)
    setError(null)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get('/users/search', { params: { q: query.trim() } })
        const data = res.data.data || []
        // Annotate whether they're already a friend
        const annotated = data.map(u => ({
          ...u,
          alreadyFriend: friendIds.has(u._id?.toString()),
        }))
        setResults(annotated)
      } catch (err) {
        if (err.response?.status !== 400) {
          setError('Search failed. Please try again.')
        }
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 400)
  }, [query, friendIds])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!wrapperRef.current?.contains(e.target)) setFocused(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSendRequest = useCallback(async (user) => {
    try {
      await api.post('/friends/request', { recipientId: user._id })
      setSentIds(prev => new Set([...prev, user._id]))
      setResults(prev => prev.map(r => r._id === user._id ? { ...r, requestPending: true } : r))
      onRequestSent?.(user)
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send request'
      // If already pending/friends, mark it in UI gracefully
      if (err.response?.status === 409) {
        setSentIds(prev => new Set([...prev, user._id]))
        setResults(prev => prev.map(r => r._id === user._id ? { ...r, requestPending: true } : r))
      } else {
        console.error('Send request failed:', msg)
      }
    }
  }, [onRequestSent])

  const showDropdown = focused && query.trim().length >= 2

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      {/* Input */}
      <motion.div
        animate={{ boxShadow: focused ? '0 0 0 1.5px rgba(0,245,255,0.5), 0 0 20px rgba(0,245,255,0.1)' : '0 0 0 1px rgba(255,255,255,0.08)' }}
        transition={{ duration: 0.2 }}
        style={{ borderRadius: '14px', background: 'rgba(255,255,255,0.04)', position: 'relative' }}
      >
        {/* Search icon */}
        <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: focused ? '#00F5FF' : 'rgba(255,255,255,0.3)', transition: 'color 0.2s', pointerEvents: 'none' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
        </div>

        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Search players by username…"
          style={{
            width: '100%', padding: '14px 44px 14px 44px',
            background: 'transparent', border: 'none', outline: 'none',
            fontFamily: '"DM Sans", sans-serif', fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.9)', borderRadius: '14px',
          }}
        />

        {/* Spinner / clear */}
        <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
          {loading ? (
            <motion.svg animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="rgba(0,245,255,0.2)" strokeWidth="3" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="#00F5FF" strokeWidth="3" strokeLinecap="round" />
            </motion.svg>
          ) : query ? (
            <button onClick={() => { setQuery(''); setResults([]) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: '4px', display: 'flex' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          ) : null}
        </div>
      </motion.div>

      {/* Results dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.99 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            style={{
              position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, zIndex: 50,
              background: 'rgba(14,14,22,0.97)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0,245,255,0.15)',
              borderRadius: '14px', overflow: 'hidden',
              boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
              padding: '8px',
            }}
          >
            {error ? (
              <div style={{ padding: '16px', textAlign: 'center', fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', color: 'rgba(255,80,80,0.7)' }}>
                {error}
              </div>
            ) : loading ? (
              <div style={{ padding: '16px', textAlign: 'center', fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)' }}>
                Searching…
              </div>
            ) : results.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)' }}>
                No players found for "{query}"
              </div>
            ) : (
              results.map(user => (
                <SearchResultRow
                  key={user._id}
                  user={user}
                  onSendRequest={handleSendRequest}
                  sentIds={sentIds}
                  currentUserId={currentUserId}
                />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
