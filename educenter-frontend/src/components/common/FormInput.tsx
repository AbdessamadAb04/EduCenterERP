import React from 'react';

interface FormInputProps {
  label: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  error?: string;
  required?: boolean;
  optional?: boolean;
  options?: { label: string; value: string }[];
  placeholder?: string;
  className?: string;
  inputId?: string;
  min?: number;
  max?: number;
  step?: number;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  disabled?: boolean;
  readOnly?: boolean;
  editMode?: boolean;
}

const FormInput: React.FC<FormInputProps> = ({ 
  label, 
  type = 'text', 
  value, 
  onChange,
  onBlur,
  error, 
  required = false,
  optional = false,
  options,
  placeholder,
  className,
  inputId,
  min,
  max,
  step,
  inputMode,
  disabled = false,
  readOnly = false,
  editMode = false,
}) => {
  const defaultBorder = error ? 'var(--color-danger)' : 'var(--color-border)';

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: `1px solid ${defaultBorder}`,
    fontSize: 'var(--text-base)',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    backgroundColor: 'var(--color-white)',
    marginTop: '6px',
    opacity: disabled ? 0.72 : 1,
    cursor: disabled ? 'not-allowed' : 'text',
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!error) e.currentTarget.style.borderColor = 'var(--color-primary)';
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!error) e.currentTarget.style.borderColor = 'var(--color-border)';
    onBlur?.(e);
  };

  return (
    <div id={inputId} style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column' }} className={className}>
      <label style={{ 
        fontSize: 'var(--text-sm)', 
        fontWeight: 500, 
        color: 'var(--color-text-secondary)',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        {label} {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}{optional && <span style={{ color: 'var(--color-gray)', fontWeight: 400 }}> (Optionnelle)</span>}
      </label>

      {type === 'select' ? (
        <select
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={handleBlur}
          style={inputStyle}
          required={required}
          disabled={disabled}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          value={value}
          onChange={onChange as any}
          onFocus={onFocus as any}
          onBlur={handleBlur as any}
          placeholder={placeholder}
          style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          inputMode={inputMode}
          style={inputStyle}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
        />
      )}

      {error && (
        <span style={{ 
          fontSize: 'var(--text-xs)', 
          color: 'var(--color-danger)', 
          marginTop: '4px' 
        }}>
          {error}
        </span>
      )}
    </div>
  );
};

export default FormInput;
