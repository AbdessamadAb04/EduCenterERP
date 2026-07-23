import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface SelectionContextType {
  selectedIds: number[];
  setSelectedIds: (ids: number[]) => void;
  showExportModal: boolean;
  setShowExportModal: (show: boolean) => void;
  clearSelection: () => void;
}

const StudentSelectionContext = createContext<SelectionContextType | undefined>(undefined);

export const StudentSelectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
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

export const useStudentSelection = () => {
  const context = useContext(StudentSelectionContext);
  if (context === undefined) {
    throw new Error('useStudentSelection must be used within a StudentSelectionProvider');
  }
  return context;
};
