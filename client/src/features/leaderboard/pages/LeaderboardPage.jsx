import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navigate } from 'react-router-dom'

import useAuthStore from '@store/authStore'
import DashboardNavbar from '@components/layout/DashboardNavbar'
import Sidebar from '@components/layout/Sidebar'
import AvatarAssistant from '@components/avatar/AvatarAssistant'
import TierBadge from '../components/TierBadge'
import LeaderboardRow from '../components/LeaderboardRow'

import { TIERS, getTier } from '@/data/leaderboardData'
import api from '@services/api'

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.35 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
}

const TIER_ORDER = ['S+', 'S', 'A', 'B', 'C']

function PodiumSlot({ entry, isCenter, color, isYou, height }) {
  return (
    <motion.div
      key={entry.userId}
      whileHover={{ y: -4 }}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
        flex: isCenter ? '0 0 140px' : '0 0 110px',
      }}
    >
      {isCenter && (
        <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
          <svg width="24" height="20" viewBox="0 0 24 20" fill="none">
            <path d="M2 16L5 4L10 10L12 3L14 10L19 4L22 16H2Z" fill="#FFB800" opacity="0.9" />
            <path d="M2 16H22" stroke="#FFB800" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </motion.div>
      )}
      <div style={{
        width: isCenter ? '64px' : '52px', height: isCenter ? '64px' : '52px',
        borderRadius: '50%', background: `${color}20`,
        border: `2px solid ${color}${isYou ? 'CC' : '60'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: '"Syne", sans-serif', fontWeight: 800,
        fontSize: isCenter ? '1rem' : '0.82rem', color,
        boxShadow: `0 0 ${isCenter ? 24 : 14}px ${color}35`,
      }}>
        {(entry.username || '??').slice(0, 2).toUpperCase()}
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: '"Syne", sans-serif', fontWeight: 700,
          fontSize: isCenter ? '0.88rem' : '0.78rem',
          color: isYou ? color : '#fff',
          maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {entry.username}{isYou ? ' (You)' : ''}
        </div>
        <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '0.8rem', color, marginTop: '2px' }}>
          {(entry.xp || 0).toLocaleString()}
          <span style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 400, fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', marginLeft: '3px' }}>xp</span>
        </div>
      </div>
      <div style={{
        width: '100%', height: `${height}px`,
        background: `linear-gradient(180deg, ${color}18, ${color}06)`,
        border: `1px solid ${color}${isCenter ? '50' : '28'}`,
        borderRadius: '10px 10px 4px 4px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: '"Syne", sans-serif', fontWeight: 800,
        fontSize: isCenter ? '1.4rem' : '1.1rem', color: `${color}80`,
        boxShadow: isCenter ? `0 0 20px ${color}18` : 'none',
      }}>
        #{entry.rank}
      </div>
    </motion.div>
  )
}

// Empty placeholder slot for missing podium positions
function PodiumEmpty({ rank, isCenter, color, height }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
      flex: isCenter ? '0 0 140px' : '0 0 110px', opacity: 0.25,
    }}>
      {isCenter && <div style={{ height: '20px' }} />}
      <div style={{
        width: isCenter ? '64px' : '52px', height: isCenter ? '64px' : '52px',
        borderRadius: '50%', background: `${color}10`,
        border: `2px dashed ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: '"Syne", sans-serif', fontWeight: 800,
        fontSize: isCenter ? '1rem' : '0.82rem', color: `${color}50`,
      }}>?</div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)' }}>—</div>
      </div>
      <div style={{
        width: '100%', height: `${height}px`,
        background: `rgba(255,255,255,0.02)`,
        border: `1px dashed rgba(255,255,255,0.08)`,
        borderRadius: '10px 10px 4px 4px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: '"Syne", sans-serif', fontWeight: 800,
        fontSize: isCenter ? '1.4rem' : '1.1rem', color: 'rgba(255,255,255,0.15)',
      }}>
        #{rank}
      </div>
    </div>
  )
}

