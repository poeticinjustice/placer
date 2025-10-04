import express from 'express'
import { body, validationResult } from 'express-validator'
import User from '../models/User.js'
import Place from '../models/Place.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import { uploadSingleMiddleware, uploadToCloudinary } from '../middleware/upload.js'

const router = express.Router()

router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    res.json({ user })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.put('/profile', authenticate, uploadSingleMiddleware, [
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim(),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio cannot be more than 500 characters'),
  body('location').optional().isLength({ max: 100 }).withMessage('Location cannot be more than 100 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const updateData = { ...req.body }

    if (req.file) {
      const result = await uploadToCloudinary(req.file)
      updateData.avatar = result.secure_url
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    )

    res.json({
      message: 'Profile updated successfully',
      user
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.get('/places', authenticate, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status = 'all'
    } = req.query

    const skip = (page - 1) * limit
    let query = { author: req.user._id }

    if (status !== 'all') {
      query.status = status
    }

    const places = await Place.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'firstName lastName avatar isApproved')

    const total = await Place.countDocuments(query)

    res.json({
      places,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.get('/comments', authenticate, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20
    } = req.query

    const skip = (page - 1) * limit

    // Find all places that have comments by this user
    const places = await Place.find({
      'comments.author': req.user._id
    })
      .select('_id name comments photos')
      .populate('comments.author', '_id firstName lastName avatar')
      .sort({ 'comments.createdAt': -1 })

    // Extract user's comments from all places
    let userComments = []
    places.forEach(place => {
      const placeComments = place.comments
        .filter(comment => comment.author._id.toString() === req.user._id.toString())
        .map(comment => ({
          _id: comment._id,
          content: comment.content,
          isAnonymous: comment.isAnonymous,
          createdAt: comment.createdAt,
          place: {
            _id: place._id,
            name: place.name,
            photo: place.photos && place.photos.length > 0 ? place.photos[0].url : null
          }
        }))
      userComments = [...userComments, ...placeComments]
    })

    // Sort by date
    userComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    // Paginate
    const total = userComments.length
    const paginatedComments = userComments.slice(skip, skip + parseInt(limit))

    res.json({
      comments: paginatedComments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-email')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const places = await Place.find({
      author: user._id,
      isPublic: true,
      status: 'published'
    })
    .sort({ createdAt: -1 })
    .limit(6)
    .populate('author', 'firstName lastName avatar isApproved')

    res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        placesCount: user.placesCount,
        joinedAt: user.joinedAt,
        isApproved: user.isApproved
      },
      recentPlaces: places
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.get('/admin/all', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 100
    } = req.query

    const skip = (page - 1) * limit

    const users = await User.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-password')

    const total = await User.countDocuments({})

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.get('/admin/pending', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20
    } = req.query

    const skip = (page - 1) * limit

    const users = await User.find({ isApproved: false, role: 'user' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-password')

    const total = await User.countDocuments({ isApproved: false, role: 'user' })

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.put('/admin/approve/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({
      message: 'User approved successfully',
      user
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.delete('/admin/reject/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot reject admin user' })
    }

    await User.findByIdAndDelete(req.params.id)
    await Place.deleteMany({ author: req.params.id })

    res.json({ message: 'User rejected and deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.put('/admin/toggle-admin/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot modify your own admin status' })
    }

    const newRole = user.role === 'admin' ? 'user' : 'admin'
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { role: newRole },
      { new: true }
    ).select('-password')

    res.json({
      message: `User ${newRole === 'admin' ? 'promoted to' : 'removed from'} admin successfully`,
      user: updatedUser
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

export default router