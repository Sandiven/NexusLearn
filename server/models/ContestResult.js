import mongoose from 'mongoose'

const contestResultSchema = new mongoose.Schema(
  {
    user:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contest:        { type: mongoose.Schema.Types.ObjectId, ref: 'Contest', required: true },

    // ── Scoring ──────────────────────────────────────────
    score:          { type: Number, required: true, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    totalQuestions: { type: Number, required: true },
    completionTime: { type: Number, required: true }, // seconds taken

    // ── Per-question answers ─────────────────────────────
    answers: [
      {
        questionIndex: { type: Number },
        selectedIndex: { type: Number },
        correct:       { type: Boolean },
        timeTaken:     { type: Number }, // seconds for this question
      },
    ],

    // ── Ranking ──────────────────────────────────────────
    rank:           { type: Number, default: null },

    // ── Rewards given ────────────────────────────────────
    xpAwarded:      { type: Number, default: 0 },
    coinsAwarded:   { type: Number, default: 0 },
  },
  { timestamps: true }
)

contestResultSchema.index({ contest: 1, score: -1, completionTime: 1 })
contestResultSchema.index({ user: 1, contest: 1 }, { unique: true })

const ContestResult = mongoose.model('ContestResult', contestResultSchema)
export default ContestResult
