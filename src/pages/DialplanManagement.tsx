import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Plus, Search, ArrowUpDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DialplanDeleteDialog from '@/components/dialplan/DialplanDeleteDialog';
import { useSidebar } from '@/components/SidebarContext';

interface DialplanDetail {
  dialplan_id: number;
  detail_id: number;
  insert_date: string;
  update_date: string;
  dialplan_detail_tag: string;
  dialplan_detail_type: string;
  dialplan_detail_data: string;
  dialplan_detail_break: string | null;
  dialplan_detail_inline: string | null;
}

interface Dialplan {
  dialplan_id: number;
  dialplan_name: string;
  dialplan_destination: string;
  hostname: string;
  dialplan_context: string;
  dialplan_continue: boolean;
  domain_id: string | number;
  domain_name?: string;
  dialplan_description: string;
  dialplan_details?: DialplanDetail[];
}

const DialplanManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isSidebarOpen } = useSidebar();

  const [dialplans, setDialplans] = useState<Dialplan[]>([]);
  const [allDialplans, setAllDialplans] = useState<Dialplan[]>([]); // Original data
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Dialplan | null; direction: 'ASC' | 'DSC' }>({
    key: null,
    direction: 'ASC',
  });

  const [isDelete, setIsDelete] = useState(false);
  const [deletedItem, setDeletedItem] = useState<Dialplan | null>(null);

  // Fetch dialplans
  useEffect(() => {
    fetchDialplans();
  }, []);

  const fetchDialplans = async () => {
    try {
      const res = await fetch('https://10.16.7.96/api/dialplans/');
      const data: Dialplan[] = await res.json();
      setAllDialplans(data);
      setDialplans(data);
    } catch (err) {
      console.error('Error fetching dialplans:', err);
      toast({
        title: "Error",
        description: "Failed to fetch dialplans",
        variant: "destructive",
      });
    }
  };

  // Search + Sort + Pagination using useMemo for performance
  const filteredAndSortedDialplans = useMemo(() => {
    let filtered = allDialplans;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.dialplan_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.dialplan_destination?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sorting
    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

        if (aValue == null) return 1;
        if (bValue == null) return -1;

        if (aValue < bValue) return sortConfig.direction === 'ASC' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ASC' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [allDialplans, searchTerm, sortConfig]);

  const paginatedDialplans = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredAndSortedDialplans.slice(start, end);
  }, [filteredAndSortedDialplans, currentPage, itemsPerPage]);

  const totalItems = filteredAndSortedDialplans.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  // Handlers
  const handleEdit = (id: number) => navigate(`/dialplan/${id}`);
  const handleView = (id: number) => navigate(`/dialplan/${id}/view`);
  const handleAddNew = () => navigate('/dialplan-creating');

  const handleDelete = (dialplan: Dialplan) => {
    setDeletedItem(dialplan);
    setIsDelete(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletedItem) return;

    try {
      const res = await fetch(`https://10.16.7.96/api/dialplans/${deletedItem.dialplan_id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast({ title: "Success", description: "Dialplan deleted successfully", variant: "success" });
        fetchDialplans();
      } else {
        throw new Error('Delete failed');
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete dialplan",
        variant: "destructive",
      });
    } finally {
      setIsDelete(false);
      setDeletedItem(null);
    }
  };

  const handleSort = (key: keyof Dialplan) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'ASC' ? 'DSC' : 'ASC',
    }));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };


  return (
    <div className="space-y-8 p-6 mt-8 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dialplan List</h1>
        </div>
        <Button
          onClick={handleAddNew}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium px-6 py-3 rounded-xl shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Dialplan
        </Button>
      </div>

      <Card className="bg-white shadow-lg border border-gray-100 overflow-hidden">
        <CardContent className="p-0">

          {/* Search Section */}
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by name or destination..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-4 py-3 rounded-xl bg-white w-full"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead
                    className="px-4 py-3 text-left text-sm font-bold text-gray-900 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('dialplan_name')}
                  >
                    <div className="flex items-center gap-2">
                      Name <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="px-4 py-3 text-left text-sm font-bold text-gray-900 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('dialplan_destination')}
                  >
                    <div className="flex items-center gap-2">
                      Destination <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </TableHead>
                  <TableHead className="px-4 py-3 text-left text-sm font-bold text-gray-900">Hostname</TableHead>
                  <TableHead className="px-4 py-3 text-left text-sm font-bold text-gray-900">Context</TableHead>
                  <TableHead className="px-4 py-3 text-left text-sm font-bold text-gray-900">Continue</TableHead>
                  <TableHead className="px-4 py-3 text-left text-sm font-bold text-gray-900">Domain</TableHead>
                  <TableHead className="px-4 py-3 text-left text-sm font-bold text-gray-900">Description</TableHead>
                  <TableHead className="px-4 py-3 text-center text-sm font-bold text-gray-900">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100">
                {paginatedDialplans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-gray-500">
                      No dialplans found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedDialplans.map((dialplan) => (
                    <TableRow
                      key={dialplan.dialplan_id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onDoubleClick={() => handleView(dialplan.dialplan_id)}
                    >
                      <TableCell className="px-4 py-3 font-medium text-sm">{dialplan.dialplan_name}</TableCell>
                      <TableCell className="px-4 py-3">
                        <Badge variant="outline" className="text-xs">{dialplan.dialplan_destination}</Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm">{dialplan.hostname}</TableCell>
                      <TableCell className="px-4 py-3 text-sm">{dialplan.dialplan_context}</TableCell>
                      <TableCell className="px-4 py-3">
                        <Badge variant={dialplan.dialplan_continue ? 'default' : 'secondary'} className="text-xs">
                          {dialplan.dialplan_continue ? 'true' : 'false'}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm">{dialplan.domain_name || dialplan.domain_id}</TableCell>
                      <TableCell className="px-4 py-3 text-sm max-w-xs truncate">
                        {dialplan.dialplan_description || '-'}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(dialplan.dialplan_id)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(dialplan)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50">
            <div className="text-sm text-gray-600">
              Showing {totalItems === 0 ? 0 : startIndex + 1} to{' '}
              {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} entries
            </div>

            <div className="flex items-center gap-4">
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border rounded-md px-3 py-1 text-sm bg-white"
              >
                {[10, 20, 30, 50].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm font-medium">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>

      <DialplanDeleteDialog
        isOpen={isDelete}
        onClose={() => setIsDelete(false)}
        onConfirm={handleDeleteConfirm}
        dialplanName={deletedItem?.dialplan_name}
      />
    </div>
  );
};

export default DialplanManagement;