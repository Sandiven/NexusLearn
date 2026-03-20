import mongoose from 'mongoose'

const achievementSchema = new mongoose.Schema(
  {
    // ── Identity ─────────────────────────────────────────
    key:         { type: String, required: true, unique: true }, // e.g. 'first_level'
    name:        { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    icon:        { type: String, default: '★' },

    // ── Classification ────────────────────────────────────
    category: {
      type: String,
      enum: ['learning', 'streak', 'competition', 'social', 'collection', 'special'],
      required: true,
    },
    rarity: {
      type: String,
      enum: ['common', 'rare', 'epic', 'legendary'],
      default: 'common',
    },

    // ── Trigger condition ─────────────────────────────────
    trigger: {
      event:    { type: String, required: true },  // LEVEL_COMPLETED etc.
      field:    { type: String, default: null },    // user field to check (e.g. 'xp')
      operator: { type: String, enum: ['gte','lte','eq','gt','lt'], default: 'gte' },
      value:    { type: Number, default: 1 },
    },

    // ── Reward ────────────────────────────────────────────
    xpReward:   { type: Number, default: 0 },
    coinReward: { type: Number, default: 0 },
    badgeColor: { type: String, default: '#00F5FF' },

    // ── Display ───────────────────────────────────────────
    isSecret:   { type: Boolean, default: false }, // hidden until unlocked
    isActive:   { type: Boolean, default: true  },
    order:      { type: Number,  default: 0      },
  },
  { timestamps: true }
)

achievementSchema.index({ key: 1 })
achievementSchema.index({ category: 1 })
achievementSchema.index({ trigger: 1 })

const Achievement = mongoose.model('Achievement', achievementSchema)
export default Achievement
