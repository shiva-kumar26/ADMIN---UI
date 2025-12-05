import { useQuery } from '@tanstack/react-query';

export interface AgentsPerformanceResponse {
  recent_agents: { agents: string[] };
  answer_rates: { status: string; data: { name: string; agent_answer_rate: number }[] };
  non_responses: { agents: { name: string; no_answer_count: number }[] };
  on_contact_times: { status: string; data: { name: string; total_on_contact_time_seconds: string }[] };
  online_times: { status: string; data: { name: string; online_time: string }[] };
  non_productive_times: { status: string; data: { name: string; non_productive_time_seconds: string }[] };
  contacts_handled: { status: string; data: { name: string; contacts_handled: number }[] };
  after_contact_work_time: { status: string; data: { name: string; average_after_contact_work_time_seconds: string }[] };
  agent_interaction_time: { status: string; data: { name: string; average_agent_interaction_time_seconds: string }[] };
}

interface UseAgentsMetricsParams {
  interval: string;
  startDate?: Date;
  endDate?: Date;
  timeZone: string;
}

const getApiUrl = (interval: string, startDate?: Date, endDate?: Date, timeZone?: string) => {
  const baseUrl = 'http://10.16.7.96:8001/agents-performance';
  switch (interval) {
    case '15-minutes-time-interval':
      return `${baseUrl}/15-minutes-time-interval?user_time_zone=${timeZone || 'UTC'}`;
    case '30-minutes-time-interval':
      return `${baseUrl}/30-minutes-time-interval?user_time_zone=${timeZone || 'UTC'}`;
    case 'today':
      return `${baseUrl}/since_today?user_time_zone=${timeZone || 'UTC'}`;
    case 'custom':
      if (startDate && endDate && timeZone) {
        const start = startDate.toISOString().split('T')[0];
        const end = endDate.toISOString().split('T')[0];
        return `${baseUrl}/date-range?user_time_zone=${timeZone}&start_date=${start}&end_date=${end}`;
      }
      return null;
    default:
      return `${baseUrl}/15-minutes-time-interval?user_time_zone=${timeZone || 'UTC'}`;
  }
};

export const useAgentsMetrics = ({ interval, startDate, endDate, timeZone }: UseAgentsMetricsParams) => {
  const apiUrl = getApiUrl(interval, startDate, endDate, timeZone);

  return useQuery({
    queryKey: ['agents-metrics', interval, startDate, endDate, timeZone],
    queryFn: async (): Promise<AgentsPerformanceResponse> => {
      if (!apiUrl) throw new Error('Invalid date range parameters');
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    },
    enabled: !!apiUrl,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Remove table rendering code from this hook file. 
// Move the following JSX to your HistoricalAgents.tsx component file where you render the table.
