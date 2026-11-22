import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface SelectionContextType {
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  showExportModal: boolean;
  setShowExportModal: (show: boolean) => void;
  clearSelection: () => void;
}

const ClassSelectionContext = createContext<SelectionContextType | undefined>(undefined);

export const ClassSelectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
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

// eslint-disable-next-line react-refresh/only-export-components
export const useClassSelection = () => {
  const context = useContext(ClassSelectionContext);
  if (context === undefined) {
    throw new Error('useClassSelection must be used within a ClassSelectionProvider');
  }
  return context;
};
