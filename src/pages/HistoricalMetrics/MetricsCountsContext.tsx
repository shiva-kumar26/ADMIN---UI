import React, { createContext, useContext, useState, ReactNode } from 'react';

type MetricsCounts = {
  queues: number;
  agents: number;
  loginLogout: number;
  cdrReports: number;
  setQueues: (count: number) => void;
  setAgents: (count: number) => void;
  setLoginLogout: (count: number) => void;
  setCdrReports: (count: number) => void;
};

const MetricsCountsContext = createContext<MetricsCounts | undefined>(undefined);

export const MetricsCountsProvider = ({ children }: { children: ReactNode }) => {
  const [queues, setQueues] = useState(0);
  const [agents, setAgents] = useState(0);
  const [loginLogout, setLoginLogout] = useState(0);
  const [cdrReports, setCdrReports] = useState(0);

  return (
    <MetricsCountsContext.Provider
      value={{
        queues,
        agents,
        loginLogout,
        cdrReports,
        setQueues,
        setAgents,
        setLoginLogout,
        setCdrReports,
      }}
    >
      {children}
    </MetricsCountsContext.Provider>
  );
};

export const useMetricsCounts = () => {
  const context = useContext(MetricsCountsContext);
  if (!context) {
    throw new Error('useMetricsCounts must be used within a MetricsCountsProvider');
  }
  return context;
};
