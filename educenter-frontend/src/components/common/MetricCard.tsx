import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: 'default' | 'danger' | 'success' | 'warning' | 'info' | 'dark';
  active?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  solid?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, sub, color = 'default', active, onClick, icon, solid }) => {
  const getBrandColor = () => {
    switch (color) {
      case 'success': return 'var(--color-primary)';
      case 'danger': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'info': return '#1d4ed8';
      case 'dark': return 'var(--color-dark-gray)';
      default: return '#065f46';
    }
  };

  const getValueColor = () => {
    switch (color) {
      case 'success': return 'var(--color-success)';
      case 'danger': return 'var(--color-danger)';
      case 'warning': return 'var(--color-warning)';
      case 'info': return 'var(--color-info)';
      case 'dark': return 'var(--color-dark-gray)';
      default: return 'var(--color-text)';
    }
  };

  const getSubColor = () => {
    return 'var(--color-gray)';
  };

  return (
    <div 
      onClick={onClick}
      style={{
        backgroundColor: solid ? getBrandColor() : 'var(--color-white)',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: active 
          ? `0 0 0 1px ${getBrandColor()}, var(--shadow-md)` 
          : solid ? `0 2px 8px ${getBrandColor()}33` : 'var(--shadow-sm)',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: 'none',
        opacity: active ? 1 : 0.9,
        border: active ? `0.5px solid ${getBrandColor()}` : solid ? 'none' : '1px solid var(--color-border)',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = active 
          ? `0 0 0 1px ${getBrandColor()}, var(--shadow-lg)` 
          : 'var(--shadow-md)';
        e.currentTarget.style.opacity = '1';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = active 
          ? `0 0 0 1px ${getBrandColor()}, var(--shadow-md)` 
          : 'var(--shadow-sm)';
        if (!active) e.currentTarget.style.opacity = '0.9';
      }}
    >
      {icon && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          color: solid ? '#fff' : active ? getBrandColor() : getValueColor(),
          opacity: solid ? 0.4 : active ? 1 : 0.6,
          transition: 'all 0.3s ease'
        }}>
          {icon}
        </div>
      )}
      <span style={{ 
        fontSize: 'var(--text-sm)', 
        color: solid ? '#fff' : 'var(--color-text-secondary)',
        fontWeight: 500,
        opacity: solid ? 0.85 : 1
      }}>
        {label}
      </span>
      <span style={{ 
        fontSize: 'var(--text-2xl)', 
        fontWeight: 'bold',
        color: solid ? '#fff' : getValueColor()
      }}>
        {value}
      </span>
      {sub && (
        <span style={{ 
          fontSize: 'var(--text-xs)', 
          color: solid ? '#fff' : getSubColor(),
          marginTop: '4px',
          opacity: solid ? 0.75 : 1
        }}>
          {sub}
        </span>
      )}
    </div>
  );
};

export default MetricCard;
