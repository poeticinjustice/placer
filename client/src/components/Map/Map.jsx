import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { geolocationService } from '../../services/geolocation'
import './Map.css'

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom icons
const createCustomIcon = (color = 'blue', size = 'medium') => {
  const iconSize = size === 'small' ? [20, 32] : size === 'large' ? [40, 64] : [25, 41]
  const iconAnchor = size === 'small' ? [10, 32] : size === 'large' ? [20, 64] : [12, 41]

  return L.divIcon({
    html: `<div class="custom-marker ${color}"></div>`,
    className: 'custom-div-icon',
    iconSize: iconSize,
    iconAnchor: iconAnchor,
    popupAnchor: [0, -32]
  })
}

// Component to handle map events
const MapEvents = ({ onLocationSelect, showLocationFinder }) => {
  useMapEvents({
    click: (e) => {
      if (onLocationSelect && showLocationFinder) {
        onLocationSelect(e.latlng)
      }
    }
  })
  return null
}

// Component to show user's current location
const LocationMarker = ({ showUserLocation, onLocationFound }) => {
  const [position, setPosition] = useState(null)
  const [_isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (showUserLocation && geolocationService.isSupported()) {
      setIsLoading(true)
      geolocationService.getCurrentPosition()
        .then((location) => {
          const pos = [location.latitude, location.longitude]
          setPosition(pos)
          onLocationFound?.(pos)
        })
        .catch((error) => {
          console.error('Error getting location:', error)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [showUserLocation, onLocationFound])

  return position ? (
    <Marker
      position={position}
      icon={createCustomIcon('red', 'medium')}
    >
      <Popup>
        <div className="location-popup">
          <strong>Your Location</strong>
          <p>Latitude: {position[0].toFixed(6)}</p>
          <p>Longitude: {position[1].toFixed(6)}</p>
        </div>
      </Popup>
    </Marker>
  ) : null
}

const Map = ({
  places = [],
  center = [40.7128, -74.0060], // Default to NYC
  zoom = 13,
  height = '400px',
  showUserLocation = false,
  showLocationFinder = false,
  onLocationSelect,
  onLocationFound,
  selectedPlace = null,
  className = ''
}) => {
  const mapRef = useRef(null)

  return (
    <div className={`map-container ${className}`} style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="leaflet-map"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents
          onLocationSelect={onLocationSelect}
          showLocationFinder={showLocationFinder}
        />

        {showUserLocation && (
          <LocationMarker
            showUserLocation={showUserLocation}
            onLocationFound={onLocationFound}
          />
        )}

        {/* Render place markers */}
        {places.map((place) => {
          if (!place.location?.coordinates) return null

          const [lng, lat] = place.location.coordinates
          const isSelected = selectedPlace && selectedPlace._id === place._id

          return (
            <Marker
              key={place._id}
              position={[lat, lng]}
              icon={createCustomIcon(isSelected ? 'green' : 'blue', 'medium')}
            >
              <Popup>
                <div className="place-popup">
                  <h3>{place.title}</h3>
                  {place.description && (
                    <p>{place.description.substring(0, 100)}...</p>
                  )}
                  {place.location?.address && (
                    <p className="address">{place.location.address}</p>
                  )}
                  {place.photos && place.photos.length > 0 && (
                    <img
                      src={place.photos[0].url}
                      alt={place.title}
                      className="popup-image"
                    />
                  )}
                  <div className="popup-actions">
                    <button
                      onClick={() => window.location.href = `/place/${place._id}`}
                      className="view-place-btn"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}

        {/* Show temporary marker for location selection */}
        {showLocationFinder && onLocationSelect && (
          <div className="location-finder-instructions">
            Click on the map to select a location
          </div>
        )}
      </MapContainer>

      {showLocationFinder && (
        <div className="map-instructions">
          <p>📍 Click anywhere on the map to select a location for your place</p>
        </div>
      )}
    </div>
  )
}

export default Map