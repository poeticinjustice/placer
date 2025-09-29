/**
 * Geolocation service for getting user location and reverse geocoding
 */

export class GeolocationService {
  constructor() {
    this.defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes
    }
  }

  /**
   * Check if geolocation is supported
   */
  isSupported() {
    return 'geolocation' in navigator
  }

  /**
   * Get current position using browser API
   */
  getCurrentPosition(options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.isSupported()) {
        reject(new Error('Geolocation is not supported by this browser'))
        return
      }

      const combinedOptions = { ...this.defaultOptions, ...options }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          })
        },
        (error) => {
          let errorMessage = 'Unable to retrieve location'

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable'
              break
            case error.TIMEOUT:
              errorMessage = 'Location request timed out'
              break
          }

          reject(new Error(errorMessage))
        },
        combinedOptions
      )
    })
  }

  /**
   * Watch position changes
   */
  watchPosition(callback, errorCallback, options = {}) {
    if (!this.isSupported()) {
      errorCallback(new Error('Geolocation is not supported by this browser'))
      return null
    }

    const combinedOptions = { ...this.defaultOptions, ...options }

    return navigator.geolocation.watchPosition(
      (position) => {
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        })
      },
      errorCallback,
      combinedOptions
    )
  }

  /**
   * Clear position watch
   */
  clearWatch(watchId) {
    if (watchId && this.isSupported()) {
      navigator.geolocation.clearWatch(watchId)
    }
  }

  /**
   * Reverse geocode coordinates to address using Nominatim (OpenStreetMap)
   */
  async reverseGeocode(latitude, longitude) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Placer App'
          }
        }
      )

      if (!response.ok) {
        throw new Error('Reverse geocoding failed')
      }

      const data = await response.json()

      if (!data || data.error) {
        throw new Error(data?.error || 'No address found')
      }

      return {
        displayName: data.display_name,
        address: {
          house_number: data.address?.house_number,
          road: data.address?.road,
          neighbourhood: data.address?.neighbourhood,
          suburb: data.address?.suburb,
          city: data.address?.city || data.address?.town || data.address?.village,
          county: data.address?.county,
          state: data.address?.state,
          postcode: data.address?.postcode,
          country: data.address?.country,
          countryCode: data.address?.country_code
        },
        coordinates: {
          latitude: parseFloat(data.lat),
          longitude: parseFloat(data.lon)
        }
      }
    } catch (error) {
      throw new Error(`Reverse geocoding failed: ${error.message}`)
    }
  }

  /**
   * Forward geocode address to coordinates using Nominatim
   */
  async forwardGeocode(address) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=5&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Placer App'
          }
        }
      )

      if (!response.ok) {
        throw new Error('Forward geocoding failed')
      }

      const data = await response.json()

      if (!data || data.length === 0) {
        throw new Error('No location found for the given address')
      }

      return data.map(result => ({
        displayName: result.display_name,
        address: {
          house_number: result.address?.house_number,
          road: result.address?.road,
          neighbourhood: result.address?.neighbourhood,
          suburb: result.address?.suburb,
          city: result.address?.city || result.address?.town || result.address?.village,
          county: result.address?.county,
          state: result.address?.state,
          postcode: result.address?.postcode,
          country: result.address?.country,
          countryCode: result.address?.country_code
        },
        coordinates: {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon)
        },
        importance: result.importance,
        type: result.type,
        class: result.class
      }))
    } catch (error) {
      throw new Error(`Forward geocoding failed: ${error.message}`)
    }
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371 // Earth's radius in kilometers
    const dLat = this.toRad(lat2 - lat1)
    const dLon = this.toRad(lon2 - lon1)
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c // Distance in kilometers
  }

  /**
   * Convert degrees to radians
   */
  toRad(degrees) {
    return degrees * (Math.PI/180)
  }
}

// Export singleton instance
export const geolocationService = new GeolocationService()