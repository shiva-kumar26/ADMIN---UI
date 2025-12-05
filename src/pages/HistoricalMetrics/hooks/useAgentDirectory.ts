
import { useQuery } from '@tanstack/react-query';
 
interface AgentInfo {
  extension: string;
  first_name: string;
  last_name: string;
}
 
interface ApiResponse {
  status: string;
  data: AgentInfo[];
}
 
export const useAgentDirectory = () => {
  return useQuery({
    queryKey: ['agent-directory'],
    queryFn: async (): Promise<Record<string, string>> => {
      const res = await fetch('http://10.16.7.96:8001/agents');
      if (!res.ok) throw new Error('Failed to fetch agent directory');
      const json: ApiResponse = await res.json();
 
      // Build map: { "1035": "Agent Five" }
      const map: Record<string, string> = {};
      for (const agent of json.data) {
        if (agent.extension) {
          map[agent.extension] = `${agent.first_name} ${agent.last_name}`;
        }
      }
 
      return map;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
 