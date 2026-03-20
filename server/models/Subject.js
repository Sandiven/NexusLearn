import mongoose from 'mongoose'

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: '' },
    icon: { type: String, default: '' },         // icon name or URL
    accentColor: { type: String, default: '#00F5FF' },
    totalLevels: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    order: { type: Number, default: 0 },          // display order
  },
  { timestamps: true }
)

subjectSchema.index({ slug: 1 })

const Subject = mongoose.model('Subject', subjectSchema)
export default Subject
