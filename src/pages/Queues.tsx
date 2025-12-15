import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Plus, Search, ArrowUpDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

interface Queue {
  queue_id: number;
  name: string;
  strategy: string;
  moh_sound: string;
  time_base_score: string;
  max_wait_time: number;
  record_template: string;
}

type SortField = keyof Queue;
type SortDirection = 'asc' | 'desc';

const Queues = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [queues, setQueues] = useState<Queue[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('https://10.16.7.96/api/api/queue')
      .then(res => res.json())
      .then(data => {
        setQueues(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Failed to fetch queues:", error);
        setLoading(false);
      });
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const sortedQueues = [...queues].sort((a, b) => {
    const aValue = (a as any)[sortField];
    const bValue = (b as any)[sortField];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    return 0;
  });

  const filteredQueues = sortedQueues.filter(queue =>
    queue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    queue.strategy.toLowerCase().includes(searchTerm.toLowerCase()) ||
    queue.moh_sound.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredQueues.length / itemsPerPage);
  const paginatedQueues = filteredQueues.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDeleteQueue = async (queueId: string) => {
    try {
      await axios.delete(`https://10.16.7.96/api/api/queue/${queueId}`);
      setQueues(prev => prev.filter(q => q.queue_id !== parseInt(queueId)));
      toast({
        title: "Success",
        description: "Queue deleted successfully.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete queue.",
        variant: "destructive",
      });
    }
  };

  const handleEditQueue = (queueId: string) => {
    navigate(`/queue-details/${queueId}?edit=true`);
  };

  const handleRowDoubleClick = (queueId: string) => {
    navigate(`/queue-details/${queueId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Loading queues...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 mt-8 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Queue Management</h1>
        </div>
        <Button
          onClick={() => navigate('/queue-creation')}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium px-6 py-3 rounded-xl shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Queue
        </Button>
      </div>

      {/* Queues Table with Search */}
      <Card className="bg-white shadow-lg border border-gray-100 overflow-hidden">
        <CardContent className="p-0">

          {/* Search Section */}
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search queues by name, strategy, or MOH..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 rounded-xl bg-white w-full"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th
                    onClick={() => handleSort('name')}
                    className="px-4 py-3 text-left text-sm font-bold text-gray-900 cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      Queue Name
                      {sortField === 'name' && <ArrowUpDown className="w-4 h-4" />}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Strategy</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">MOH Sound</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Time Base Score</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Max Wait Time</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Record Template</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedQueues.map((queue) => (
                  <tr
                    key={queue.queue_id}
                    onDoubleClick={() => handleRowDoubleClick(queue.queue_id.toString())}
                    className="hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md">
                          {queue.name.split('@')[0].slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{queue.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="px-3 py-1 font-medium text-xs">
                        {queue.strategy}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {queue.moh_sound || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {queue.time_base_score}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {queue.max_wait_time > 0 ? `${queue.max_wait_time}s` : 'Unlimited'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {queue.record_template || 'None'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditQueue(queue.queue_id.toString());
                          }}
                          className="h-8 w-8 hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteQueue(queue.queue_id.toString());
                          }}
                          className="h-8 w-8 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedQueues.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-gray-500 text-lg">
                      No queues found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50">
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredQueues.length)} of {filteredQueues.length} queues
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-700">Rows per page:</span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(v) => {
                    setItemsPerPage(Number(v));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-20 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm font-medium text-gray-700">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages || 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Queues;