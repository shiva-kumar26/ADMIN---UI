import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Clock, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TablePagination from '../HistoricalMetrics/Pagination/TablePagination';
import { useRealtimeMetrics } from './RealtimeMetricsContext';
 
interface AgentData {
  Extension: string;
  agent_name: string;
  answer_rate: number;
  avg_handled_time: string;
  call_handled_time: string;
  calls_handled: number;
  calls_rejected: number;
  login_time: string;
  status: string;
}
 
const RealTimeAgentMetrics = () => {
  const navigate = useNavigate();
  const [agentData, setAgentData] = useState<AgentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setAgentMetrics } = useRealtimeMetrics();
 
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
 
  // Utility function to parse time string (HH:MM:SS) to seconds
  const parseTimeToSeconds = (time: string): number => {
    if (!time || time === '00:00:00') return 0;
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };
 
  // Utility function to format seconds to HH:MM:SS
  const formatSecondsToTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };
 
  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        const response = await fetch('http://10.16.7.91:5001/realtime_agents');
        if (!response.ok) {
          throw new Error('Failed to fetch agent data');
        }
 
        const data: AgentData[] = await response.json();
        console.log('Fetched Agent Data:', data); // Debug
 
        // Filter out garbage/duplicate/malformed records and deduplicate by Extension
        const filteredData = data
          .filter(
            (a) =>
              a.Extension &&
              a.Extension.length <= 5 &&
              a.Extension !== '10.16.7.91' &&
              !a.Extension.includes('@')
          )
          .filter((item, index, self) =>
            index === self.findIndex((t) => t.Extension === item.Extension)
          );
 
        setAgentData(filteredData);
        setLoading(false);
 
        const available = filteredData.filter((a) => a.status === 'Available').length;
        const onCall = filteredData.filter((a) => a.status === 'On Call').length;
        const breakAway = filteredData.filter((a) => a.status === 'Break' || a.status === 'Away').length;
 
        // Calculate average handle time across all agents
        const avgHandleTimeSeconds = filteredData
          .map(a => parseTimeToSeconds(a.avg_handled_time))
          .filter(seconds => seconds > 0)
          .reduce((acc, curr, _, arr) => acc + curr / arr.length, 0) || 0;
        const avgHandleTime = formatSecondsToTime(avgHandleTimeSeconds);
 
        const callsHandled = filteredData.reduce((acc, a) => acc + (a.calls_handled || 0), 0);
        const callHandledTime = filteredData.reduce((acc, a) => acc + parseTimeToSeconds(a.call_handled_time), 0);
 
        // Set clean metrics
        setAgentMetrics({
          totalAgents: filteredData.length,
          availableAgents: available,
          onCallAgents: onCall,
          breakAwayAgents: breakAway,
          avgHandleTime,
          callsHandled,
          callHandledTime,
        });
 
        console.log('Computed Agent Metrics:', {
          totalAgents: filteredData.length,
          availableAgents: available,
          onCallAgents: onCall,
          breakAwayAgents: breakAway,
          avgHandleTime,
          callsHandled,
          callHandledTime,
        });
 
      } catch (err) {
        console.error('Agent Data Fetch Error:', err);
        setError('Error fetching agent data');
        setLoading(false);
      }
    };
 
    fetchAgentData();
    const intervalId = setInterval(fetchAgentData, 60000);
    return () => clearInterval(intervalId);
  }, [setAgentMetrics]);
 
  const totalItems = agentData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedData = agentData.slice(startIndex, endIndex);
 
  const handlePageChange = (page: number) => setCurrentPage(page);
 
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };
 
  const getStatusBadge = (status: string) => {
    if (!status) {
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Unknown</Badge>;
    }
    if (status === 'Available') {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{status}</Badge>;
    } else if (status === 'Logged Out') {
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{status}</Badge>;
    }
  };
 
  if (loading) {
    return <div className="text-center p-6">Loading...</div>;
  }
 
  if (error) {
    return <div className="text-center p-6 text-red-600">{error}</div>;
  }
 
  return (
    <div className="h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mt-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" onClick={() => navigate('/realtime-reports')} className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                    <Users className="h-8 w-8 mr-3 text-blue-600" />
                    Real-Time Agent Metrics
                  </h1>
                  <p className="text-gray-600 text-lg">Live monitoring of agent performance and status</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-full">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-800 font-medium">Live Data</span>
                </div>
                <div className="text-sm text-gray-600">Last Update: {new Date().toLocaleTimeString()}</div>
              </div>
            </div>
          </div>
        </div>
 
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Agents</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 Daddy">{agentData.length}</div>
              <p className="text-xs text-gray-600">Currently logged in</p>
            </CardContent>
          </Card>
 
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Available Agents</CardTitle>
              <Clock className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{agentData.filter((agent) => agent.status === 'Available').length}</div>
              <p className="text-xs text-gray-600">Ready to take calls</p>
            </CardContent>
          </Card>
 
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">On Call</CardTitle>
              <Phone className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{agentData.filter((agent) => agent.status === 'On Call').length}</div>
              <p className="text-xs text-gray-600">Currently handling calls</p>
            </CardContent>
          </Card>
        </div>
 
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">Agent Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto w-full">
              <div className="max-h-[200px] overflow-y-auto">
                <table className="min-w-full border-separate border-spacing-0 w-full">
                  <thead>
                    <tr>
                      <th className="sticky top-0 z-10 bg-white px-4 py-2 border-b">Agent Name</th>
                      <th className="sticky top-0 z-10 bg-white px-4 py-2 border-b">Extension</th>
                      <th className="sticky top-0 z-10 bg-white px-4 py-2 border-b">Status</th>
                      <th className="sticky top-0 z-10 bg-white px-4 py-2 border-b">Calls Handled</th>
                      <th className="sticky top-0 z-10 bg-white px-4 py-2 border-b">Calls Rejected</th>
                      <th className="sticky top-0 z-10 bg-white px-4 py-2 border-b">Avg Handled Time</th>
                      <th className="sticky top-0 z-10 bg-white px-4 py-2 border-b">Call Handled Time</th>
                      <th className="sticky top-0 z-10 bg-white px-4 py-2 border-b">Login Time</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedData.map((agent) => (
                      <tr key={agent.Extension} className="hover:bg-gray-50 transition-colors">
                        <td className="font-medium px-4 py-2 border-b whitespace-nowrap">{agent.agent_name}</td>
                        <td className="px-4 py-2 border-b whitespace-nowrap">{agent.Extension}</td>
                        <td className="px-4 py-2 border-b whitespace-nowrap">{getStatusBadge(agent.status)}</td>
                        <td className="px-4 py-2 border-b whitespace-nowrap">{agent.calls_handled}</td>
                        <td className="px-4 py-2 border-b whitespace-nowrap">{agent.calls_rejected}</td>
                        <td className="font-mono px-4 py-2 border-b whitespace-nowrap">{agent.avg_handled_time}</td>
                        <td className="font-mono px-4 py-2 border-b whitespace-nowrap">{agent.call_handled_time}</td>
                        <td className="text-sm text-gray-600 px-4 py-2 border-b whitespace-nowrap">{agent.login_time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
 
export default RealTimeAgentMetrics;