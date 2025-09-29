import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchPlaces } from '../../store/slices/placesSlice'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import './Home.css'

const Home = () => {
  const dispatch = useDispatch()
  const { places, isLoading } = useSelector((state) => state.places)
  const { isAuthenticated } = useSelector((state) => state.auth)

  useEffect(() => {
    dispatch(fetchPlaces({ limit: 6 }))
  }, [dispatch])

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Discover Amazing Places</h1>
          <p>Share and explore unique locations around the world</p>
          {!isAuthenticated && (
            <Link to="/auth" className="btn btn-primary btn-large">
              Get Started
            </Link>
          )}
        </div>
      </section>

      <section className="featured-places">
        <div className="container">
          <h2>Featured Places</h2>
          {places.length > 0 ? (
            <div className="places-grid">
              {places.map((place) => (
                <Link
                  key={place._id}
                  to={`/place/${place._id}`}
                  className="place-card"
                >
                  {place.photos[0] && (
                    <img
                      src={place.photos[0].url}
                      alt={place.name}
                      className="place-image"
                    />
                  )}
                  <div className="place-content">
                    <h3>{place.name}</h3>
                    <p>{place.location.address}</p>
                    <div className="place-meta">
                      <span className="author">
                        {place.isAnonymous ? 'Anonymous' :
                         `${place.author.firstName} ${place.author.lastName || ''}`}
                      </span>
                      <span className="views">{place.views} views</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No places found. Be the first to share a place!</p>
              {isAuthenticated && (
                <Link to="/create" className="btn btn-primary">
                  Add Your First Place
                </Link>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Home