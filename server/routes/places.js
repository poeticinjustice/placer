import express from 'express'
import { body, validationResult } from 'express-validator'
import Place from '../models/Place.js'
import User from '../models/User.js'
import { authenticate, requireApproval } from '../middleware/auth.js'
import { uploadMiddleware, uploadToCloudinary } from '../middleware/upload.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      category = '',
      author = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      lat,
      lng,
      radius = 10
    } = req.query

    const skip = (page - 1) * limit
    let query = { isPublic: true, status: 'published' }

    if (search) {
      query.$text = { $search: search }
    }

    if (category && category !== 'all') {
      query.category = category
    }

    if (author) {
      query.author = author
    }

    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      }
    }

    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1

    const places = await Place.find(query)
      .sort(sortOptions)
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
    console.error('Fetch places error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const place = await Place.findById(req.params.id)
      .populate('author', 'firstName lastName avatar isApproved')
      .populate('comments.author', 'firstName lastName avatar')

    if (!place) {
      return res.status(404).json({ message: 'Place not found' })
    }

    if (!place.isPublic && place.status !== 'published') {
      return res.status(404).json({ message: 'Place not found' })
    }

    await place.incrementViews()

    res.json({ place })
  } catch (error) {
    console.error('Fetch place error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/', authenticate, requireApproval, uploadMiddleware, [
  body('name').trim().notEmpty().withMessage('Place name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('location.address').notEmpty().withMessage('Address is required'),
  body('location.coordinates.coordinates').isArray({ min: 2, max: 2 }).withMessage('Valid coordinates required')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const photos = []
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file)
        photos.push({
          url: result.secure_url,
          cloudinaryId: result.public_id
        })
      }
    }

    const placeData = {
      ...req.body,
      author: req.user._id,
      photos
    }

    const place = new Place(placeData)
    await place.save()

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { placesCount: 1 }
    })

    const populatedPlace = await Place.findById(place._id)
      .populate('author', 'firstName lastName avatar isApproved')

    res.status(201).json({
      message: 'Place created successfully',
      place: populatedPlace
    })
  } catch (error) {
    console.error('Create place error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

router.put('/:id', authenticate, uploadMiddleware, async (req, res) => {
  try {
    const place = await Place.findById(req.params.id)

    if (!place) {
      return res.status(404).json({ message: 'Place not found' })
    }

    if (place.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this place' })
    }

    const photos = [...place.photos]
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file)
        photos.push({
          url: result.secure_url,
          cloudinaryId: result.public_id
        })
      }
    }

    const updatedPlace = await Place.findByIdAndUpdate(
      req.params.id,
      { ...req.body, photos },
      { new: true, runValidators: true }
    ).populate('author', 'firstName lastName avatar isApproved')

    res.json({
      message: 'Place updated successfully',
      place: updatedPlace
    })
  } catch (error) {
    console.error('Update place error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const place = await Place.findById(req.params.id)

    if (!place) {
      return res.status(404).json({ message: 'Place not found' })
    }

    if (place.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this place' })
    }

    await Place.findByIdAndDelete(req.params.id)

    await User.findByIdAndUpdate(place.author, {
      $inc: { placesCount: -1 }
    })

    res.json({ message: 'Place deleted successfully' })
  } catch (error) {
    console.error('Delete place error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/:id/like', authenticate, async (req, res) => {
  try {
    const place = await Place.findById(req.params.id)

    if (!place) {
      return res.status(404).json({ message: 'Place not found' })
    }

    const existingLike = place.likes.find(like =>
      like.user.toString() === req.user._id.toString()
    )

    if (existingLike) {
      place.likes = place.likes.filter(like =>
        like.user.toString() !== req.user._id.toString()
      )
    } else {
      place.likes.push({ user: req.user._id })
    }

    await place.save()

    res.json({
      message: existingLike ? 'Like removed' : 'Like added',
      likesCount: place.likes.length,
      isLiked: !existingLike
    })
  } catch (error) {
    console.error('Like place error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/:id/comments', authenticate, [
  body('content').trim().notEmpty().withMessage('Comment content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const place = await Place.findById(req.params.id)

    if (!place) {
      return res.status(404).json({ message: 'Place not found' })
    }

    const comment = {
      author: req.user._id,
      content: req.body.content,
      isAnonymous: req.body.isAnonymous || false
    }

    place.comments.push(comment)
    await place.save()

    const populatedPlace = await Place.findById(place._id)
      .populate('comments.author', 'firstName lastName avatar')

    const newComment = populatedPlace.comments[populatedPlace.comments.length - 1]

    res.status(201).json({
      message: 'Comment added successfully',
      comment: newComment
    })
  } catch (error) {
    console.error('Add comment error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router