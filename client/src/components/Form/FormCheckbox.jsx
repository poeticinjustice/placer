import './FormCheckbox.css'

/**
 * FormCheckbox Component
 * Reusable checkbox field with label and error display
 *
 * @param {string} label - Label text for the checkbox
 * @param {string} name - Checkbox name attribute
 * @param {boolean} checked - Checkbox checked state
 * @param {function} onChange - Change handler function
 * @param {boolean} disabled - Whether checkbox is disabled
 * @param {string} error - Error message to display
 * @param {string} helpText - Help text to display
 * @param {string} className - Additional CSS classes
 * @param {object} ...rest - Any other input attributes
 */
const FormCheckbox = ({
  label,
  name,
  checked,
  onChange,
  disabled = false,
  error,
  helpText,
  className = '',
  ...rest
}) => {
  const checkboxId = `form-checkbox-${name}`

  return (
    <div className={`form-checkbox ${className} ${error ? 'form-checkbox--error' : ''}`}>
      <label htmlFor={checkboxId} className="form-checkbox__label">
        <input
          id={checkboxId}
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="form-checkbox__input"
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${checkboxId}-error` : helpText ? `${checkboxId}-help` : undefined}
          {...rest}
        />
        <span className="form-checkbox__text">{label}</span>
      </label>

      {error && (
        <span id={`${checkboxId}-error`} className="form-checkbox__error-text">
          {error}
        </span>
      )}

      {helpText && !error && (
        <span id={`${checkboxId}-help`} className="form-checkbox__help-text">
          {helpText}
        </span>
      )}
    </div>
  )
}

export default FormCheckbox