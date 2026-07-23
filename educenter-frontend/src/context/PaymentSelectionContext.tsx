import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface PaymentSelectionContextType {
  selectedPaymentIds: number[];
  setSelectedPaymentIds: (ids: number[]) => void;
  showReceiptModal: boolean;
  setShowReceiptModal: (show: boolean) => void;
  clearSelection: () => void;
}

const PaymentSelectionContext = createContext<PaymentSelectionContextType | undefined>(undefined);

export const PaymentSelectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedPaymentIds, setSelectedPaymentIds] = useState<number[]>([]);
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

export const usePaymentSelection = () => {
  const context = useContext(PaymentSelectionContext);
  if (context === undefined) {
    throw new Error('usePaymentSelection must be used within a PaymentSelectionProvider');
  }
  return context;
};
