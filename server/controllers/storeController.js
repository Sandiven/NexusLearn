import StoreItem from '../models/StoreItem.js'
import User      from '../models/User.js'

// ── GET /api/store/items ──────────────────────────────────
// Query: ?type=booster&featured=true&category=avatar
export const getStoreItems = async (req, res, next) => {
  try {
    const { type, featured, category } = req.query
    const filter = { isActive: true }
    if (type)     filter.type     = type
    if (category) filter.category = category
    if (featured) filter.featured = featured === 'true'

    const items = await StoreItem.find(filter)
      .sort({ featured: -1, order: 1, createdAt: -1 })

    // Annotate each item with ownership status for current user
    const user = await User.findById(req.user._id).select('inventory')
    const ownedIds = new Set((user?.inventory || []).map(i => i.itemId?.toString()))

    const annotated = items.map(item => ({
      ...item.toObject(),
      owned: ownedIds.has(item._id.toString()),
    }))

    res.status(200).json({ success: true, data: annotated })
  } catch (err) { next(err) }
}

// ── POST /api/store/purchase ──────────────────────────────
// Body: { itemId }
export const purchaseItem = async (req, res, next) => {
  try {
    const { itemId } = req.body
    const userId = req.user._id

    const [item, user] = await Promise.all([
      StoreItem.findById(itemId),
      User.findById(userId),
    ])

    if (!item)        return res.status(404).json({ message: 'Item not found' })
    if (!item.isActive) return res.status(400).json({ message: 'Item not available' })

    // Ownership check
    const alreadyOwned = user.inventory?.some(i => i.itemId?.toString() === itemId.toString())
    if (alreadyOwned && item.limitPerUser === 1) {
      return res.status(409).json({ message: 'You already own this item' })
    }

    // Stock check
    if (item.stock > 0) {
      const purchaseCount = await User.countDocuments({ 'inventory.itemId': itemId })
      if (purchaseCount >= item.stock) {
        return res.status(400).json({ message: 'Item is out of stock' })
      }
    }

    // Funds check
    if (user.coins < item.price) {
      return res.status(400).json({
        message: `Insufficient coins. Need ${item.price}, have ${user.coins}.`,
        coinsNeeded: item.price - user.coins,
      })
    }

    // Build inventory entry
    const inventoryEntry = {
      itemId:      item._id,
      slug:        item.slug,
      purchasedAt: new Date(),
      active:      false,
    }

    // If booster, set expiry
    if (item.type === 'booster' && item.effect.durationDays > 0) {
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + item.effect.durationDays)
      inventoryEntry.expiresAt = expiresAt
    }

    // Apply active booster immediately
    const activeBooster = item.type === 'booster' ? {
      itemId:         item._id,
      slug:           item.slug,
      xpMultiplier:   item.effect.xpMultiplier,
      coinMultiplier: item.effect.coinMultiplier,
      streakShield:   item.effect.streakShield,
      activatedAt:    new Date(),
      expiresAt:      inventoryEntry.expiresAt || null,
      levelsRemaining:item.effect.durationLevels || 0,
    } : null

    // Commit: deduct coins + add to inventory
    const updateOps = {
      $inc:  { coins: -item.price },
      $push: { inventory: inventoryEntry },
    }
    if (activeBooster) {
      updateOps.$push.activeBoosters = activeBooster
    }

    await User.findByIdAndUpdate(userId, updateOps)

    res.status(200).json({
      success: true,
      data: {
        item:         item.toObject(),
        coinsSpent:   item.price,
        coinsBalance: user.coins - item.price,
        activeBooster,
      },
    })
  } catch (err) { next(err) }
}

