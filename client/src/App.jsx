import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getCurrentUser } from './store/slices/authSlice'
import './App.css'

// Components (will be created later)
import Layout from './components/Layout/Layout'
import Home from './pages/Home/Home'
import Auth from './pages/Auth/Auth'
import Dashboard from './pages/Dashboard/Dashboard'
import PlaceDetails from './pages/PlaceDetails/PlaceDetails'
import CreatePlace from './pages/CreatePlace/CreatePlace'
import Profile from './pages/Profile/Profile'
import AdminDashboard from './pages/Admin/AdminDashboard'
import LoadingSpinner from './components/UI/LoadingSpinner'

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated, isLoading, token, user } = useSelector((state) => state.auth)

  useEffect(() => {
    if (token) {
      dispatch(getCurrentUser())
    }
  }, [dispatch, token])

  if (isLoading) {
    return <LoadingSpinner />
  }

  const isAdmin = user?.role === 'admin'

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="auth" element={!isAuthenticated ? <Auth /> : <Navigate to="/dashboard" />} />
          <Route path="dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/auth" />} />
          <Route path="place/:id" element={<PlaceDetails />} />
          <Route path="create" element={isAuthenticated ? <CreatePlace /> : <Navigate to="/auth" />} />
          <Route path="profile" element={isAuthenticated ? <Profile /> : <Navigate to="/auth" />} />
          <Route
            path="admin"
            element={isAuthenticated && isAdmin ? <AdminDashboard /> : <Navigate to="/" />}
          />
        </Route>
      </Routes>
    </div>
  )
}

export default App
