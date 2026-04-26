import React, { ReactNode } from 'react';

interface PrimaryButtonProps {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  disabled?: boolean;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ 
  label, 
  onClick, 
  icon, 
  disabled = false 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '10px 20px',
        backgroundColor: disabled ? 'var(--color-gray)' : 'var(--color-primary)',
        color: 'var(--color-white)',
        borderRadius: '8px',
        border: 'none',
        fontSize: 'var(--text-base)',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: 'var(--shadow-sm)'
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.filter = 'brightness(1.1)';
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.filter = 'none';
      }}
    >
      {icon}
      {label}
    </button>
  );
};

export default PrimaryButton;
