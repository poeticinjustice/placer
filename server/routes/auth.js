import express from 'express'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import User from '../models/User.js'
import { authenticate } from '../middleware/auth.js'
import { sendSignupNotification } from '../utils/emailNotification.js'

const router = express.Router()

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  })
}

router.post('/signup', [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { firstName, lastName, email, password } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' })
    }

    const user = new User({
      firstName,
      lastName,
      email,
      password
    })

    await user.save()

    const token = generateToken(user._id)

    user.lastLoginAt = new Date()
    await user.save()

    // Send email notification (non-blocking)
    sendSignupNotification(user).catch(err => {
    })

    res.status(201).json({
      message: 'Account created successfully! Your account is pending admin approval.',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isApproved: user.isApproved,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error during signup' })
  }
})

router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { email, password } = req.body

    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = generateToken(user._id)

    user.lastLoginAt = new Date()
    await user.save()

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isApproved: user.isApproved,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error during login' })
  }
})

router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isApproved: user.isApproved,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        placesCount: user.placesCount,
        joinedAt: user.joinedAt,
        lastLoginAt: user.lastLoginAt
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/logout', authenticate, async (req, res) => {
  res.json({ message: 'Logout successful' })
})

router.put('/change-password', authenticate, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Passwords do not match')
    }
    return true
  })
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { currentPassword, newPassword } = req.body

    const user = await User.findById(req.user._id).select('+password')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const isPasswordValid = await user.comparePassword(currentPassword)
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' })
    }

    user.password = newPassword
    await user.save()

    res.json({ message: 'Password changed successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

export default router