import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import {
  MapPinIcon,
  CalendarDaysIcon,
  EyeIcon,
  HeartIcon,
  ArrowLeftIcon,
  UserCircleIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import CommentSection from '../../components/Comments/CommentSection'
import Map from '../../components/Map/Map'
import ImageLightbox from '../../components/UI/ImageLightbox'
import { formatDate } from '../../utils/dateFormatter'
import { API_URL } from '../../config/api'
import './PlaceDetails.css'

const PlaceDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token, user, isAuthenticated } = useSelector((state) => state.auth)
  const [place, setPlace] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  useEffect(() => {
    fetchPlace()
  }, [id])

  const fetchPlace = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get(`${API_URL}/api/places/${id}`)
      const fetchedPlace = response.data.place
      setPlace(fetchedPlace)
      setLikesCount(fetchedPlace.likes?.length || 0)

      // Check if current user has liked this place
      if (isAuthenticated && user) {
        const userLiked = fetchedPlace.likes?.some(like => like.user === user._id)
        setIsLiked(userLiked)
      }
    } catch (err) {
      console.error('Error fetching place:', err)
      setError(err.response?.data?.message || 'Failed to load place')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = async () => {
    if (!isAuthenticated) {
      navigate('/auth')
      return
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/places/${id}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      setIsLiked(response.data.isLiked)
      setLikesCount(response.data.likesCount)
    } catch (err) {
      console.error('Error liking place:', err)
    }
  }

  const getAuthorName = () => {
    if (!place) return ''
    if (place.isAnonymous || !place.author) return 'Anonymous'
    return `${place.author.firstName} ${place.author.lastName || ''}`.trim()
  }

  const canEdit = () => {
    if (!isAuthenticated || !place) return false
    return place.author._id === user._id || user.role === 'admin'
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this place? This action cannot be undone.')) {
      return
    }

    try {
      setIsDeleting(true)
      await axios.delete(`${API_URL}/api/places/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert('Place deleted successfully')
      navigate('/dashboard')
    } catch (err) {
      console.error('Error deleting place:', err)
      alert(err.response?.data?.message || 'Failed to delete place')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error || !place) {
    return (
      <div className="place-details-error">
        <div className="container">
          <h2>Oops!</h2>
          <p>{error || 'Place not found'}</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="place-details">
      <div className="container">
        {/* Action Buttons */}
        <div className="place-actions-header">
          <button onClick={() => navigate(-1)} className="back-btn">
            <ArrowLeftIcon className="icon" />
            Back
          </button>

          {canEdit() && (
            <div className="edit-delete-actions">
              <button
                onClick={() => navigate(`/edit/${id}`)}
                className="edit-btn"
              >
                <PencilIcon className="icon" />
                Edit Place
              </button>

              <button
                onClick={handleDelete}
                className="delete-btn"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <>
                    <TrashIcon className="icon" />
                    Delete
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Photo Gallery */}
        {place.photos && place.photos.length > 0 && (
          <div className="photo-gallery">
            <div className="main-photo">
              <img
                src={place.photos[currentPhotoIndex].url}
                alt={place.name}
                className="photo"
                onClick={() => {
                  setLightboxIndex(currentPhotoIndex)
                  setLightboxOpen(true)
                }}
                style={{ cursor: 'pointer' }}
              />
              {place.photos.length > 1 && (
                <>
                  <button
                    className="photo-nav prev"
                    onClick={(e) => {
                      e.stopPropagation()
                      setCurrentPhotoIndex((currentPhotoIndex - 1 + place.photos.length) % place.photos.length)
                    }}
                  >
                    ‹
                  </button>
                  <button
                    className="photo-nav next"
                    onClick={(e) => {
                      e.stopPropagation()
                      setCurrentPhotoIndex((currentPhotoIndex + 1) % place.photos.length)
                    }}
                  >
                    ›
                  </button>
                  <div className="photo-indicator">
                    {currentPhotoIndex + 1} / {place.photos.length}
                  </div>
                </>
              )}
            </div>
            {place.photos.length > 1 && (
              <div className="photo-thumbnails">
                {place.photos.map((photo, index) => (
                  <button
                    key={index}
                    className={`thumbnail ${index === currentPhotoIndex ? 'active' : ''}`}
                    onClick={() => setCurrentPhotoIndex(index)}
                  >
                    <img src={photo.url} alt={`${place.name} ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Place Info */}
        <div className="place-info-grid">
          <div className="place-main-info">
            <div className="place-header">
              <div>
                <h1 className="place-title">{place.name}</h1>
              </div>

              <button
                onClick={handleLike}
                className={`like-btn ${isLiked ? 'liked' : ''}`}
                title={isLiked ? 'Unlike' : 'Like'}
              >
                {isLiked ? (
                  <HeartIconSolid className="icon" />
                ) : (
                  <HeartIcon className="icon" />
                )}
                <span>{likesCount}</span>
              </button>
            </div>

            <div className="place-meta">
              {place.location && (
                <div className="meta-item">
                  <MapPinIcon className="icon" />
                  <span>{place.location.address}</span>
                </div>
              )}
              <div className="meta-item">
                <CalendarDaysIcon className="icon" />
                <span>Posted {formatDate(place.createdAt)}</span>
              </div>
              <div className="meta-item">
                <EyeIcon className="icon" />
                <span>{place.views || 0} views</span>
              </div>
            </div>

            <div className="place-description">
              <h2>About this place</h2>
              <p>{place.description}</p>
            </div>

            {place.tags && place.tags.length > 0 && (
              <div className="place-tags">
                {place.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Author Info */}
            <div className="place-author">
              <div className="author-card">
                {place.author?.avatar ? (
                  <img src={place.author.avatar} alt={getAuthorName()} className="author-avatar" />
                ) : (
                  <div className="author-avatar-placeholder">
                    <UserCircleIcon className="icon" />
                  </div>
                )}
                <div className="author-info">
                  <span className="author-label">Shared by</span>
                  <span className="author-name">{getAuthorName()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Map Sidebar */}
          {place.location && (
            <div className="place-map-sidebar">
              <div className="map-container">
                <Map
                  center={[place.location.coordinates[1], place.location.coordinates[0]]}
                  zoom={15}
                  markers={[{
                    position: [place.location.coordinates[1], place.location.coordinates[0]],
                    popup: place.name
                  }]}
                  height="400px"
                />
              </div>
            </div>
          )}
        </div>

        {/* Comments Section */}
        <CommentSection
          placeId={id}
          initialComments={place.comments || []}
          onCommentAdded={(comment) => {
            setPlace({ ...place, comments: [...(place.comments || []), comment] })
          }}
          onCommentDeleted={(commentId) => {
            setPlace({ ...place, comments: place.comments.filter(c => c._id !== commentId) })
          }}
        />
      </div>

      {/* Image Lightbox */}
      {lightboxOpen && place.photos && place.photos.length > 0 && (
        <ImageLightbox
          images={place.photos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onNavigate={(index) => setLightboxIndex(index)}
        />
      )}
    </div>
  )
}

export default PlaceDetails