import React from 'react';

type StatusType = 'ACTIVE' | 'PAUSED' | 'ON_HOLD' | 'DROPPED' | 'PAID' | 'PENDING' | 'OVERDUE' | 'ARCHIVED';

interface StatusBadgeProps {
  status: StatusType;
  daysLate?: number;
}

const statusConfig: Record<StatusType, { label: string; bg: string; text: string }> = {
  ACTIVE: { label: 'Actif', bg: 'var(--color-success-bg)', text: 'var(--color-success)' },
  PAUSED: { label: 'En pause', bg: 'var(--color-warning-bg)', text: 'var(--color-warning)' },
  PAID: { label: 'Payé', bg: 'var(--color-success-bg)', text: 'var(--color-success)' },
  ON_HOLD: { label: 'En attente', bg: 'var(--color-warning-bg)', text: 'var(--color-warning)' },
  PENDING: { label: 'En cours', bg: 'var(--color-warning-bg)', text: 'var(--color-warning)' },
  DROPPED: { label: 'Archivé', bg: '#f1f5f9', text: '#64748b' },
  ARCHIVED: { label: 'Archivé', bg: '#f1f5f9', text: '#64748b' },
  OVERDUE: { label: 'En retard', bg: 'var(--color-danger-bg)', text: 'var(--color-danger)' },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, daysLate }) => {
  const config = statusConfig[status] || statusConfig.ACTIVE;
  const label = status === 'OVERDUE' && daysLate ? `${daysLate}j ${config.label}` : config.label;

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
      {label}
    </span>
  );
};

export default StatusBadge;
