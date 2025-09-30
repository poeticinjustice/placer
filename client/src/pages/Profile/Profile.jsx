import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { updateUserProfile } from '../../store/slices/authSlice'
import { fetchUserPlaces } from '../../store/slices/userSlice'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import {
  UserIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  MapPinIcon,
  CalendarDaysIcon,
  CameraIcon,
  ExclamationTriangleIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'
import './Profile.css'

const Profile = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user, isLoading: authLoading, error: authError } = useSelector((state) => state.auth)
  const { userPlaces, isLoading: placesLoading } = useSelector((state) => state.user)
  const [isEditing, setIsEditing] = useState(false)
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
    dispatch(fetchUserPlaces({ limit: 6 }))
  }, [dispatch])

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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={profileForm.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={profileForm.lastName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Bio</label>
                  <textarea
                    name="bio"
                    value={profileForm.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself..."
                    maxLength={500}
                  />
                  <small>{profileForm.bio.length}/500 characters</small>
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={profileForm.location}
                    onChange={handleInputChange}
                    placeholder="City, Country"
                  />
                </div>
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
            <span className="stat-label">Places</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{userPlaces.length}</span>
            <span className="stat-label">Recent</span>
          </div>
        </div>

        {/* User's Places */}
        <div className="profile-places">
          <div className="section-header">
            <h2>My Places</h2>
            {!user.isApproved && (
              <p className="approval-notice">
                <ExclamationTriangleIcon className="icon" />
                Your account is pending approval. You can create and edit places, but they won't be visible to others until approved.
              </p>
            )}
          </div>

          {placesLoading ? (
            <LoadingSpinner />
          ) : userPlaces.length > 0 ? (
            <div className="places-grid">
              {userPlaces.map((place) => (
                <div key={place._id} className="place-card">
                  {place.photos && place.photos.length > 0 && (
                    <div className="place-image">
                      <img src={place.photos[0].url} alt={place.title} />
                    </div>
                  )}
                  <div className="place-content">
                    <h3>{place.title}</h3>
                    {place.description && (
                      <p className="place-description">
                        {place.description.length > 100
                          ? `${place.description.substring(0, 100)}...`
                          : place.description}
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
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <MapPinIcon className="empty-icon" />
              <h3>No places yet</h3>
              <p>Start sharing amazing places with the community!</p>
              <a href="/create" className="btn btn-primary">
                Create Your First Place
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile