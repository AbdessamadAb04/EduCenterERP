import React from 'react';

type StatusType = 'ACTIVE' | 'ON_HOLD' | 'DROPPED' | 'PAID' | 'PENDING' | 'OVERDUE' | 'ARCHIVED';

interface StatusBadgeProps {
  status: StatusType;
}

const statusConfig: Record<StatusType, { label: string; bg: string; text: string }> = {
  ACTIVE: { label: 'Actif', bg: 'var(--color-success-bg)', text: 'var(--color-success)' },
  PAID: { label: 'Payé', bg: 'var(--color-success-bg)', text: 'var(--color-success)' },
  ON_HOLD: { label: 'En attente', bg: 'var(--color-warning-bg)', text: 'var(--color-warning)' },
  PENDING: { label: 'En cours', bg: 'var(--color-warning-bg)', text: 'var(--color-warning)' },
  DROPPED: { label: 'Archivé', bg: '#f1f5f9', text: '#64748b' },
  ARCHIVED: { label: 'Archivé', bg: '#f1f5f9', text: '#64748b' },
  OVERDUE: { label: 'En retard', bg: 'var(--color-danger-bg)', text: 'var(--color-danger)' },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status] || statusConfig.ACTIVE;

  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '4px',
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
      backgroundColor: config.bg,
      color: config.text,
      textAlign: 'center',
      minWidth: '80px'
    }}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
