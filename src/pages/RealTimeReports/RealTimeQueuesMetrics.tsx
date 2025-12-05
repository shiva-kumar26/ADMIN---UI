import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TablePagination from '../HistoricalMetrics/Pagination/TablePagination';
import axios from 'axios';
import { useRealtimeMetrics } from './RealtimeMetricsContext'; // Adjust import path as needed

interface QueueData {
  queue_name: string;
  calls_answered: number;
  calls_abandoned: number;
  agents_available: number;
  service_level_60_seconds: number;
  service_level_120_seconds: number;
  call_answer_rate: number;
  calls_waiting: number;
}

const RealTimeQueuesMetrics = () => {
  const navigate = useNavigate();
  const [queueData, setQueueData] = useState<QueueData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const { setQueueMetrics } = useRealtimeMetrics();

  useEffect(() => {
    const fetchQueueMetrics = async () => {
      try {
        const response = await axios.get('http://10.16.7.91:5001/realtime_queues');
        const data: QueueData[] = response.data || [];
        setQueueData(data);

        const totalQueues = data.length;
        const callsWaiting = data.reduce((sum, q) => sum + (q.calls_waiting || 0), 0);
        const callsAnswered = data.reduce((sum, q) => sum + (q.calls_answered || 0), 0);

        const avgServiceLevel =
          data.length > 0
            ? data.reduce((sum, q) => sum + (q.service_level_60_seconds || 0), 0) / data.length
            : 0;

        const avgAnswerRate =
          data.length > 0
            ? data.reduce((sum, q) => sum + (q.call_answer_rate || 0), 0) / data.length
            : 0;

        setQueueMetrics({
          totalQueues,
          callsWaiting,
          callsAnswered,
          serviceLevel60: parseFloat(avgServiceLevel.toFixed(2)),
          answerRate: parseFloat(avgAnswerRate.toFixed(2)),
          callWaitTime: '0:00', // Placeholder, adjust if you want to format actual time string
        });
      } catch (error) {
        console.error('Error fetching real-time queues:', error);
        setQueueData([]);
      }
    };

    fetchQueueMetrics();
    const intervalId = setInterval(fetchQueueMetrics, 60000);
    return () => clearInterval(intervalId);
  }, [setQueueMetrics]);

  const totalItems = queueData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedData = queueData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => setCurrentPage(page);

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  return (
    <div className="h-[(100vh-64px)] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mt-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/realtime-reports')}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                    <Clock className="h-8 w-8 mr-3 text-yellow-600" />
                    Real-Time Queue Metrics
                  </h1>
                  <p className="text-gray-600 text-lg">
                    Live monitoring of queue performance and call distribution
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-full">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-800 font-medium">Live Data</span>
                </div>
                <div className="text-sm text-gray-600">
                  Last Update: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">Queue Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto w-full">
              <div className="max-h-[200px] overflow-y-auto">
                <table className="min-w-full border-separate border-spacing-0 w-full">
                  <thead>
                    <tr>
                      <th className="sticky top-0 z-10 bg-white px-4 py-2 border-b">Queue Name</th>
                      <th className="sticky top-0 z-10 bg-white px-4 py-2 border-b">Calls Answered</th>
                      <th className="sticky top-0 z-10 bg-white px-4 py-2 border-b">Calls Abandoned</th>
                      <th className="sticky top-0 z-10 bg-white px-4 py-2 border-b">Agents Available</th>
                      <th className="sticky top-0 z-10 bg-white px-4 py-2 border-b">Service Level 60s</th>
                      <th className="sticky top-0 z-10 bg-white px-4 py-2 border-b">Service Level 120s</th>
                      <th className="sticky top-0 z-10 bg-white px-4 py-2 border-b">Answer Rate</th>
                      <th className="sticky top-0 z-10 bg-white px-4 py-2 border-b">Calls Waiting</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedData.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center text-gray-500 py-8 text-sm italic border-b">
                          ❗ No real-time queue data available
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((queue, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-2 border-b">{queue.queue_name}</td>
                          <td className="px-4 py-2 border-b">{queue.calls_answered}</td>
                          <td className="px-4 py-2 border-b">{queue.calls_abandoned}</td>
                          <td className="px-4 py-2 border-b">{queue.agents_available}</td>
                          <td className="px-4 py-2 border-b">{queue.service_level_60_seconds}%</td>
                          <td className="px-4 py-2 border-b">{queue.service_level_120_seconds}%</td>
                          <td className="px-4 py-2 border-b">{queue.call_answer_rate}%</td>
                          <td className="px-4 py-2 border-b">{queue.calls_waiting}</td>
                        </tr>
                      ))
                    )}
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

export default RealTimeQueuesMetrics;
