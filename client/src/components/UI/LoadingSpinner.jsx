const LoadingSpinner = ({ size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  }

  return (
    <div className={`d-flex justify-center align-center p-lg ${className}`}>
      <div className={`spinner ${sizeClasses[size]}`}></div>
    </div>
  )
}

export default LoadingSpinner