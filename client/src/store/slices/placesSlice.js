import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const initialState = {
  places: [],
  currentPlace: null,
  isLoading: false,
  error: null,
  searchQuery: '',
  viewMode: 'gallery', // gallery, list, map
  filters: {
    location: '',
    author: '',
    dateRange: null
  }
}

export const fetchPlaces = createAsyncThunk(
  'places/fetchPlaces',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const response = await axios.get(`${API_URL}/api/places?${queryString}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data.message)
    }
  }
)

export const fetchPlaceById = createAsyncThunk(
  'places/fetchPlaceById',
  async (placeId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/places/${placeId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data.message)
    }
  }
)

export const createPlace = createAsyncThunk(
  'places/createPlace',
  async (placeData, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token
      const response = await axios.post(`${API_URL}/api/places`, placeData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data.message)
    }
  }
)

export const updatePlace = createAsyncThunk(
  'places/updatePlace',
  async ({ placeId, placeData }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token
      const response = await axios.put(`${API_URL}/api/places/${placeId}`, placeData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data.message)
    }
  }
)

export const deletePlace = createAsyncThunk(
  'places/deletePlace',
  async (placeId, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token
      await axios.delete(`${API_URL}/api/places/${placeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return placeId
    } catch (error) {
      return rejectWithValue(error.response.data.message)
    }
  }
)

const placesSlice = createSlice({
  name: 'places',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearCurrentPlace: (state) => {
      state.currentPlace = null
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlaces.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPlaces.fulfilled, (state, action) => {
        state.isLoading = false
        state.places = action.payload.places
      })
      .addCase(fetchPlaces.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(fetchPlaceById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPlaceById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentPlace = action.payload.place
      })
      .addCase(fetchPlaceById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(createPlace.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createPlace.fulfilled, (state, action) => {
        state.isLoading = false
        state.places.unshift(action.payload.place)
      })
      .addCase(createPlace.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(updatePlace.fulfilled, (state, action) => {
        const index = state.places.findIndex(place => place._id === action.payload.place._id)
        if (index !== -1) {
          state.places[index] = action.payload.place
        }
        if (state.currentPlace && state.currentPlace._id === action.payload.place._id) {
          state.currentPlace = action.payload.place
        }
      })
      .addCase(deletePlace.fulfilled, (state, action) => {
        state.places = state.places.filter(place => place._id !== action.payload)
        if (state.currentPlace && state.currentPlace._id === action.payload) {
          state.currentPlace = null
        }
      })
  },
})

export const { setSearchQuery, setViewMode, setFilters, clearCurrentPlace, clearError } = placesSlice.actions
export default placesSlice.reducer