// ── GET /api/store/inventory ──────────────────────────────
export const getInventory = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('inventory activeBoosters coins')

    if (!user) return res.status(404).json({ message: 'User not found' })

    // Populate item details for each inventory entry
    const itemIds = user.inventory.map(i => i.itemId)
    const items   = await StoreItem.find({ _id: { $in: itemIds } })
    const itemMap = new Map(items.map(i => [i._id.toString(), i]))

    const enriched = user.inventory.map(entry => ({
      ...entry.toObject(),
      item: itemMap.get(entry.itemId?.toString()) || null,
    }))

    res.status(200).json({
      success: true,
      data: {
        inventory:      enriched,
        activeBoosters: user.activeBoosters,
        coins:          user.coins,
      },
    })
  } catch (err) { next(err) }
}

// ── POST /api/store/activate ──────────────────────────────
// Body: { itemId } — activates a cosmetic (avatar/theme)
export const activateItem = async (req, res, next) => {
  try {
    const { itemId } = req.body
    const userId = req.user._id

    const user = await User.findById(userId).select('inventory')
    const entry = user.inventory.find(i => i.itemId?.toString() === itemId)
    if (!entry) return res.status(404).json({ message: 'Item not in inventory' })

    // Deactivate same-category items, activate this one
    const item = await StoreItem.findById(itemId)
    await User.updateOne(
      { _id: userId, 'inventory.itemId': { $exists: true } },
      { $set: { 'inventory.$[e].active': false } },
      { arrayFilters: [{ 'e.itemId': { $exists: true } }] }  // all off
    )
    await User.updateOne(
      { _id: userId, 'inventory.itemId': item._id },
      { $set: { 'inventory.$.active': true } }
    )

    res.status(200).json({ success: true, message: `${item.name} activated` })
  } catch (err) { next(err) }
}

// ── Default store items (seeded once to MongoDB) ─────────
const DEFAULT_STORE_ITEMS = [
  { slug: 'neon-cyber-avatar',  name: 'Neon Cyber Avatar',    description: 'A glowing cyberpunk avatar frame with animated neon border.', type: 'cosmetic', category: 'avatar',     rarity: 'epic',      price: 400, accentColor: '#00F5FF', icon: '◈', featured: true, order: 1, effect: { durationDays: 0 } },
  { slug: 'violet-storm-frame', name: 'Violet Storm Frame',   description: 'Surging violet lightning border for your profile.', type: 'cosmetic', category: 'frame',      rarity: 'rare',      price: 250, accentColor: '#8B5CF6', icon: '◉', featured: true, order: 2, effect: { durationDays: 0 } },
  { slug: 'xp-surge-3x',        name: 'XP Surge 3×',          description: 'Triple XP on every activity for 24 hours.', type: 'booster', category: 'xp_boost',  rarity: 'legendary', price: 600, accentColor: '#FFB800', icon: '⚡', featured: true, order: 3, effect: { xpMultiplier: 3, durationDays: 1 } },
  { slug: 'xp-boost-2x-24h',    name: '2× XP Boost',          description: 'Double XP on all learning activities for 24 hours.', type: 'booster', category: 'xp_boost',  rarity: 'epic',      price: 350, accentColor: '#00F5FF', icon: '⚡', order: 4, effect: { xpMultiplier: 2, durationDays: 1 } },
  { slug: 'xp-boost-1-5x-48h',  name: '1.5× XP Boost 48h',   description: '1.5× XP for 48 hours.', type: 'booster', category: 'xp_boost',  rarity: 'rare',      price: 200, accentColor: '#00F5FF', icon: '⚡', order: 5, effect: { xpMultiplier: 1.5, durationDays: 2 } },
  { slug: 'coin-magnet-24h',     name: 'Coin Magnet',          description: 'Double coins from all activities for 24 hours.', type: 'booster', category: 'coin_boost', rarity: 'rare',      price: 200, accentColor: '#FFB800', icon: '●', order: 6, effect: { coinMultiplier: 2, durationDays: 1 } },
  { slug: 'streak-freeze',       name: 'Streak Freeze',        description: 'Protect your streak for one missed day.', type: 'booster', category: 'streak',    rarity: 'common',    price: 80,  accentColor: '#FF6B35', icon: '🔥', order: 7, effect: { streakShield: true, durationDays: 7 } },
  { slug: 'galaxy-theme',        name: 'Galaxy Theme',         description: 'Deep space galaxy dashboard theme.', type: 'theme',   category: 'theme',     rarity: 'epic',      price: 500, accentColor: '#8B5CF6', icon: '◆', order: 8, effect: { themeKey: 'galaxy', durationDays: 0 } },
]

