import mongoose from 'mongoose'

// ── Per-user XP history log ───────────────────────────────
// Appended whenever XP is awarded. Used to build the XP graph on Progress page.
const xpHistorySchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount:  { type: Number, required: true },   // XP earned in this event
    event:   { type: String, default: '' },       // e.g. LEVEL_COMPLETED, PROBLEM_SOLVED
    earnedAt:{ type: Date, default: Date.now },
  },
  { timestamps: false }
)

xpHistorySchema.index({ user: 1, earnedAt: -1 })

const XPHistory = mongoose.model('XPHistory', xpHistorySchema)
export default XPHistory
