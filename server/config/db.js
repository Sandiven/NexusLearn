import mongoose from 'mongoose'

const connectDB = async () => {
  const uri = process.env.MONGO_URI

  if (!uri) {
    console.error('❌  MONGO_URI is not defined in environment variables')
    process.exit(1)
  }

  try {
    const conn = await mongoose.connect(uri, {
      // Recommended options for Mongoose 8+
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })

    console.log(`✅  MongoDB connected: ${conn.connection.host}`)

    // Connection event listeners
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️   MongoDB disconnected — retrying...')
    })

    mongoose.connection.on('error', (err) => {
      console.error('❌  MongoDB connection error:', err)
    })
  } catch (error) {
    console.error('❌  MongoDB initial connection failed:', error.message)
    process.exit(1)
  }
}

export default connectDB
