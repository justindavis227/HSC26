import { createContext, useContext, useState } from 'react';

interface CampusContextType {
  selectedCampus: string;
  setSelectedCampus: (campus: string) => void;
}

const CampusContext = createContext<CampusContextType | undefined>(undefined);

const STORAGE_KEY = 'selected_campus';

export function CampusProvider({ children }: { children: React.ReactNode }) {
  const [selectedCampus, setSelectedCampusState] = useState<string>(
    () => localStorage.getItem(STORAGE_KEY) ?? ''
  );

  function setSelectedCampus(campus: string) {
    setSelectedCampusState(campus);
    localStorage.setItem(STORAGE_KEY, campus);
  }

  return (
    <CampusContext.Provider value={{ selectedCampus, setSelectedCampus }}>
      {children}
    </CampusContext.Provider>
  );
}

export function useCampus() {
  const context = useContext(CampusContext);
  if (!context) throw new Error('useCampus must be used within CampusProvider');
  return context;
}
