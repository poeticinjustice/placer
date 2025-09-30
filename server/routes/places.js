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
      author = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      lat,
      lng,
      radius = 10,
      featured = ''
    } = req.query

    const skip = (page - 1) * limit
    let query = { isPublic: true, status: 'published' }

    if (featured === 'true') {
      query.isFeatured = true
    }

    if (author) {
      query.author = author
    }

    // Distance-based filter (user location + radius)
    // Note: $near cannot be combined with $text search or skip/limit in some MongoDB versions
    // So we handle it separately
    if (lat && lng) {
      const places = await Place.find({
        ...query,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            $maxDistance: radius * 1000 // Convert km to meters
          }
        }
      })
        .limit(parseInt(limit) + skip) // Get more than needed, then slice
        .populate('author', 'firstName lastName avatar isApproved')

      // Apply search filter in memory if needed
      let filteredPlaces = places
      if (search) {
        const searchLower = search.toLowerCase()
        filteredPlaces = places.filter(place =>
          place.name.toLowerCase().includes(searchLower) ||
          place.description.toLowerCase().includes(searchLower) ||
          place.location.address.toLowerCase().includes(searchLower)
        )
      }

      // Apply pagination
      const paginatedPlaces = filteredPlaces.slice(skip, skip + parseInt(limit))

      return res.json({
        places: paginatedPlaces,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredPlaces.length,
          pages: Math.ceil(filteredPlaces.length / limit)
        }
      })
    }

    // Regular query without location filter
    if (search) {
      query.$text = { $search: search }
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
  // Description, location, and photos are now optional
  body('location.coordinates.coordinates').optional().custom((value) => {
    if (!value) return true; // Allow missing coordinates
    if (typeof value === 'string') {
      try {
        const coords = JSON.parse(value);
        if (Array.isArray(coords) && coords.length === 2 &&
            coords.every(coord => typeof coord === 'number')) {
          return true;
        }
      } catch (e) {
        throw new Error('Invalid coordinates format');
      }
    } else if (Array.isArray(value) && value.length === 2 &&
               value.every(coord => typeof coord === 'number')) {
      return true;
    }
    throw new Error('Valid coordinates must be an array of 2 numbers');
  })
], async (req, res) => {
  try {
    // Debug: log what server receives
    console.log('=== CREATE PLACE REQUEST ===')
    console.log('Body:', req.body)
    console.log('Files:', req.files)
    console.log('============================')

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array())
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

    // Process tags if they exist
    let tags = []
    if (req.body.tags) {
      tags = req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    }

    // Process location coordinates and restructure for MongoDB GeoJSON
    let processedBody = { ...req.body }
    if (req.body.location?.coordinates?.coordinates) {
      let coordinates
      if (typeof req.body.location.coordinates.coordinates === 'string') {
        // Parse the coordinates array from string
        coordinates = JSON.parse(req.body.location.coordinates.coordinates)
      } else if (Array.isArray(req.body.location.coordinates.coordinates)) {
        // Use the coordinates array directly
        coordinates = req.body.location.coordinates.coordinates
      }

      if (coordinates && coordinates.length === 2) {
        processedBody.location = {
          address: req.body.location.address,
          type: 'Point',
          coordinates: coordinates
        }
        console.log('Processed location structure:', processedBody.location)
      }
    } else if (!req.body.location || !req.body.location.coordinates) {
      // Remove location if not provided
      delete processedBody.location
    }

    const placeData = {
      ...processedBody,
      author: req.user._id,
      photos,
      tags
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

    // Handle photos - start with existing photos from request or empty array
    let photos = []
    if (req.body.existingPhotos) {
      try {
        photos = JSON.parse(req.body.existingPhotos)
      } catch (e) {
        console.error('Error parsing existing photos:', e)
        photos = []
      }
    }

    // Add new photos from file upload
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file)
        photos.push({
          url: result.secure_url,
          cloudinaryId: result.public_id
        })
      }
    }

    // Process location coordinates - same as create route
    let processedBody = { ...req.body }
    if (req.body.location?.coordinates?.coordinates) {
      let coordinates
      if (typeof req.body.location.coordinates.coordinates === 'string') {
        coordinates = JSON.parse(req.body.location.coordinates.coordinates)
      } else if (Array.isArray(req.body.location.coordinates.coordinates)) {
        coordinates = req.body.location.coordinates.coordinates
      }

      if (coordinates && coordinates.length === 2) {
        processedBody.location = {
          address: req.body.location.address,
          type: 'Point',
          coordinates: coordinates
        }
      }
    } else if (!req.body.location || !req.body.location.coordinates) {
      // Remove location if not provided
      delete processedBody.location
    }

    // Prepare update data
    const updateData = { ...processedBody, photos }

    // Remove existingPhotos from update data as it's not a schema field
    delete updateData.existingPhotos

    // Only admins can update isFeatured
    if (req.user.role !== 'admin') {
      delete updateData.isFeatured
    }

    const updatedPlace = await Place.findByIdAndUpdate(
      req.params.id,
      updateData,
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

router.delete('/:id/comments/:commentId', authenticate, async (req, res) => {
  try {
    const place = await Place.findById(req.params.id)

    if (!place) {
      return res.status(404).json({ message: 'Place not found' })
    }

    const comment = place.comments.id(req.params.commentId)

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' })
    }

    // Only comment author or admin can delete
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this comment' })
    }

    place.comments.pull(req.params.commentId)
    await place.save()

    res.json({ message: 'Comment deleted successfully' })
  } catch (error) {
    console.error('Delete comment error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

router.patch('/:id/featured', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can feature places' })
    }

    const place = await Place.findById(req.params.id)

    if (!place) {
      return res.status(404).json({ message: 'Place not found' })
    }

    place.isFeatured = !place.isFeatured
    await place.save()

    res.json({
      message: place.isFeatured ? 'Place featured successfully' : 'Place unfeatured successfully',
      isFeatured: place.isFeatured
    })
  } catch (error) {
    console.error('Toggle featured error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router