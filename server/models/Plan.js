import mongoose from 'mongoose'

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: ['free', 'pro', 'elite'],
      required: true,
      unique: true,
    },
    displayName: { type: String, required: true },
    description: { type: String, default: '' },
    priceMonthly: { type: Number, default: 0 },
    priceYearly: { type: Number, default: 0 },
    features: [{ type: String }],
    limits: {
      dailyChallenges: { type: Number, default: 3 },    // -1 = unlimited
      contestsPerMonth: { type: Number, default: 2 },
      fightsPerDay: { type: Number, default: 1 },
    },
    accentColor: { type: String, default: '#00F5FF' },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

const Plan = mongoose.model('Plan', planSchema)
export default Plan
