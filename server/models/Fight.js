// import mongoose from 'mongoose'

// const playerStateSchema = new mongoose.Schema({
//   user:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   score:          { type: Number, default: 0 },
//   correctAnswers: { type: Number, default: 0 },
//   answers: [{
//     questionIndex: Number, selectedIndex: Number,
//     correct: Boolean, timeTaken: Number, points: Number,
//   }],
//   finishedAt: { type: Date, default: null },
//   connected:  { type: Boolean, default: false },
// }, { _id: false })

// const fightSchema = new mongoose.Schema({
//   player1: playerStateSchema,
//   player2: playerStateSchema,
//   questions: [{
//     questionText: { type: String, required: true },
//     options:      [{ type: String }],
//     correctIndex: { type: Number, required: true },
//     points:       { type: Number, default: 100 },
//     difficulty:   { type: String, enum: ['easy','medium','hard'], default: 'medium' },
//   }],
//   questionCount:   { type: Number, default: 5 },
//   timePerQuestion: { type: Number, default: 15 },
//   subjectSlug:     { type: String, default: 'data-structures' },
//   status: {
//     type: String,
//     enum: ['invited','accepted','countdown','active','finished','cancelled'],
//     default: 'invited',
//   },
//   currentQuestion:     { type: Number, default: 0 },
//   countdownStartedAt:  { type: Date, default: null },
//   startedAt:           { type: Date, default: null },
//   finishedAt:          { type: Date, default: null },
//   winner:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
//   isDraw:           { type: Boolean, default: false },
//   xpRewardWinner:   { type: Number, default: 300 },
//   xpRewardLoser:    { type: Number, default: 75 },
//   coinRewardWinner: { type: Number, default: 100 },
//   coinRewardLoser:  { type: Number, default: 25 },
// }, { timestamps: true })

// fightSchema.index({ 'player1.user': 1, status: 1 })
// fightSchema.index({ 'player2.user': 1, status: 1 })
// fightSchema.index({ status: 1, createdAt: -1 })

// const Fight = mongoose.model('Fight', fightSchema)
// export default Fight
import mongoose from 'mongoose'

const playerStateSchema = new mongoose.Schema({
  user:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score:          { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  answers: [{
    questionIndex: Number, selectedIndex: Number,
    correct: Boolean, timeTaken: Number, points: Number,
  }],
  finishedAt: { type: Date, default: null },
  connected:  { type: Boolean, default: false },
}, { _id: false })

const fightSchema = new mongoose.Schema({
  player1: playerStateSchema,
  player2: playerStateSchema,
  questions: [{
    questionText: { type: String, required: true },
    options:      [{ type: String }],
    correctIndex: { type: Number, required: true },
    points:       { type: Number, default: 100 },
    difficulty:   { type: String, enum: ['easy','medium','hard'], default: 'medium' },
  }],
  questionCount:   { type: Number, default: 5 },
  timePerQuestion: { type: Number, default: 15 },
  subjectSlug:     { type: String, default: 'data-structures' },
  status: {
    type: String,
    enum: ['invited','accepted','countdown','active','finished','cancelled'],
    default: 'invited',
  },
  currentQuestion:     { type: Number, default: 0 },
  countdownStartedAt:  { type: Date, default: null },
  questionStartedAt:   { type: Date, default: null },
  startedAt:           { type: Date, default: null },
  finishedAt:          { type: Date, default: null },
  abandonedBy:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  winner:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  isDraw:           { type: Boolean, default: false },
  xpRewardWinner:   { type: Number, default: 300 },
  xpRewardLoser:    { type: Number, default: 75 },
  coinRewardWinner: { type: Number, default: 100 },
  coinRewardLoser:  { type: Number, default: 25 },
}, { timestamps: true })

fightSchema.index({ 'player1.user': 1, status: 1 })
fightSchema.index({ 'player2.user': 1, status: 1 })
fightSchema.index({ status: 1, createdAt: -1 })

const Fight = mongoose.model('Fight', fightSchema)
export default Fight
