
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Trash2, Plus, ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LoadingQueues } from '@/components/ui/loading-states';
import axios from 'axios';
import CustomPagination from './CustomPagination';
import { useSidebar } from '@/components/SidebarContext';
interface Queue {
  queue_id: number;
  name: string;
  strategy: string;
  moh_sound: string;
  announce_sound: string | null;
  announce_frequency: number | null;
  time_base_score: string;
  tier_rules_apply: string;
  tier_rule_wait_second: number;
  tier_rule_wait_multiply_level: string;
  tier_rule_no_agent_no_wait: string;
  discard_abandoned_after: number;
  abandoned_resume_allowed: string;
  max_wait_time: number;
  max_wait_time_with_no_agent: number;
  max_wait_time_with_no_agent_time_reached: number;
  record_template: string;
}

type SortField = keyof Queue;
type SortDirection = 'asc' | 'desc';

const Queues = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {isSidebarOpen} = useSidebar()
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

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' &&
      <ArrowUpDown className="w-4 h-4" />
  };

  const sortedQueues = [...queues].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

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
    Object.values(queue).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredQueues.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredQueues.length);
  const paginatedQueues = filteredQueues.slice(startIndex, endIndex);

  const handleDeleteQueue = async (queueId: string) => {
    try {
      await axios.delete(`https://10.16.7.96/api/api/queue/${queueId}`);
      setQueues(prev => prev.filter(queue => queue.queue_id !== parseInt(queueId)));
      toast({
        title: "Queue Deleted",
        description: "Queue has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete queue.",
        variant: "destructive",
      });
      console.error("Error in delete API:", error);
    }
  };

  const handleEditQueue = (queueId: string) => {
    navigate(`/queue-details/${queueId}?edit=true`);
  };

  const handleRowDoubleClick = (queueId: string) => {
    navigate(`/queue-details/${queueId}`);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="space-y-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Queue Management</CardTitle>
          </CardHeader>
          <CardContent>
            <LoadingQueues />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
<>
  <div className="flex flex-col items-center">
    <div
      className={`h-[88vh] flex flex-col mx-1 mb-2 ${
        !isSidebarOpen ? 'w-full ml-10' : 'max-w-[1230px]'
      }`}
    >
      <div className="flex items-center justify-between">
        <h4 className='font-bold'>Queue Management</h4>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg"
          onClick={() => navigate('/queue-creation')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Queue
        </Button>
      </div>

      <div className="flex gap-4 mt-4 items-center">
        <Input
          placeholder="Search queues..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="relative overflow-auto scrollbar-hide flex-1">
        <div className="min-w-full overflow-x-auto scrollbar-hide">
          <div className="flex flex-col justify-between">
            <Table
              className="min-w-full table-auto scrollbar-hide px-2 border border-gray-200 mt-4"
              style={{ height: 'calc(88vh - 120px)' }}
            >
              <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
                <TableRow className="border-b border-gray-200 h-[40px]">
                  <TableHead
                    className="text-gray-700 font-semibold text-center px-4 py-2 border-b cursor-pointer min-w-[150px]"
                    onClick={() => handleSort('name')}
                  >
                    <span className="flex items-center justify-center gap-1">
                      Queue Name
                      {getSortIcon('name')}
                    </span>
                  </TableHead>
                  <TableHead
                    className="text-gray-700 font-semibold text-center px-4 py-2 border-b cursor-pointer min-w-[120px]"
                    onClick={() => handleSort('strategy')}
                  >
                    Strategy {getSortIcon('strategy')}
                  </TableHead>
                  <TableHead
                    className="text-gray-700 font-semibold text-center px-4 py-2 border-b cursor-pointer min-w-[130px]"
                    onClick={() => handleSort('moh_sound')}
                  >
                    MOH Sound {getSortIcon('moh_sound')}
                  </TableHead>
                  <TableHead
                    className="text-gray-700 font-semibold text-center px-4 py-2 border-b cursor-pointer min-w-[160px]"
                    onClick={() => handleSort('time_base_score')}
                  >
                    Time Base Score {getSortIcon('time_base_score')}
                  </TableHead>
                  <TableHead
                    className="text-gray-700 font-semibold text-center px-4 py-2 border-b cursor-pointer min-w-[150px]"
                    onClick={() => handleSort('tier_rules_apply')}
                  >
                    Tier Rules Apply {getSortIcon('tier_rules_apply')}
                  </TableHead>
                  <TableHead
                    className="text-gray-700 font-semibold text-center px-4 py-2 border-b cursor-pointer min-w-[180px]"
                    onClick={() => handleSort('tier_rule_wait_second')}
                  >
                    Tier Rule Wait Second {getSortIcon('tier_rule_wait_second')}
                  </TableHead>
                  <TableHead
                    className="text-gray-700 font-semibold text-center px-4 py-2 border-b cursor-pointer min-w-[200px]"
                    onClick={() => handleSort('tier_rule_wait_multiply_level')}
                  >
                    Tier Rule Wait Multiply Level {getSortIcon('tier_rule_wait_multiply_level')}
                  </TableHead>
                  <TableHead
                    className="text-gray-700 font-semibold text-center px-4 py-2 border-b cursor-pointer min-w-[200px]"
                    onClick={() => handleSort('tier_rule_no_agent_no_wait')}
                  >
                    Tier Rule No Agent No Wait {getSortIcon('tier_rule_no_agent_no_wait')}
                  </TableHead>
                  <TableHead
                    className="text-gray-700 font-semibold text-center px-4 py-2 border-b cursor-pointer min-w-[180px]"
                    onClick={() => handleSort('discard_abandoned_after')}
                  >
                    Discard Abandoned After {getSortIcon('discard_abandoned_after')}
                  </TableHead>
                  <TableHead
                    className="text-gray-700 font-semibold text-center px-4 py-2 border-b cursor-pointer min-w-[180px]"
                    onClick={() => handleSort('abandoned_resume_allowed')}
                  >
                    Abandoned Resume Allowed {getSortIcon('abandoned_resume_allowed')}
                  </TableHead>
                  <TableHead
                    className="text-gray-700 font-semibold text-center px-4 py-2 border-b cursor-pointer min-w-[140px]"
                    onClick={() => handleSort('max_wait_time')}
                  >
                    Max Wait Time {getSortIcon('max_wait_time')}
                  </TableHead>
                  <TableHead
                    className="text-gray-700 font-semibold text-center px-4 py-2 border-b cursor-pointer min-w-[200px]"
                    onClick={() => handleSort('max_wait_time_with_no_agent')}
                  >
                    Max Wait Time With No Agent {getSortIcon('max_wait_time_with_no_agent')}
                  </TableHead>
                  <TableHead
                    className="text-gray-700 font-semibold text-center px-4 py-2 border-b cursor-pointer min-w-[250px]"
                    onClick={() => handleSort('max_wait_time_with_no_agent_time_reached')}
                  >
                    Max Wait Time With No Agent Time Reached {getSortIcon('max_wait_time_with_no_agent_time_reached')}
                  </TableHead>
                  <TableHead
                    className="text-gray-700 font-semibold text-center px-4 py-2 border-b cursor-pointer min-w-[150px]"
                    onClick={() => handleSort('record_template')}
                  >
                    Record Template {getSortIcon('record_template')}
                  </TableHead>
                  <TableHead className="text-gray-700 font-semibold text-center px-4 py-2 border-b min-w-[120px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="overflow-y-auto">
                {paginatedQueues.map((queue) => (
                  <TableRow
                    key={queue.queue_id}
                    className="hover:bg-gray-50 cursor-pointer border-b border-gray-200"
                    style={{height:'50px'}}
                    onDoubleClick={() => handleRowDoubleClick(queue.queue_id.toString())}
                  >
                    <TableCell className="text-center px-3 py-2 font-medium">{queue.name}</TableCell>
                    <TableCell className="text-center px-3 py-2">{queue.strategy}</TableCell>
                    <TableCell className="text-center px-3 py-2">{queue.moh_sound}</TableCell>
                    <TableCell className="text-center px-3 py-2">{queue.time_base_score}</TableCell>
                    <TableCell className="text-center px-3 py-2">{queue.tier_rules_apply}</TableCell>
                    <TableCell className="text-center px-3 py-2">{queue.tier_rule_wait_second}</TableCell>
                    <TableCell className="text-center px-3 py-2">{queue.tier_rule_wait_multiply_level}</TableCell>
                    <TableCell className="text-center px-3 py-2">{queue.tier_rule_no_agent_no_wait}</TableCell>
                    <TableCell className="text-center px-3 py-2">{queue.discard_abandoned_after}</TableCell>
                    <TableCell className="text-center px-3 py-2">{queue.abandoned_resume_allowed}</TableCell>
                    <TableCell className="text-center px-3 py-2">{queue.max_wait_time}</TableCell>
                    <TableCell className="text-center px-3 py-2">{queue.max_wait_time_with_no_agent}</TableCell>
                    <TableCell className="text-center px-3 py-2">{queue.max_wait_time_with_no_agent_time_reached}</TableCell>
                    <TableCell className="text-center px-3 py-2">{queue.record_template}</TableCell>
                    <TableCell className="text-center px-3 py-2">
                      <div className="flex space-x-2 justify-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditQueue(queue.queue_id.toString())}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteQueue(queue.queue_id.toString())}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedQueues.length === 0 && (
                  <TableRow className="border-b border-gray-200 h-[50px]">
                    <TableCell colSpan={15} className="text-center px-4 py-2 text-gray-500">
                      No queues found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <div className="w-full flex justify-between items-center border-t border-gray-200">
        {/* Record Count */}
        <span className="text-sm text-gray-600">
          Showing {startIndex + 1} to {startIndex + paginatedQueues.length} of {filteredQueues.length} Records
        </span>

        {/* Pagination Controls */}
        <div className=" px-4 py-3 bg-white sticky bottom-0 z-10">
          <div className="flex items-center gap-4">
            {/* Rows per page selector */}
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <label htmlFor="itemsPerPage">Rows per page:</label>
              <select
                id="itemsPerPage"
                className="border border-gray-300 rounded px-2 py-1"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
              >
                {[10, 20, 30, 50].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>

            {/* Page navigation icons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded border text-sm ${
                  currentPage === 1
                    ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                ‹
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded border text-sm ${
                  currentPage === totalPages
                    ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</>
  );
};

export default Queues;
