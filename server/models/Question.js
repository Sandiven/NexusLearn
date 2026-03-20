import mongoose from 'mongoose'

const questionSchema = new mongoose.Schema(
  {
    levelId:      { type: Number, required: true, index: true },
    subjectSlug:  { type: String, required: true, index: true },
    phase: {
      type: String,
      enum: ['mid_quiz', 'content_test', 'cumulative'],
      required: true,
    },
    questionText: { type: String, required: true, trim: true },
    options:      [{ type: String, required: true }],
    correctIndex: { type: Number, required: true, min: 0, max: 3 },
    explanation:  { type: String, default: '' },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    points:       { type: Number, default: 10 },
    levelSource:  { type: Number, default: null }, // for cumulative: which level it came from
    tags:         [{ type: String }],
  },
  { timestamps: true }
)

questionSchema.index({ levelId: 1, phase: 1 })
questionSchema.index({ subjectSlug: 1, levelId: 1 })

const Question = mongoose.model('Question', questionSchema)
export default Question
