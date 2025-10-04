/**
 * Centralized API client
 * Single source of truth for all API calls with:
 * - Automatic auth token injection
 * - Global error handling (401 auto-logout)
 * - Request/response interceptors
 * - Domain-organized API methods
 */

import axios from 'axios'
import { API_URL } from '../config/api'

// Create base axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - inject auth token automatically
apiClient.interceptors.request.use(
  (config) => {
    let token = null

    // Try new auth format first (object with token and user)
    const persistedAuth = localStorage.getItem('auth')
    if (persistedAuth) {
      try {
        const authData = JSON.parse(persistedAuth)
        token = authData.token
      } catch (e) {
        console.error('Error parsing auth token:', e)
      }
    }

    // Fallback to old token format for backwards compatibility
    if (!token) {
      token = localStorage.getItem('token')

      // Migrate old token to new format
      if (token) {
        console.log('Migrating old token format to new auth format')
        localStorage.setItem('auth', JSON.stringify({ token, user: null }))
        localStorage.removeItem('token')
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle common errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized globally
    if (error.response?.status === 401) {
      // Clear auth state (try both formats)
      localStorage.removeItem('auth')
      localStorage.removeItem('token')

      // Only redirect if not already on auth page
      if (!window.location.pathname.includes('/auth')) {
        window.location.href = '/auth'
      }
    }

    return Promise.reject(error)
  }
)

/**
 * API service methods
 * Organized by domain for easy discoverability
 */
export const api = {
  // ==================== AUTH ====================
  auth: {
    signup: (data) => apiClient.post('/api/auth/signup', data),
    login: (data) => apiClient.post('/api/auth/login', data),
    logout: () => apiClient.post('/api/auth/logout'),
    getCurrentUser: () => apiClient.get('/api/auth/me'),
    changePassword: (data) => apiClient.put('/api/auth/change-password', data),
  },

  // ==================== PLACES ====================
  places: {
    list: (params) => apiClient.get('/api/places', { params }),
    get: (id) => apiClient.get(`/api/places/${id}`),
    create: (formData) => apiClient.post('/api/places', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, formData) => apiClient.put(`/api/places/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (id) => apiClient.delete(`/api/places/${id}`),
    like: (id) => apiClient.post(`/api/places/${id}/like`),
    addComment: (id, data) => apiClient.post(`/api/places/${id}/comments`, data),
    deleteComment: (placeId, commentId) => apiClient.delete(`/api/places/${placeId}/comments/${commentId}`),
  },

  // ==================== USERS ====================
  users: {
    // Profile
    getProfile: () => apiClient.get('/api/users/profile'),
    updateProfile: (formData) => apiClient.put('/api/users/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

    // User's content
    getPlaces: (params) => apiClient.get('/api/users/places', { params }),
    getComments: (params) => apiClient.get('/api/users/comments', { params }),

    // Public profile
    getPublicProfile: (id) => apiClient.get(`/api/users/${id}`),
  },

  // ==================== ADMIN ====================
  admin: {
    // User management
    fetchPendingUsers: (params) => apiClient.get('/api/users/admin/pending', { params }),
    fetchAllUsers: () => apiClient.get('/api/users/admin/all'),
    approveUser: (id) => apiClient.put(`/api/users/admin/approve/${id}`),
    rejectUser: (id) => apiClient.delete(`/api/users/admin/reject/${id}`),
    toggleAdmin: (id) => apiClient.put(`/api/users/admin/toggle-admin/${id}`),

    // Place management
    fetchPlaces: (params) => apiClient.get('/api/places', { params }),
    toggleFeatured: (id) => apiClient.patch(`/api/places/${id}/featured`),
  }
}

// Export the base client for custom requests if needed
export default apiClient
