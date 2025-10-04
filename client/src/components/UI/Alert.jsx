import PropTypes from 'prop-types'
import { ExclamationTriangleIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import './Alert.css'

const Alert = ({ type = 'error', message, onDismiss }) => {
  if (!message) return null

  const icons = {
    error: ExclamationTriangleIcon,
    success: CheckCircleIcon,
    info: InformationCircleIcon
  }

  const Icon = icons[type]

  return (
    <div className={`alert alert-${type}`} role="alert">
      <div className="alert-content">
        <Icon className="alert-icon" />
        <span className="alert-message">{message}</span>
      </div>
      {onDismiss && (
        <button
          type="button"
          className="alert-dismiss"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  )
}

Alert.propTypes = {
  type: PropTypes.oneOf(['error', 'success', 'info']),
  message: PropTypes.string,
  onDismiss: PropTypes.func
}

export default Alert
