import ResponsiveGrid from './ResponsiveGrid'
import PlaceCard from './PlaceCard'

const Gallery = ({
  places,
  isLoading = false,
  variant = 'minimal',
  showAuthor = false,
  showStats = false,
  showDescription = false,
  columns = { mobile: 2, tablet: 3, desktop: 4 },
  gap = 'lg',
  layout = 'grid',
  className = '',
  emptyMessage = 'No places found'
}) => {
  return (
    <ResponsiveGrid
      items={places}
      renderItem={(place) => (
        <PlaceCard
          place={place}
          variant={variant}
          showAuthor={showAuthor}
          showStats={showStats}
          showDescription={showDescription}
        />
      )}
      layout={layout}
      columns={columns}
      gap={gap}
      className={className}
      loading={isLoading}
      emptyState={
        <div className="empty-state">
          <p>{emptyMessage}</p>
        </div>
      }
    />
  )
}

export default Gallery