import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { createPlace } from '../../store/slices/placesSlice'
import LocationPicker from '../../components/Map/LocationPicker'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import './CreatePlace.css'

const CreatePlace = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isLoading, error } = useSelector((state) => state.places)
  const { user } = useSelector((state) => state.auth)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: null,
    category: '',
    tags: '',
    images: []
  })

  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])

  const categories = [
    'Restaurant',
    'Cafe',
    'Park',
    'Museum',
    'Shopping',
    'Entertainment',
    'Historic Site',
    'Nature',
    'Beach',
    'Mountain',
    'Other'
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
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

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      alert('Please enter a title for your place')
      return
    }

    if (!formData.location) {
      alert('Please select a location on the map')
      return
    }

    // Create FormData for file upload
    const submitData = new FormData()
    submitData.append('title', formData.title)
    submitData.append('description', formData.description)
    submitData.append('category', formData.category)
    submitData.append('tags', formData.tags)

    // Add location data
    submitData.append('location', JSON.stringify({
      type: 'Point',
      coordinates: formData.location.coordinates,
      address: formData.location.address
    }))

    // Add images
    imageFiles.forEach((file) => {
      submitData.append('images', file)
    })

    try {
      const result = await dispatch(createPlace(submitData)).unwrap()
      navigate(`/places/${result.place._id}`)
    } catch (error) {
      console.error('Error creating place:', error)
    }
  }

  if (!user?.isApproved) {
    return (
      <div className="create-place">
        <div className="container">
          <div className="not-approved">
            <h1>Account Pending Approval</h1>
            <p>Your account is pending admin approval. You cannot create places yet.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="create-place">
      <div className="container">
        <div className="create-place-header">
          <h1>Add New Place</h1>
          <p>Share a special place with the community</p>
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
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe what makes this place special..."
                rows="4"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
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
            </div>
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
            <div className="form-group">
              <label htmlFor="images">Upload Images</label>
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
              onClick={() => navigate(-1)}
              className="cancel-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.title.trim() || !formData.location}
              className="submit-button"
            >
              {isLoading ? <LoadingSpinner size="small" /> : 'Create Place'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreatePlace