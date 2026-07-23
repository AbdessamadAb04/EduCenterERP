import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface SelectionContextType {
  selectedIds: number[];
  setSelectedIds: (ids: number[]) => void;
  showExportModal: boolean;
  setShowExportModal: (show: boolean) => void;
  clearSelection: () => void;
}

const ClassSelectionContext = createContext<SelectionContextType | undefined>(undefined);

export const ClassSelectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);

  const clearSelection = () => {
    setSelectedIds([]);
    setShowExportModal(false);
  };

  return (
    <ClassSelectionContext.Provider value={{ 
      selectedIds, 
      setSelectedIds, 
      showExportModal, 
      setShowExportModal,
      clearSelection
    }}>
      {children}
    </ClassSelectionContext.Provider>
  );
};

export const useClassSelection = () => {
  const context = useContext(ClassSelectionContext);
  if (context === undefined) {
    throw new Error('useClassSelection must be used within a ClassSelectionProvider');
  }
  return context;
};
