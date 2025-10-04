import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { updateUserProfile } from '../../store/slices/authSlice'
import { fetchUserPlaces, fetchUserComments } from '../../store/slices/userSlice'
import { useToast } from '../../components/UI/ToastContainer'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import { formatDate } from '../../utils/dateFormatter'
import { stripHtml } from '../../utils/htmlUtils'
import { FormInput, FormTextarea } from '../../components/Form'
import Tabs from '../../components/UI/Tabs'
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
  ChevronRightIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline'
import './Profile.css'

const Profile = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const toast = useToast()
  const { user, isLoading: authLoading, error: authError } = useSelector((state) => state.auth)
  const { userPlaces, userComments, isLoading: placesLoading, isLoadingComments, pagination, commentsPagination } = useSelector((state) => state.user)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('places')
  const [currentPage, setCurrentPage] = useState(1)
  const [currentCommentsPage, setCurrentCommentsPage] = useState(1)
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

  useEffect(() => {
    if (activeTab === 'comments') {
      dispatch(fetchUserComments({ page: currentCommentsPage, limit: 20 }))
    }
  }, [dispatch, activeTab, currentCommentsPage])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      e.target.value = ''
      return
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('Image must be less than 5MB')
      e.target.value = ''
      return
    }

    setProfileForm(prev => ({
      ...prev,
      avatar: file
    }))

    const reader = new FileReader()
    reader.onload = () => {
      if (reader.result) {
        setPreviewUrl(reader.result)
      }
    }
    reader.onerror = () => {
      toast.error('Failed to read image file')
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    try {
      await dispatch(updateUserProfile(profileForm)).unwrap()
      setIsEditing(false)
      setPreviewUrl(null)
    } catch (error) {
      // Error is handled by Redux and shown in UI
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

        {/* User's Places and Comments Tabs */}
        <div className="profile-content">
          {!user.isApproved && (
            <div className="approval-notice-banner">
              <ExclamationTriangleIcon className="icon" />
              Your account is pending approval. You can update your profile but cannot create places yet.
            </div>
          )}

          <Tabs
            tabs={[
              {
                id: 'places',
                label: 'My Places',
                icon: <MapPinIcon />,
                count: pagination?.total,
                content: (
                  <>
                    {placesLoading ? (
                      <LoadingSpinner />
                    ) : userPlaces.length > 0 ? (
                      <>
                        <div className="places-grid">
                          {userPlaces.map((place) => (
                            <Link to={`/place/${place._id}`} key={place._id} className="place-card">
                              {place.photos && place.photos.length > 0 && (
                                <div className="place-image">
                                  <img src={place.photos[0].url} alt={place.name} />
                                </div>
                              )}
                              <div className="place-content">
                                <h3>{place.name}</h3>
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
                      </>
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
                  </>
                )
              },
              {
                id: 'comments',
                label: 'My Comments',
                icon: <ChatBubbleLeftIcon />,
                count: commentsPagination?.total,
                content: (
                  <>
                    {isLoadingComments ? (
                      <LoadingSpinner />
                    ) : userComments.length > 0 ? (
                      <>
                        <div className="comments-list">
                          {userComments.map((comment) => {
                            if (!comment.place) return null

                            return (
                              <Link to={`/place/${comment.place._id}`} key={comment._id} className="comment-card">
                                {comment.place.photo && (
                                  <div className="comment-place-image">
                                    <img src={comment.place.photo} alt={comment.place.name || 'Place'} />
                                  </div>
                                )}
                                <div className="comment-content">
                                  <div className="comment-header">
                                    <h4>{comment.place.name || 'Untitled Place'}</h4>
                                    <span className="comment-date">{formatDate(comment.createdAt)}</span>
                                  </div>
                                  <p className="comment-text">{stripHtml(comment.content)}</p>
                                </div>
                              </Link>
                            )
                          })}
                        </div>

                        {commentsPagination && commentsPagination.pages > 1 && (
                          <div className="pagination">
                            <button
                              onClick={() => setCurrentCommentsPage(currentCommentsPage - 1)}
                              disabled={currentCommentsPage === 1}
                              className="pagination-btn"
                            >
                              <ChevronLeftIcon className="icon" />
                              Previous
                            </button>
                            <div className="pagination-info">
                              Page {currentCommentsPage} of {commentsPagination.pages}
                            </div>
                            <button
                              onClick={() => setCurrentCommentsPage(currentCommentsPage + 1)}
                              disabled={currentCommentsPage === commentsPagination.pages}
                              className="pagination-btn"
                            >
                              Next
                              <ChevronRightIcon className="icon" />
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="empty-state">
                        <ChatBubbleLeftIcon className="empty-icon" />
                        <h3>No comments yet</h3>
                        <p>Start commenting on places to share your thoughts!</p>
                      </div>
                    )}
                  </>
                )
              }
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </div>
    </div>
  )
}

export default Profile