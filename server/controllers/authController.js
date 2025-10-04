import jwt from 'jsonwebtoken'
import { validationResult } from 'express-validator'
import User from '../models/User.js'
import { sendSignupNotification } from '../utils/emailNotification.js'

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  })
}

const formatUserResponse = (user) => ({
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  isApproved: user.isApproved,
  role: user.role,
  avatar: user.avatar,
  bio: user.bio,
  location: user.location
})

export const signup = async (req, res) => {
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
    sendSignupNotification(user).catch(() => {
      // Silent fail - email is not critical
    })

    res.status(201).json({
      message: 'Account created successfully! Your account is pending admin approval.',
      token,
      user: formatUserResponse(user)
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error during signup' })
  }
}

export const login = async (req, res) => {
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
      user: formatUserResponse(user)
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error during login' })
  }
}

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    res.json({
      user: {
        ...formatUserResponse(user),
        placesCount: user.placesCount,
        joinedAt: user.joinedAt,
        lastLoginAt: user.lastLoginAt
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const logout = async (req, res) => {
  res.json({ message: 'Logout successful' })
}

export const changePassword = async (req, res) => {
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
}
