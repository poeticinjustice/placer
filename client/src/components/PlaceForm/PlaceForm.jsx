import { useState, useEffect, useRef } from 'react'
import LocationPicker from '../Map/LocationPicker'
import LoadingSpinner from '../UI/LoadingSpinner'
import { FormInput, FormCheckbox, FormFileInput } from '../Form'
import TiptapEditor from '../Editor/TiptapEditor'
import TagAutocomplete from '../Form/TagAutocomplete'
import { useToast } from '../UI/ToastContainer'
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
  showFeaturedToggle = false,
  showAnonymousOption = true
}) => {
  const toast = useToast()
  const [formData, setFormData] = useState(() => ({
    title: initialData?.title || '',
    description: initialData?.description || '',
    location: initialData?.location || null,
    tags: initialData?.tags || '',
    isAnonymous: initialData?.isAnonymous || false,
    isFeatured: initialData?.isFeatured || false
  }))

  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [currentExistingPhotos, setCurrentExistingPhotos] = useState(existingPhotos || [])

  // Track if user has made any changes to prevent resetting during edits
  const hasUserEdited = useRef(false)
  const previousInitialData = useRef(initialData)
  const previousPhotosLength = useRef(existingPhotos.length)

  // Only sync with initialData when it actually changes (not during user edits)
  useEffect(() => {
    const initialDataChanged = previousInitialData.current !== initialData

    if (initialDataChanged && !hasUserEdited.current) {
      setFormData({
        title: initialData?.title || '',
        description: initialData?.description || '',
        location: initialData?.location || null,
        tags: initialData?.tags || '',
        isAnonymous: initialData?.isAnonymous || false,
        isFeatured: initialData?.isFeatured || false
      })
      previousInitialData.current = initialData
    }
  }, [initialData])

  // Sync existingPhotos only when the length changes (avoid infinite loop from array reference changes)
  useEffect(() => {
    const photosLength = existingPhotos?.length || 0
    if (photosLength !== previousPhotosLength.current) {
      setCurrentExistingPhotos(existingPhotos || [])
      previousPhotosLength.current = photosLength
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingPhotos?.length])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    hasUserEdited.current = true
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleLocationChange = (location) => {
    hasUserEdited.current = true
    setFormData(prev => ({
      ...prev,
      location
    }))
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)

    // Validate files
    const maxSize = 5 * 1024 * 1024 // 5MB
    const validFiles = []

    for (const file of files) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`)
        continue
      }

      // Check file size
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large (max 5MB)`)
        continue
      }

      validFiles.push(file)
    }

    if (validFiles.length === 0) {
      e.target.value = ''
      return
    }

    setImageFiles(validFiles)

    // Create previews
    const previews = validFiles.map(file => {
      const reader = new FileReader()
      return new Promise((resolve, reject) => {
        reader.onload = (e) => resolve(e.target.result)
        reader.onerror = () => reject(new Error(`Failed to read ${file.name}`))
        reader.readAsDataURL(file)
      })
    })

    Promise.all(previews)
      .then(setImagePreviews)
      .catch(() => {
        // Error reading one or more image files for preview
        toast.error('Failed to load image previews')
      })
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
      toast.error('Please enter a title for your place')
      return
    }

    // Description, location, and photos are now optional

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

          <div className="form-group">
            <label>Description</label>
            <TiptapEditor
              content={formData.description}
              onChange={(html) => setFormData(prev => ({ ...prev, description: html }))}
              placeholder="Describe what makes this place special..."
            />
          </div>

          <TagAutocomplete
            value={formData.tags}
            onChange={(value) => setFormData(prev => ({ ...prev, tags: value }))}
            placeholder="Search or type tags (comma or Enter to add)"
            helpText="Select from existing tags or type your own. Press comma or Enter to add custom tags."
          />

          {showAnonymousOption && (
            <FormCheckbox
              label="Post anonymously"
              name="isAnonymous"
              checked={formData.isAnonymous}
              onChange={handleInputChange}
              helpText="Your name will not be displayed with this place"
            />
          )}

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
          <h2>Location</h2>
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
            disabled={isLoading || !formData.title.trim()}
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
