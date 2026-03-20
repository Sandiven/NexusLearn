import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LeaderboardRow from './LeaderboardRow'
import TierBadge from './TierBadge'
import { TIERS, withTiers } from '@/data/leaderboardData'

const TIER_ORDER = ['S+', 'S', 'A', 'B', 'C']

/**
 * LeaderboardTable
 * @param {array}   entries       — ranked leaderboard entries
 * @param {string}  currentUserId — highlight this user
 * @param {string}  mode          — 'global' | 'contest'
 * @param {boolean} showTierDividers
 * @param {boolean} showSearch
 */
export default function LeaderboardTable({
  entries = [],
  currentUserId,
  mode = 'global',
  showTierDividers = true,
  showSearch = true,
}) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return entries
    return entries.filter(e =>
      e.username.toLowerCase().includes(search.toLowerCase())
    )
  }, [entries, search])

  // Group by tier for divider rendering
  const grouped = useMemo(() => {
    if (!showTierDividers || search.trim()) return null
    const groups = {}
    TIER_ORDER.forEach(t => { groups[t] = [] })
    entries.forEach(e => {
      const tierKey = e.tier?.label || 'C'
      if (groups[tierKey]) groups[tierKey].push(e)
    })
    return groups
  }, [entries, showTierDividers, search])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>

      {/* Search bar */}
      {showSearch && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '16px', position: 'relative' }}
        >
          <div style={{
            position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
            color: 'rgba(255,255,255,0.3)', pointerEvents: 'none',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search players…"
            style={{
              width: '100%', padding: '10px 14px 10px 38px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: '12px', outline: 'none',
              fontFamily: '"DM Sans", sans-serif', fontSize: '0.88rem',
              color: 'rgba(255,255,255,0.8)',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(0,245,255,0.35)'}
            onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.09)'}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{
              position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.3)', padding: '4px',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </motion.div>
      )}

      {/* Column headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '52px 36px 1fr auto',
        gap: '12px',
        padding: '6px 16px 10px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        marginBottom: '4px',
      }}>
        {['Rank', '', 'Player', mode === 'global' ? 'XP' : 'Score'].map(h => (
          <span key={h} style={{
            fontFamily: '"DM Sans", sans-serif', fontSize: '0.68rem',
            fontWeight: 600, color: 'rgba(255,255,255,0.28)',
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            {h}
          </span>
        ))}
      </div>

      {/* Entries */}
      <AnimatePresence initial={false}>
        {search.trim() || !showTierDividers ? (
          // Flat list (search mode)
          filtered.map((entry, i) => (
            <LeaderboardRow
              key={entry.userId || entry.rank}
              entry={entry}
              isCurrentUser={entry.userId?.toString() === currentUserId}
              mode={mode}
              animDelay={i * 0.04}
            />
          ))
        ) : (
          // Grouped with tier dividers
          TIER_ORDER.map(tierKey => {
            const group = grouped?.[tierKey] || []
            if (!group.length) return null
            const tierConfig = TIERS[tierKey]

            return (
              <motion.div key={tierKey} layout>
                {/* Tier divider */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '14px 16px 8px',
                }}>
                  <TierBadge tier={tierKey} showName size="md" />
                  <div style={{ flex: 1, height: '1px', background: `linear-gradient(90deg, ${tierConfig.border}, transparent)` }} />
                  <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.68rem', color: 'rgba(255,255,255,0.22)' }}>
                    {group.length} {group.length === 1 ? 'player' : 'players'}
                  </span>
                </div>

                {/* Rows in this tier */}
                {group.map((entry, i) => (
                  <LeaderboardRow
                    key={entry.userId || entry.rank}
                    entry={entry}
                    isCurrentUser={entry.userId?.toString() === currentUserId}
                    mode={mode}
                    animDelay={i * 0.03}
                  />
                ))}
              </motion.div>
            )
          })
        )}
      </AnimatePresence>

      {/* Empty state */}
      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '40px 20px' }}
        >
          <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.3)' }}>
            No players found matching "{search}"
          </div>
        </motion.div>
      )}
    </div>
  )
}
