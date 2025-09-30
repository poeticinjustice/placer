import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import axios from 'axios'
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
import './AdminDashboard.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const AdminPlaces = () => {
  const { token } = useSelector((state) => state.auth)
  const [places, setPlaces] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processingPlaceId, setProcessingPlaceId] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })

  useEffect(() => {
    fetchPlaces()
  }, [pagination.page])

  const fetchPlaces = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await axios.get(
        `${API_URL}/api/places?page=${pagination.page}&limit=${pagination.limit}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      setPlaces(response.data.places)
      setPagination(response.data.pagination)
    } catch (err) {
      console.error('Error fetching places:', err)
      setError(err.response?.data?.message || 'Failed to fetch places')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleFeatured = async (placeId) => {
    try {
      setProcessingPlaceId(placeId)
      const response = await axios.patch(
        `${API_URL}/api/places/${placeId}/featured`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      setPlaces(places.map(place =>
        place._id === placeId
          ? { ...place, isFeatured: response.data.isFeatured }
          : place
      ))
    } catch (err) {
      console.error('Error toggling featured status:', err)
      alert(err.response?.data?.message || 'Failed to update featured status')
    } finally {
      setProcessingPlaceId(null)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (isLoading && places.length === 0) {
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

        {error && (
          <div className="error-message">
            <ExclamationTriangleIcon className="icon" />
            {error}
          </div>
        )}

        <div className="stats-bar">
          <div className="stat-card">
            <div className="stat-number">{places.filter(p => p.isFeatured).length}</div>
            <div className="stat-label">Featured Places</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{pagination.total}</div>
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
                      disabled={processingPlaceId === place._id}
                      title={place.isFeatured ? 'Remove from featured' : 'Add to featured'}
                    >
                      {processingPlaceId === place._id ? (
                        <LoadingSpinner size="small" />
                      ) : place.isFeatured ? (
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
                        {formatDate(place.createdAt)}
                      </span>
                    </div>

                    {place.author && (
                      <div className="place-author">
                        By {place.author.firstName} {place.author.lastName}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {pagination.pages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="btn btn-secondary"
                >
                  Previous
                </button>

                <span className="pagination-info">
                  Page {pagination.page} of {pagination.pages}
                </span>

                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
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