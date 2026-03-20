import mongoose from 'mongoose'

const levelProgressSchema = new mongoose.Schema(
  {
    user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    levelId:     { type: Number, required: true },
    subjectSlug: { type: String, required: true },

    // Current phase in the flow
    phase: {
      type: String,
      enum: ['lecture', 'notes', 'content_test', 'cumulative', 'complete'],
      default: 'lecture',
    },

    // Content section progress
    lectureCompleted:    { type: Boolean, default: false },
    notesCompleted:      { type: Boolean, default: false },

    // Test scores
    contentTestScore:    { type: Number, default: null },
    cumulativeScore:     { type: Number, default: null },

    // Section completion flags
    testCompleted:       { type: Boolean, default: false },
    cumulativeCompleted: { type: Boolean, default: false },

    // Level completion
    passed:        { type: Boolean, default: false },
    xpAwarded:     { type: Number,  default: 0 },
    coinsAwarded:  { type: Number,  default: 0 },
    completedAt:   { type: Date,    default: null },
    attempts:      { type: Number,  default: 0 },
  },
  { timestamps: true }
)

levelProgressSchema.index({ user: 1, levelId: 1, subjectSlug: 1 }, { unique: true })

const LevelProgress = mongoose.model('LevelProgress', levelProgressSchema)
export default LevelProgress