// Seed default store items if DB is empty
async function ensureStoreItems() {
  const count = await StoreItem.countDocuments()
  if (count === 0) {
    await StoreItem.insertMany(DEFAULT_STORE_ITEMS.map(item => ({
      ...item,
      isActive: true,
      stock: -1,
      limitPerUser: 3,
      effect: { xpMultiplier: 1, coinMultiplier: 1, streakShield: false, durationDays: 0, durationLevels: 0, ...item.effect },
    })))
  }
}

// ── GET /api/store/catalogue ──────────────────────────────
// Returns items (seeding if needed) annotated with owned status
// This is the primary endpoint for the frontend shop
export const getStoreCatalogue = async (req, res, next) => {
  try {
    await ensureStoreItems()
    const items  = await StoreItem.find({ isActive: true }).sort({ featured: -1, order: 1 })
    const user   = await User.findById(req.user._id).select('inventory')
    const owned  = new Set((user?.inventory || []).map(i => i.slug?.toString()).filter(Boolean))

    const annotated = items.map(item => ({
      ...item.toObject(),
      _id: item.slug,   // expose slug as _id so frontend storeData IDs match
      owned: owned.has(item.slug),
    }))

    res.status(200).json({ success: true, data: annotated })
  } catch (err) { next(err) }
}

// ── POST /api/store/purchase/slug ─────────────────────────
// Purchase by slug (matches frontend storeData._id strings like 's001' → slug)
export const purchaseBySlug = async (req, res, next) => {
  try {
    await ensureStoreItems()
    const { slug, frontendId } = req.body
    const userId = req.user._id

    // Find item by slug — frontend storeData items have a slug field matching DB slugs
    const item = await StoreItem.findOne({ slug: slug || frontendId, isActive: true })

    if (!item) return res.status(404).json({ message: 'Item not found' })

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    // Check already owned — for cosmetics/themes/badges with limitPerUser=1, block re-purchase
    const existingPurchaseCount = user.inventory?.filter(i => i.slug === item.slug).length || 0
    if (existingPurchaseCount >= item.limitPerUser && item.limitPerUser > 0) {
      return res.status(409).json({ message: 'You already own this item' })
    }

    if (user.coins < item.price) {
      return res.status(400).json({ message: `Need ${item.price} coins, you have ${user.coins}` })
    }

    const now = new Date()
    const inventoryEntry = {
      itemId:      item._id,
      slug:        item.slug,
      purchasedAt: now,
      active:      false,
      expiresAt:   item.effect?.durationDays > 0
        ? new Date(now.getTime() + item.effect.durationDays * 86400000)
        : null,
    }

    await User.findByIdAndUpdate(userId, {
      $inc:  { coins: -item.price },
      $push: { inventory: inventoryEntry },
    })

    res.status(200).json({
      success: true,
      data: {
        item:         { ...item.toObject(), _id: item.slug },
        coinsSpent:   item.price,
        coinsBalance: user.coins - item.price,
      },
    })
  } catch (err) { next(err) }
}

// ── GET /api/store/owned ──────────────────────────────────
// Returns just the owned slugs for fast UI sync
export const getOwnedSlugs = async (req, res, next) => {
  try {
    const user   = await User.findById(req.user._id).select('inventory coins')
    const owned  = (user?.inventory || []).map(e => e.slug).filter(Boolean)
    res.status(200).json({ success: true, data: { ownedSlugs: owned, coins: user?.coins || 0 } })
  } catch (err) { next(err) }
}
