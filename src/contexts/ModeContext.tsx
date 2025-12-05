import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ModeContextType {
  mode: 'supervisor' | 'agent';
  toggleMode: () => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export const ModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<'supervisor' | 'agent'>('supervisor');

  const toggleMode = () => {
    setMode((prev) => (prev === 'supervisor' ? 'agent' : 'supervisor'));
  };

  return (
    <ModeContext.Provider value={{ mode, toggleMode }}>
      {children}
    </ModeContext.Provider>
  );
};

export const useMode = () => {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useMode must be used within ModeProvider');
  }
  return context;
};
