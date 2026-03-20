import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navigate } from 'react-router-dom'

import useAuthStore         from '@store/authStore'
import useGamificationStore from '@store/gamificationStore'
import DashboardNavbar      from '@components/layout/DashboardNavbar'
import Sidebar              from '@components/layout/Sidebar'
import AvatarAssistant      from '@components/avatar/AvatarAssistant'
import api                  from '@services/api'

import StoreGrid      from '../components/StoreGrid'
import PurchaseModal  from '../components/PurchaseModal'
import InventoryPanel from '../components/InventoryPanel'

import { STORE_ITEMS, FEATURED_ITEMS, RARITY_CONFIG } from '@/data/storeData'

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.35 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
}

function FeaturedBanner({ item, userCoins, owned, onBuy }) {
  if (!item) return null
  const accent    = item.accentColor || '#00F5FF'
  const rarity    = RARITY_CONFIG[item.rarity] || RARITY_CONFIG.common
  const canAfford = userCoins >= item.price

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
      style={{
        background: item.previewGradient || `${accent}0A`,
        border: `1px solid ${rarity.border}`,
        borderRadius: '20px', padding: '28px 32px',
        display: 'flex', alignItems: 'center', gap: '24px',
        position: 'relative', overflow: 'hidden', flexWrap: 'wrap',
      }}
    >
      <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 3 }}
        style={{ position: 'absolute', top: 0, bottom: 0, width: '40%', background: `linear-gradient(90deg, transparent, ${accent}08, transparent)`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, left: '5%', right: '5%', height: '1px', background: `linear-gradient(90deg, transparent, ${accent}60, transparent)` }} />

      <motion.div animate={{ boxShadow: [`0 0 20px ${accent}30`, `0 0 40px ${accent}55`, `0 0 20px ${accent}30`] }} transition={{ duration: 2.5, repeat: Infinity }}
        style={{ width: '72px', height: '72px', borderRadius: '18px', background: `${accent}14`, border: `1.5px solid ${accent}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>
        {item.icon}
      </motion.div>

      <div style={{ flex: 1, minWidth: '200px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <div style={{ background: `${accent}18`, border: `1px solid ${accent}30`, borderRadius: '8px', padding: '2px 10px', fontFamily: '"DM Sans", sans-serif', fontSize: '0.7rem', fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.06em' }}>★ Featured</div>
          <div style={{ background: `${rarity.color}14`, border: `1px solid ${rarity.border}`, borderRadius: '7px', padding: '2px 8px', fontFamily: '"DM Sans", sans-serif', fontSize: '0.68rem', fontWeight: 700, color: rarity.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{RARITY_CONFIG[item.rarity]?.label}</div>
          {item.originalPrice && (
            <div style={{ background: 'rgba(255,64,96,0.12)', border: '1px solid rgba(255,64,96,0.25)', borderRadius: '7px', padding: '2px 8px', fontFamily: '"Syne", sans-serif', fontSize: '0.65rem', fontWeight: 800, color: '#FF4060' }}>
              -{Math.round((1 - item.price / item.originalPrice) * 100)}% OFF
            </div>
          )}
        </div>
        <h2 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', color: '#fff', letterSpacing: '-0.02em', marginBottom: '6px' }}>{item.name}</h2>
        <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.88rem', color: 'rgba(255,255,255,0.5)', maxWidth: '420px', lineHeight: 1.55, margin: 0 }}>{item.description}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', flexShrink: 0 }}>
        <div style={{ textAlign: 'right' }}>
          {item.originalPrice && <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through' }}>{item.originalPrice} coins</div>}
          <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 900, fontSize: '1.6rem', color: '#FFB800', letterSpacing: '-0.02em', lineHeight: 1 }}>{item.price.toLocaleString()}</div>
          <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>coins</div>
        </div>
        {owned ? (
          <div style={{ padding: '11px 24px', background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.25)', borderRadius: '12px', fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.88rem', color: '#00FF88' }}>✓ Owned</div>
        ) : (
          <motion.button whileHover={canAfford ? { scale: 1.03, boxShadow: `0 8px 28px ${accent}40` } : {}} whileTap={canAfford ? { scale: 0.97 } : {}}
            onClick={() => canAfford && onBuy(item)} disabled={!canAfford}
            style={{ padding: '11px 28px', background: canAfford ? `linear-gradient(135deg, ${accent}, ${accent}BB)` : 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '12px', cursor: canAfford ? 'pointer' : 'not-allowed', fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.88rem', color: canAfford ? '#000' : 'rgba(255,255,255,0.25)' }}>
            {canAfford ? 'Get Now' : `Need ${(item.price - userCoins).toLocaleString()} more`}
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}

export default function StorePage() {
  const { isAuthenticated }      = useAuthStore()
  const { coins, addCoinsLocal } = useGamificationStore()

  // Ref so async callbacks always read the latest coins value
  const coinsRef = useRef(coins)
  useEffect(() => { coinsRef.current = coins }, [coins])

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [activeCategory,   setActiveCategory]   = useState('all')
  const [activeTab,        setActiveTab]         = useState('shop')
  const [pendingItem,      setPendingItem]        = useState(null)
  const [purchaseError,    setPurchaseError]      = useState(null)

  // KEY FIX: ownedSlugs is a Set of slug strings (e.g. 'neon-cyber-avatar')
  // Items in STORE_ITEMS have item.slug — we ALWAYS check ownedSlugs.has(item.slug)
  // Never check against item._id (which is the static 's001' etc. — not what DB stores)
  const [ownedSlugs,     setOwnedSlugs]     = useState(new Set())
  const [activeIds,      setActiveIds]       = useState(new Set())
  const [inventory,      setInventory]       = useState([])
  const [activeBoosters, setActiveBoosters]  = useState([])
  const [invLoading,     setInvLoading]      = useState(true)

  if (!isAuthenticated) return <Navigate to="/login" replace />

  const featuredItem = FEATURED_ITEMS[0]

  // Load inventory + owned slugs from DB
  const loadInventory = useCallback(async () => {
    try {
      setInvLoading(true)
      const res  = await api.get('/store/inventory')
      const data = res.data.data
      const inv  = data.inventory || []

      // Build owned set from slugs — matches storeData item.slug fields
      const slugSet  = new Set(inv.map(e => e.slug).filter(Boolean))
      const activeSet = new Set(inv.filter(e => e.active).map(e => e.slug).filter(Boolean))

      setInventory(inv)
      setOwnedSlugs(slugSet)
      setActiveIds(activeSet)
      setActiveBoosters(data.activeBoosters || [])

      // Sync coins exactly from server (absolute value, no delta math with stale closure)
      if (typeof data.coins === 'number') {
        const delta = data.coins - coinsRef.current
        if (delta !== 0) addCoinsLocal(delta)
      }
    } catch (err) {
      console.error('Failed to load inventory:', err)
    } finally {
      setInvLoading(false)
    }
  }, [addCoinsLocal])

  useEffect(() => { loadInventory() }, [loadInventory])

  // Handle confirmed purchase
  const handleConfirmPurchase = useCallback(async (item) => {
    setPendingItem(null)
    setPurchaseError(null)
    try {
      // Send item.slug — backend purchaseBySlug finds item by slug in DB
      const res = await api.post('/store/purchase/slug', { slug: item.slug })
      const serverBalance = res.data?.data?.coinsBalance

      // Update coins from server response (source of truth)
      if (typeof serverBalance === 'number') {
        const delta = serverBalance - coinsRef.current
        addCoinsLocal(delta)
      } else {
        addCoinsLocal(-item.price)
      }

      // Immediately mark as owned in UI
      setOwnedSlugs(prev => new Set([...prev, item.slug]))

      // Reload full inventory from DB to get persisted entry with item details
      await loadInventory()
    } catch (err) {
      const msg = err.response?.data?.message || 'Purchase failed. Please try again.'
      setPurchaseError(msg)
      console.error('Purchase failed:', err)
    }
  }, [addCoinsLocal, loadInventory])

  // Activate cosmetic
  const handleActivate = useCallback(async (entry) => {
    try {
      await api.post('/store/activate', { itemId: entry.itemId })
      setActiveIds(new Set([entry.slug || entry.itemId?.toString()]))
      setInventory(prev => prev.map(e => ({
        ...e,
        active: e.itemId?.toString() === entry.itemId?.toString(),
      })))
    } catch (err) {
      console.error('Activate failed:', err)
    }
  }, [])

  const tabs = [
    { key: 'shop',      label: 'Shop' },
    { key: 'inventory', label: `Inventory (${inventory.length})` },
  ]

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"
      style={{ minHeight: '100vh', background: '#0F0F14', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(255,184,0,0.05) 0%, transparent 60%)' }} />

      <DashboardNavbar />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(p => !p)} />

        <main style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h1 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: '#fff', letterSpacing: '-0.025em', marginBottom: '4px' }}>Store</h1>
                <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.88rem', color: 'rgba(255,255,255,0.38)' }}>Spend your coins on boosters, cosmetics, and more.</p>
              </div>
              <motion.div animate={{ boxShadow: ['0 0 0 rgba(255,184,0,0)', '0 0 20px rgba(255,184,0,0.15)', '0 0 0 rgba(255,184,0,0)'] }} transition={{ duration: 3, repeat: Infinity }}
                style={{ background: 'rgba(255,184,0,0.08)', border: '1px solid rgba(255,184,0,0.25)', borderRadius: '14px', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,184,0,0.15)', border: '1px solid rgba(255,184,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '0.75rem', color: '#FFB800' }}>C</div>
                <div>
                  <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Balance</div>
                  <motion.div key={coins} initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 0.3 }}
                    style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.2rem', color: '#FFB800', letterSpacing: '-0.01em' }}>
                    {coins.toLocaleString()} <span style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 400, fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>coins</span>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>

            {/* Purchase error banner */}
            <AnimatePresence>
              {purchaseError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  style={{ background: 'rgba(255,64,96,0.08)', border: '1px solid rgba(255,64,96,0.25)', borderRadius: '12px', padding: '12px 18px', marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}
                >
                  <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.88rem', color: '#FF4060' }}>{purchaseError}</span>
                  <button onClick={() => setPurchaseError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,64,96,0.6)', fontSize: '1rem', lineHeight: 1 }}>✕</button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '4px', marginBottom: '24px', width: 'fit-content' }}>
              {tabs.map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  style={{ padding: '8px 18px', borderRadius: '9px', border: 'none', cursor: 'pointer', background: activeTab === tab.key ? 'rgba(255,184,0,0.12)' : 'transparent', color: activeTab === tab.key ? '#FFB800' : 'rgba(255,255,255,0.4)', fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.15s', boxShadow: activeTab === tab.key ? '0 0 0 1px rgba(255,184,0,0.22)' : 'none' }}>
                  {tab.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'shop' ? (
                <motion.div key="shop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                    {featuredItem && (
                      <FeaturedBanner
                        item={featuredItem}
                        userCoins={coins}
                        owned={ownedSlugs.has(featuredItem.slug)}
                        onBuy={setPendingItem}
                      />
                    )}
                    <div>
                      <h2 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1rem', color: '#fff', marginBottom: '16px' }}>All Items</h2>
                      <StoreGrid
                        items={STORE_ITEMS}
                        activeCategory={activeCategory}
                        onCategoryChange={setActiveCategory}
                        ownedSlugs={ownedSlugs}
                        activeIds={activeIds}
                        userCoins={coins}
                        onBuy={setPendingItem}
                        onActivate={(item) => handleActivate({ itemId: item._id, slug: item.slug })}
                      />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="inventory" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                  {invLoading ? (
                    <div style={{ padding: '60px', textAlign: 'center', fontFamily: '"DM Sans", sans-serif', fontSize: '0.88rem', color: 'rgba(255,255,255,0.3)' }}>Loading inventory…</div>
                  ) : (
                    <InventoryPanel
                      inventory={inventory}
                      activeBoosters={activeBoosters}
                      onActivate={handleActivate}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      <AnimatePresence>
        {pendingItem && (
          <PurchaseModal
            item={pendingItem}
            userCoins={coins}
            onConfirm={handleConfirmPurchase}
            onCancel={() => setPendingItem(null)}
          />
        )}
      </AnimatePresence>

      <AvatarAssistant />
    </motion.div>
  )
}
