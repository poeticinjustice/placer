import express from 'express'
import { body } from 'express-validator'
import { authenticate, requireApproval } from '../middleware/auth.js'
import { uploadMiddleware } from '../middleware/upload.js'
import * as placesController from '../controllers/placesController.js'

const router = express.Router()

// Get all unique tags with counts
router.get('/tags', placesController.getTags)

// Get all places with filtering and pagination
router.get('/', placesController.getPlaces)

// Get single place by ID
router.get('/:id', placesController.getPlaceById)

// Create new place
router.post('/', authenticate, requireApproval, uploadMiddleware, [
  body('name').trim().notEmpty().withMessage('Place name is required'),
  body('location.coordinates.coordinates').optional().custom((value) => {
    if (!value) return true
    if (typeof value === 'string') {
      try {
        const coords = JSON.parse(value)
        if (Array.isArray(coords) && coords.length === 2 &&
            coords.every(coord => typeof coord === 'number')) {
          return true
        }
      } catch {
        throw new Error('Invalid coordinates format')
      }
    } else if (Array.isArray(value) && value.length === 2 &&
               value.every(coord => typeof coord === 'number')) {
      return true
    }
    throw new Error('Valid coordinates must be an array of 2 numbers')
  })
], placesController.createPlace)

// Update place
router.put('/:id', authenticate, uploadMiddleware, placesController.updatePlace)

// Delete place
router.delete('/:id', authenticate, placesController.deletePlace)

// Like/unlike place
router.post('/:id/like', authenticate, placesController.likePlace)

// Add comment to place
router.post('/:id/comments', authenticate, [
  body('content').trim().notEmpty().withMessage('Comment content is required')
], placesController.addComment)

// Delete comment from place
router.delete('/:id/comments/:commentId', authenticate, placesController.deleteComment)

// Toggle featured status (admin only)
router.patch('/:id/featured', authenticate, placesController.toggleFeatured)

export default router
