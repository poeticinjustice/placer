import { useEffect } from 'react'
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import './ImageLightbox.css'

const ImageLightbox = ({ images, currentIndex, onClose, onNavigate }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate(currentIndex - 1)
      if (e.key === 'ArrowRight' && currentIndex < images.length - 1) onNavigate(currentIndex + 1)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [currentIndex, images.length, onClose, onNavigate])

  if (!images || images.length === 0) return null

  const currentImage = images[currentIndex]

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose} aria-label="Close">
        <XMarkIcon />
      </button>

      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <img
          src={currentImage.url}
          alt={currentImage.alt || `Image ${currentIndex + 1}`}
          className="lightbox-image"
        />

        {images.length > 1 && (
          <>
            {currentIndex > 0 && (
              <button
                className="lightbox-nav lightbox-nav-prev"
                onClick={() => onNavigate(currentIndex - 1)}
                aria-label="Previous image"
              >
                <ChevronLeftIcon />
              </button>
            )}

            {currentIndex < images.length - 1 && (
              <button
                className="lightbox-nav lightbox-nav-next"
                onClick={() => onNavigate(currentIndex + 1)}
                aria-label="Next image"
              >
                <ChevronRightIcon />
              </button>
            )}

            <div className="lightbox-counter">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ImageLightbox
