import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { updatePlace } from '../../store/slices/placesSlice'
import LocationPicker from '../../components/Map/LocationPicker'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import '../CreatePlace/CreatePlace.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const EditPlace = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isLoading, error } = useSelector((state) => state.places)
  const { user, token } = useSelector((state) => state.auth)

  const [place, setPlace] = useState(null)
  const [loadingPlace, setLoadingPlace] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: null,
    tags: '',
    isFeatured: false
  })

  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [existingPhotos, setExistingPhotos] = useState([])

  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    fetchPlace()
  }, [id])

  const fetchPlace = async () => {
    try {
      setLoadingPlace(true)
      const response = await axios.get(`${API_URL}/api/places/${id}`)
      const fetchedPlace = response.data.place

      // Check if user is authorized to edit
      if (fetchedPlace.author._id !== user._id && !isAdmin) {
        alert('You are not authorized to edit this place')
        navigate(`/place/${id}`)
        return
      }

      setPlace(fetchedPlace)
      setFormData({
        title: fetchedPlace.name,
        description: fetchedPlace.description,
        location: {
          address: fetchedPlace.location.address,
          coordinates: fetchedPlace.location.coordinates
        },
        tags: fetchedPlace.tags ? fetchedPlace.tags.join(', ') : '',
        isFeatured: fetchedPlace.isFeatured || false
      })
      setExistingPhotos(fetchedPlace.photos || [])
    } catch (err) {
      console.error('Error fetching place:', err)
      alert('Failed to load place')
      navigate('/dashboard')
    } finally {
      setLoadingPlace(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleLocationChange = (location) => {
    setFormData(prev => ({
      ...prev,
      location
    }))
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    setImageFiles(files)

    // Create previews
    const previews = files.map(file => {
      const reader = new FileReader()
      return new Promise((resolve) => {
        reader.onload = (e) => resolve(e.target.result)
        reader.readAsDataURL(file)
      })
    })

    Promise.all(previews).then(setImagePreviews)
  }

  const removeImage = (index) => {
    const newFiles = imageFiles.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    setImageFiles(newFiles)
    setImagePreviews(newPreviews)
  }

  const removeExistingPhoto = (index) => {
    setExistingPhotos(existingPhotos.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      alert('Please enter a title for your place')
      return
    }

    if (!formData.description.trim()) {
      alert('Please enter a description for your place')
      return
    }

    if (!formData.location) {
      alert('Please select a location on the map')
      return
    }

    // Create FormData for file upload
    const submitData = new FormData()
    submitData.append('name', formData.title)
    submitData.append('description', formData.description)

    // Only append tags if not empty
    if (formData.tags && formData.tags.trim()) {
      submitData.append('tags', formData.tags)
    }

    // Add location data
    submitData.append('location[address]', formData.location.address)
    submitData.append('location[coordinates][type]', 'Point')
    submitData.append('location[coordinates][coordinates]', JSON.stringify(formData.location.coordinates))

    // Add existing photos as JSON
    submitData.append('existingPhotos', JSON.stringify(existingPhotos))

    // Add new images
    imageFiles.forEach((file) => {
      submitData.append('photos', file)
    })

    // Only admins can set isFeatured
    if (isAdmin) {
      submitData.append('isFeatured', formData.isFeatured)
    }

    try {
      const result = await dispatch(updatePlace({ placeId: id, placeData: submitData })).unwrap()
      navigate(`/place/${result.place._id}`)
    } catch (error) {
      console.error('Error updating place:', error)
    }
  }

  if (loadingPlace) {
    return <LoadingSpinner />
  }

  if (!place) {
    return (
      <div className="create-place">
        <div className="container">
          <div className="not-approved">
            <h1>Place Not Found</h1>
            <p>The place you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="create-place">
      <div className="container">
        <div className="create-place-header">
          <h1>Edit Place</h1>
          <p>Update the details of your place</p>
        </div>

        <form onSubmit={handleSubmit} className="create-place-form">
          {/* Basic Information */}
          <div className="form-section">
            <h2>Basic Information</h2>

            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter a descriptive title for this place"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe what makes this place special..."
                rows="4"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="tags">Tags</label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="outdoor, family-friendly, scenic (comma separated)"
              />
            </div>

            {isAdmin && (
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                  />
                  <span>Feature this place on the home page</span>
                </label>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="form-section">
            <h2>Location *</h2>
            <LocationPicker
              selectedLocation={formData.location}
              onLocationChange={handleLocationChange}
              height="350px"
            />
          </div>

          {/* Images */}
          <div className="form-section">
            <h2>Images</h2>

            {existingPhotos.length > 0 && (
              <div className="existing-images">
                <h3>Current Images</h3>
                <div className="image-previews">
                  {existingPhotos.map((photo, index) => (
                    <div key={index} className="image-preview">
                      <img src={photo.url} alt={`Existing ${index + 1}`} />
                      <button
                        type="button"
                        onClick={() => removeExistingPhoto(index)}
                        className="remove-image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="images">Add New Images</label>
              <input
                type="file"
                id="images"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="file-input"
              />
              <p className="help-text">Upload up to 5 images (max 5MB each)</p>
            </div>

            {imagePreviews.length > 0 && (
              <div className="new-images">
                <h3>New Images</h3>
                <div className="image-previews">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="image-preview">
                      <img src={preview} alt={`Preview ${index + 1}`} />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="remove-image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Error display */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(`/place/${id}`)}
              className="cancel-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.title.trim() || !formData.location}
              className="submit-button"
            >
              {isLoading ? <LoadingSpinner size="small" /> : 'Update Place'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditPlace