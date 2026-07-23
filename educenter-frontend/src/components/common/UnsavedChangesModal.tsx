import React from 'react';
import Modal from './Modal';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onKeepEditing: () => void;
  onDiscard: () => void;
  title?: string;
  message?: string;
}

const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  isOpen,
  onKeepEditing,
  onDiscard,
  title = 'Modifications non enregistrées',
  message = 'Vous avez des modifications non enregistrées. Si vous fermez maintenant, elles seront perdues.',
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onKeepEditing}
      title={title}
      width="520px"
      footer={
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', width: '100%' }}>
          <button
            type="button"
            onClick={onKeepEditing}
            style={{
              padding: '10px 20px',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--color-gray)',
              cursor: 'pointer',
            }}
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onDiscard}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc2626',
              color: 'white',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Quitter
          </button>
        </div>
      }
    >
      <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
        <p style={{ fontSize: '1.05rem', color: 'var(--color-text)', margin: 0, lineHeight: 1.6 }}>
          {message}
        </p>
      </div>
    </Modal>
  );
};

export default UnsavedChangesModal;