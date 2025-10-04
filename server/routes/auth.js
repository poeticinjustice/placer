import express from 'express'
import { body } from 'express-validator'
import { authenticate } from '../middleware/auth.js'
import * as authController from '../controllers/authController.js'

const router = express.Router()

router.post('/signup', [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], authController.signup)

router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], authController.login)

router.get('/me', authenticate, authController.getCurrentUser)

router.post('/logout', authenticate, authController.logout)

router.put('/change-password', authenticate, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Passwords do not match')
    }
    return true
  })
], authController.changePassword)

export default router
