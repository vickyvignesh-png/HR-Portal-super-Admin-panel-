import React from 'react';

export const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  error,
  hint,
  required = false,
  disabled = false,
  id,
  className = '',
  placeholder = 'Select an option'
}) => {
  const selectId = id || name;

  return (
    <div className={`form-group ${className}`.trim()}>
      {label && (
        <label htmlFor={selectId} className="form-label">
          {label}
          {required && <span className="required-star">*</span>}
        </label>
      )}
      <select
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`form-select ${error ? 'has-error' : ''}`.trim()}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const lbl = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={val} value={val}>
              {lbl}
            </option>
          );
        })}
      </select>
      {hint && !error && <span className="form-hint">{hint}</span>}
      {error && <span className="form-error">{error}</span>}
    </div>
  );
};
