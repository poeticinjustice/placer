import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId).select('-password')

    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' })
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' })
  }
}

export const requireAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' })
    }
    next()
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const requireApproval = async (req, res, next) => {
  try {
    if (!req.user.isApproved && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Your account is pending admin approval. You can update your profile but cannot create posts yet.'
      })
    }
    next()
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}