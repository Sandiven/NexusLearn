import { motion, AnimatePresence } from 'framer-motion'
import { RARITY_CONFIG, STORE_ITEMS } from '@/data/storeData'

// Build a slug→item lookup from static storeData as a reliable fallback
const SLUG_TO_ITEM = Object.fromEntries(STORE_ITEMS.map(i => [i.slug, i]))

function InventoryItem({ entry, onActivate }) {
  // Prefer DB-populated item, fall back to static storeData by slug
  const item   = entry.item || SLUG_TO_ITEM[entry.slug] || null
  if (!item) return null
  const rarity = RARITY_CONFIG[item.rarity] || RARITY_CONFIG.common
  const accent = item.accentColor || '#00F5FF'
  const isActive = entry.active
  const isBooster = item.type === 'booster'
  const isExpired = entry.expiresAt && new Date(entry.expiresAt) < new Date()

  const timeLeft = entry.expiresAt && !isExpired
    ? Math.ceil((new Date(entry.expiresAt) - Date.now()) / 3600000)
    : null

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: isExpired ? 0.4 : 1, scale: 1 }}
      whileHover={!isExpired ? { scale: 1.02 } : {}}
      style={{
        background: isActive ? `${accent}08` : 'rgba(255,255,255,0.03)',
        border: `1px solid ${isActive ? `${accent}30` : 'rgba(255,255,255,0.07)'}`,
        borderRadius: '12px', padding: '12px 14px',
        display: 'flex', alignItems: 'center', gap: '12px',
        cursor: 'default',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Active left bar */}
      {isActive && (
        <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: '3px', borderRadius: '2px', background: accent, boxShadow: `0 0 8px ${accent}` }} />
      )}

      {/* Icon */}
      <div style={{
        width: '36px', height: '36px', borderRadius: '9px', flexShrink: 0,
        background: `${accent}12`, border: `1px solid ${accent}25`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1rem',
      }}>
        {item.icon}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
          <span style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.82rem', color: isActive ? accent : '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.name}
          </span>
          {isActive && (
            <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.6rem', fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.04em' }}>active</span>
          )}
        </div>
        <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
          {isBooster && timeLeft ? `${timeLeft}h left` : isBooster && isExpired ? 'Expired' : item.type}
        </div>
      </div>

      {/* Action */}
      {!isBooster && !isExpired && (
        <motion.button
          whileHover={!isActive ? { scale: 1.05, borderColor: `${accent}50` } : {}}
          onClick={() => !isActive && onActivate?.(entry)}
          style={{
            padding: '5px 11px', borderRadius: '8px',
            background: 'transparent',
            border: `1px solid ${isActive ? `${accent}35` : 'rgba(255,255,255,0.1)'}`,
            cursor: isActive ? 'default' : 'pointer',
            fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', fontWeight: 600,
            color: isActive ? accent : 'rgba(255,255,255,0.4)',
            transition: 'all 0.18s', flexShrink: 0,
          }}
        >
          {isActive ? 'Equipped' : 'Equip'}
        </motion.button>
      )}

      {isBooster && !isExpired && (
        <div style={{
          background: `${accent}12`, borderRadius: '8px', padding: '4px 9px',
          fontFamily: '"Syne", sans-serif', fontWeight: 700,
          fontSize: '0.7rem', color: accent, flexShrink: 0,
        }}>
          {item.effect.xpMultiplier > 1 ? `${item.effect.xpMultiplier}×XP` : item.effect.coinMultiplier > 1 ? `${item.effect.coinMultiplier}×C` : '🛡'}
        </div>
      )}
    </motion.div>
  )
}

export default function InventoryPanel({ inventory, activeBoosters, onActivate }) {
  const hasItems = inventory && inventory.length > 0
  const boosters  = (activeBoosters || []).filter(b => {
    if (!b.expiresAt) return true
    return new Date(b.expiresAt) > new Date()
  })

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '18px', padding: '22px',
      display: 'flex', flexDirection: 'column', gap: '16px',
      height: 'fit-content',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1rem', color: '#fff', margin: 0, marginBottom: '2px' }}>
            My Inventory
          </h3>
          <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>
            {inventory?.length || 0} item{inventory?.length !== 1 ? 's' : ''}
          </span>
        </div>
        {boosters.length > 0 && (
          <div style={{
            background: 'rgba(255,184,0,0.1)', border: '1px solid rgba(255,184,0,0.25)',
            borderRadius: '8px', padding: '3px 10px',
            display: 'flex', alignItems: 'center', gap: '5px',
          }}>
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.8, repeat: Infinity }}
              style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FFB800' }} />
            <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.68rem', fontWeight: 600, color: '#FFB800' }}>
              {boosters.length} active boost{boosters.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Active booster strip */}
      <AnimatePresence>
        {boosters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              background: 'rgba(255,184,0,0.05)', border: '1px solid rgba(255,184,0,0.2)',
              borderRadius: '12px', padding: '12px',
            }}
          >
            <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.68rem', color: 'rgba(255,184,0,0.7)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
              Active Boosters
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {boosters.map(b => (
                <div key={b.slug} style={{
                  background: 'rgba(255,184,0,0.1)', border: '1px solid rgba(255,184,0,0.22)',
                  borderRadius: '8px', padding: '4px 10px',
                  fontFamily: '"Syne", sans-serif', fontSize: '0.72rem', fontWeight: 700, color: '#FFB800',
                }}>
                  {b.xpMultiplier > 1 ? `${b.xpMultiplier}×XP` : b.coinMultiplier > 1 ? `${b.coinMultiplier}×C` : 'Shield'}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inventory list */}
      {!hasItems ? (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '2rem', marginBottom: '10px', opacity: 0.3 }}>◈</div>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem', color: 'rgba(255,255,255,0.28)', margin: 0 }}>
            No items yet. Visit the store to get started!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <AnimatePresence>
            {inventory.map((entry, i) => (
              <InventoryItem key={entry.itemId || i} entry={entry} onActivate={onActivate} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
