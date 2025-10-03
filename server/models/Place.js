import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Comment content is required']
  },
  isAnonymous: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

const placeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Place name is required'],
    trim: true,
    maxlength: [100, 'Place name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: false
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  location: {
    address: {
      type: String,
      required: false
    },
    type: {
      type: String,
      enum: ['Point'],
      required: false
    },
    coordinates: {
      type: [Number],
      required: false,
      validate: {
        validator: function(coords) {
          if (!coords || coords.length === 0) return true; // Allow empty
          return coords.length === 2 &&
                 coords[0] >= -180 && coords[0] <= 180 && // longitude
                 coords[1] >= -90 && coords[1] <= 90      // latitude
        },
        message: 'Invalid coordinates'
      }
    },
    city: String,
    state: String,
    country: String
  },
  photos: [{
    url: {
      type: String,
      required: true
    },
    cloudinaryId: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      maxlength: [200, 'Caption cannot be more than 200 characters']
    }
  }],
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot be more than 30 characters']
  }],
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  visitDate: {
    type: Date,
    default: null
  },
  comments: [commentSchema],
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

placeSchema.index({ location: '2dsphere' })
placeSchema.index({ name: 'text', description: 'text', 'location.address': 'text', tags: 'text' })
placeSchema.index({ author: 1, createdAt: -1 })
placeSchema.index({ tags: 1 })
placeSchema.index({ isPublic: 1, status: 1 })
placeSchema.index({ isFeatured: 1 })

placeSchema.virtual('likesCount').get(function() {
  return this.likes.length
})

placeSchema.virtual('commentsCount').get(function() {
  return this.comments.length
})

placeSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'author',
    select: 'firstName lastName avatar isApproved'
  })
  next()
})

placeSchema.methods.incrementViews = function() {
  this.views += 1
  return this.save()
}

export default mongoose.model('Place', placeSchema)