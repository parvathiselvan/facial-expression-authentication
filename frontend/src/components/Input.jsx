import React, { forwardRef } from 'react';

/**
 * Input component for consistent form styling
 * 
 * @param {Object} props - Component props
 * @param {string} props.id - Input ID for label association
 * @param {string} props.label - Input field label
 * @param {string} props.type - Input type (text, password, email, etc.)
 * @param {string} props.name - Input name for form submission
 * @param {string} props.value - Input value
 * @param {function} props.onChange - Change handler
 * @param {string} props.error - Error message to display
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.required - Whether field is required
 * @param {string} props.helpText - Optional help text
 * @param {string} props.className - Additional CSS classes
 */
const Input = forwardRef(({
  id,
  label,
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  required = false,
  helpText,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="form-group">
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      
      <div className="input-wrapper position-relative">
        <input
          ref={ref}
          id={id}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`form-control ${error ? 'border-danger' : ''} ${className}`}
          required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
          {...props}
        />
      </div>
      
      {helpText && !error && (
        <div id={`${id}-help`} className="form-text mt-2">
          {helpText}
        </div>
      )}
      
      {error && (
        <div id={`${id}-error`} className="form-error mt-2">
          {error}
        </div>
      )}
    </div>
  );
});

// Display name for React DevTools
Input.displayName = 'Input';

export default Input;
