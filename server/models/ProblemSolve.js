import mongoose from 'mongoose'

// ── Per-user problem solve record ─────────────────────────
// One document per (user, problemId) pair — tracks first solve date
const problemSolveSchema = new mongoose.Schema(
  {
    user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    problemId:  { type: Number, required: true },       // matches PROBLEMS[].id in frontend data
    subject:    { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    solvedAt:   { type: Date, default: Date.now },       // UTC date of first solve
  },
  { timestamps: false }
)

// One solve record per user+problem
problemSolveSchema.index({ user: 1, problemId: 1 }, { unique: true })
// Fast daily aggregation queries
problemSolveSchema.index({ user: 1, solvedAt: -1 })

const ProblemSolve = mongoose.model('ProblemSolve', problemSolveSchema)
export default ProblemSolve
