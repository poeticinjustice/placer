import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  theme: 'light',
  sidebarOpen: false,
  modalOpen: false,
  modalType: null,
  toast: null,
  isLoading: false
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload
    },
    openModal: (state, action) => {
      state.modalOpen = true
      state.modalType = action.payload
    },
    closeModal: (state) => {
      state.modalOpen = false
      state.modalType = null
    },
    showToast: (state, action) => {
      state.toast = action.payload
    },
    hideToast: (state) => {
      state.toast = null
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload
    }
  },
})

export const {
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  openModal,
  closeModal,
  showToast,
  hideToast,
  setLoading
} = uiSlice.actions

export default uiSlice.reducer