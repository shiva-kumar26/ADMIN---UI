// RealtimeMetricsContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AgentMetrics {
  totalAgents: number;
  availableAgents: number;
  onCallAgents: number;
  breakAwayAgents: number;
  avgHandleTime: string;
  callHandledTime: number;
  callsHandled: number;
}

interface QueueMetrics {
  totalQueues: number;
  callsWaiting: number;
  callsAnswered: number;
  serviceLevel60: number;
  answerRate: number;
  callWaitTime: string;
}

interface RealtimeMetricsContextType {
  agentMetrics: AgentMetrics;
  queueMetrics: QueueMetrics;
  setAgentMetrics: (metrics: AgentMetrics) => void;
  setQueueMetrics: (metrics: QueueMetrics) => void;
}

const defaultAgentMetrics: AgentMetrics = {
  totalAgents: 0,
  availableAgents: 0,
  onCallAgents: 0,
  breakAwayAgents: 0,
  avgHandleTime: '0:00',
  callHandledTime: 0,
  callsHandled: 0,
};

const defaultQueueMetrics: QueueMetrics = {
  totalQueues: 0,
  callsWaiting: 0,
  callsAnswered: 0,
  serviceLevel60: 0,
  answerRate: 0,
  callWaitTime: '0:00',
};

const RealtimeMetricsContext = createContext<RealtimeMetricsContextType>({
  agentMetrics: defaultAgentMetrics,
  queueMetrics: defaultQueueMetrics,
  setAgentMetrics: () => {},
  setQueueMetrics: () => {},
});

export const useRealtimeMetrics = () => useContext(RealtimeMetricsContext);

export const RealtimeMetricsProvider = ({ children }: { children: ReactNode }) => {
  const [agentMetrics, setAgentMetrics] = useState<AgentMetrics>(defaultAgentMetrics);
  const [queueMetrics, setQueueMetrics] = useState<QueueMetrics>(defaultQueueMetrics);

  return (
    <RealtimeMetricsContext.Provider
      value={{
        agentMetrics,
        queueMetrics,
        setAgentMetrics,
        setQueueMetrics,
      }}
    >
      {children}
    </RealtimeMetricsContext.Provider>
  );
};
