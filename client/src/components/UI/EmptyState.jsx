import './EmptyState.css'

/**
 * EmptyState Component
 * Displays an empty state message with icon and optional action button
 *
 * @param {React.Component} icon - Hero icon component to display
 * @param {string} title - Main title text
 * @param {string} description - Description text
 * @param {React.ReactNode} action - Optional action button or link
 * @param {string} className - Additional CSS classes
 */
const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <div className={`empty-state ${className}`}>
      {Icon && <Icon className="empty-state__icon" />}
      {title && <h3 className="empty-state__title">{title}</h3>}
      {description && <p className="empty-state__description">{description}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  )
}

export default EmptyState