function Podium({ top3, currentUserId }) {
  if (!top3 || top3.length === 0) return null

  const rankColors = { 1: '#FFB800', 2: '#C0C0C0', 3: '#CD7F32' }
  const heights    = { left: 80, center: 108, right: 64 }

  const rank1 = top3.find(e => e.rank === 1) || top3[0] || null
  const rank2 = top3.find(e => e.rank === 2) || (top3.length >= 2 ? top3[1] : null)
  const rank3 = top3.find(e => e.rank === 3) || (top3.length >= 3 ? top3[2] : null)

  const slots = [
    { entry: rank2, rank: 2, isCenter: false, color: rankColors[2], height: heights.left },
    { entry: rank1, rank: 1, isCenter: true,  color: rankColors[1], height: heights.center },
    { entry: rank3, rank: 3, isCenter: false, color: rankColors[3], height: heights.right },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '12px', marginBottom: '36px', padding: '0 16px' }}
    >
      {slots.map(({ entry, rank, isCenter, color, height }) => {
        const isYou = entry?.userId?.toString() === currentUserId?.toString()
        return entry
          ? <PodiumSlot key={rank} entry={entry} isCenter={isCenter} color={color} isYou={isYou} height={height} />
          : <PodiumEmpty key={rank} rank={rank} isCenter={isCenter} color={color} height={height} />
      })}
    </motion.div>
  )
}

