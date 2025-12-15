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
  status: 'Available' | 'On Break' | 'Logged Out' | 'Waiting' | 'Available (On Demand)' | 'Busy';
  inCall: boolean;
}

const MyAgents = () => {
  const { toast } = useToast();
  const { authState, updateUserStatus } = useAuth();
  const { teamMembers } = useWebSocketEvent();
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
    'Busy',
    'Logged Out',
  ];

  // -------------------------------  
  // BADGE + DOT COLORS  
  // -------------------------------
  const getStatusBadgeStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return "bg-green-600 text-white";
      case 'available (on demand)':
        return "bg-green-400 text-white";
      case 'busy':
        return "bg-red-600 text-white";
      case 'on break':
        return "bg-yellow-500 text-black";
      case 'logged out':
        return "bg-gray-800 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusDotColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return "bg-green-600";
      case 'available (on demand)':
        return "bg-green-400";
      case 'busy':
        return "bg-red-600";
      case 'on break':
        return "bg-yellow-500";
      case 'logged out':
        return "bg-gray-700";
      default:
        return "bg-gray-500";
    }
  };

  // -------------------------------
  // INITIAL LOAD  
  // -------------------------------
  useEffect(() => {
    const fetchInitialAgentStatuses = async () => {
      const sourceAgents = teamMembers.length > 0 ? teamMembers : user?.agents || [];
      if (!sourceAgents || sourceAgents.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const filteredAgents = sourceAgents.filter(
          (agent) => agent.supervisor_reference === user.user_id || teamMembers.length > 0
        );

        const mappedAgents = await Promise.all(
          filteredAgents.map(async (agent) => {
            const extension = agent.extension || agent.stationId;
            const currentStatus = await getAgentStatus(extension);
            const validStatus = currentStatus || agent.status || 'Logged Out';

            return {
              id: agent.id || agent.user_id || `agent_${extension}`,
              firstname: agent.firstname || agent.fullname?.split(' ')[0] || 'Agent',
              lastname: agent.lastname || agent.fullname?.split(' ')[1] || '',
              stationId: extension,
              status: validStatus as Agent['status'],
              inCall: validStatus === "Busy",
            };
          })
        );

        setAgents(mappedAgents);
      } catch (error) {
        console.error(error);
        toast({
          title: 'Error',
          description: 'Failed to fetch agent statuses',
          variant: 'destructive',
        });
      }

      setLoading(false);
    };

    fetchInitialAgentStatuses();
  }, [user, teamMembers, toast]);

  // -------------------------------
  // POLLING STATUS REFRESH  
  // -------------------------------
  const refreshOnlyStatuses = async () => {
    try {
      const response = await axios.get('http://10.16.7.91:5001/realtime_agents');
      if (!Array.isArray(response.data)) return;

      const realtime = response.data;

      setAgents((prevAgents) =>
        prevAgents.map((agent) => {
          const rt = realtime.find((r: any) => r.Extension == agent.stationId);
          return rt
            ? { ...agent, status: rt.status, inCall: rt.status === "Busy" }
            : agent;
        })
      );
    } catch (error) {
      console.error("Status refresh error:", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(refreshOnlyStatuses, 2000);
    return () => clearInterval(interval);
  }, []);

  // -------------------------------
  // WEBSOCKET SYNC  
  // -------------------------------
  useEffect(() => {
    if (teamMembers.length > 0) {
      setAgents((prevAgents) =>
        prevAgents.map((agent) => {
          const updated = teamMembers.find((m) => m.extension === agent.stationId);
          return updated ? { ...agent, status: updated.status } : agent;
        })
      );
    }
  }, [teamMembers]);

  // -------------------------------
  // API: GET STATUS  
  // -------------------------------
  const getAgentStatus = async (stationId: string) => {
    try {
      const response = await axios.get('http://10.16.7.91:5001/realtime_agents');
      const agent = response.data.find((a: any) => a.Extension == stationId);
      return agent?.status || null;
    } catch (error) {
      console.error("Realtime Agents API Error:", error);
      return null;
    }
  };

  // -------------------------------
  // STATUS CHANGE  
  // -------------------------------
  const handleStatusChange = async (agentId: string, newStatus: Agent['status']) => {
    const agent = agents.find((a) => a.id === agentId);
    if (!agent) return;

    try {
      await axios.post(
        'https://10.16.7.96:5050/Set-Agent-Status',
        { agent: agent.stationId, status: newStatus },
        { headers: { 'Content-Type': 'application/json' } }
      );

      updateUserStatus(newStatus);

      const updatedStatus = await getAgentStatus(agent.stationId);
      if (updatedStatus) {
        setAgents((prevAgents) =>
          prevAgents.map((a) =>
            a.id === agentId ? { ...a, status: updatedStatus } : a
          )
        );
      }
    } catch (error) {
      console.error("Status update failed:", error);
      toast({
        title: 'Error',
        description: 'Failed to update agent status.',
        variant: 'destructive',
      });
    }
  };

  const handleRowClick = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowModal(true);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading agents...</div>;
  }

  if (!agents.length) {
    return <div className="flex justify-center items-center h-64">No agents found.</div>;
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
              {agents
                .filter((agent) =>
                  `${agent.firstname} ${agent.lastname} ${agent.stationId}`
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
                )
                .map((agent) => (
                  <TableRow
                    key={agent.id}
                    onClick={() => handleRowClick(agent)}
                    className="cursor-pointer"
                  >
                    {/* --------------- Agent Name --------------- */}
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          {agent.firstname[0]}
                          {agent.lastname[0]}
                        </div>
                        <div className="font-medium">
                          {agent.firstname} {agent.lastname}
                        </div>
                      </div>
                    </TableCell>

                    {/* --------------- Station --------------- */}
                    <TableCell className="font-mono">{agent.stationId}</TableCell>

                    {/* --------------- Status Badge --------------- */}
                    <TableCell>
                      <Badge className={`${getStatusBadgeStyle(agent.status)} px-3 py-1 rounded-full`}>
                        {agent.status}
                      </Badge>
                    </TableCell>

                    {/* --------------- In Call --------------- */}
                    <TableCell>
                      {agent.inCall ? (
                        <span className="text-green-600 font-medium">Yes</span>
                      ) : (
                        <span className="text-gray-500">No</span>
                      )}
                    </TableCell>

                    {/* --------------- Dropdown --------------- */}
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Select
                        value={agent.status}
                        onValueChange={(value) =>
                          handleStatusChange(agent.id, value as any)
                        }
                      >
                        {/* Trigger with colored pill */}
                        <SelectTrigger className="w-40">
                          <div
                            className={`px-2 py-1 rounded text-sm font-medium ${getStatusBadgeStyle(
                              agent.status
                            )}`}
                          >
                            {agent.status}
                          </div>
                        </SelectTrigger>

                        {/* Options with colored dots */}
                        <SelectContent>
                          {agentStatuses.map((status) => (
                            <SelectItem
                              key={status}
                              value={status}
                              disabled={
                                agent.status === "Logged Out"
                                  ? status !== "Logged Out"
                                  : false
                              }
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-3 h-3 rounded-full ${getStatusDotColor(
                                    status
                                  )}`}
                                />
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

      {/* --------------- Modal --------------- */}
      {showModal && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
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
