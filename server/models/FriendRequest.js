import mongoose from 'mongoose'

const friendRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    message: {
      type: String,
      maxlength: 120,
      default: '',
    },
  },
  { timestamps: true }
)

// Prevent duplicate requests in either direction
friendRequestSchema.index({ sender: 1, recipient: 1 }, { unique: true })
friendRequestSchema.index({ recipient: 1, status: 1 })
friendRequestSchema.index({ sender: 1, status: 1 })

const FriendRequest = mongoose.model('FriendRequest', friendRequestSchema)
export default FriendRequest
