import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import StoreItemCard from './StoreItemCard'
import { CATEGORIES, getItemsByCategory } from '@/data/storeData'

export default function StoreGrid({ items, activeCategory, onCategoryChange, ownedSlugs, activeIds, userCoins, onBuy, onActivate }) {
  const filtered = useMemo(() => {
    return activeCategory === 'all' ? items : items.filter(i => i.category === activeCategory)
  }, [items, activeCategory])

  return (
    <div>
      {/* Category pills */}
      <div style={{
        display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '22px',
        paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        {CATEGORIES.map(cat => {
          const count = cat.key === 'all' ? items.length : items.filter(i => i.category === cat.key).length
          if (count === 0 && cat.key !== 'all') return null
          const isActive = activeCategory === cat.key
          return (
            <motion.button
              key={cat.key}
              whileHover={!isActive ? { scale: 1.03 } : {}}
              onClick={() => onCategoryChange(cat.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 14px', borderRadius: '10px', border: 'none',
                background: isActive ? 'rgba(0,245,255,0.1)' : 'rgba(255,255,255,0.04)',
                color: isActive ? '#00F5FF' : 'rgba(255,255,255,0.45)',
                fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.18s',
                boxShadow: isActive ? '0 0 0 1px rgba(0,245,255,0.25)' : 'none',
              }}
            >
              {cat.label}
              <span style={{
                background: isActive ? 'rgba(0,245,255,0.15)' : 'rgba(255,255,255,0.07)',
                borderRadius: '6px', padding: '1px 6px',
                fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.65rem',
                color: isActive ? '#00F5FF' : 'rgba(255,255,255,0.3)',
              }}>
                {count}
              </span>
            </motion.button>
          )
        })}
      </div>

      {/* Grid */}
      <AnimatePresence mode="popLayout">
        {filtered.length > 0 ? (
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
              gap: '16px',
            }}
          >
            {filtered.map((item, i) => (
              <StoreItemCard
                key={item._id}
                item={item}
                owned={ownedSlugs.has(item.slug)}
                active={activeIds.has(item.slug)}
                canAfford={userCoins >= item.price}
                onBuy={onBuy}
                onActivate={onActivate}
                index={i}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: '48px 20px' }}
          >
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.3)' }}>
              No items in this category yet.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
