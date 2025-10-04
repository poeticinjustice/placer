// Server configuration constants

// Rate limiting
export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes in milliseconds
  MAX_REQUESTS: 500, // max requests per window
}

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100, // prevent abuse
}

// Password security
export const PASSWORD = {
  MIN_LENGTH: 6,
  BCRYPT_ROUNDS: 12,
}

// JWT
export const JWT = {
  EXPIRES_IN: '30d',
}

// File upload
export const UPLOAD = {
  MAX_FILES: 10,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB in bytes
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
}

export default {
  RATE_LIMIT,
  PAGINATION,
  PASSWORD,
  JWT,
  UPLOAD,
}
