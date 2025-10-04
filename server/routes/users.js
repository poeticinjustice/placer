import express from 'express'
import { body } from 'express-validator'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import { uploadSingleMiddleware } from '../middleware/upload.js'
import * as usersController from '../controllers/usersController.js'

const router = express.Router()

// Get current user's profile
router.get('/profile', authenticate, usersController.getProfile)

// Update current user's profile
router.put('/profile', authenticate, uploadSingleMiddleware, [
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim(),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio cannot be more than 500 characters'),
  body('location').optional().isLength({ max: 100 }).withMessage('Location cannot be more than 100 characters')
], usersController.updateProfile)

// Get current user's places
router.get('/places', authenticate, usersController.getUserPlaces)

// Get current user's comments
router.get('/comments', authenticate, usersController.getUserComments)

// Get user by ID (public profile)
router.get('/:id', usersController.getUserById)

// Admin routes
router.get('/admin/all', authenticate, requireAdmin, usersController.getAllUsers)
router.get('/admin/pending', authenticate, requireAdmin, usersController.getPendingUsers)
router.put('/admin/approve/:id', authenticate, requireAdmin, usersController.approveUser)
router.delete('/admin/reject/:id', authenticate, requireAdmin, usersController.rejectUser)
router.put('/admin/toggle-admin/:id', authenticate, requireAdmin, usersController.toggleAdminStatus)

export default router
