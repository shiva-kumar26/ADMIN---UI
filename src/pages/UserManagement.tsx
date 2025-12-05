import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Plus, ArrowUpDown, Search, Car } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ApiService } from '@/services/api';
import { DirectoryUser } from '@/types/api';
import CustomPagination from './CustomPagination';
import { useSidebar } from '@/components/SidebarContext';

const UserManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isSidebarOpen } = useSidebar();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [users, setUsers] = useState<DirectoryUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://10.16.7.96/api/directory_search/');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const userData = await response.json();
      setUsers(userData);
    } catch (error) {
      console.error('Fetch error:', error); // Log the error for debugging
      toast({
        title: "Error",
        description: `Failed to fetch users: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user_id.toLowerCase().includes(searchTerm.toLowerCase());

    const userRole = user.role.length > 0 ? user.role[0].toLowerCase() : '';
    const matchesRole = roleFilter === 'All Roles' || userRole === roleFilter.toLowerCase();

  const matchesStatus =
  statusFilter === 'All Status' ||
  (user.status?.toLowerCase?.() || '') === statusFilter.toLowerCase();
    return matchesSearch && matchesRole && matchesStatus;
  });
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aField = a[sortField]?.toString().toLowerCase() || '';
    const bField = b[sortField]?.toString().toLowerCase() || '';

    if (aField < bField) return sortDirection === 'asc' ? -1 : 1;
    if (aField > bField) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const paginatedUsers = sortedUsers.slice(startIndex, startIndex + itemsPerPage);

  const deleteUser = async (directoryId: number) => {
    try {
      const response = await fetch(`https://10.16.7.96/api/directory_search/${directoryId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      const success = await deleteUser(userId);
      if (success) {
        setUsers(users.filter(user => user.directory_id !== userId));
        toast({
          title: "User Deleted",
          description: "User has been successfully deleted.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete user",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handleEditUser = (userId: number) => {
    navigate(`/user-details/${userId}?edit=true`);
  };

  const handleRowDoubleClick = (userId: number) => {
    navigate(`/user-details/${userId}`);
  };



  const getRoleBadge = (roles: string[]) => {
    const role = roles.length > 0 ? roles[0].toLowerCase() : 'user';
    const roleColors = {
      admin: 'bg-purple-100 text-purple-800 hover:bg-purple -100',
      supervisor: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
      agent: 'bg-orange-200 text-orange-800 hover:bg-orange-100',
      user: 'bg-gray-100 text-gray-800 hover:bg-gray-100'
    };
    return roleColors[role as keyof typeof roleColors] || roleColors.user;
  };
  const getStatusBadge = (status: string) => {
    if (!status) {
      return <Badge className="bg-white-100 text-white-800">-</Badge>;
    }
    if (status === 'Available') {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{status}</Badge>;
    } else if (status === 'Logged Out') {
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
    }
    else if (status === 'On Break') {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{status}</Badge>;
    }
    else if (status === 'Available (On Demand)') {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{status}</Badge>;
    }
    else {
      return <span> - </span>
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[88vh]">
        <div className="loader" />
      </div>
    );
  }

  return (
 <>
  <div className="flex flex-col items-center mt-2">
    <div
      className={`h-[88vh] flex flex-col mx-1 mb-2 ${!isSidebarOpen ? 'w-full ml-10' : 'max-w-[1230px]'}`}
    >
      <div>
        <div className="flex items-center justify-between">
          <h4 className="font-bold">Users List</h4>
          <Button
            onClick={() => navigate('/user-creation')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New User
          </Button>
        </div>
        <div className="flex gap-4 mt-4 items-center">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-[300px]"
            />
          </div>
          <div className="flex gap-4">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Roles">All Roles</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Supervisor">Supervisor</SelectItem>
                <SelectItem value="Agent">Agent</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Status">All Status</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="On Break">On Break</SelectItem>
                <SelectItem value="Logged Out">Logged Out</SelectItem>
                <SelectItem value="Available (On Demand)">Available (On Demand)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="relative overflow-auto scrollbar-hide mt-4">
        <div className="min-w-full overflow-x-auto scrollbar-hide">
          <div className="flex flex-col justify-between">
            <Table
              className="min-w-full table-auto scrollbar-hide px-2 border-600"
              style={{ height: 'calc(88vh - 120px)' }} // Fixed height based on parent container
            >
              <TableHeader>
                <TableRow className="sticky top-0 z-10 bg-white">
                  <TableHead
                    onClick={() => handleSort('firstname')}
                    className="min-w-[140px] px-4 py-1 bg-gray-50 cursor-pointer text-black"
                  >
                    <div className="flex items-center gap-2">
                      First Name <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[120px] text-black">Last Name</TableHead>
                  <TableHead className="min-w-[120px] text-black">Host Name</TableHead>
                  <TableHead className="min-w-[120px] text-black">Extension</TableHead>
                  <TableHead className="min-w-[120px] text-black">User Name</TableHead>
                  <TableHead className="min-w-[120px] text-black">Role</TableHead>
                  <TableHead className="min-w-[120px] text-black">Queue Name</TableHead>
                  <TableHead className="min-w-[120px] text-black">Status</TableHead>
                  <TableHead className="min-w-[120px] text-black">State</TableHead>
                  <TableHead className="min-w-[120px] text-black">Level</TableHead>
                  <TableHead className="min-w-[120px] text-black">Position</TableHead>
                  <TableHead className="min-w-[120px] text-black">Contact</TableHead>
                  <TableHead className="min-w-[120px] text-center text-black">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="overflow-y-auto" style={{ height: 'calc(88vh - 160px)' }}>
                {paginatedUsers.map((user) => (
                  <TableRow
                    key={user.directory_id}
                    className="hover:bg-gray-50 cursor-pointer h-[50px] border-b border-gray-200"
                    onDoubleClick={() => handleRowDoubleClick(user.directory_id)}
                  >
                    <TableCell className="min-w-[120px] px-4 py-2 font-medium">{user.firstname}</TableCell>
                    <TableCell className="min-w-[120px] px-3 py-2">{user.lastname}</TableCell>
                    <TableCell className="min-w-[120px] px-3 py-2">{user.hostname || '-'}</TableCell>
                    <TableCell className="min-w-[120px] px-3 py-2">{user.extension || '-'}</TableCell>
                    <TableCell className="min-w-[120px] px-3 py-2">{user.user_id}</TableCell>
                    <TableCell className="min-w-[120px] px-3 py-2">
                      <Badge className={getRoleBadge(user.role)}>
                        {Array.isArray(user.role) && user.role.length > 0
                          ? user.role.join(', ')
                          : 'User'}
                      </Badge>
                    </TableCell>
                    <TableCell className="min-w-[120px] px-3 py-2">
                      {Array.isArray(user.queue) && user.queue.length > 0
                        ? user.queue.join(', ')
                        : '-'}
                    </TableCell>
                    <TableCell className="min-w-[120px] px-3 py-2">{getStatusBadge(user.status)}</TableCell>
                    <TableCell className="min-w-[120px] px-3 py-2">{user.state}</TableCell>
                    <TableCell className="min-w-[120px] px-3 py-2">{user.level || '-'}</TableCell>
                    <TableCell className="min-w-[120px] px-3 py-2">{user.position || '-'}</TableCell>
                    <TableCell className="min-w-[120px] px-3 py-2">{user.contact || '-'}</TableCell>
                    <TableCell className="min-w-[120px] px-3 py-2">
                      <div className="flex space-x-2 justify-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditUser(user.directory_id);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteUser(user.directory_id);
                          }}
                          className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedUsers.length === 0 && (
                  <TableRow className="border-b border-gray-200 h-[50px]">
                    <TableCell colSpan={13} className="text-center px-4 py-2 text-gray-500">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      <div className="w-full flex justify-between items-center border-t border-gray-200 px-4 py-3 bg-white sticky bottom-0 z-10">
        {/* Record Count */}
        <span className="text-sm text-gray-600">
          Showing {startIndex + 1} to {startIndex + paginatedUsers.length} of {filteredUsers.length} Records
        </span>

        {/* Pagination Controls */}
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
              {[5, 10, 25, 50, 100].map((num) => (
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
</>

  );
};

export default UserManagement;
