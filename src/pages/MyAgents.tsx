import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { User as UserIcon, Search, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocketEvent } from '@/contexts/WebSocketContext';


interface Agent {
  id: string;
  firstname: string;
  lastname: string;
  stationId: string;
  status: 'Available' | 'On Break' | 'Logged Out' | 'Waiting' | 'Available (On Demand)';
  inCall: boolean;
}


const MyAgents = () => {
  const { toast } = useToast();
  const { authState, updateUserStatus } = useAuth();
  const { teamMembers, setTeamMembers } = useWebSocketEvent();
  const user = authState.user;
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);


  const agentStatuses = [
    'Available',
    'On Break',
    'Available (On Demand)',
    'Logged Out',
  ];


  // Initialize agents from user data OR teamMembers
  useEffect(() => {
    const fetchInitialAgentStatuses = async () => {
      console.log("🔵 MyAgents: Initializing agents...");
      console.log("🔵 User:", user);
      console.log("🔵 TeamMembers from context:", teamMembers);


      // Use teamMembers if available, otherwise use user.agents
      const sourceAgents = teamMembers.length > 0 ? teamMembers : user?.agents || [];
      
      if (!sourceAgents || sourceAgents.length === 0) {
        console.warn('❌ No agents available from any source');
        setLoading(false);
        return;
      }


      try {
        const filteredAgents = sourceAgents.filter(
          (agent) => agent.supervisor_reference === user.user_id || teamMembers.length > 0
        );
        
        console.log("🔵 Filtered agents:", filteredAgents);


        const mappedAgents = await Promise.all(
          filteredAgents.map(async (agent) => {
            const extension = agent.extension || agent.stationId;
            const currentStatus = await getAgentStatus(extension);
            const validStatus = currentStatus || agent.status || 'Logged Out';


            return {
              id: agent.id || agent.user_id || `agent_${extension}`,
              firstname: agent.firstname || agent.fullname?.split(' ')[0] || 'Agent',
              lastname: agent.lastname || agent.fullname?.split(' ')[1] || extension,
              stationId: extension,
              status: validStatus as Agent['status'],
              inCall: !!agent.inCall,
            };
          })
        );
        
        setAgents(mappedAgents);
        console.log('✅ Processed agents with fetched statuses:', mappedAgents);
      } catch (error) {
        console.error('❌ Error processing agent data or fetching statuses:', error);
        toast({
          title: 'Error',
          description: 'Failed to process agent data or fetch statuses.',
          variant: 'destructive',
        });
      }
      
      setLoading(false);
    };


    fetchInitialAgentStatuses();
  }, [user, teamMembers, toast]);


  // ✅ NEW FUNCTION: Refresh only agent statuses (Same as Supervisor Dashboard)
  const refreshOnlyStatuses = async () => {
    if (!agents || agents.length === 0) return;

    try {
      const updated = await Promise.all(
        agents.map(async (agent) => {
          const status = await getAgentStatus(agent.stationId);

          return {
            ...agent,
            status: status || agent.status,
          };
        })
      );

      setAgents(updated);
      console.log('✅ Agent statuses refreshed:', updated);
    } catch (error) {
      console.error('❌ Error refreshing agent statuses:', error);
    }
  };


  // ✅ POLLING INTERVAL: Refresh statuses every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshOnlyStatuses();
    }, 2000);

    return () => clearInterval(interval);
  }, [agents]);


  // Handle WebSocket events - Update agents when teamMembers change
  useEffect(() => {
    if (teamMembers.length > 0 && agents.length > 0) {
      console.log("🔄 Syncing agents with teamMembers updates");
      
      setAgents((prevAgents) =>
        prevAgents.map((agent) => {
          const updatedMember = teamMembers.find(
            (member) => member.extension === agent.stationId
          );
          
          if (updatedMember) {
            return {
              ...agent,
              status: updatedMember.status as Agent['status'],
            };
          }
          
          return agent;
        })
      );
    }
  }, [teamMembers]);


  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900';
      case 'logged out':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200 hover:text-gray-900';
      case 'on break':
        return 'bg-red-100 text-red-800 hover:bg-red-200 hover:text-red-900';
      case 'waiting':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200 hover:text-blue-900';
      case 'available (on demand)':
        return 'bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200 hover:text-gray-900';
    }
  };


  const getStatusColorSelection = (status: string): string => {
    switch (status) {
      case 'Available':
        return 'bg-green-500';
      case 'On Break':
        return 'bg-red-500';
      case 'Available (On Demand)':
        return 'bg-green-500';
      case 'Logged Out':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };


  const getAgentCircleColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'bg-gradient-to-r from-green-500 to-green-700 text-white';
      case 'logged out':
        return 'bg-gradient-to-r from-gray-500 to-gray-700 text-white';
      case 'on break':
        return 'bg-gradient-to-r from-red-500 to-red-700 text-white';
      case 'waiting':
        return 'bg-gradient-to-r from-blue-500 to-blue-700 text-white';
      case 'available (on demand)':
        return 'bg-gradient-to-r from-green-500 to-green-700 text-white';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-700 text-white';
    }
  };


  const filteredAgents = agents.filter(
    (agent) =>
      agent.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.stationId.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const getAgentStatus = async (stationId: string) => {
    const requestBody = { agent: stationId };
    try {
      const response = await axios.post('https://10.16.7.96:5050/Get-Agent-Status', requestBody, {
        headers: { 'Content-Type': 'application/json' },
      });


      if (response.status === 200) {
        return response.data.status;
      }
    } catch (error: any) {
      console.error('Get Agent Status API Error:', error);
      return null;
    }
  };


  const handleStatusChange = async (agentId: string, newStatus: Agent['status']) => {
    const agent = agents.find((a) => a.id === agentId);
    if (!agent) {
      console.error('Agent not found for ID:', agentId);
      toast({ title: 'Error', description: 'Agent not found.', variant: 'destructive' });
      return;
    }


    const requestBody = { agent: agent.stationId, status: newStatus };
    try {
      const response = await axios.post('https://10.16.7.96:5050/Set-Agent-Status', requestBody, {
        headers: { 'Content-Type': 'application/json' },
      });


      if (response.status === 200) {
        toast({ title: 'Success', description: 'Agent status updated successfully.' });
        updateUserStatus(newStatus);


        const updatedStatus = await getAgentStatus(agent.stationId);
        if (updatedStatus) {
          setAgents((prevAgents) =>
            prevAgents.map((a) => (a.id === agentId ? { ...a, status: updatedStatus } : a))
          );
        }
      }
    } catch (error) {
      console.error('Error setting agent status:', error);
      toast({ title: 'Error', description: 'Failed to update agent status.', variant: 'destructive' });
    }
  };


  const handleRowClick = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowModal(true);
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading agents...</div>
      </div>
    );
  }


  if (!agents.length) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="text-lg text-gray-600 mb-2">No agents found.</div>
        <div className="text-sm text-gray-400">Please check that user.agents is populated</div>
      </div>
    );
  }


  return (
    <div className="space-y-6 h-[calc(100vh-64px)] overflow-y-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <UserIcon className="w-5 h-5" />
              <span>Agent List ({agents.length})</span>
            </CardTitle>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Station ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>In Call</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgents.map((agent) => (
                <TableRow key={agent.id} onClick={() => handleRowClick(agent)} className="cursor-pointer">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${getAgentCircleColor(agent.status)}`}>
                        {agent.firstname.charAt(0)}
                        {agent.lastname.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {agent.firstname} {agent.lastname}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{agent.stationId}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(agent.status)}>{agent.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {agent.inCall ? (
                        <>
                          <Phone className="w-4 h-4 text-green-500 animate-pulse" />
                          <span className="text-green-600 text-sm font-medium">Yes</span>
                        </>
                      ) : (
                        <>
                          <Phone className="w-4 h-4 text-gray-300" />
                          <span className="text-gray-500 text-sm">No</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={agent.status}
                      onValueChange={(value: Agent['status']) => handleStatusChange(agent.id, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {agentStatuses.map((status) => (
                          <SelectItem
                            key={status}
                            value={status}
                            disabled={
                              (agent.status === 'Available' ||
                               agent.status === 'Available (On Demand)' ||
                               agent.status === 'On Break' ||
                               agent.status === 'Logged Out') &&
                              (status === 'Available' || status === 'Available (On Demand)')
                            }
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 ${getStatusColorSelection(status)} rounded-full`} />
                              {status}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>


      {showModal && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Agent Details</h2>
            <p><strong>ID:</strong> {selectedAgent.id}</p>
            <p><strong>Name:</strong> {selectedAgent.firstname} {selectedAgent.lastname}</p>
            <p><strong>Station ID:</strong> {selectedAgent.stationId}</p>
            <p><strong>Status:</strong> {selectedAgent.status}</p>
            <Button onClick={() => setShowModal(false)} className="mt-4">
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};


export default MyAgents;