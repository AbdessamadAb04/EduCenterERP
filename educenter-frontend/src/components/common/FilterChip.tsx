import React from 'react';

interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 16px',
        borderRadius: '24px',
        fontSize: 'var(--text-sm)',
        fontWeight: 500,
        backgroundColor: active ? 'var(--color-primary-light)' : 'var(--color-white)',
        color: active ? 'var(--color-primary)' : 'var(--color-gray)',
        border: `1px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap'
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'var(--color-gray-bg)';
          e.currentTarget.style.color = 'var(--color-text)';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'var(--color-white)';
          e.currentTarget.style.color = 'var(--color-gray)';
        }
      }}
    >
      {label}
    </button>
  );
};

export default FilterChip;
