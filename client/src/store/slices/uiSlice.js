import { createSlice } from '@reduxjs/toolkit'

// Load theme from localStorage or default to 'light'
const loadTheme = () => {
  const savedTheme = localStorage.getItem('theme')
  return savedTheme || 'light'
}

const initialState = {
  theme: loadTheme(),
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
      localStorage.setItem('theme', action.payload)
      document.documentElement.setAttribute('data-theme', action.payload)
    },
    toggleTheme: (state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light'
      state.theme = newTheme
      localStorage.setItem('theme', newTheme)
      document.documentElement.setAttribute('data-theme', newTheme)
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
  toggleTheme,
  toggleSidebar,
  setSidebarOpen,
  openModal,
  closeModal,
  showToast,
  hideToast,
  setLoading
} = uiSlice.actions

export default uiSlice.reducer