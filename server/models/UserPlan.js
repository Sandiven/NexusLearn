import mongoose from 'mongoose'

const userPlanSchema = new mongoose.Schema(
  {
    user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    planId: { type: String, required: true }, // e.g. 'js-50', 'dsa-150'

    // ── User-configured schedule ──────────────────────────
    daysPerWeek:      { type: [Number], default: [] }, // 0=Sun,1=Mon,...,6=Sat
    questionsPerDay:  { type: Number, default: 5, min: 1 },

    // ── Progress ─────────────────────────────────────────
    status: {
      type: String,
      enum: ['not_started', 'active', 'completed', 'abandoned'],
      default: 'not_started',
    },
    questionsCompleted: { type: Number, default: 0 },
    totalQuestions:     { type: Number, required: true },

    // ── Streak ────────────────────────────────────────────
    currentStreak:  { type: Number, default: 0 },
    longestStreak:  { type: Number, default: 0 },
    streakBreaks:   { type: Number, default: 0 },
    lastActivityAt: { type: Date, default: null },

    // ── Rewards ───────────────────────────────────────────
    maxPoints:      { type: Number, default: 0 }, // full reward if no breaks
    earnedPoints:   { type: Number, default: 0 }, // calculated on completion
    badgeEarned:    { type: Boolean, default: false },
    badgeKey:       { type: String, default: null },

    startedAt:   { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

// One enrollment per user per plan
userPlanSchema.index({ user: 1, planId: 1 }, { unique: true })

const UserPlan = mongoose.model('UserPlan', userPlanSchema)
export default UserPlan
