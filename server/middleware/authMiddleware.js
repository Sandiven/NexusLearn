import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// ── Protect: verify JWT and attach req.user ───────────────
export const protect = async (req, res, next) => {
  let token

  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1]
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorised — no token provided' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select('-password')

    if (!user) {
      return res.status(401).json({ message: 'Not authorised — user no longer exists' })
    }
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account has been deactivated' })
    }

    req.user = user
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired — please log in again' })
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' })
    }
    next(err)
  }
}

// ── RestrictTo: role-based guard ──────────────────────────
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({
        message: `Access denied — requires role: ${roles.join(', ')}`,
      })
    }
    next()
  }
}
