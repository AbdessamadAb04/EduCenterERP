import React from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  width?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({ 
  placeholder = "Rechercher...", 
  value, 
  onChange,
  width = '300px'
}) => {
  return (
    <div style={{
      position: 'relative',
      width: width,
      display: 'flex',
      alignItems: 'center'
    }}>
      <div style={{
        position: 'absolute',
        left: '12px',
        color: 'var(--color-gray)',
        pointerEvents: 'none'
      }}>
        <Search size={18} />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 12px 10px 40px',
          borderRadius: '8px',
          border: '1px solid var(--color-border)',
          fontSize: 'var(--text-sm)',
          outline: 'none',
          transition: 'border-color 0.2s ease',
          backgroundColor: 'var(--color-white)'
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
        onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
      />
    </div>
  );
};

export default SearchInput;
