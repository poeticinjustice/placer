import PropTypes from 'prop-types'
import './FormInput.css'

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
  autoComplete,
  ...rest
}) => {
  const inputId = `form-input-${name}`

  // Auto-determine autocomplete if not provided
  const getAutoComplete = () => {
    if (autoComplete !== undefined) return autoComplete

    // Map common field names to autocomplete values
    const autocompleteMap = {
      email: 'email',
      password: 'current-password',
      newPassword: 'new-password',
      currentPassword: 'current-password',
      confirmPassword: 'new-password',
      firstName: 'given-name',
      lastName: 'family-name',
      name: 'name',
      phone: 'tel',
      address: 'street-address',
      city: 'address-level2',
      state: 'address-level1',
      zip: 'postal-code',
      country: 'country-name'
    }

    return autocompleteMap[name] || 'off'
  }

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
        autoComplete={getAutoComplete()}
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

FormInput.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  helpText: PropTypes.string,
  minLength: PropTypes.number,
  maxLength: PropTypes.number,
  className: PropTypes.string,
  autoComplete: PropTypes.string
}

export default FormInput