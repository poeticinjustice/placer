import PropTypes from 'prop-types'
import Skeleton from './Skeleton'
import './PlaceCardSkeleton.css'

const PlaceCardSkeleton = ({ variant = 'default' }) => {
  return (
    <div className={`place-card-skeleton place-card-skeleton--${variant}`}>
      <Skeleton height="200px" borderRadius="8px 8px 0 0" />
      <div className="place-card-skeleton__content">
        <Skeleton height="24px" width="80%" />
        <Skeleton height="16px" width="60%" />
        <Skeleton height="16px" width="40%" />
      </div>
    </div>
  )
}

PlaceCardSkeleton.propTypes = {
  variant: PropTypes.oneOf(['default', 'compact', 'minimal'])
}

export default PlaceCardSkeleton
