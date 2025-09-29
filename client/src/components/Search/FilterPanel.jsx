import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import './FilterPanel.css'

const FilterPanel = ({ filters, onFiltersChange, onClose, isOpen }) => {
  const [localFilters, setLocalFilters] = useState(filters)

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'attraction', label: 'Attraction' },
    { value: 'outdoor', label: 'Outdoor' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'accommodation', label: 'Accommodation' },
    { value: 'transport', label: 'Transport' },
    { value: 'services', label: 'Services' },
    { value: 'other', label: 'Other' }
  ]

  const sortOptions = [
    { value: 'createdAt-desc', label: 'Newest First' },
    { value: 'createdAt-asc', label: 'Oldest First' },
    { value: 'name-asc', label: 'Name A-Z' },
    { value: 'name-desc', label: 'Name Z-A' }
  ]

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleReset = () => {
    const resetFilters = {
      category: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      radius: 10,
      location: ''
    }
    setLocalFilters(resetFilters)
    onFiltersChange(resetFilters)
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
          {/* Category Filter */}
          <div className="filter-group">
            <label className="filter-label">Category</label>
            <select
              value={localFilters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="filter-select"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
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

          {/* Location Filter */}
          <div className="filter-group">
            <label className="filter-label">Location</label>
            <input
              type="text"
              value={localFilters.location || ''}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              placeholder="Enter city, state, or address"
              className="filter-input"
            />
          </div>

          {/* Radius Filter */}
          <div className="filter-group">
            <label className="filter-label">
              Search Radius: {localFilters.radius || 10} km
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={localFilters.radius || 10}
              onChange={(e) => handleFilterChange('radius', parseInt(e.target.value))}
              className="filter-range"
            />
            <div className="range-labels">
              <span>1km</span>
              <span>100km</span>
            </div>
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