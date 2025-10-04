import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  StarIcon,
  MapPinIcon,
  EyeIcon,
  HeartIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import { formatDateShort } from '../../utils/dateFormatter'
import { useToast } from '../../components/UI/ToastContainer'
import {
  fetchAdminPlaces,
  toggleFeaturedStatus,
  setPlacesPagination
} from '../../store/slices/adminSlice'
import './AdminPlaces.css'

const AdminPlaces = () => {
  const dispatch = useDispatch()
  const toast = useToast()

  const { places, isLoadingPlaces, placesError, placesPagination } = useSelector((state) => state.admin)

  useEffect(() => {
    dispatch(fetchAdminPlaces({ page: placesPagination.page, limit: placesPagination.limit }))
  }, [dispatch, placesPagination.page, placesPagination.limit])

  const handleToggleFeatured = async (placeId) => {
    try {
      await dispatch(toggleFeaturedStatus(placeId)).unwrap()
      toast.success('Featured status updated')
    } catch (err) {
      toast.error(err || 'Failed to update featured status')
    }
  }

  const handlePageChange = (newPage) => {
    dispatch(setPlacesPagination({ page: newPage }))
  }

  if (isLoadingPlaces && places.length === 0) {
    return <LoadingSpinner />
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="admin-header">
          <div>
            <Link to="/admin" className="back-link">
              <ArrowLeftIcon className="icon" />
              Back to Dashboard
            </Link>
            <h1>Manage Featured Places</h1>
            <p className="subtitle">Select which places to feature on the home page</p>
          </div>
        </div>

        {placesError && (
          <div className="error-message">
            <ExclamationTriangleIcon className="icon" />
            {placesError}
          </div>
        )}

        <div className="stats-bar">
          <div className="stat-card">
            <div className="stat-number">{places.filter(p => p.isFeatured).length}</div>
            <div className="stat-label">Featured Places</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{placesPagination.total}</div>
            <div className="stat-label">Total Places</div>
          </div>
        </div>

        {places.length === 0 ? (
          <div className="empty-state">
            <MapPinIcon className="empty-icon" />
            <h3>No places yet</h3>
            <p>Places will appear here once users start sharing them.</p>
          </div>
        ) : (
          <>
            <div className="places-grid">
              {places.map((place) => (
                <div key={place._id} className="place-admin-card">
                  <div className="place-image">
                    {place.photos && place.photos.length > 0 ? (
                      <img src={place.photos[0].url} alt={place.name} />
                    ) : (
                      <div className="image-placeholder">
                        <MapPinIcon className="icon" />
                      </div>
                    )}
                    <button
                      onClick={() => handleToggleFeatured(place._id)}
                      className={`featured-toggle ${place.isFeatured ? 'active' : ''}`}
                      disabled={isLoadingPlaces}
                      title={place.isFeatured ? 'Remove from featured' : 'Add to featured'}
                    >
                      {place.isFeatured ? (
                        <StarIconSolid className="icon" />
                      ) : (
                        <StarIcon className="icon" />
                      )}
                    </button>
                  </div>

                  <div className="place-info">
                    <h3 className="place-name">
                      <Link to={`/place/${place._id}`}>
                        {place.name}
                      </Link>
                    </h3>

                    {place.location?.address && (
                      <div className="place-location">
                        <MapPinIcon className="icon" />
                        <span>{place.location.address}</span>
                      </div>
                    )}

                    <div className="place-meta">
                      <span className="meta-item">
                        <EyeIcon className="icon" />
                        {place.views || 0}
                      </span>
                      <span className="meta-item">
                        <HeartIcon className="icon" />
                        {place.likes?.length || 0}
                      </span>
                      <span className="meta-date">
                        {formatDateShort(place.createdAt)}
                      </span>
                    </div>

                    {place.author && (
                      <div className="place-author">
                        By {place.author.firstName || 'User'} {place.author.lastName || ''}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {placesPagination.pages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(placesPagination.page - 1)}
                  disabled={placesPagination.page === 1}
                  className="btn btn-secondary"
                >
                  Previous
                </button>

                <span className="pagination-info">
                  Page {placesPagination.page} of {placesPagination.pages}
                </span>

                <button
                  onClick={() => handlePageChange(placesPagination.page + 1)}
                  disabled={placesPagination.page === placesPagination.pages}
                  className="btn btn-secondary"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default AdminPlaces
