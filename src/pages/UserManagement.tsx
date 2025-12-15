import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  User, Search, Plus, Edit, Trash2, X, 
  Shield, UserCheck, Activity, Phone,
  ArrowUpDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ApiService } from '@/services/api';
import { DirectoryUser } from '@/types/api';
import { useGlobalUsers } from '@/contexts/GlobalUsersContext';

const UserManagement = () => {
  const { users, loading, refreshUsers } = useGlobalUsers();
  const navigate = useNavigate();
  const { toast } = useToast();

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<string>('firstname');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [realtimeStatuses, setRealtimeStatuses] = useState<Record<string, string>>({});

  // Modal States
  const [showTotalModal, setShowTotalModal] = useState(false);
  const [showAdminsModal, setShowAdminsModal] = useState(false);
  const [showSupervisorsModal, setShowSupervisorsModal] = useState(false);
  const [showAgentsModal, setShowAgentsModal] = useState(false);
  const [showOnlineModal, setShowOnlineModal] = useState(false);

  // Realtime Status Polling
  useEffect(() => {
    const fetchRealtimeStatus = async () => {
      try {
        const response = await fetch('http://10.16.7.91:5001/realtime_agents');
        if (response.ok) {
          const data = await response.json();
          const statusMap: Record<string, string> = {};
          if (Array.isArray(data)) {
            data.forEach((agent: any) => {
              if (agent.Extension) {
                statusMap[agent.Extension] = agent.status || 'Logged Out';
              }
            });
          }
          setRealtimeStatuses(statusMap);
        }
      } catch (error) {
        console.error('Failed to fetch realtime agent status', error);
      }
    };

    fetchRealtimeStatus();
    const interval = setInterval(fetchRealtimeStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Helper: Check if user is Agent
  const isAgent = (user: DirectoryUser) => {
    return user.role.some(r => r.toLowerCase() === 'agent');
  };

  // Get display status: N/A for Admin/Supervisor, real-time for Agents
  const getDisplayStatus = (user: DirectoryUser) => {
    if (!isAgent(user)) {
      return 'N/A';
    }
    return realtimeStatuses[user.extension] || 'Logged Out';
  };

  // Filtering for main table
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.extension && user.extension.includes(searchTerm));

    const userRole = user.role.length > 0 ? user.role[0].toLowerCase() : '';
    const matchesRole = roleFilter === 'All Roles' || userRole === roleFilter.toLowerCase();

    const displayStatus = getDisplayStatus(user);
    const matchesStatus = statusFilter === 'All Status' || 
      displayStatus.toLowerCase().includes(statusFilter.toLowerCase());

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Sorting & Pagination
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aVal = (a as any)[sortField]?.toString().toLowerCase() || '';
    const bVal = (b as any)[sortField]?.toString().toLowerCase() || '';
    return sortDirection === 'asc' 
      ? aVal.localeCompare(bVal) 
      : bVal.localeCompare(aVal);
  });

  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const paginatedUsers = sortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Actions
  const handleDeleteUser = async (userId: number) => {
    try {
      const success = await ApiService.deleteUser(userId);
      if (success) {
        await refreshUsers();
        toast({ title: "Success", description: "User deleted successfully." });
      } else {
        toast({ title: "Error", description: "Failed to delete user", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete user", variant: "destructive" });
    }
  };

  const handleEditUser = (userId: number) => {
    navigate(`/user-details/${userId}?edit=true`);
  };

  const handleRowDoubleClick = (userId: number) => {
    navigate(`/user-details/${userId}`);
  };

  // Badge Styles
  const getRoleBadge = (roles: string[]) => {
    const role = roles.length > 0 ? roles[0].toLowerCase() : 'user';
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'supervisor': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'agent': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'N/A') {
      return 'bg-gray-100 text-gray-700 border-gray-200';
    }
    const s = status?.toLowerCase() || '';
    if (s.includes('available') || s.includes('busy')) return 'bg-green-100 text-green-800 border-green-200';
    if (s.includes('break')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // Stats
  const totalUsers = users.length;
  const admins = users.filter(u => u.role.some(r => r.toLowerCase() === 'admin'));
  const supervisors = users.filter(u => u.role.some(r => r.toLowerCase() === 'supervisor'));
  const agents = users.filter(u => u.role.some(r => r.toLowerCase() === 'agent'));
  const onlineUsers = agents.filter(u => {
    const status = realtimeStatuses[u.extension];
    return status && (status.toLowerCase().includes('available') || status.toLowerCase().includes('busy'));
  });

  // Modal with CLEARLY VISIBLE Close Button
  const UserListModal = ({ isOpen, onClose, title, icon: Icon, usersList, color = 'blue' }: any) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden" onClick={e => e.stopPropagation()}>
          <div className={`bg-gradient-to-r from-${color}-600 to-${color === 'purple' ? 'indigo' : color}-700 p-6 text-white relative`}>
            <div className="flex items-center gap-4 pr-12">
              {Icon && <Icon className="w-10 h-10" />}
              <div>
                <h2 className="text-2xl font-bold">{title}</h2>
                <p className="text-sm opacity-90">{usersList.length} user{usersList.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* PROMINENT CLOSE BUTTON - Now clearly visible */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all shadow-lg hover:shadow-xl border border-white/30"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
            {usersList.length === 0 ? (
              <p className="text-center text-gray-500 py-12">No users in this category</p>
            ) : (
              <div className="space-y-3">
                {usersList.map((user: DirectoryUser) => (
                  <div key={user.directory_id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {user.firstname[0]}{user.lastname[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-lg">
                            {user.firstname} {user.lastname}
                          </p>
                          <p className="text-sm text-gray-600">
                            {user.user_id} • Ext: {user.extension || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`${getRoleBadge(user.role)} px-4 py-2 font-medium`}>
                          {user.role.join(', ')}
                        </Badge>
                        <Badge className={`${getStatusBadge(getDisplayStatus(user))} px-4 py-2 font-medium`}>
                          {getDisplayStatus(user)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              User Management
            </h1>
            <p className="text-gray-600 mt-1">Manage all users, roles, and real-time statuses in one place.</p>
          </div>
          <Button
            onClick={() => navigate('/user-creation')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium px-6 py-3 rounded-xl shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New User
          </Button>
        </div>

        {/* Clickable Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card 
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105"
            onClick={() => setShowTotalModal(true)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-2">Total Users</p>
                  <h3 className="text-5xl font-bold">{totalUsers}</h3>
                  <p className="text-xs text-blue-100 mt-3">Click to view all</p>
                </div>
                <User className="w-8 h-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0 shadow-lg hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105"
            onClick={() => setShowAdminsModal(true)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium mb-2">Admins</p>
                  <h3 className="text-5xl font-bold">{admins.length}</h3>
                  <p className="text-xs text-purple-100 mt-3">Click to view</p>
                </div>
                <Shield className="w-8 h-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0 shadow-lg hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105"
            onClick={() => setShowSupervisorsModal(true)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-2">Supervisors</p>
                  <h3 className="text-5xl font-bold">{supervisors.length}</h3>
                  <p className="text-xs text-blue-100 mt-3">Click to view</p>
                </div>
                <UserCheck className="w-8 h-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-orange-500 to-amber-600 text-white border-0 shadow-lg hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105"
            onClick={() => setShowAgentsModal(true)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium mb-2">Agents</p>
                  <h3 className="text-5xl font-bold">{agents.length}</h3>
                  <p className="text-xs text-orange-100 mt-3">Click to view</p>
                </div>
                <Phone className="w-8 h-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105"
            onClick={() => setShowOnlineModal(true)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium mb-2">Online Now</p>
                  <h3 className="text-5xl font-bold animate-pulse">{onlineUsers.length}</h3>
                  <p className="text-xs text-green-100 mt-3">Click to view</p>
                </div>
                <Activity className="w-8 h-8 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white shadow-lg border border-gray-100">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search by name, username, or extension..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 rounded-xl"
                />
              </div>
              <div className="flex gap-3">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
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
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Status">All Status</SelectItem>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Busy">Busy</SelectItem>
                    <SelectItem value="On Break">On Break</SelectItem>
                    <SelectItem value="Logged Out">Logged Out</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Users Table - HEADINGS SIZE INCREASED */}
        <Card className="bg-white shadow-lg border border-gray-100 overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th onClick={() => handleSort('firstname')} className="px-6 py-4 text-left text-base font-bold text-gray-900 cursor-pointer hover:bg-gray-100">
                      <div className="flex items-center gap-2">
                        First Name <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-base font-bold text-gray-900">Last Name</th>
                    <th className="px-6 py-4 text-left text-base font-bold text-gray-900">Extension</th>
                    <th className="px-6 py-4 text-left text-base font-bold text-gray-900">Username</th>
                    <th className="px-6 py-4 text-left text-base font-bold text-gray-900">Role</th>
                    <th className="px-6 py-4 text-left text-base font-bold text-gray-900">Queue</th>
                    <th className="px-6 py-4 text-left text-base font-bold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-left text-base font-bold text-gray-900">Level</th>
                    <th className="px-6 py-4 text-left text-base font-bold text-gray-900">Position</th>
                    <th className="px-6 py-4 text-left text-base font-bold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedUsers.map((user) => (
                    <tr
                      key={user.directory_id}
                      onDoubleClick={() => handleRowDoubleClick(user.directory_id)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {user.firstname[0]}{user.lastname[0]}
                          </div>
                          <span className="font-medium">{user.firstname}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{user.lastname}</td>
                      <td className="px-6 py-4 font-mono text-sm">{user.extension || '-'}</td>
                      <td className="px-6 py-4">{user.user_id}</td>
                      <td className="px-6 py-4">
                        <Badge className={getRoleBadge(user.role)}>
                          {user.role.length > 0 ? user.role.join(', ') : 'User'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {user.queue?.length > 0 ? user.queue.join(', ') : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getStatusBadge(getDisplayStatus(user))}>
                          {getDisplayStatus(user)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center">{user.level || '-'}</td>
                      <td className="px-6 py-4 text-center">{user.position || '-'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleEditUser(user.directory_id); }}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={(e) => { e.stopPropagation(); handleDeleteUser(user.directory_id); }}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginatedUsers.length === 0 && (
                    <tr>
                      <td colSpan={10} className="text-center py-12 text-gray-500">
                        No users found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50">
              <div className="text-sm text-gray-600">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, sortedUsers.length)} of {sortedUsers.length} users
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <span>Rows per page:</span>
                  <Select 
                    value={itemsPerPage.toString()} 
                    onValueChange={(value) => {
                      setItemsPerPage(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-20 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages || 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals with improved close button */}
      <UserListModal isOpen={showTotalModal} onClose={() => setShowTotalModal(false)} title="All Users" icon={User} usersList={users} color="blue" />
      <UserListModal isOpen={showAdminsModal} onClose={() => setShowAdminsModal(false)} title="Admin Users" icon={Shield} usersList={admins} color="purple" />
      <UserListModal isOpen={showSupervisorsModal} onClose={() => setShowSupervisorsModal(false)} title="Supervisors" icon={UserCheck} usersList={supervisors} color="blue" />
      <UserListModal isOpen={showAgentsModal} onClose={() => setShowAgentsModal(false)} title="Agents" icon={Phone} usersList={agents} color="orange" />
      <UserListModal isOpen={showOnlineModal} onClose={() => setShowOnlineModal(false)} title="Online Users" icon={Activity} usersList={onlineUsers} color="green" />
    </div>
  );
};

export default UserManagement;