import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'

import connectDB from './config/db.js'

// Seed helpers
import { seedDSAQuestions } from './controllers/levelController.js'

// Routes
import authRoutes from './routes/authRoutes.js'
import subjectRoutes from './routes/subjectRoutes.js'
import levelRoutes from './routes/levelRoutes.js'
import contestRoutes from './routes/contestRoutes.js'
import friendRoutes from './routes/friendRoutes.js'
import rewardsRoutes      from './routes/rewardsRoutes.js'
import leaderboardRoutes  from './routes/leaderboardRoutes.js'
import fightRoutes        from './routes/fightRoutes.js'
import storeRoutes        from './routes/storeRoutes.js'
import achievementRoutes  from './routes/achievementRoutes.js'
import planRoutes            from './routes/planRoutes.js'
import notificationRoutes    from './routes/notificationRoutes.js'
import dailyChallengeRoutes  from './routes/dailyChallengeRoutes.js'
import problemsRoutes        from './routes/problemsRoutes.js'

// ── Connect to MongoDB ───────────────────────────────────
await connectDB()

// Seed demo content (idempotent)
try { await seedDSAQuestions() } catch(e) { console.warn("Seed warning:", e.message) }

const app = express()
const PORT = process.env.PORT || 5000

// ── Security middleware ──────────────────────────────────
app.use(helmet())

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// ── Rate limiting ────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests — please try again later' },
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many auth attempts — please try again later' },
})

app.use(limiter)

// ── Body parsing ─────────────────────────────────────────
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true }))

// ── Request logging (dev only) ───────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// ── Health check ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  })
})

// ── API Routes ───────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/subjects', subjectRoutes)
app.use('/api/levels', levelRoutes)
app.use('/api/contests', contestRoutes)
app.use('/api/friends', friendRoutes)
app.use('/api/users',   friendRoutes)   // /api/users/search shares same router
app.use('/api', rewardsRoutes)
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/fights',      fightRoutes)
app.use('/api/store',        storeRoutes)
app.use('/api/achievements', achievementRoutes)
app.use('/api/plans',             planRoutes)
app.use('/api/notifications',     notificationRoutes)
app.use('/api/daily-challenge',   dailyChallengeRoutes)
app.use('/api',                   problemsRoutes)

// ── 404 handler ──────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` })
})

// ── Global error handler ─────────────────────────────────
app.use((err, req, res, next) => {
  console.error('🔥 Server error:', err)

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message)
    return res.status(400).json({ message: messages.join(', ') })
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    return res.status(409).json({ message: `${field} already exists` })
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' })
  }

  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal server error'
  res.status(statusCode).json({ message })
})

// ── Start server with Socket.io ───────────────────────────
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { registerFightHandlers } from './socket/fightSocket.js'

const httpServer = createServer(app)

const io = new SocketIOServer(httpServer, {
  cors: {
    origin:      process.env.CLIENT_URL || 'http://localhost:5173',
    methods:     ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})

registerFightHandlers(io)

httpServer.listen(PORT, () => {
  console.log(`\n🚀  Nexus Learn server running`)
  console.log(`   Mode:      ${process.env.NODE_ENV || 'development'}`)
  console.log(`   Port:      ${PORT}`)
  console.log(`   URL:       http://localhost:${PORT}`)
  console.log(`   Socket.io: /fight namespace active\n`)
})

export default app
