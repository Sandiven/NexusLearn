import mongoose from 'mongoose'

const levelSchema = new mongoose.Schema(
  {
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    title: { type: String, required: true, trim: true },
    levelNumber: { type: Number, required: true },
    description: { type: String, default: '' },
    xpReward: { type: Number, default: 50 },
    coinReward: { type: Number, default: 10 },
    passingScore: { type: Number, default: 70 }, // percentage required to pass
    timeLimit: { type: Number, default: 0 },      // seconds, 0 = no limit
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
)

levelSchema.index({ subject: 1, levelNumber: 1 }, { unique: true })

const Level = mongoose.model('Level', levelSchema)
export default Level
