import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchPlaces } from '../../store/slices/placesSlice'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import ResponsiveGrid from '../../components/Gallery/ResponsiveGrid'
import PlaceCard from '../../components/Gallery/PlaceCard'
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
          <ResponsiveGrid
            items={places}
            renderItem={(place) => (
              <PlaceCard
                place={place}
                variant="default"
                showAuthor={true}
                showStats={true}
                showDescription={false}
              />
            )}
            layout="grid"
            columns={{ mobile: 2, tablet: 3, desktop: 4 }}
            gap="lg"
            className="featured-places-grid"
            loading={isLoading}
            emptyState={
              <div className="empty-state">
                <p>No places found. Be the first to share a place!</p>
                {isAuthenticated && (
                  <Link to="/create" className="btn btn-primary">
                    Add Your First Place
                  </Link>
                )}
              </div>
            }
          />
        </div>
      </section>
    </div>
  )
}

export default Home