import { useState, useEffect, useRef } from 'react'
import { XMarkIcon, MapPinIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { geolocationService } from '../../services/geolocation'
import { api } from '../../services/api'
import './FilterPanel.css'

const FilterPanel = ({ filters, onFiltersChange, onClose, isOpen }) => {
  const [localFilters, setLocalFilters] = useState(filters)
  const [userLocation, setUserLocation] = useState(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState(null)
  const [distanceUnit, setDistanceUnit] = useState('mi') // 'mi' or 'km'
  const [availableTags, setAvailableTags] = useState([])
  const [tagSearchQuery, setTagSearchQuery] = useState('')
  const [showTagDropdown, setShowTagDropdown] = useState(false)
  const [selectedTags, setSelectedTags] = useState(filters?.tags || [])
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const tagInputRef = useRef(null)
  const dropdownRef = useRef(null)

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

  // Sync selectedTags with filters.tags when filters change
  useEffect(() => {
    setSelectedTags(filters?.tags || [])
  }, [filters?.tags])

  // Sync userLocation state when filters change
  useEffect(() => {
    if (filters?.useDistance && filters?.userLat && filters?.userLng) {
      setUserLocation({
        latitude: filters.userLat,
        longitude: filters.userLng
      })
    } else {
      setUserLocation(null)
    }
  }, [filters?.useDistance, filters?.userLat, filters?.userLng])

  // Sync localFilters when filters prop changes
  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  // Fetch available tags on mount
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await api.places.getTags()
        setAvailableTags(response.data.tags || [])
      } catch (error) {
        console.error('Error fetching tags:', error)
      }
    }
    if (isOpen) {
      fetchTags()
    }
  }, [isOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          tagInputRef.current && !tagInputRef.current.contains(event.target)) {
        setShowTagDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const highlightedElement = dropdownRef.current.querySelector(`#tag-option-${highlightedIndex}`)
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }
  }, [highlightedIndex])

  // Filter tags based on search query
  const filteredTags = availableTags.filter(({ tag }) => {
    const matchesSearch = tagSearchQuery === '' || tag.toLowerCase().includes(tagSearchQuery.toLowerCase())
    const notSelected = !selectedTags.includes(tag)
    return matchesSearch && notSelected
  })

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
      const newFilters = {
        ...localFilters,
        userLat: location.latitude,
        userLng: location.longitude,
        useDistance: true
      }
      setLocalFilters(newFilters)
      onFiltersChange(newFilters)
    } catch (error) {
      setLocationError(error.message)
    } finally {
      setLocationLoading(false)
    }
  }

  const handleClearLocation = () => {
    setUserLocation(null)
    setLocationError(null)
    const newFilters = {
      ...localFilters,
      userLat: null,
      userLng: null,
      useDistance: false,
      radius: 16
    }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleAddTag = (tag) => {
    const newSelectedTags = [...selectedTags, tag]
    setSelectedTags(newSelectedTags)
    handleFilterChange('tags', newSelectedTags)
    setTagSearchQuery('')
    setShowTagDropdown(false)
  }

  const handleRemoveTag = (tagToRemove) => {
    const newSelectedTags = selectedTags.filter(tag => tag !== tagToRemove)
    setSelectedTags(newSelectedTags)
    handleFilterChange('tags', newSelectedTags.length > 0 ? newSelectedTags : null)
  }

  const handleTagInputChange = (e) => {
    setTagSearchQuery(e.target.value)
    setShowTagDropdown(true)
    setHighlightedIndex(-1) // Reset highlight when typing
  }

  const handleTagInputFocus = () => {
    setShowTagDropdown(true)
  }

  const handleTagInputKeyDown = (e) => {
    if (!showTagDropdown || filteredTags.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev < filteredTags.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < filteredTags.length) {
          handleAddTag(filteredTags[highlightedIndex].tag)
        }
        break
      case 'Escape':
        e.preventDefault()
        setShowTagDropdown(false)
        setHighlightedIndex(-1)
        break
      default:
        break
    }
  }

  const handleReset = () => {
    const resetFilters = {
      sortBy: 'createdAt',
      sortOrder: 'desc',
      radius: distanceUnit === 'mi' ? 10 : 16,
      useDistance: false,
      userLat: null,
      userLng: null,
      tags: null
    }
    setLocalFilters(resetFilters)
    onFiltersChange(resetFilters)
    setUserLocation(null)
    setLocationError(null)
    setSelectedTags([])
    setTagSearchQuery('')
  }

  const getRadiusDisplay = () => {
    const radius = localFilters.radius || (distanceUnit === 'mi' ? 10 : 16)
    return distanceUnit === 'mi' ?
      `${Math.round(radius * 0.621371)} mi` :
      `${radius} km`
  }

  const handleDistancePreset = (preset) => {
    // Backend always expects km, so always use preset.km
    handleFilterChange('radius', preset.km)
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
          {/* Tag Filter */}
          <div className="filter-group">
            <label className="filter-label">Filter by Tags</label>
            <div className="tag-autocomplete-container">
              <div className="tag-input-wrapper" ref={tagInputRef}>
                <input
                  type="text"
                  value={tagSearchQuery}
                  onChange={handleTagInputChange}
                  onFocus={handleTagInputFocus}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="Search tags..."
                  className="tag-search-input"
                  aria-label="Search for tags to filter by"
                  aria-autocomplete="list"
                  aria-controls="tag-dropdown"
                  aria-activedescendant={
                    highlightedIndex >= 0 ? `tag-option-${highlightedIndex}` : undefined
                  }
                />
              </div>

              {showTagDropdown && filteredTags.length > 0 && (
                <div className="tag-dropdown" ref={dropdownRef} id="tag-dropdown" role="listbox">
                  {filteredTags.slice(0, 10).map(({ tag, count }, index) => (
                    <button
                      key={tag}
                      id={`tag-option-${index}`}
                      onClick={() => handleAddTag(tag)}
                      className={`tag-dropdown-item ${index === highlightedIndex ? 'highlighted' : ''}`}
                      role="option"
                      aria-selected={index === highlightedIndex}
                    >
                      <span className="tag-name">#{tag}</span>
                      <span className="tag-count">{count}</span>
                    </button>
                  ))}
                </div>
              )}

              {selectedTags.length > 0 && (
                <div className="selected-tags">
                  {selectedTags.map(tag => (
                    <span key={tag} className="tag-chip">
                      #{tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="tag-remove-btn"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

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