export default function LeaderboardPage() {
  const { isAuthenticated, user } = useAuthStore()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [entries, setEntries]                   = useState([])
  const [currentUserEntry, setCurrentUserEntry] = useState(null)
  const [loading, setLoading]                   = useState(true)
  const [error, setError]                       = useState(null)
  const [search, setSearch]                     = useState('')
  const [searchResults, setSearchResults]       = useState([])
  const [searchLoading, setSearchLoading]       = useState(false)
  const searchTimer = useRef(null)

  if (!isAuthenticated) return <Navigate to="/login" replace />
  const currentUserId = user?._id || user?.id

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await api.get('/leaderboard/global')
      setEntries(res.data.data || [])
      setCurrentUserEntry(res.data.currentUserEntry || null)
    } catch {
      setError('Failed to load leaderboard. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchLeaderboard() }, [fetchLeaderboard])

  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); return }
    clearTimeout(searchTimer.current)
    setSearchLoading(true)
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await api.get(`/leaderboard/search?q=${encodeURIComponent(search.trim())}`)
        setSearchResults(res.data.data || [])
      } catch { setSearchResults([]) }
      finally { setSearchLoading(false) }
    }, 350)
    return () => clearTimeout(searchTimer.current)
  }, [search])

  const top3        = useMemo(() => entries.slice(0, 3), [entries])
  const restEntries = useMemo(() => entries.slice(3), [entries])
  const isSearching = search.trim().length > 0

  const myEntry = useMemo(() => {
    if (!currentUserId) return null
    return entries.find(e => e.userId?.toString() === currentUserId?.toString()) || currentUserEntry
  }, [entries, currentUserEntry, currentUserId])

  const myTierColor = myEntry ? (TIERS[myEntry.tier]?.color || '#00F5FF') : '#00F5FF'

  const grouped = useMemo(() => {
    if (isSearching) return null
    const groups = {}
    TIER_ORDER.forEach(t => { groups[t] = [] })
    restEntries.forEach(e => {
      const key = e.tier || 'C'
      if (groups[key]) groups[key].push(e)
    })
    return groups
  }, [restEntries, isSearching])

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"
      style={{ minHeight: '100vh', background: '#0F0F14', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(255,184,0,0.05) 0%, transparent 60%)' }} />
      <DashboardNavbar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
              style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <h1 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: '#fff', letterSpacing: '-0.025em', marginBottom: '8px' }}>
                  Leaderboard
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)' }}>
                    Global XP Rankings · Top 100
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(0,245,255,0.06)', border: '1px solid rgba(0,245,255,0.15)', borderRadius: '8px', padding: '3px 10px' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#00F5FF" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', color: '#00F5FF', fontWeight: 600 }}>
                      Updates daily at 00:00 IST
                    </span>
                  </div>
                </div>
              </div>

              {myEntry && (
                <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                  style={{ background: `${myTierColor}08`, border: `1px solid ${myTierColor}25`, borderRadius: '14px', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: `0 0 20px ${myTierColor}10` }}>
                  <TierBadge tier={myEntry.tier || 'C'} showName size="md" />
                  <div>
                    <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Rank</div>
                    <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.1rem', color: myTierColor }}>#{myEntry.rank}</div>
                    <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>{(myEntry.xp || 0).toLocaleString()} XP</div>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {error && (
              <div style={{ background: 'rgba(255,64,96,0.08)', border: '1px solid rgba(255,64,96,0.2)', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', fontFamily: '"DM Sans", sans-serif', fontSize: '0.88rem', color: '#FF4060', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {error}
                <button onClick={fetchLeaderboard} style={{ background: 'rgba(255,64,96,0.15)', border: '1px solid rgba(255,64,96,0.3)', borderRadius: '8px', color: '#FF4060', padding: '5px 12px', cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', fontSize: '0.8rem' }}>Retry</button>
              </div>
            )}

            {/* Main card */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
              style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px', overflow: 'hidden' }}>
              {loading ? (
                <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{ width: '32px', height: '32px', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#FFB800', borderRadius: '50%', margin: '0 auto 16px' }} />
                  <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.3)' }}>Loading leaderboard…</div>
                </div>
              ) : (
                <>
                  {/* Podium — always visible above search */}
                  {top3.length > 0 && (
                    <div style={{ padding: '28px 24px 0' }}>
                      <Podium top3={top3} currentUserId={currentUserId} />
                    </div>
                  )}

                  <div style={{ padding: '8px 16px 20px' }}>
                    {/* Search — below podium, always accessible */}
                    {top3.length > 0 && (
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginBottom: '16px', paddingTop: '16px' }} />
                    )}
                    <div style={{ marginBottom: '16px', position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                      </div>
                      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search players…"
                        style={{ width: '100%', padding: '10px 14px 10px 38px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '12px', outline: 'none', fontFamily: '"DM Sans", sans-serif', fontSize: '0.88rem', color: 'rgba(255,255,255,0.8)', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                        onFocus={e => e.target.style.borderColor = 'rgba(0,245,255,0.35)'}
                        onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.09)'} />
                      {search && (
                        <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: '4px' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      )}
                    </div>

                    {/* Column headers */}
                    <div style={{ display: 'grid', gridTemplateColumns: '52px 36px 1fr auto', gap: '12px', padding: '6px 16px 10px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '4px' }}>
                      {['Rank', '', 'Player', 'XP'].map(h => (
                        <span key={h} style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.68rem', fontWeight: 600, color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
                      ))}
                    </div>

                    <AnimatePresence mode="wait">
                      {isSearching ? (
                        <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          {searchLoading ? (
                            <div style={{ padding: '20px', textAlign: 'center', fontFamily: '"DM Sans", sans-serif', fontSize: '0.88rem', color: 'rgba(255,255,255,0.3)' }}>Searching…</div>
                          ) : searchResults.length ? (
                            searchResults.map((entry, i) => (
                              <LeaderboardRow key={entry.userId} entry={entry} isCurrentUser={entry.userId?.toString() === currentUserId?.toString()} mode="global" animDelay={i * 0.04} />
                            ))
                          ) : (
                            <div style={{ padding: '30px 20px', textAlign: 'center', fontFamily: '"DM Sans", sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.3)' }}>No players found matching "{search}"</div>
                          )}
                        </motion.div>
                      ) : (
                        <motion.div key="ranked" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          {TIER_ORDER.map(tierKey => {
                            const group = grouped?.[tierKey] || []
                            if (!group.length) return null
                            const tierConfig = TIERS[tierKey]
                            return (
                              <div key={tierKey}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px 8px' }}>
                                  <TierBadge tier={tierKey} showName size="md" />
                                  <div style={{ flex: 1, height: '1px', background: `linear-gradient(90deg, ${tierConfig.border}, transparent)` }} />
                                  <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.68rem', color: 'rgba(255,255,255,0.22)' }}>{group.length} {group.length === 1 ? 'player' : 'players'}</span>
                                </div>
                                {group.map((entry, i) => (
                                  <LeaderboardRow key={entry.userId} entry={entry} isCurrentUser={entry.userId?.toString() === currentUserId?.toString()} mode="global" animDelay={i * 0.03} />
                                ))}
                              </div>
                            )
                          })}
                          {entries.length === 0 && !loading && (
                            <div style={{ padding: '40px 20px', textAlign: 'center', fontFamily: '"DM Sans", sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.3)' }}>No players yet. Be the first to earn XP!</div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Current user outside top 100 */}
                    {!isSearching && currentUserEntry && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '16px', borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '12px' }}>
                        <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 16px 8px' }}>Your Position</div>
                        <LeaderboardRow entry={{ ...currentUserEntry, isCurrentUser: true }} isCurrentUser={true} mode="global" animDelay={0} />
                      </motion.div>
                    )}
                  </div>
                </>
              )}
            </motion.div>

            {/* Tier legend */}
            {!loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                style={{ marginTop: '24px', display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {Object.entries(TIERS).map(([key, config]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <TierBadge tier={key} showName size="sm" />
                    <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
                      {key === 'S+' ? 'Top 3' : key === 'S' ? 'Top 13' : key === 'A' ? 'Top 43' : key === 'B' ? 'Top 100' : 'Everyone else'}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </main>
      </div>
      <AvatarAssistant />
    </motion.div>
  )
}
