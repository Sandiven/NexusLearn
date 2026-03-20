import mongoose from 'mongoose'

// ── Per-user attempt record ───────────────────────────────
const attemptSchema = new mongoose.Schema({
  user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  selectedIndex: { type: Number, required: true },
  isCorrect:     { type: Boolean, required: true },
  rewardGranted: { type: Boolean, default: false },
  attemptedAt:   { type: Date, default: Date.now },
}, { _id: false })

// ── Daily challenge document (one per date) ───────────────
const dailyChallengeSchema = new mongoose.Schema({
  // YYYY-MM-DD string — one document per calendar day
  date: { type: String, required: true, unique: true, index: true },

  // The question fields stored inline for simplicity
  questionId:   { type: Number, required: true },  // from the pool (used for determinism)
  subject:      { type: String, required: true },
  subjectLabel: { type: String, required: true },
  difficulty:   { type: String, enum: ['medium','hard'], required: true },
  title:        { type: String, required: true },
  question:     { type: String, required: true },
  options:      [{ type: String }],
  correctIndex: { type: Number, required: true },
  explanation:  { type: String, default: '' },
  accentColor:  { type: String, default: '#00F5FF' },

  // Per-user attempts for this day
  attempts: [attemptSchema],
}, {
  timestamps: true,
})

// Index for fast per-user lookup
dailyChallengeSchema.index({ date: 1, 'attempts.user': 1 })

const DailyChallenge = mongoose.model('DailyChallenge', dailyChallengeSchema)
export default DailyChallenge
