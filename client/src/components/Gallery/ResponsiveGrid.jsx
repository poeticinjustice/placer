import { useState, useEffect } from 'react'
import './ResponsiveGrid.css'

/**
 * Responsive grid component with multiple layout options
 * Supports: grid, masonry, list views with proper responsive breakpoints
 */
const ResponsiveGrid = ({
  items = [],
  renderItem,
  layout = 'grid', // 'grid', 'masonry', 'list'
  columns = { mobile: 2, tablet: 3, desktop: 4 },
  gap = 'md', // 'sm', 'md', 'lg'
  className = '',
  itemClassName = '',
  emptyState = null,
  loading = false
}) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return <div className="responsive-grid-loading">Loading...</div>
  }

  const gridClasses = [
    'responsive-grid',
    `responsive-grid--${layout}`,
    `responsive-grid--gap-${gap}`,
    `responsive-grid--cols-${columns.mobile}-${columns.tablet}-${columns.desktop}`,
    className
  ].filter(Boolean).join(' ')

  if (loading) {
    return (
      <div className={gridClasses}>
        {/* Skeleton loading items */}
        {Array.from({ length: columns.mobile * 2 }).map((_, index) => (
          <div key={index} className="responsive-grid__skeleton">
            <div className="skeleton-image"></div>
            <div className="skeleton-content">
              <div className="skeleton-title"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-text"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return emptyState || <div className="responsive-grid-empty">No items to display</div>
  }

  return (
    <div className={gridClasses} data-layout={layout}>
      {items.map((item, index) => (
        <div
          key={item.id || item._id || index}
          className={`responsive-grid__item ${itemClassName}`}
          data-index={index}
        >
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  )
}

export default ResponsiveGrid