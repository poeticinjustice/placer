import PropTypes from 'prop-types'
import './FormCheckbox.css'

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

FormCheckbox.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  helpText: PropTypes.string,
  className: PropTypes.string
}

export default FormCheckbox