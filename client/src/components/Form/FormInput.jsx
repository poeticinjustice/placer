import './FormInput.css'

/**
 * FormInput Component
 * Reusable input field with label, validation, and error display
 *
 * @param {string} label - Label text for the input
 * @param {string} type - Input type (text, email, password, number, etc.)
 * @param {string} name - Input name attribute
 * @param {string} value - Input value
 * @param {function} onChange - Change handler function
 * @param {string} placeholder - Placeholder text
 * @param {boolean} required - Whether field is required
 * @param {boolean} disabled - Whether field is disabled
 * @param {string} error - Error message to display
 * @param {string} helpText - Help text to display below input
 * @param {number} minLength - Minimum length for validation
 * @param {number} maxLength - Maximum length for validation
 * @param {string} className - Additional CSS classes
 * @param {object} ...rest - Any other input attributes
 */
const FormInput = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  helpText,
  minLength,
  maxLength,
  className = '',
  ...rest
}) => {
  const inputId = `form-input-${name}`

  return (
    <div className={`form-input ${className} ${error ? 'form-input--error' : ''}`}>
      {label && (
        <label htmlFor={inputId} className="form-input__label">
          {label}
          {required && <span className="form-input__required">*</span>}
        </label>
      )}

      <input
        id={inputId}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        minLength={minLength}
        maxLength={maxLength}
        className="form-input__field"
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined}
        {...rest}
      />

      {error && (
        <span id={`${inputId}-error`} className="form-input__error-text">
          {error}
        </span>
      )}

      {helpText && !error && (
        <span id={`${inputId}-help`} className="form-input__help-text">
          {helpText}
        </span>
      )}
    </div>
  )
}

export default FormInput