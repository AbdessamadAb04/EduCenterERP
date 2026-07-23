import React from 'react';
import { Bell, X } from 'lucide-react';

interface NotificationsPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationsPopup: React.FC<NotificationsPopupProps> = ({ isOpen, onClose }) => {
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'absolute',
        top: '100%',
        right: 0,
        marginTop: '6px',
        width: '340px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 200,
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)' }}>
          Notifications
        </span>
        <X size={16} cursor="pointer" color="var(--color-gray)" onClick={onClose} />
      </div>

      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '48px 24px', gap: '12px',
      }}>
        <Bell size={40} color="var(--color-gray)" style={{ opacity: 0.3 }} />
        <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
          Aucune notification
        </span>
        <span style={{ fontSize: '0.8rem', color: 'var(--color-gray)', textAlign: 'center' }}>
          Vous n'avez aucune notification pour le moment.
        </span>
      </div>
    </div>
  );
};

export default NotificationsPopup;
