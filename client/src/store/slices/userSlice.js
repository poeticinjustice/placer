import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { API_URL } from '../../config/api'

const initialState = {
  userPlaces: [],
  isLoading: false,
  error: null,
  pagination: null
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
  },
})

export const { clearError, clearUserPlaces } = userSlice.actions
export default userSlice.reducer