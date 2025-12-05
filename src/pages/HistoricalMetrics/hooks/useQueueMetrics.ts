
import { useQuery } from '@tanstack/react-query';

export interface QueueMetricsResponse {
  unique_queue_names: string[];
  service_levels_60_seconds: Array<{
    queue: string;
    service_level_60_seconds: string;
    total_calls: number;
  }>;
  service_levels_120_seconds: Array<{
    queue: string;
    service_level_120_seconds: string;
    total_calls: number;
  }>;
  avg_after_contact_work_time: Array<{
    queue: string;
    avg_time: number;
    avg_time_formatted: string;
    total_calls: number;
  }>;
  avg_interaction_times: Array<{
    queue: string;
    avg_time: number;
    avg_time_formatted: string;
    total_calls: number;
  }>;
  avg_handle_times: Array<{
    queue: string;
    avg_time: number;
    avg_time_formatted: string;
    total_calls: number;
  }>;
  contacts_queued: Record<string, unknown>;
  contacts_handled_incoming: Record<string, unknown>;
  contacts_handled_outbound: Record<string, unknown>;
  abandoned_contacts: unknown[];
  contacts_handled_per_queue: Record<string, unknown>;
}

interface UseQueueMetricsParams {
  interval: string;
  startDate?: Date;
  endDate?: Date;
  timeZone: string;
}

const getApiUrl = (interval: string, startDate?: Date, endDate?: Date, timeZone?: string) => {
  const baseUrl = 'http://10.16.7.96:8001';
  const tzParam = timeZone ? `?user_time_zone=${encodeURIComponent(timeZone)}` : '';

  switch (interval) {
    case '15-minutes-time-interval':
      return `${baseUrl}/queue-metrics/15-minutes-time-interval${tzParam}`;
    case '30-minutes-time-interval':
      return `${baseUrl}/queue-metrics/30-minutes-time-interval${tzParam}`;
    case 'today':
      return `${baseUrl}/queue-metrics/today${tzParam}`;
    case 'custom':
      if (startDate && endDate) {
        const start = startDate.toISOString().split('T')[0];
        const end = endDate.toISOString().split('T')[0];
        return `${baseUrl}/api/queue-metrics/daterange?start_date=${start}&end_date=${end}&user_time_zone=${encodeURIComponent(timeZone ?? '')}`;
      }
      return null;
    default:
      return `${baseUrl}/queue-metrics/15-minutes-time-interval${tzParam}`;
  }
};

export const useQueueMetrics = ({ interval, startDate, endDate, timeZone }: UseQueueMetricsParams) => {
  const apiUrl = getApiUrl(interval, startDate, endDate, timeZone);

  return useQuery({
    queryKey: ['queue-metrics', interval, startDate, endDate, timeZone],
    queryFn: async (): Promise<QueueMetricsResponse> => {
      if (!apiUrl) {
        throw new Error('Invalid date range parameters');
      }

      console.log('Fetching queue metrics from:', apiUrl);
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Queue metrics data:', data);
      return data;
    },
    enabled: !!apiUrl && (interval !== 'Custom Date Range' || (!!startDate && !!endDate)),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime)
  });
};
