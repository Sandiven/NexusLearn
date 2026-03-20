import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 12

const userSchema = new mongoose.Schema(
  {
    // ── Identity ───────────────────────────────────────
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [20, 'Username must be at most 20 characters'],
      match: [/^[a-zA-Z0-9_]+$/, 'Username: letters, numbers, underscores only'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },

    // ── Gamification ───────────────────────────────────
    xp:     { type: Number, default: 0, min: 0 },
    coins:  { type: Number, default: 0, min: 0 },
    level:  { type: Number, default: 1, min: 1 },
    streak: { type: Number, default: 0, min: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActivityDate: { type: Date, default: null },

    // ── Social ─────────────────────────────────────────
    friends:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    badges:   [{ type: String }],

    // ── Profile ────────────────────────────────────────
    avatar:  { type: String, default: 'default' },
    bio:     { type: String, maxlength: 160, default: '' },
    country: { type: String, default: '' },

    // ── Achievements ───────────────────────────────────
    achievements: [
      {
        key:          { type: String, required: true },
        unlockedAt:   { type: Date, default: Date.now },
        xpAwarded:    { type: Number, default: 0 },
        coinsAwarded: { type: Number, default: 0 },
      },
    ],

    // ── Store Inventory ────────────────────────────────    
    inventory: [
      {
        itemId:      { type: mongoose.Schema.Types.ObjectId, ref: 'StoreItem' },
        slug:        { type: String },
        purchasedAt: { type: Date, default: Date.now },
        active:      { type: Boolean, default: false },
        expiresAt:   { type: Date, default: null },
      },
    ],
    activeBoosters: [
      {
        itemId:          { type: mongoose.Schema.Types.ObjectId, ref: 'StoreItem' },
        slug:            { type: String },
        xpMultiplier:    { type: Number, default: 1 },
        coinMultiplier:  { type: Number, default: 1 },
        streakShield:    { type: Boolean, default: false },
        activatedAt:     { type: Date, default: Date.now },
        expiresAt:       { type: Date, default: null },
        levelsRemaining: { type: Number, default: 0 },
      },
    ],

    // ── Plan ───────────────────────────────────────────
    plan: {
      type: String,
      enum: ['free', 'pro', 'elite'],
      default: 'free',
    },

    // ── System ─────────────────────────────────────────
    isEmailVerified: { type: Boolean, default: false },
    isActive:        { type: Boolean, default: true },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
)

// ── Indexes ──────────────────────────────────────────────
userSchema.index({ xp: -1 })
userSchema.index({ username: 1 })
userSchema.index({ email: 1 })

// ── Pre-save: hash password ───────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (err) {
    next(err)
  }
})

// ── Instance: verify password ─────────────────────────────
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password)
}

// ── Instance: safe public profile ────────────────────────
userSchema.methods.toPublicProfile = function () {
  const obj = this.toObject()
  delete obj.password
  delete obj.__v
  return obj
}

const User = mongoose.model('User', userSchema)
export default User
