import { useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { geolocationService } from '../../services/geolocation'
import { MapPinIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import './LocationPicker.css'

// Custom icon for selected location
const selectedLocationIcon = L.divIcon({
  html: '<div class="selected-location-marker"></div>',
  className: 'selected-div-icon',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15]
})

// Component to handle map clicks
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng)
    }
  })
  return null
}

const LocationPicker = ({
  selectedLocation,
  onLocationChange,
  height = '300px',
  showSearch = true,
  showCurrentLocation = true
}) => {
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]) // Default to NYC
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [_locationInfo, setLocationInfo] = useState(null)

  // Handle location selection from map click
  const handleLocationSelect = async (latlng) => {
    const location = {
      latitude: latlng.lat,
      longitude: latlng.lng
    }

    // Get address information
    try {
      const addressInfo = await geolocationService.reverseGeocode(latlng.lat, latlng.lng)
      setLocationInfo(addressInfo)
      onLocationChange({
        ...location,
        address: addressInfo.displayName,
        coordinates: [latlng.lng, latlng.lat] // GeoJSON format
      })
    } catch (error) {
      onLocationChange({
        ...location,
        coordinates: [latlng.lng, latlng.lat]
      })
    }
  }

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const results = await geolocationService.forwardGeocode(searchQuery)
      setSearchResults(results.slice(0, 5)) // Limit to 5 results
    } catch (error) {
      setSearchResults([])
    }
    setIsSearching(false)
  }

  // Handle search result selection
  const handleSearchResultSelect = (result) => {
    const location = {
      latitude: result.coordinates.latitude,
      longitude: result.coordinates.longitude,
      address: result.displayName,
      coordinates: [result.coordinates.longitude, result.coordinates.latitude]
    }

    setMapCenter([result.coordinates.latitude, result.coordinates.longitude])
    setLocationInfo(result)
    onLocationChange(location)
    setSearchResults([])
    setSearchQuery('')
  }

  // Get current location
  const handleGetCurrentLocation = async () => {
    setIsGettingLocation(true)
    try {
      const position = await geolocationService.getCurrentPosition()
      const location = {
        latitude: position.latitude,
        longitude: position.longitude
      }

      setMapCenter([position.latitude, position.longitude])

      // Get address information
      try {
        const addressInfo = await geolocationService.reverseGeocode(position.latitude, position.longitude)
        setLocationInfo(addressInfo)
        onLocationChange({
          ...location,
          address: addressInfo.displayName,
          coordinates: [position.longitude, position.latitude]
        })
      } catch (error) {
        onLocationChange({
          ...location,
          coordinates: [position.longitude, position.latitude]
        })
      }
    } catch (error) {
      alert(error.message)
    }
    setIsGettingLocation(false)
  }

  // Handle search on Enter key
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }

  return (
    <div className="location-picker">
      {/* Search and controls */}
      <div className="location-picker-controls">
        {showSearch && (
          <div className="search-container">
            <div className="search-input-container">
              <MagnifyingGlassIcon className="search-icon" />
              <input
                type="text"
                placeholder="Search for a location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="search-input"
              />
              <button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="search-button"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>

            {/* Search results */}
            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="search-result-item"
                    onClick={() => handleSearchResultSelect(result)}
                  >
                    <MapPinIcon className="result-icon" />
                    <div className="result-content">
                      <div className="result-name">{result.displayName}</div>
                      <div className="result-type">{result.type}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {showCurrentLocation && (
          <button
            onClick={handleGetCurrentLocation}
            disabled={isGettingLocation}
            className="current-location-button"
          >
            <MapPinIcon className="button-icon" />
            {isGettingLocation ? 'Getting location...' : 'Use current location'}
          </button>
        )}
      </div>

      {/* Map */}
      <div className="map-container" style={{ height }}>
        <MapContainer
          center={mapCenter}
          zoom={13}
          scrollWheelZoom={true}
          className="location-picker-map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler onLocationSelect={handleLocationSelect} />

          {selectedLocation && selectedLocation.latitude && selectedLocation.longitude && (
            <Marker
              position={[selectedLocation.latitude, selectedLocation.longitude]}
              icon={selectedLocationIcon}
            />
          )}
        </MapContainer>

        <div className="map-instructions">
          📍 Click anywhere on the map to select a location
        </div>
      </div>

      {/* Selected location info */}
      {selectedLocation && (
        <div className="selected-location-info">
          <h4>Selected Location</h4>
          <p className="coordinates">
            Lat: {selectedLocation.latitude?.toFixed(6)},
            Lng: {selectedLocation.longitude?.toFixed(6)}
          </p>
          {selectedLocation.address && (
            <p className="address">{selectedLocation.address}</p>
          )}
        </div>
      )}
    </div>
  )
}

export default LocationPicker