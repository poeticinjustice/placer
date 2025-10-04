import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../../services/api'
import { handleApiError } from '../../utils/apiErrorHandler'

const initialState = {
  places: [],
  currentPlace: null,
  isLoading: false,
  error: null,
  searchQuery: '',
  viewMode: 'gallery', // gallery, list, map
  totalPages: 1,
  currentPage: 1,
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
      const response = await api.places.list(params)
      return response.data
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to fetch places'))
    }
  }
)

export const fetchPlaceById = createAsyncThunk(
  'places/fetchPlaceById',
  async (placeId, { rejectWithValue }) => {
    try {
      const response = await api.places.get(placeId)
      return response.data
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to fetch place'))
    }
  }
)

export const createPlace = createAsyncThunk(
  'places/createPlace',
  async (placeData, { rejectWithValue }) => {
    try {
      const response = await api.places.create(placeData)
      return response.data
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to create place'))
    }
  }
)

export const updatePlace = createAsyncThunk(
  'places/updatePlace',
  async ({ placeId, placeData }, { rejectWithValue }) => {
    try {
      const response = await api.places.update(placeId, placeData)
      return response.data
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to update place'))
    }
  }
)

export const deletePlace = createAsyncThunk(
  'places/deletePlace',
  async (placeId, { rejectWithValue }) => {
    try {
      await api.places.delete(placeId)
      return placeId
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to delete place'))
    }
  }
)

export const likePlace = createAsyncThunk(
  'places/likePlace',
  async (placeId, { rejectWithValue }) => {
    try {
      const response = await api.places.like(placeId)
      return { placeId, ...response.data }
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to like place'))
    }
  }
)

// Combined search and filter action
export const searchPlaces = createAsyncThunk(
  'places/searchPlaces',
  async (_, { getState, dispatch }) => {
    const { places } = getState()
    const { searchQuery, filters } = places

    const searchParams = {}

    if (searchQuery && searchQuery.trim()) {
      searchParams.search = searchQuery.trim()
    }

    // Location-based filtering with user coordinates
    if (filters.useDistance && filters.userLat && filters.userLng) {
      searchParams.lat = filters.userLat
      searchParams.lng = filters.userLng
      searchParams.radius = filters.radius || 16 // Default 16km (~10 miles)
    }

    if (filters.sortBy) {
      searchParams.sortBy = filters.sortBy
    }

    if (filters.sortOrder) {
      searchParams.sortOrder = filters.sortOrder
    }

    // Tag filtering
    if (filters.tags && filters.tags.length > 0) {
      // Backend currently supports single tag, so we'll use the first one
      // If you want to support multiple tags, you'll need to update the backend
      searchParams.tag = filters.tags[0]
    }

    return dispatch(fetchPlaces(searchParams))
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
        state.totalPages = action.payload.totalPages || 1
        state.currentPage = action.payload.currentPage || 1
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
      .addCase(likePlace.fulfilled, (state, action) => {
        const { placeId, likesCount } = action.payload
        // Update in places list
        const placeIndex = state.places.findIndex(p => p._id === placeId)
        if (placeIndex !== -1) {
          state.places[placeIndex].likes = Array(likesCount).fill(null) // Placeholder for count
        }
        // Update current place if it's the one being liked
        if (state.currentPlace && state.currentPlace._id === placeId) {
          state.currentPlace.likes = Array(likesCount).fill(null)
        }
      })
  },
})

export const { setSearchQuery, setViewMode, setFilters, clearCurrentPlace, clearError } = placesSlice.actions
export default placesSlice.reducer
