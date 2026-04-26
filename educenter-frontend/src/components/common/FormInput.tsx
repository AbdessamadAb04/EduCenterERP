import React from 'react';

interface FormInputProps {
  label: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  error?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  placeholder?: string;
  className?: string;
}

const FormInput: React.FC<FormInputProps> = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  error, 
  required = false,
  options,
  placeholder,
  className
}) => {
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: `1px solid ${error ? 'var(--color-danger)' : 'var(--color-border)'}`,
    fontSize: 'var(--text-base)',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    backgroundColor: 'var(--color-white)',
    marginTop: '6px'
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!error) e.currentTarget.style.borderColor = 'var(--color-primary)';
  };

  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!error) e.currentTarget.style.borderColor = 'var(--color-border)';
  };

  return (
    <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column' }} className={className}>
      <label style={{ 
        fontSize: 'var(--text-sm)', 
        fontWeight: 500, 
        color: 'var(--color-text-secondary)',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        {label} {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
      </label>

      {type === 'select' ? (
        <select
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          style={inputStyle}
          required={required}
        >
          {placeholder && <option value="">{placeholder}</option>}
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
          onBlur={onBlur as any}
          placeholder={placeholder}
          style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
          required={required}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          style={inputStyle}
          required={required}
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
