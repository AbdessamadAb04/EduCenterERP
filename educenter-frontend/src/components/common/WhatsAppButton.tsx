import React from 'react';
import { MessageSquare } from 'lucide-react';

interface WhatsAppButtonProps {
  phone: string;
  studentName: string;
  amount: number;
  dueDate: string;
}

const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ 
  phone, 
  studentName, 
  amount, 
  dueDate 
}) => {
  const sendMessage = () => {
    // Message template (French) from plan
    const message = `Bonjour ${studentName}, nous vous rappelons que votre paiement de ${amount} MAD était dû le ${dueDate}. Merci de régulariser votre situation. Centre EduCenter.`;
    
    // Clean phone number (remove spaces, etc.) - assuming Moroccan format or similar
    const cleanPhone = phone.replace(/\s+/g, '').replace(/^0/, '212');
    
    // Construct wa.me link
    const url = `https://wa.me/${cleanPhone}/?text=${encodeURIComponent(message)}`;
    
    // Open in new tab
    window.open(url, '_blank');
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation(); // Avoid triggering row click
        sendMessage();
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 14px',
        backgroundColor: '#25D366', // WhatsApp Brand Color
        color: 'white',
        borderRadius: '6px',
        border: 'none',
        fontSize: 'var(--text-xs)',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        boxShadow: '0 2px 4px rgba(37, 211, 102, 0.2)'
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#128C7E')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#25D366')}
    >
      <MessageSquare size={14} fill="currentColor" />
      Envoyer rappel
    </button>
  );
};

export default WhatsAppButton;
