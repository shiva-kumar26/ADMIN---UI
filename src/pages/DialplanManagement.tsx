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
        toast({ title: "Success", description: "Dialplan deleted successfully" });
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
    <div className="flex flex-col items-center p-4">
      <Card className={`w-full h-[88vh] flex flex-col ${!isSidebarOpen ? 'ml-10' : ''}`}>
        <CardHeader className="flex-shrink-0 space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">Dialplan List</CardTitle>
            <Button
              onClick={handleAddNew}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Dialplan
            </Button>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search by name or destination..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="pl-10"
            />
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0">
          <div className="h-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead
                    className="cursor-pointer hover:bg-gray-100 font-bold text-gray-900"
                    onClick={() => handleSort('dialplan_name')}
                  >
                    <div className="flex items-center gap-2">
                      Name <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-100 font-bold text-gray-900"
                    onClick={() => handleSort('dialplan_destination')}
                  >
                    <div className="flex items-center gap-2">
                      Destination <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-900">Hostname</TableHead>
                  <TableHead className="font-bold text-gray-900">Context</TableHead>
                  <TableHead className="font-bold text-gray-900">Continue</TableHead>
                  <TableHead className="font-bold text-gray-900">Domain</TableHead>
                  <TableHead className="font-bold text-gray-900">Description</TableHead>
                  <TableHead className="text-center font-bold text-gray-900">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
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
                      className="hover:bg-gray-50 cursor-pointer"
                      onDoubleClick={() => handleView(dialplan.dialplan_id)}
                    >
                      <TableCell className="font-medium">{dialplan.dialplan_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{dialplan.dialplan_destination}</Badge>
                      </TableCell>
                      <TableCell>{dialplan.hostname}</TableCell>
                      <TableCell>{dialplan.dialplan_context}</TableCell>
                      <TableCell>
                        <Badge variant={dialplan.dialplan_continue ? 'default' : 'secondary'}>
                          {dialplan.dialplan_continue ? 'true' : 'false'}
                        </Badge>
                      </TableCell>
                      <TableCell>{dialplan.domain_name || dialplan.domain_id}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {dialplan.dialplan_description || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(dialplan.dialplan_id)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
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
        </CardContent>

        <CardFooter className="border-t bg-white flex justify-between items-center py-3">
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
              className="border rounded px-3 py-1 text-sm"
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
                ‹
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages || 1}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                ›
              </Button>
            </div>
          </div>
        </CardFooter>
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