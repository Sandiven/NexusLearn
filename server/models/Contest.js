import mongoose from 'mongoose'

const contestSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    subjectSlug: { type: String, default: '' },
    accentColor: { type: String, default: '#FFB800' },
    badge:       { type: String, default: '⚡' },

    // ── Timing ──────────────────────────────────────────
    timeLimit: { type: Number, required: true }, // seconds total
    startTime: { type: Date, required: true },
    endTime:   { type: Date, required: true },
    status: {
      type: String,
      enum: ['upcoming', 'active', 'ended'],
      default: 'upcoming',
    },

    // ── Embedded questions ───────────────────────────────
    questions: [
      {
        questionText: { type: String, required: true },
        options:      [{ type: String }],
        correctIndex: { type: Number, required: true },
        points:       { type: Number, default: 100 },
        difficulty:   { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
      },
    ],

    // ── Rewards ──────────────────────────────────────────
    xpReward:        { type: Number, default: 300 },
    coinReward:      { type: Number, default: 80 },
    participationXP: { type: Number, default: 50 },
    maxParticipants: { type: Number, default: 0 },
    isPublished:     { type: Boolean, default: false },
  },
  { timestamps: true }
)

contestSchema.index({ status: 1, startTime: -1 })

const Contest = mongoose.model('Contest', contestSchema)
export default Contest
