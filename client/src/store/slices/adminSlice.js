import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../../services/api'
import { handleApiError } from '../../utils/apiErrorHandler'
import { PAGINATION } from '../../constants/pagination'

const initialState = {
  // Users management
  allUsers: [],
  pendingUsers: [],
  isLoadingUsers: false,
  usersError: null,
  usersPagination: {
    page: PAGINATION.DEFAULT_PAGE,
    limit: PAGINATION.DEFAULT_LIMIT,
    total: 0,
    pages: 0
  },

  // Places management
  places: [],
  isLoadingPlaces: false,
  placesError: null,
  placesPagination: {
    page: PAGINATION.DEFAULT_PAGE,
    limit: PAGINATION.DEFAULT_LIMIT,
    total: 0,
    pages: 0
  }
}

// Fetch pending users
export const fetchPendingUsers = createAsyncThunk(
  'admin/fetchPendingUsers',
  async ({ page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT } = {}, { rejectWithValue }) => {
    try {
      const response = await api.admin.fetchPendingUsers({ page, limit })
      return response.data
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to fetch pending users'))
    }
  }
)

// Fetch all users
export const fetchAllUsers = createAsyncThunk(
  'admin/fetchAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      // Fetch both pending and all users
      const [pendingRes, approvedRes] = await Promise.all([
        api.admin.fetchPendingUsers({}),
        api.admin.fetchAllUsers()
      ])

      // Combine and deduplicate users
      const allUsers = [...pendingRes.data.users, ...approvedRes.data.users]
      const uniqueUsers = allUsers.filter((user, index, self) =>
        index === self.findIndex(u => u._id === user._id)
      )

      return uniqueUsers
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to fetch users'))
    }
  }
)

// Approve user
export const approveUser = createAsyncThunk(
  'admin/approveUser',
  async (userId, { rejectWithValue }) => {
    try {
      await api.admin.approveUser(userId)
      return userId
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to approve user'))
    }
  }
)

// Reject/delete user
export const rejectUser = createAsyncThunk(
  'admin/rejectUser',
  async (userId, { rejectWithValue }) => {
    try {
      await api.admin.rejectUser(userId)
      return userId
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to reject user'))
    }
  }
)

// Toggle admin status
export const toggleAdminStatus = createAsyncThunk(
  'admin/toggleAdminStatus',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.admin.toggleAdmin(userId)
      return response.data.user
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to update user role'))
    }
  }
)

// Fetch places for admin
export const fetchAdminPlaces = createAsyncThunk(
  'admin/fetchPlaces',
  async ({ page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT } = {}, { rejectWithValue }) => {
    try {
      const response = await api.admin.fetchPlaces({ page, limit })
      return response.data
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to fetch places'))
    }
  }
)

// Toggle featured status
export const toggleFeaturedStatus = createAsyncThunk(
  'admin/toggleFeaturedStatus',
  async (placeId, { rejectWithValue }) => {
    try {
      const response = await api.admin.toggleFeatured(placeId)
      return { placeId, isFeatured: response.data.isFeatured }
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to update featured status'))
    }
  }
)

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearUsersError: (state) => {
      state.usersError = null
    },
    clearPlacesError: (state) => {
      state.placesError = null
    },
    setUsersPagination: (state, action) => {
      state.usersPagination = { ...state.usersPagination, ...action.payload }
    },
    setPlacesPagination: (state, action) => {
      state.placesPagination = { ...state.placesPagination, ...action.payload }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch pending users
      .addCase(fetchPendingUsers.pending, (state) => {
        state.isLoadingUsers = true
        state.usersError = null
      })
      .addCase(fetchPendingUsers.fulfilled, (state, action) => {
        state.isLoadingUsers = false
        state.pendingUsers = action.payload.users
        state.usersPagination = action.payload.pagination
      })
      .addCase(fetchPendingUsers.rejected, (state, action) => {
        state.isLoadingUsers = false
        state.usersError = action.payload
      })

      // Fetch all users
      .addCase(fetchAllUsers.pending, (state) => {
        state.isLoadingUsers = true
        state.usersError = null
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.isLoadingUsers = false
        state.allUsers = action.payload
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.isLoadingUsers = false
        state.usersError = action.payload
      })

      // Approve user
      .addCase(approveUser.fulfilled, (state, action) => {
        const userId = action.payload
        state.pendingUsers = state.pendingUsers.filter(user => user._id !== userId)
        state.allUsers = state.allUsers.map(user =>
          user._id === userId ? { ...user, isApproved: true } : user
        )
        if (state.usersPagination.total > 0) {
          state.usersPagination.total -= 1
        }
      })
      .addCase(approveUser.rejected, (state, action) => {
        state.usersError = action.payload
      })

      // Reject user
      .addCase(rejectUser.fulfilled, (state, action) => {
        const userId = action.payload
        state.pendingUsers = state.pendingUsers.filter(user => user._id !== userId)
        state.allUsers = state.allUsers.filter(user => user._id !== userId)
        if (state.usersPagination.total > 0) {
          state.usersPagination.total -= 1
        }
      })
      .addCase(rejectUser.rejected, (state, action) => {
        state.usersError = action.payload
      })

      // Toggle admin status
      .addCase(toggleAdminStatus.fulfilled, (state, action) => {
        const updatedUser = action.payload
        state.allUsers = state.allUsers.map(user =>
          user._id === updatedUser._id ? updatedUser : user
        )
      })
      .addCase(toggleAdminStatus.rejected, (state, action) => {
        state.usersError = action.payload
      })

      // Fetch places
      .addCase(fetchAdminPlaces.pending, (state) => {
        state.isLoadingPlaces = true
        state.placesError = null
      })
      .addCase(fetchAdminPlaces.fulfilled, (state, action) => {
        state.isLoadingPlaces = false
        state.places = action.payload.places
        state.placesPagination = action.payload.pagination
      })
      .addCase(fetchAdminPlaces.rejected, (state, action) => {
        state.isLoadingPlaces = false
        state.placesError = action.payload
      })

      // Toggle featured status
      .addCase(toggleFeaturedStatus.fulfilled, (state, action) => {
        const { placeId, isFeatured } = action.payload
        state.places = state.places.map(place =>
          place._id === placeId ? { ...place, isFeatured } : place
        )
      })
      .addCase(toggleFeaturedStatus.rejected, (state, action) => {
        state.placesError = action.payload
      })
  }
})

export const { clearUsersError, clearPlacesError, setUsersPagination, setPlacesPagination } = adminSlice.actions
export default adminSlice.reducer
