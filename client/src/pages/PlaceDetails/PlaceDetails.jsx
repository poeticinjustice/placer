import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import DOMPurify from 'dompurify'
import {
  MapPinIcon,
  CalendarDaysIcon,
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
import { useConfirm } from '../../components/UI/ConfirmDialogProvider'
import { useToast } from '../../components/UI/ToastContainer'
import { fetchPlaceById, deletePlace, likePlace } from '../../store/slices/placesSlice'
import useDocumentTitle from '../../hooks/useDocumentTitle'
import './PlaceDetails.css'

const PlaceDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { confirm } = useConfirm()
  const toast = useToast()

  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const { currentPlace: place, isLoading, error } = useSelector((state) => state.places)

  useDocumentTitle(place?.name || 'Place Details')

  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  useEffect(() => {
    dispatch(fetchPlaceById(id))
  }, [dispatch, id])

  useEffect(() => {
    if (place) {
      setLikesCount(place.likes?.length || 0)
      // Check if current user has liked this place
      if (isAuthenticated && user) {
        const userLiked = place.likes?.some(like => like && like.user === user._id)
        setIsLiked(userLiked || false)
      } else {
        setIsLiked(false)
      }
    }
  }, [place, isAuthenticated, user])

  const handleLike = async () => {
    if (!isAuthenticated) {
      navigate('/auth')
      return
    }

    try {
      const result = await dispatch(likePlace(id)).unwrap()
      setIsLiked(result.isLiked)
      setLikesCount(result.likesCount)
    } catch {
      toast.error('Failed to like place')
    }
  }

  const getAuthorName = () => {
    if (!place) return ''
    if (place.isAnonymous || !place.author) return 'Anonymous'
    return `${place.author.firstName} ${place.author.lastName || ''}`.trim()
  }

  const canEdit = () => {
    if (!isAuthenticated || !place || !user) return false

    // Admin can edit anything
    if (user.role === 'admin') return true

    // Regular user can only edit their own content
    // Handle both user.id (from auth state) and user._id
    const userId = user.id || user._id
    const authorId = place.author?._id || place.author

    return authorId === userId
  }

  const handleDelete = async () => {
    const confirmed = await confirm(
      'Delete this place?',
      'This action cannot be undone and will remove all associated data.'
    )
    if (!confirmed) return

    try {
      setIsDeleting(true)
      await dispatch(deletePlace(id)).unwrap()
      toast.success('Place deleted successfully')
      navigate('/dashboard')
    } catch {
      toast.error('Failed to delete place')
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
            </div>

            <div className="place-description">
              <h2>About this place</h2>
              {place.description ? (
                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(place.description) }} />
              ) : (
                <p>No description provided</p>
              )}
            </div>

            {place.tags && place.tags.length > 0 && (
              <div className="place-tags">
                {place.tags.map((tag, index) => (
                  <Link
                    key={index}
                    to={`/dashboard?tag=${encodeURIComponent(tag)}`}
                    className="tag"
                  >
                    #{tag}
                  </Link>
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
          {place.location && place.location.coordinates?.length === 2 && (
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