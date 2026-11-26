import React, { type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  width?: string; // New optional width prop
  className?: string; // Add className prop
}

const Modal: React.FC<ModalProps> = ({ title, isOpen, onClose, children, footer, width = '500px', className }) => {
  if (!isOpen) return null;

  return (
    <div 
      className={`modal-overlay ${className}`}
      style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      padding: '50px 0 0 220px',
      zIndex: 1000,
      backdropFilter: 'blur(2px)'
    }} onClick={onClose}>
      <div 
        className="modal-content"
        style={{
        marginLeft: '24px',
        backgroundColor: 'var(--color-white)',
        width: width,
        maxWidth: '90%',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div 
          className="modal-header"
          style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>{title}</h3>
          <X 
            size={20} 
            cursor="pointer" 
            onClick={onClose} 
            style={{ color: 'var(--color-gray)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-gray)')}
          />
        </div>

        {/* Content */}
        <div style={{ padding: '24px', overflow: 'auto', maxHeight: '70vh' }} className="modal-body">
          {children}
        </div>

        {/* Footer */}
        {footer !== undefined ? (
          <div 
            className="modal-footer"
            style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            backgroundColor: 'var(--color-gray-bg)'
          }}>
            {footer}
          </div>
        ) : (
          <div style={{
             padding: '16px 24px',
             borderTop: '1px solid var(--color-border)',
             display: 'flex',
             justifyContent: 'flex-end',
             gap: '12px',
             backgroundColor: 'var(--color-gray-bg)'
           }}>
             <button 
                onClick={onClose}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'transparent',
                  color: 'var(--color-gray)',
                  border: 'none',
                  fontSize: 'var(--text-base)',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
             >
               Annuler
             </button>
             <button
                onClick={() => {}} // This should be handled by the parent
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-white)',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: 'var(--text-base)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
             >
               Enregistrer
             </button>
           </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
