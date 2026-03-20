import mongoose from 'mongoose'

const storeItemSchema = new mongoose.Schema(
  {
    // ── Identity ─────────────────────────────────────────
    name:        { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    slug:        { type: String, required: true, unique: true, lowercase: true },

    // ── Classification ────────────────────────────────────
    type: {
      type: String,
      enum: ['cosmetic', 'booster', 'theme', 'badge'],
      required: true,
    },
    category: {
      type: String,
      enum: ['avatar', 'frame', 'theme', 'xp_boost', 'coin_boost', 'streak', 'badge'],
      required: true,
    },
    rarity: {
      type: String,
      enum: ['common', 'rare', 'epic', 'legendary'],
      default: 'common',
    },

    // ── Pricing ───────────────────────────────────────────
    price:       { type: Number, required: true, min: 0 },
    originalPrice:{ type: Number, default: null },   // set when on sale

    // ── Visual ────────────────────────────────────────────
    accentColor: { type: String, default: '#00F5FF' },
    icon:        { type: String, default: '◈' },       // emoji or icon key
    previewImage:{ type: String, default: null },

    // ── Effect payload (applied to user on purchase) ──────
    effect: {
      xpMultiplier:   { type: Number, default: 1 },     // 1 = no boost
      coinMultiplier: { type: Number, default: 1 },
      streakShield:   { type: Boolean, default: false }, // freeze streak
      durationDays:   { type: Number, default: 0 },      // 0 = permanent
      durationLevels: { type: Number, default: 0 },      // 0 = unlimited
      avatarKey:      { type: String, default: null },
      themeKey:       { type: String, default: null },
      badgeKey:       { type: String, default: null },
    },

    // ── Availability ──────────────────────────────────────
    stock:       { type: Number, default: -1 },        // -1 = unlimited
    featured:    { type: Boolean, default: false },
    isActive:    { type: Boolean, default: true },
    limitPerUser:{ type: Number, default: 1 },         // max purchases per user
    order:       { type: Number, default: 0 },
  },
  { timestamps: true }
)

storeItemSchema.index({ type: 1, isActive: 1 })
storeItemSchema.index({ featured: 1 })
storeItemSchema.index({ slug: 1 })

const StoreItem = mongoose.model('StoreItem', storeItemSchema)
export default StoreItem
