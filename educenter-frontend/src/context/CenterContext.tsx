import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export interface EtablissementInfo {
  id?: string;
  centerName: string;
  centerType: string;
  city: string;
  address: string;
  phone: string;
  secondaryPhone: string;
  email: string;
  website: string;
}

interface CenterContextType extends EtablissementInfo {
  setEtablissement: (info: Partial<EtablissementInfo>) => void;
}

const defaultEtablissement: EtablissementInfo = {
  centerName: '',
  centerType: 'langues',
  city: '',
  address: '',
  phone: '',
  secondaryPhone: '',
  email: '',
  website: '',
};

const CenterContext = createContext<CenterContextType | undefined>(undefined);

export const CenterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [etablissement, setEtablissementState] = useLocalStorage<EtablissementInfo>('etablissement', defaultEtablissement);

  const setEtablissement = (info: Partial<EtablissementInfo>) => {
    setEtablissementState(current => ({ ...current, ...info }));
  };

  return (
    <CenterContext.Provider value={{ ...etablissement, setEtablissement }}>
      {children}
    </CenterContext.Provider>
  );
};

export const useCenter = () => {
  const context = useContext(CenterContext);
  if (context === undefined) {
    throw new Error('useCenter must be used within a CenterProvider');
  }
  return context;
};
