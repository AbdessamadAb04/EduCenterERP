import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface PaymentSelectionContextType {
  selectedPaymentIds: string[];
  setSelectedPaymentIds: (ids: string[]) => void;
  showReceiptModal: boolean;
  setShowReceiptModal: (show: boolean) => void;
  clearSelection: () => void;
}

const PaymentSelectionContext = createContext<PaymentSelectionContextType | undefined>(undefined);

export const PaymentSelectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedPaymentIds, setSelectedPaymentIds] = useState<string[]>([]);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const clearSelection = () => {
    setSelectedPaymentIds([]);
    setShowReceiptModal(false);
  };

  return (
    <PaymentSelectionContext.Provider value={{ 
      selectedPaymentIds, 
      setSelectedPaymentIds, 
      showReceiptModal, 
      setShowReceiptModal,
      clearSelection
    }}>
      {children}
    </PaymentSelectionContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const usePaymentSelection = () => {
  const context = useContext(PaymentSelectionContext);
  if (context === undefined) {
    throw new Error('usePaymentSelection must be used within a PaymentSelectionProvider');
  }
  return context;
};
