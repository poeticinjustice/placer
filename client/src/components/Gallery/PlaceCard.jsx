import { Link } from 'react-router-dom'
import { MapPinIcon, EyeIcon, HeartIcon } from '@heroicons/react/24/outline'
import './PlaceCard.css'

const PlaceCard = ({
  place,
  variant = 'default', // 'default', 'compact', 'minimal'
  showAuthor = true,
  showStats = true,
  showDescription = true,
  className = ''
}) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getAuthorName = () => {
    if (place.isAnonymous || !place.author) return 'Anonymous'
    return `${place.author.firstName} ${place.author.lastName || ''}`.trim()
  }

  const cardClasses = [
    'place-card',
    `place-card--${variant}`,
    className
  ].filter(Boolean).join(' ')

  return (
    <Link
      to={`/place/${place._id}`}
      className={cardClasses}
      data-testid="place-card"
    >
      {/* Image */}
      <div className="place-card__image">
        {place.photos && place.photos.length > 0 ? (
          <>
            <img
              src={place.photos[0].url}
              alt={place.title || place.name}
              loading="lazy"
              className="place-image"
            />
            {place.photos.length > 1 && (
              <div className="place-card__image-count">
                +{place.photos.length - 1}
              </div>
            )}
          </>
        ) : (
          <div className="place-card__image-placeholder">
            <MapPinIcon className="placeholder-icon" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="place-card__content">
        {variant === 'minimal' ? (
          /* Minimal variant: only show title */
          <div className="place-card__header">
            <h3 className="place-card__title">
              {place.title || place.name}
            </h3>
          </div>
        ) : (
          <>
            <div className="place-card__header">
              <h3 className="place-card__title">
                {place.title || place.name}
              </h3>

              {place.location?.address && (
                <p className="place-card__location">
                  <MapPinIcon className="location-icon" />
                  {place.location.address}
                </p>
              )}
            </div>

            {showDescription && place.description && (
              <p className="place-card__description">
                {place.description}
              </p>
            )}

            {/* Footer */}
            <div className="place-card__footer">
              {showAuthor && (
                <div className="place-card__author">
                  {place.author?.avatar ? (
                    <img
                      src={place.author.avatar}
                      alt={getAuthorName()}
                      className="author-avatar"
                    />
                  ) : (
                    <div className="author-avatar author-avatar--placeholder">
                      {getAuthorName().charAt(0)}
                    </div>
                  )}
                  <span className="author-name">{getAuthorName()}</span>
                </div>
              )}

              {showStats && (
                <div className="place-card__stats">
                  {place.views !== undefined && (
                    <span className="stat">
                      <EyeIcon className="stat-icon" />
                      {place.views}
                    </span>
                  )}
                  {place.likesCount !== undefined && (
                    <span className="stat">
                      <HeartIcon className="stat-icon" />
                      {place.likesCount}
                    </span>
                  )}
                  <span className="place-card__date">
                    {formatDate(place.createdAt)}
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Link>
  )
}

export default PlaceCard