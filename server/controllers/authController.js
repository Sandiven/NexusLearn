import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })

const sendAuthResponse = (res, statusCode, user) => {
  const token = signToken(user._id)
  res.status(statusCode).json({
    success: true,
    token,
    user: user.toPublicProfile(),
  })
}

// POST /api/auth/signup
export const signup = async (req, res, next) => {
  try {
    const { username, email, password, confirmPassword } = req.body

    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' })
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' })
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' })
    }

    const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] })
    if (existing) {
      const field = existing.email === email.toLowerCase() ? 'Email' : 'Username'
      return res.status(409).json({ message: `${field} is already in use` })
    }

    const user = await User.create({ username, email, password })
    sendAuthResponse(res, 201, user)
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0]
      return res.status(409).json({ message: `${field} already exists` })
    }
    next(err)
  }
}

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password')

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account has been deactivated' })
    }

    sendAuthResponse(res, 200, user)
  } catch (err) {
    next(err)
  }
}

// GET /api/auth/me
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.status(200).json({ success: true, user: user.toPublicProfile() })
  } catch (err) {
    next(err)
  }
}

// PATCH /api/auth/avatar
export const updateAvatar = async (req, res, next) => {
  try {
    const { avatar } = req.body
    if (!avatar || typeof avatar !== 'string') {
      return res.status(400).json({ message: 'Avatar value is required' })
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: true, runValidators: false }
    )
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.status(200).json({ success: true, user: user.toPublicProfile() })
  } catch (err) {
    next(err)
  }
}
