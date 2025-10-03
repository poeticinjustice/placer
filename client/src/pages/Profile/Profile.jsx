import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { updateUserProfile } from '../../store/slices/authSlice'
import { fetchUserPlaces } from '../../store/slices/userSlice'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import { formatDate } from '../../utils/dateFormatter'
import { FormInput, FormTextarea } from '../../components/Form'
import {
  UserIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  MapPinIcon,
  CalendarDaysIcon,
  CameraIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import './Profile.css'

const Profile = () => {
  const stripHtml = (html) => {
    if (!html) return ''
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    const text = tmp.textContent || tmp.innerText || ''
    return text.trim()
  }

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user, isLoading: authLoading, error: authError } = useSelector((state) => state.auth)
  const { userPlaces, isLoading: placesLoading, pagination } = useSelector((state) => state.user)
  const [isEditing, setIsEditing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    location: '',
    avatar: null
  })
  const [previewUrl, setPreviewUrl] = useState(null)

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.bio || '',
        location: user.location || '',
        avatar: null
      })
    }
  }, [user])

  useEffect(() => {
    dispatch(fetchUserPlaces({ page: currentPage, limit: 20 }))
  }, [dispatch, currentPage])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfileForm(prev => ({
        ...prev,
        avatar: file
      }))

      const reader = new FileReader()
      reader.onload = () => setPreviewUrl(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    try {
      await dispatch(updateUserProfile(profileForm)).unwrap()
      setIsEditing(false)
      setPreviewUrl(null)
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setPreviewUrl(null)
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.bio || '',
        location: user.location || '',
        avatar: null
      })
    }
  }

  const getApprovalStatusBadge = () => {
    if (!user) return null

    if (user.isApproved) {
      return <span className="status-badge approved">Approved</span>
    } else {
      return <span className="status-badge pending">Pending Approval</span>
    }
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!user) {
    return <LoadingSpinner />
  }

  return (
    <div className="profile">
      <div className="container">
        {authError && (
          <div className="error-message">
            <ExclamationTriangleIcon className="icon" />
            {authError}
          </div>
        )}

        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar-section">
            <div className="avatar-container">
              {previewUrl || user.avatar ? (
                <img
                  src={previewUrl || user.avatar}
                  alt="Profile"
                  className="profile-avatar"
                />
              ) : (
                <div className="profile-avatar-placeholder">
                  <UserIcon className="icon" />
                </div>
              )}
              {isEditing && (
                <label className="avatar-upload-btn">
                  <CameraIcon className="icon" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    hidden
                  />
                </label>
              )}
            </div>
          </div>

          <div className="profile-info">
            {!isEditing ? (
              <>
                <h1 className="profile-name">
                  {user.firstName} {user.lastName}
                  {getApprovalStatusBadge()}
                </h1>
                <p className="profile-email">{user.email}</p>
                {user.bio && <p className="profile-bio">{user.bio}</p>}
                {user.location && (
                  <p className="profile-location">
                    <MapPinIcon className="icon" />
                    {user.location}
                  </p>
                )}
                <p className="profile-joined">
                  <CalendarDaysIcon className="icon" />
                  Joined {formatDate(user.joinedAt)}
                </p>
                <div className="profile-actions">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-secondary"
                  >
                    <PencilIcon className="icon" />
                    Edit Profile
                  </button>
                  <button
                    onClick={() => navigate('/change-password')}
                    className="btn btn-secondary"
                  >
                    <LockClosedIcon className="icon" />
                    Change Password
                  </button>
                </div>
              </>
            ) : (
              <div className="profile-edit-form">
                <FormInput
                  label="First Name"
                  type="text"
                  name="firstName"
                  value={profileForm.firstName}
                  onChange={handleInputChange}
                  required
                />
                <FormInput
                  label="Last Name"
                  type="text"
                  name="lastName"
                  value={profileForm.lastName}
                  onChange={handleInputChange}
                />
                <FormTextarea
                  label="Bio"
                  name="bio"
                  value={profileForm.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself..."
                  maxLength={500}
                  showCharCount
                />
                <FormInput
                  label="Location"
                  type="text"
                  name="location"
                  value={profileForm.location}
                  onChange={handleInputChange}
                  placeholder="City, Country"
                />
                <div className="form-actions">
                  <button
                    onClick={handleSave}
                    className="btn btn-primary"
                    disabled={authLoading}
                  >
                    {authLoading ? (
                      <LoadingSpinner size="small" />
                    ) : (
                      <>
                        <CheckIcon className="icon" />
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="btn btn-secondary"
                    disabled={authLoading}
                  >
                    <XMarkIcon className="icon" />
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Profile Stats */}
        <div className="profile-stats">
          <div className="stat-item">
            <span className="stat-number">{user.placesCount || 0}</span>
            <span className="stat-label">Total Places</span>
          </div>
        </div>

        {/* User's Places */}
        <div className="profile-places">
          <div className="section-header">
            <h2>My Places</h2>
            {!user.isApproved && (
              <p className="approval-notice">
                <ExclamationTriangleIcon className="icon" />
                Your account is pending approval. You can update your profile but cannot create places yet.
              </p>
            )}
          </div>

          {placesLoading ? (
            <LoadingSpinner />
          ) : userPlaces.length > 0 ? (
            <div className="places-grid">
              {userPlaces.map((place) => (
                <Link to={`/place/${place._id}`} key={place._id} className="place-card">
                  {place.photos && place.photos.length > 0 && (
                    <div className="place-image">
                      <img src={place.photos[0].url} alt={place.title} />
                    </div>
                  )}
                  <div className="place-content">
                    <h3>{place.title}</h3>
                    {place.description && (
                      <p className="place-description">
                        {stripHtml(place.description).length > 100
                          ? `${stripHtml(place.description).substring(0, 100)}...`
                          : stripHtml(place.description)}
                      </p>
                    )}
                    <div className="place-meta">
                      <span className={`status ${place.status}`}>
                        {place.status}
                      </span>
                      <span className="date">
                        {formatDate(place.createdAt)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <MapPinIcon className="empty-icon" />
              <h3>No places yet</h3>
              <p>Start sharing amazing places with the community!</p>
              <Link to="/create" className="btn btn-primary">
                Create Your First Place
              </Link>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                <ChevronLeftIcon className="icon" />
                Previous
              </button>

              <div className="pagination-info">
                Page {currentPage} of {pagination.pages}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.pages}
                className="pagination-btn"
              >
                Next
                <ChevronRightIcon className="icon" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile