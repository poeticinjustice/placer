import PropTypes from 'prop-types'
import './FormTextarea.css'

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

FormTextarea.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  helpText: PropTypes.string,
  rows: PropTypes.number,
  minLength: PropTypes.number,
  maxLength: PropTypes.number,
  showCharCount: PropTypes.bool,
  className: PropTypes.string
}

export default FormTextarea