import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPlaces, setViewMode, setSearchQuery, setFilters, searchPlaces } from '../../store/slices/placesSlice'
import Map from '../../components/Map/Map'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import ResponsiveGrid from '../../components/Gallery/ResponsiveGrid'
import PlaceCard from '../../components/Gallery/PlaceCard'
import {
  MapIcon,
  Squares2X2Icon,
  ListBulletIcon,
  PlusIcon,
  FunnelIcon,
  ViewColumnsIcon
} from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import SearchBar from '../../components/Search/SearchBar'
import FilterPanel from '../../components/Search/FilterPanel'
import './Dashboard.css'

const Dashboard = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { places, isLoading, viewMode, searchQuery, filters } = useSelector((state) => state.places)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    dispatch(fetchPlaces())
  }, [dispatch])

  const handleViewModeChange = (mode) => {
    dispatch(setViewMode(mode))
  }

  const handleSearch = (query) => {
    dispatch(setSearchQuery(query))
    dispatch(searchPlaces())
  }

  const handleFiltersChange = (newFilters) => {
    dispatch(setFilters(newFilters))
    dispatch(searchPlaces())
  }

  const handleCloseFilters = () => {
    setShowFilters(false)
  }

  const viewModeOptions = [
    { key: 'gallery', icon: Squares2X2Icon, label: 'Gallery' },
    { key: 'masonry', icon: ViewColumnsIcon, label: 'Masonry' },
    { key: 'list', icon: ListBulletIcon, label: 'List' },
    { key: 'map', icon: MapIcon, label: 'Map' }
  ]

  const renderPlaceCard = (place) => (
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
            {place.description.substring(0, 120)}...
          </p>
        )}
        <div className="place-meta">
          {place.category && (
            <span className="place-category">{place.category}</span>
          )}
          {place.location?.address && (
            <span className="place-location">{place.location.address}</span>
          )}
        </div>
        <div className="place-actions">
          <Link to={`/places/${place._id}`} className="view-place-btn">
            View Details
          </Link>
        </div>
      </div>
    </div>
  )

  const renderGalleryView = () => (
    <ResponsiveGrid
      items={places}
      renderItem={(place) => (
        <PlaceCard
          place={place}
          variant="default"
          showAuthor={false}
          showStats={true}
          showDescription={true}
        />
      )}
      layout="grid"
      columns={{ mobile: 2, tablet: 3, desktop: 4 }}
      gap="lg"
      className="dashboard-places-grid"
      loading={isLoading}
      emptyState={
        <div className="empty-state">
          <h3>No places yet</h3>
          <p>Start discovering and sharing amazing places!</p>
        </div>
      }
    />
  )

  const renderMasonryView = () => (
    <ResponsiveGrid
      items={places}
      renderItem={(place) => (
        <PlaceCard
          place={place}
          variant="compact"
          showAuthor={false}
          showStats={true}
          showDescription={true}
        />
      )}
      layout="masonry"
      columns={{ mobile: 2, tablet: 3, desktop: 4 }}
      gap="md"
      className="dashboard-places-masonry"
      loading={isLoading}
      emptyState={
        <div className="empty-state">
          <h3>No places yet</h3>
          <p>Start discovering and sharing amazing places!</p>
        </div>
      }
    />
  )

  const renderListView = () => (
    <div className="places-list">
      {places.map((place) => (
        <div key={place._id} className="place-list-item">
          {place.photos && place.photos.length > 0 && (
            <div className="list-item-image">
              <img src={place.photos[0].url} alt={place.title} />
            </div>
          )}
          <div className="list-item-content">
            <h3>{place.title}</h3>
            {place.description && (
              <p>{place.description.substring(0, 200)}...</p>
            )}
            <div className="list-item-meta">
              {place.category && (
                <span className="place-category">{place.category}</span>
              )}
              {place.location?.address && (
                <span className="place-location">{place.location.address}</span>
              )}
            </div>
          </div>
          <div className="list-item-actions">
            <Link to={`/places/${place._id}`} className="view-place-btn">
              View Details
            </Link>
          </div>
        </div>
      ))}
    </div>
  )

  const renderMapView = () => (
    <div className="places-map-container">
      <Map
        places={places}
        height="600px"
        showUserLocation={true}
        zoom={10}
      />
    </div>
  )

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="loading-container">
          <LoadingSpinner />
          <p>Loading places...</p>
        </div>
      )
    }

    if (places.length === 0) {
      return (
        <div className="empty-state">
          <h3>No places found</h3>
          <p>Be the first to share a special place with the community!</p>
          {user?.isApproved && (
            <Link to="/create" className="create-first-place-btn">
              <PlusIcon className="btn-icon" />
              Add Your First Place
            </Link>
          )}
        </div>
      )
    }

    switch (viewMode) {
      case 'list':
        return renderListView()
      case 'map':
        return renderMapView()
      case 'masonry':
        return renderMasonryView()
      default:
        return renderGalleryView()
    }
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div className="header-top">
            <div className="header-text">
              <h1>Welcome back, {user?.firstName}!</h1>
              {!user?.isApproved && (
                <div className="approval-notice">
                  <p>Your account is pending admin approval. You can update your profile but cannot create posts yet.</p>
                </div>
              )}
            </div>

            {user?.isApproved && (
              <Link to="/create" className="create-place-btn">
                <PlusIcon className="btn-icon" />
                Add Place
              </Link>
            )}
          </div>

          <div className="dashboard-controls">
            <div className="view-mode-selector">
              {viewModeOptions.map(({ key, icon: IconComponent, label }) => (
                <button
                  key={key}
                  onClick={() => handleViewModeChange(key)}
                  className={`view-mode-btn ${viewMode === key ? 'active' : ''}`}
                  title={label}
                >
                  <IconComponent className="view-mode-icon" />
                  <span className="view-mode-label">{label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="filters-btn"
            >
              <FunnelIcon className="btn-icon" />
              Filters
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="dashboard-search">
          <SearchBar
            onSearch={handleSearch}
            initialValue={searchQuery}
            placeholder="Search places by name, description, or location..."
            className="main-search"
          />
        </div>

        <div className="dashboard-content">
          {renderContent()}
        </div>

        {/* Filter Panel */}
        <FilterPanel
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClose={handleCloseFilters}
          isOpen={showFilters}
        />
      </div>
    </div>
  )
}

export default Dashboard