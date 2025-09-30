import { ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import './ErrorMessage.css'

/**
 * ErrorMessage Component
 * Displays error messages with consistent styling
 *
 * @param {string} message - The error message to display
 * @param {string} variant - 'error' (red) or 'warning' (yellow)
 * @param {function} onDismiss - Optional callback when dismiss button is clicked
 * @param {string} className - Additional CSS classes
 */
const ErrorMessage = ({
  message,
  variant = 'error',
  onDismiss,
  className = ''
}) => {
  if (!message) return null

  const Icon = variant === 'warning' ? ExclamationTriangleIcon : XCircleIcon

  return (
    <div className={`error-message error-message--${variant} ${className}`}>
      <div className="error-message__content">
        <Icon className="error-message__icon" />
        <span className="error-message__text">{message}</span>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="error-message__dismiss"
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  )
}

export default ErrorMessage