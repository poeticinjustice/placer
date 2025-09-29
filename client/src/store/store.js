import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import placesReducer from './slices/placesSlice'
import uiReducer from './slices/uiSlice'
import userReducer from './slices/userSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    places: placesReducer,
    ui: uiReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export default store