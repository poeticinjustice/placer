/**
 * Centralized API error handler
 * Safely extracts error messages from API responses
 */

export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  // Network error (no response)
  if (!error.response) {
    if (error.message === 'Network Error') {
      return 'Network error. Please check your connection.'
    }
    return error.message || defaultMessage
  }

  // Server responded with error
  const response = error.response

  // Try to extract message from various common response formats
  if (response.data?.message) {
    return response.data.message
  }

  if (response.data?.error) {
    return response.data.error
  }

  // Handle validation errors
  if (response.data?.errors && Array.isArray(response.data.errors)) {
    return response.data.errors.map(err => err.msg || err.message).join(', ')
  }

  // HTTP status text as fallback
  if (response.statusText) {
    return response.statusText
  }

  return defaultMessage
}
