import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { API_URL } from '../../config/api'

const initialState = {
  userPlaces: [],
  userComments: [],
  isLoading: false,
  isLoadingComments: false,
  error: null,
  pagination: null,
  commentsPagination: null
}

// Fetch user's places
export const fetchUserPlaces = createAsyncThunk(
  'user/fetchPlaces',
  async ({ page = 1, limit = 20, status = 'all' } = {}, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token
      if (!token) return rejectWithValue('No token found')

      const response = await axios.get(`${API_URL}/api/users/places`, {
        params: { page, limit, status },
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch places')
    }
  }
)

// Fetch user's comments
export const fetchUserComments = createAsyncThunk(
  'user/fetchComments',
  async ({ page = 1, limit = 20 } = {}, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token
      if (!token) return rejectWithValue('No token found')

      const response = await axios.get(`${API_URL}/api/users/comments`, {
        params: { page, limit },
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch comments')
    }
  }
)

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearUserPlaces: (state) => {
      state.userPlaces = []
      state.pagination = null
    },
    clearUserComments: (state) => {
      state.userComments = []
      state.commentsPagination = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserPlaces.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUserPlaces.fulfilled, (state, action) => {
        state.isLoading = false
        state.userPlaces = action.payload.places
        state.pagination = action.payload.pagination
      })
      .addCase(fetchUserPlaces.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(fetchUserComments.pending, (state) => {
        state.isLoadingComments = true
        state.error = null
      })
      .addCase(fetchUserComments.fulfilled, (state, action) => {
        state.isLoadingComments = false
        state.userComments = action.payload.comments
        state.commentsPagination = action.payload.pagination
      })
      .addCase(fetchUserComments.rejected, (state, action) => {
        state.isLoadingComments = false
        state.error = action.payload
      })
  },
})

export const { clearError, clearUserPlaces, clearUserComments } = userSlice.actions
export default userSlice.reducer