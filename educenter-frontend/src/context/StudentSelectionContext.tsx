import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface SelectionContextType {
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  showExportModal: boolean;
  setShowExportModal: (show: boolean) => void;
  clearSelection: () => void;
}

const StudentSelectionContext = createContext<SelectionContextType | undefined>(undefined);

export const StudentSelectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);

  const clearSelection = () => {
    setSelectedIds([]);
    setShowExportModal(false);
  };

  return (
    <StudentSelectionContext.Provider value={{ 
      selectedIds, 
      setSelectedIds, 
      showExportModal, 
      setShowExportModal,
      clearSelection
    }}>
      {children}
    </StudentSelectionContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useStudentSelection = () => {
  const context = useContext(StudentSelectionContext);
  if (context === undefined) {
    throw new Error('useStudentSelection must be used within a StudentSelectionProvider');
  }
  return context;
};
