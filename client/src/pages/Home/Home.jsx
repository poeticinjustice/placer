import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useSearchParams } from 'react-router-dom'
import { fetchPlaces } from '../../store/slices/placesSlice'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import Gallery from '../../components/Gallery/Gallery'
import Pagination from '../../components/UI/Pagination'
import './Home.css'

const Home = () => {
  const dispatch = useDispatch()
  const { places, isLoading, totalPages } = useSelector((state) => state.places)
  const { isAuthenticated } = useSelector((state) => state.auth)
  const [searchParams, setSearchParams] = useSearchParams()
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1)

  useEffect(() => {
    const page = parseInt(searchParams.get('page')) || 1
    setCurrentPage(page)
    dispatch(fetchPlaces({ limit: 12, featured: 'true', page }))
  }, [dispatch, searchParams])

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
          <Gallery
            places={places}
            isLoading={isLoading}
            variant="minimal"
            className="featured-places-grid"
            emptyMessage="No featured places yet. Check back soon!"
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setSearchParams({ page })}
          />
        </div>
      </section>
    </div>
  )
}

export default Home