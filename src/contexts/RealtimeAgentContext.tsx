import React, { createContext, useContext, useState, ReactNode } from 'react';

interface RealtimeAgentContextType {
  onCallCount: number;
  setOnCallCount: (count: number) => void;
}

const RealtimeAgentContext = createContext<RealtimeAgentContextType | undefined>(undefined);

export const RealtimeAgentProvider = ({ children }: { children: ReactNode }) => {
  const [onCallCount, setOnCallCount] = useState(0);
  return (
    <RealtimeAgentContext.Provider value={{ onCallCount, setOnCallCount }}>
      {children}
    </RealtimeAgentContext.Provider>
  );
};

export const useRealtimeAgent = () => {
  const context = useContext(RealtimeAgentContext);
  if (!context) {
    throw new Error('useRealtimeAgent must be used within RealtimeAgentProvider');
  }
  return context;
};
