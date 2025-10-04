import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../../services/api'
import { handleApiError } from '../../utils/apiErrorHandler'

// Load auth state from localStorage
const loadAuthState = () => {
  try {
    const persistedAuth = localStorage.getItem('auth')
    if (persistedAuth) {
      const { token, user } = JSON.parse(persistedAuth)
      return { token, user, isAuthenticated: !!token, isLoading: !!token }
    }
  } catch (e) {
    // Clear corrupted auth data
    localStorage.removeItem('auth')
  }
  return { token: null, user: null, isAuthenticated: false, isLoading: false }
}

const initialState = {
  ...loadAuthState(),
  error: null,
}

export const signup = createAsyncThunk(
  'auth/signup',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.auth.signup(userData)
      // Persist auth state
      localStorage.setItem('auth', JSON.stringify({
        token: response.data.token,
        user: response.data.user
      }))
      return response.data
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Signup failed'))
    }
  }
)

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.auth.login(credentials)
      // Persist auth state
      localStorage.setItem('auth', JSON.stringify({
        token: response.data.token,
        user: response.data.user
      }))
      return response.data
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Login failed'))
    }
  }
)

export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('auth')
  try {
    await api.auth.logout()
  } catch (error) {
    // Silent fail on logout - user is already logging out
  }
  return null
})

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token
      if (!token) return rejectWithValue('No token found')

      const response = await api.auth.getCurrentUser()
      return response.data
    } catch (error) {
      localStorage.removeItem('auth')
      return rejectWithValue(handleApiError(error, 'Failed to get user'))
    }
  }
)

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token
      if (!token) return rejectWithValue('No token found')

      const formData = new FormData()
      Object.keys(profileData).forEach(key => {
        if (profileData[key] !== null && profileData[key] !== undefined) {
          formData.append(key, profileData[key])
        }
      })

      const response = await api.users.updateProfile(formData)
      return response.data
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Update failed'))
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    updateProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(signup.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
      })
      .addCase(signup.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
      })
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.isAuthenticated = true
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.isLoading = false
        state.token = null
        state.isAuthenticated = false
      })
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { clearError, updateProfile } = authSlice.actions
export default authSlice.reducer
