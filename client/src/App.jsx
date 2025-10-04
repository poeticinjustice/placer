import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getCurrentUser } from './store/slices/authSlice'
import './App.css'

// Core components - loaded immediately
import Layout from './components/Layout/Layout'
import Home from './pages/Home/Home'
import Auth from './pages/Auth/Auth'
import Dashboard from './pages/Dashboard/Dashboard'
import LoadingSpinner from './components/UI/LoadingSpinner'
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary'
import { ToastProvider } from './components/UI/ToastContainer'
import { ConfirmDialogProvider } from './components/UI/ConfirmDialogProvider'

// Lazy-loaded components - only loaded when needed
const PlaceDetails = lazy(() => import('./pages/PlaceDetails/PlaceDetails'))
const CreatePlace = lazy(() => import('./pages/CreatePlace/CreatePlace'))
const EditPlace = lazy(() => import('./pages/EditPlace/EditPlace'))
const Profile = lazy(() => import('./pages/Profile/Profile'))
const ChangePassword = lazy(() => import('./pages/ChangePassword/ChangePassword'))
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'))
const UserManagement = lazy(() => import('./pages/Admin/UserManagement'))
const AdminPlaces = lazy(() => import('./pages/Admin/AdminPlaces'))

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
    <ErrorBoundary>
      <ToastProvider>
        <ConfirmDialogProvider>
          <div className="App">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="auth" element={!isAuthenticated ? <Auth /> : <Navigate to="/dashboard" />} />
                  <Route path="dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/auth" />} />
                  <Route path="place/:id" element={<PlaceDetails />} />
                  <Route path="create" element={isAuthenticated ? <CreatePlace /> : <Navigate to="/auth" />} />
                  <Route path="edit/:id" element={isAuthenticated ? <EditPlace /> : <Navigate to="/auth" />} />
                  <Route path="profile" element={isAuthenticated ? <Profile /> : <Navigate to="/auth" />} />
                  <Route path="change-password" element={isAuthenticated ? <ChangePassword /> : <Navigate to="/auth" />} />
                  <Route
                    path="admin"
                    element={
                      !isAuthenticated ? (
                        <Navigate to="/auth" />
                      ) : !isAdmin ? (
                        <Navigate to="/dashboard" />
                      ) : (
                        <AdminDashboard />
                      )
                    }
                  />
                  <Route
                    path="admin/users"
                    element={
                      !isAuthenticated ? (
                        <Navigate to="/auth" />
                      ) : !isAdmin ? (
                        <Navigate to="/dashboard" />
                      ) : (
                        <UserManagement />
                      )
                    }
                  />
                  <Route
                    path="admin/places"
                    element={
                      !isAuthenticated ? (
                        <Navigate to="/auth" />
                      ) : !isAdmin ? (
                        <Navigate to="/dashboard" />
                      ) : (
                        <AdminPlaces />
                      )
                    }
                  />
                </Route>
              </Routes>
            </Suspense>
          </div>
        </ConfirmDialogProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App
