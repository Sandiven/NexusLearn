import mongoose from 'mongoose'

const userSubjectProgressSchema = new mongoose.Schema(
  {
    user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subjectSlug: { type: String, required: true },
    subjectName: { type: String, default: '' },
    level:       { type: Number, default: 1, min: 1 },   // subject-wise level, starts at 1
    xpEarned:    { type: Number, default: 0, min: 0 },
    levelsCompleted: { type: Number, default: 0, min: 0 },
    totalLevels:     { type: Number, default: 10 },
  },
  { timestamps: true }
)

userSubjectProgressSchema.index({ user: 1, subjectSlug: 1 }, { unique: true })

const UserSubjectProgress = mongoose.model('UserSubjectProgress', userSubjectProgressSchema)
export default UserSubjectProgress
