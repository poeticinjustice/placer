/**
 * Cloudinary Image Optimization Utilities
 *
 * These utilities help optimize images by generating Cloudinary URLs
 * with specific transformations for different use cases.
 */

/**
 * Extract the base Cloudinary URL parts
 * @param {string} url - Full Cloudinary URL
 * @returns {object} - { baseUrl, publicId }
 */
const parseCloudinaryUrl = (url) => {
  if (!url || !url.includes('cloudinary')) {
    return null
  }

  // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}
  const uploadIndex = url.indexOf('/upload/')
  if (uploadIndex === -1) return null

  const baseUrl = url.substring(0, uploadIndex + 8) // includes '/upload/'
  const publicId = url.substring(uploadIndex + 8)

  return { baseUrl, publicId }
}

/**
 * Generate optimized Cloudinary URL with transformations
 * @param {string} url - Original Cloudinary URL
 * @param {object} options - Transformation options
 * @returns {string} - Optimized Cloudinary URL
 */
export const optimizeCloudinaryImage = (url, options = {}) => {
  if (!url) return url

  const parsed = parseCloudinaryUrl(url)
  if (!parsed) return url // Not a Cloudinary URL, return as is

  const { baseUrl, publicId } = parsed
  const transformations = []

  // Width
  if (options.width) {
    transformations.push(`w_${options.width}`)
  }

  // Height
  if (options.height) {
    transformations.push(`h_${options.height}`)
  }

  // Crop mode (default: fill)
  const crop = options.crop || 'fill'
  transformations.push(`c_${crop}`)

  // Quality (default: auto for best automatic quality)
  const quality = options.quality || 'auto'
  transformations.push(`q_${quality}`)

  // Format (default: auto for best format based on browser)
  const format = options.format || 'auto'
  transformations.push(`f_${format}`)

  // Fetch format (default: auto for automatic format selection)
  if (options.fetchFormat !== false) {
    transformations.push('fl_progressive')
  }

  // Gravity (for cropping focus point)
  if (options.gravity) {
    transformations.push(`g_${options.gravity}`)
  }

  // DPR (device pixel ratio) for retina displays
  if (options.dpr) {
    transformations.push(`dpr_${options.dpr}`)
  }

  return `${baseUrl}${transformations.join(',')}/` + publicId
}

/**
 * Preset transformations for common use cases
 */
export const ImagePresets = {
  // Thumbnails for lists/grids
  thumbnail: (url) => optimizeCloudinaryImage(url, {
    width: 400,
    height: 400,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto',
    format: 'auto'
  }),

  // Small card images
  card: (url) => optimizeCloudinaryImage(url, {
    width: 600,
    height: 400,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto',
    format: 'auto'
  }),

  // Medium size for place details
  medium: (url) => optimizeCloudinaryImage(url, {
    width: 1000,
    crop: 'limit', // Don't upscale
    quality: 'auto',
    format: 'auto'
  }),

  // Large size for lightbox/full view
  large: (url) => optimizeCloudinaryImage(url, {
    width: 1920,
    crop: 'limit',
    quality: 'auto',
    format: 'auto'
  }),

  // Avatar/profile pictures
  avatar: (url) => optimizeCloudinaryImage(url, {
    width: 200,
    height: 200,
    crop: 'fill',
    gravity: 'face', // Focus on faces
    quality: 'auto',
    format: 'auto'
  }),

  // Small avatar for comments/lists
  avatarSmall: (url) => optimizeCloudinaryImage(url, {
    width: 80,
    height: 80,
    crop: 'fill',
    gravity: 'face',
    quality: 'auto',
    format: 'auto'
  })
}

/**
 * Get responsive srcSet for an image
 * Useful for <img srcset="..." /> to serve different sizes based on screen width
 * @param {string} url - Original Cloudinary URL
 * @param {array} widths - Array of widths to generate (default: [400, 800, 1200, 1600])
 * @returns {string} - srcSet string
 */
export const getResponsiveSrcSet = (url, widths = [400, 800, 1200, 1600]) => {
  if (!url || !parseCloudinaryUrl(url)) return ''

  return widths
    .map(width => {
      const optimizedUrl = optimizeCloudinaryImage(url, {
        width,
        crop: 'limit',
        quality: 'auto',
        format: 'auto'
      })
      return `${optimizedUrl} ${width}w`
    })
    .join(', ')
}
