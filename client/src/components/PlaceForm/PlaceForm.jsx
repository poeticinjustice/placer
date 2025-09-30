import { useState, useEffect } from 'react'
import LocationPicker from '../Map/LocationPicker'
import LoadingSpinner from '../UI/LoadingSpinner'
import { FormInput, FormTextarea, FormCheckbox, FormFileInput } from '../Form'
import './PlaceForm.css'

const PlaceForm = ({
  initialData = null,
  existingPhotos = [],
  onSubmit,
  onCancel,
  isLoading = false,
  error = null,
  submitButtonText = 'Submit',
  title = 'Place Form',
  subtitle = '',
  showFeaturedToggle = false
}) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    location: initialData?.location || null,
    tags: initialData?.tags || '',
    isFeatured: initialData?.isFeatured || false
  })

  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [currentExistingPhotos, setCurrentExistingPhotos] = useState([])

  // Update form data and existing photos when props change (for edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        location: initialData.location || null,
        tags: initialData.tags || '',
        isFeatured: initialData.isFeatured || false
      })
    }
    // Only update existing photos if they're actually provided (not empty array)
    if (existingPhotos && existingPhotos.length > 0) {
      setCurrentExistingPhotos(existingPhotos)
    }
  }, [initialData, existingPhotos.length])

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
    setCurrentExistingPhotos(currentExistingPhotos.filter((_, i) => i !== index))
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

    // Pass data to parent component for submission
    onSubmit({
      formData,
      imageFiles,
      existingPhotos: currentExistingPhotos
    })
  }

  return (
    <div className="place-form-wrapper">
      <div className="place-form-header">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>

      <form onSubmit={handleSubmit} className="place-form">
        {/* Basic Information */}
        <div className="form-section">
          <h2>Basic Information</h2>

          <FormInput
            label="Title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter a descriptive title for this place"
            required
          />

          <FormTextarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe what makes this place special..."
            rows={4}
            required
          />

          <FormInput
            label="Tags"
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            placeholder="outdoor, family-friendly, scenic (comma separated)"
            helpText="Separate tags with commas"
          />

          {showFeaturedToggle && (
            <FormCheckbox
              label="Feature this place on the home page"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleInputChange}
            />
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

          {currentExistingPhotos.length > 0 && (
            <div className="existing-images">
              <h3>Current Images</h3>
              <div className="image-previews">
                {currentExistingPhotos.map((photo, index) => (
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

          <FormFileInput
            label={currentExistingPhotos.length > 0 ? 'Add New Images' : 'Upload Images'}
            name="images"
            onChange={handleImageChange}
            accept="image/*"
            multiple
            helpText="Upload up to 5 images (max 5MB each)"
          />

          {imagePreviews.length > 0 && (
            <div className="new-images">
              {currentExistingPhotos.length > 0 && <h3>New Images</h3>}
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
            onClick={onCancel}
            className="cancel-button"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !formData.title.trim() || !formData.location}
            className="submit-button"
          >
            {isLoading ? <LoadingSpinner size="small" /> : submitButtonText}
          </button>
        </div>
      </form>
    </div>
  )
}

export default PlaceForm