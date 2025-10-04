import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { createPlace } from '../../store/slices/placesSlice'
import PlaceForm from '../../components/PlaceForm/PlaceForm'
import usePageTitle from '../../hooks/usePageTitle'
import './CreatePlace.css'

const CreatePlace = () => {
  usePageTitle('Create Place')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isLoading, error } = useSelector((state) => state.places)
  const { user } = useSelector((state) => state.auth)

  const handleSubmit = async ({ formData, imageFiles }) => {
    // Create FormData for file upload
    const submitData = new FormData()
    submitData.append('name', formData.title) // Server expects 'name'

    // Only append description if provided
    if (formData.description && formData.description.trim()) {
      submitData.append('description', formData.description)
    }

    // Always send tags, even if empty
    submitData.append('tags', formData.tags || '')

    // Add anonymous flag
    submitData.append('isAnonymous', formData.isAnonymous)

    // Add featured flag if user is admin
    if (user?.role === 'admin') {
      submitData.append('isFeatured', formData.isFeatured)
    }

    // Add location data only if location is selected
    if (formData.location && formData.location.coordinates) {
      submitData.append('location[address]', formData.location.address || '')
      submitData.append('location[coordinates][type]', 'Point')
      submitData.append('location[coordinates][coordinates]', JSON.stringify(formData.location.coordinates))
    }

    // Add images (server expects this as files, not 'photos')
    imageFiles.forEach((file) => {
      submitData.append('photos', file) // Server expects 'photos'
    })

    try {
      const result = await dispatch(createPlace(submitData)).unwrap()
      navigate(`/place/${result.place._id}`)
    } catch (error) {
    }
  }

  const handleCancel = () => {
    navigate(-1)
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
        <PlaceForm
          title="Add New Place"
          subtitle="Share a special place with the community"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
          error={error}
          submitButtonText="Create Place"
          showFeaturedToggle={user?.role === 'admin'}
        />
      </div>
    </div>
  )
}

export default CreatePlace