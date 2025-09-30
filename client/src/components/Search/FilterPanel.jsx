import { useState, useEffect } from 'react'
import { XMarkIcon, MapPinIcon } from '@heroicons/react/24/outline'
import { geolocationService } from '../../services/geolocation'
import './FilterPanel.css'

const FilterPanel = ({ filters, onFiltersChange, onClose, isOpen }) => {
  const [localFilters, setLocalFilters] = useState(filters)
  const [userLocation, setUserLocation] = useState(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState(null)
  const [distanceUnit, setDistanceUnit] = useState('mi') // 'mi' or 'km'

  const sortOptions = [
    { value: 'createdAt-desc', label: 'Newest First' },
    { value: 'createdAt-asc', label: 'Oldest First' },
    { value: 'name-asc', label: 'Name A-Z' },
    { value: 'name-desc', label: 'Name Z-A' }
  ]

  const distancePresets = [
    { mi: 5, km: 8 },
    { mi: 10, km: 16 },
    { mi: 25, km: 40 },
    { mi: 50, km: 80 },
    { mi: 100, km: 161 }
  ]

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleGetLocation = async () => {
    setLocationLoading(true)
    setLocationError(null)
    try {
      const location = await geolocationService.getCurrentPosition()
      setUserLocation(location)
      handleFilterChange('userLat', location.latitude)
      handleFilterChange('userLng', location.longitude)
      handleFilterChange('useDistance', true)
    } catch (error) {
      setLocationError(error.message)
      console.error('Location error:', error)
    } finally {
      setLocationLoading(false)
    }
  }

  const handleClearLocation = () => {
    setUserLocation(null)
    handleFilterChange('userLat', null)
    handleFilterChange('userLng', null)
    handleFilterChange('useDistance', false)
    setLocationError(null)
  }

  const handleReset = () => {
    const resetFilters = {
      sortBy: 'createdAt',
      sortOrder: 'desc',
      radius: distanceUnit === 'mi' ? 10 : 16,
      useDistance: false,
      userLat: null,
      userLng: null
    }
    setLocalFilters(resetFilters)
    onFiltersChange(resetFilters)
    setUserLocation(null)
    setLocationError(null)
  }

  const getRadiusDisplay = () => {
    const radius = localFilters.radius || (distanceUnit === 'mi' ? 10 : 16)
    return distanceUnit === 'mi' ?
      `${Math.round(radius * 0.621371)} mi` :
      `${radius} km`
  }

  const handleDistancePreset = (preset) => {
    const radius = distanceUnit === 'mi' ? preset.km : preset.km
    handleFilterChange('radius', radius)
  }

  const handleSortChange = (value) => {
    const [sortBy, sortOrder] = value.split('-')
    handleFilterChange('sortBy', sortBy)
    handleFilterChange('sortOrder', sortOrder)
  }

  const currentSort = `${localFilters.sortBy || 'createdAt'}-${localFilters.sortOrder || 'desc'}`

  if (!isOpen) return null

  return (
    <div className="filter-panel-overlay">
      <div className="filter-panel">
        <div className="filter-panel-header">
          <h3>Filters</h3>
          <button onClick={onClose} className="close-btn">
            <XMarkIcon className="close-icon" />
          </button>
        </div>

        <div className="filter-panel-content">
          {/* Sort Filter */}
          <div className="filter-group">
            <label className="filter-label">Sort By</label>
            <select
              value={currentSort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="filter-select"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Distance-based Location Filter */}
          <div className="filter-group">
            <label className="filter-label">Filter by Distance</label>

            {!userLocation && !locationError && (
              <button
                onClick={handleGetLocation}
                disabled={locationLoading}
                className="location-btn"
              >
                <MapPinIcon className="btn-icon" />
                {locationLoading ? 'Getting Location...' : 'Use My Location'}
              </button>
            )}

            {locationError && (
              <div className="location-error">
                <p>{locationError}</p>
                <button onClick={handleGetLocation} className="retry-btn">
                  Try Again
                </button>
              </div>
            )}

            {userLocation && (
              <div className="location-active">
                <p className="location-status">
                  <MapPinIcon className="status-icon" />
                  Using your location
                </p>
                <button onClick={handleClearLocation} className="clear-location-btn">
                  Clear Location
                </button>

                {/* Distance Presets */}
                <div className="distance-presets">
                  <label className="preset-label">Quick Distance:</label>
                  <div className="preset-buttons">
                    {distancePresets.map((preset) => (
                      <button
                        key={preset.mi}
                        onClick={() => handleDistancePreset(preset)}
                        className={`preset-btn ${localFilters.radius === preset.km ? 'active' : ''}`}
                      >
                        {distanceUnit === 'mi' ? `${preset.mi} mi` : `${preset.km} km`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Distance Slider */}
                <div className="distance-slider">
                  <label className="filter-label">
                    Distance: {getRadiusDisplay()}
                  </label>
                  <input
                    type="range"
                    min={distanceUnit === 'mi' ? 1 : 1}
                    max={distanceUnit === 'mi' ? 100 : 161}
                    value={localFilters.radius || (distanceUnit === 'mi' ? 16 : 16)}
                    onChange={(e) => handleFilterChange('radius', parseInt(e.target.value))}
                    className="filter-range"
                  />
                  <div className="range-labels">
                    <span>{distanceUnit === 'mi' ? '1 mi' : '1 km'}</span>
                    <span>{distanceUnit === 'mi' ? '100 mi' : '161 km'}</span>
                  </div>
                </div>

                {/* Unit Toggle */}
                <div className="unit-toggle">
                  <button
                    onClick={() => setDistanceUnit('mi')}
                    className={`unit-btn ${distanceUnit === 'mi' ? 'active' : ''}`}
                  >
                    Miles
                  </button>
                  <button
                    onClick={() => setDistanceUnit('km')}
                    className={`unit-btn ${distanceUnit === 'km' ? 'active' : ''}`}
                  >
                    Kilometers
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="filter-panel-actions">
          <button onClick={handleReset} className="reset-btn">
            Reset Filters
          </button>
          <button onClick={onClose} className="apply-btn">
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}

export default FilterPanel