import './FormTextarea.css'

/**
 * FormTextarea Component
 * Reusable textarea field with label, validation, and error display
 *
 * @param {string} label - Label text for the textarea
 * @param {string} name - Textarea name attribute
 * @param {string} value - Textarea value
 * @param {function} onChange - Change handler function
 * @param {string} placeholder - Placeholder text
 * @param {boolean} required - Whether field is required
 * @param {boolean} disabled - Whether field is disabled
 * @param {string} error - Error message to display
 * @param {string} helpText - Help text to display below textarea
 * @param {number} rows - Number of visible text rows
 * @param {number} minLength - Minimum length for validation
 * @param {number} maxLength - Maximum length for validation
 * @param {boolean} showCharCount - Show character count
 * @param {string} className - Additional CSS classes
 * @param {object} ...rest - Any other textarea attributes
 */
const FormTextarea = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  helpText,
  rows = 4,
  minLength,
  maxLength,
  showCharCount = false,
  className = '',
  ...rest
}) => {
  const textareaId = `form-textarea-${name}`
  const charCount = value ? value.length : 0

  return (
    <div className={`form-textarea ${className} ${error ? 'form-textarea--error' : ''}`}>
      {label && (
        <label htmlFor={textareaId} className="form-textarea__label">
          {label}
          {required && <span className="form-textarea__required">*</span>}
        </label>
      )}

      <textarea
        id={textareaId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        minLength={minLength}
        maxLength={maxLength}
        className="form-textarea__field"
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${textareaId}-error` : helpText ? `${textareaId}-help` : undefined}
        {...rest}
      />

      <div className="form-textarea__footer">
        <div className="form-textarea__messages">
          {error && (
            <span id={`${textareaId}-error`} className="form-textarea__error-text">
              {error}
            </span>
          )}

          {helpText && !error && (
            <span id={`${textareaId}-help`} className="form-textarea__help-text">
              {helpText}
            </span>
          )}
        </div>

        {showCharCount && maxLength && (
          <span className="form-textarea__char-count">
            {charCount}/{maxLength}
          </span>
        )}
      </div>
    </div>
  )
}

export default FormTextarea