import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { updatePlace } from '../../store/slices/placesSlice'
import PlaceForm from '../../components/PlaceForm/PlaceForm'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import { API_URL } from '../../config/api'
import './EditPlace.css'

const EditPlace = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isLoading, error } = useSelector((state) => state.places)
  const { user } = useSelector((state) => state.auth)

  const [place, setPlace] = useState(null)
  const [loadingPlace, setLoadingPlace] = useState(true)
  const [initialData, setInitialData] = useState(null)
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
      setInitialData({
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

  const handleSubmit = async ({ formData, imageFiles, existingPhotos: updatedExistingPhotos }) => {
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
    submitData.append('existingPhotos', JSON.stringify(updatedExistingPhotos))

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

  const handleCancel = () => {
    navigate(`/place/${id}`)
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
        <PlaceForm
          title="Edit Place"
          subtitle="Update the details of your place"
          initialData={initialData}
          existingPhotos={existingPhotos}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
          error={error}
          submitButtonText="Update Place"
          showFeaturedToggle={isAdmin}
        />
      </div>
    </div>
  )
}

export default EditPlace