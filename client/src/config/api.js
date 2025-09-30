/**
 * API Configuration
 * Central configuration for API endpoints
 */

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    SIGNUP: `${API_URL}/api/auth/signup`,
    LOGIN: `${API_URL}/api/auth/login`,
    LOGOUT: `${API_URL}/api/auth/logout`,
    ME: `${API_URL}/api/auth/me`,
    CHANGE_PASSWORD: `${API_URL}/api/auth/change-password`
  },

  // Place endpoints
  PLACES: {
    LIST: `${API_URL}/api/places`,
    CREATE: `${API_URL}/api/places`,
    GET: (id) => `${API_URL}/api/places/${id}`,
    UPDATE: (id) => `${API_URL}/api/places/${id}`,
    DELETE: (id) => `${API_URL}/api/places/${id}`,
    TOGGLE_FEATURED: (id) => `${API_URL}/api/places/${id}/featured`,
    LIKE: (id) => `${API_URL}/api/places/${id}/like`,
    COMMENT: (id) => `${API_URL}/api/places/${id}/comments`,
    DELETE_COMMENT: (placeId, commentId) => `${API_URL}/api/places/${placeId}/comments/${commentId}`
  },

  // User endpoints
  USERS: {
    LIST: `${API_URL}/api/users`,
    GET: (id) => `${API_URL}/api/users/${id}`,
    UPDATE_PROFILE: `${API_URL}/api/users/profile`,
    MY_PLACES: `${API_URL}/api/users/me/places`,
    ADMIN: {
      PENDING: `${API_URL}/api/users/admin/pending`,
      ALL: `${API_URL}/api/users/admin/all`,
      APPROVE: (id) => `${API_URL}/api/users/admin/approve/${id}`,
      REJECT: (id) => `${API_URL}/api/users/admin/reject/${id}`
    }
  }
}
