import './FormFileInput.css'

/**
 * FormFileInput Component
 * Reusable file input field with label, preview support, and error display
 *
 * @param {string} label - Label text for the file input
 * @param {string} name - Input name attribute
 * @param {function} onChange - Change handler function
 * @param {boolean} multiple - Whether to allow multiple file selection
 * @param {string} accept - Accepted file types (e.g., "image/*")
 * @param {boolean} required - Whether field is required
 * @param {boolean} disabled - Whether field is disabled
 * @param {string} error - Error message to display
 * @param {string} helpText - Help text to display
 * @param {string} buttonText - Text for the upload button
 * @param {string} className - Additional CSS classes
 * @param {object} ...rest - Any other input attributes
 */
const FormFileInput = ({
  label,
  name,
  onChange,
  multiple = false,
  accept,
  required = false,
  disabled = false,
  error,
  helpText,
  buttonText = 'Choose Files',
  className = '',
  ...rest
}) => {
  const inputId = `form-file-${name}`

  return (
    <div className={`form-file ${className} ${error ? 'form-file--error' : ''}`}>
      {label && (
        <label htmlFor={inputId} className="form-file__label">
          {label}
          {required && <span className="form-file__required">*</span>}
        </label>
      )}

      <label htmlFor={inputId} className="form-file__button">
        <span className="form-file__button-text">{buttonText}</span>
        <input
          id={inputId}
          type="file"
          name={name}
          onChange={onChange}
          multiple={multiple}
          accept={accept}
          required={required}
          disabled={disabled}
          className="form-file__input"
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined}
          {...rest}
        />
      </label>

      {error && (
        <span id={`${inputId}-error`} className="form-file__error-text">
          {error}
        </span>
      )}

      {helpText && !error && (
        <span id={`${inputId}-help`} className="form-file__help-text">
          {helpText}
        </span>
      )}
    </div>
  )
}

export default FormFileInput