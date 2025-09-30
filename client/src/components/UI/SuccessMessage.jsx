import { CheckCircleIcon } from '@heroicons/react/24/outline'
import './SuccessMessage.css'

/**
 * SuccessMessage Component
 * Displays success messages with consistent styling
 *
 * @param {string} message - The success message to display
 * @param {function} onDismiss - Optional callback when dismiss button is clicked
 * @param {string} className - Additional CSS classes
 */
const SuccessMessage = ({
  message,
  onDismiss,
  className = ''
}) => {
  if (!message) return null

  return (
    <div className={`success-message ${className}`}>
      <div className="success-message__content">
        <CheckCircleIcon className="success-message__icon" />
        <span className="success-message__text">{message}</span>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="success-message__dismiss"
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  )
}

export default SuccessMessage