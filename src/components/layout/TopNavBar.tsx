import React, { useState, useEffect, useRef, useContext } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bell, Settings, LogOut, Menu, GitBranch, FolderOpen, Plus, Save, Play } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { WebSocketEventContext } from '@/contexts/WebSocketContext';


interface TopNavBarProps {
  onToggleSidebar: () => void;
  isSidebarOpen:any;
  flowName?: string;
  onBackToProjects?: () => void;
  onNewFlow?: () => void;
  onSaveDraft?: () => void;
  onDeploy?: () => void;
}

const TopNavBar: React.FC<TopNavBarProps> = ({
  onToggleSidebar,
  isSidebarOpen,
  flowName,
  onBackToProjects,
  onNewFlow,
  onSaveDraft,
  onDeploy,
}) => {
  const { authState, logout } = useAuth();
  const { toast } = useToast();
  const user = authState.user;
  const navigate = useNavigate();
const [forceOpen, setForceOpen] = useState(false);
const [agentStatus, setAgentStatus] = useState<string | null>(user?.status || null);
  //  const [latestEvent, setLatestEvent] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const wsRef = useRef(null);
  const context = useContext(WebSocketEventContext)
  const latestEvent = context?.latestEvent
  
useEffect(() => {
    const fetchAgentStatus = async () => {
      if (user?.extension && !user?.role?.includes('Admin') && !user?.role?.includes('Supervisor')) {
        const status = await getAgentStatus(user.extension);
        if (status) {
          setAgentStatus(status); 
        }
      }
    };

    fetchAgentStatus();
  }, [user]);
  // useEffect(() => {
  //   wsRef.current = new WebSocket("wss://10.16.7.96:5001");
 
  //   wsRef.current.onopen = () => {
  //     console.log("[📡] WebSocket connected");
  //   };
 
  //   wsRef.current.onmessage = (msg) => {
  //     try {
  //       const data = JSON.parse(msg.data);
  //       console.log("[📥] Event received:", data);
  //       setLatestEvent(data);
  //     } catch (err) {
  //       console.error("Invalid WebSocket data", err);
  //     }
  //   };
 
  //   wsRef.current.onclose = () => {
  //     console.log("[🔌] WebSocket disconnected");
  //   };
 
  //   return () => {
  //     console.log("[🧹] Cleaning up WebSocket connection");
  //     wsRef.current?.close();
  //   };
  // }, []);
 
  // useEffect(() => {
  //   if (!latestEvent) return;
 
  //   const {
  //     Event,
  //     EventType,
  //     Agent,
  //     Status,
  //     Username,
  //     From,
  //     Event: CallEvent,
  //   } = latestEvent;
 
  //   console.log("🔔 New WebSocket message:", latestEvent);
  //   setTeamMembers((prevMembers) =>
  //     prevMembers.map((member) => {
  //       const extension = member.extension;
 
  //       if (Event === "Register" && Username === extension) {
        
  //       }
  //       if (Event === "UnRegister" && Username === extension) {
          
  //       }
  //       if (
  //         Event === "Agent-Status" &&
  //         extension &&
  //         Agent?.startsWith(extension)
  //       ) {
          
  //       }
 
  //       if (EventType === "CALL_EVENT" && From === extension) {
  //         if (CallEvent === "CHANNEL_ANSWER") {
            
  //         }
 
  //         if (CallEvent === "CHANNEL_HANGUP") {
            
  //         }
  //       }
 
  //       return member;
  //     })
  //   );
  // }, [latestEvent]);



 useEffect(() => {
    if (!latestEvent) return;

    const {
      Event,
      EventType,
      Agent,
      Status,
      Username,
      From,
      Event: CallEvent,
    } = latestEvent;

    console.log("🔔 New WebSocket message:", latestEvent);

    setTeamMembers((prevMembers) =>
      prevMembers.map((member) => {
        const extension = member.extension;

        if (Event === 'Register' && Username === extension) {
          return { ...member, isOnline: true };
        }

        if (Event === 'UnRegister' && Username === extension) {
          return { ...member, isOnline: false };
        }

        if (Event === 'Agent-Status' && Agent?.startsWith(extension)) {
          return { ...member, status: Status };
        }

        if (EventType === 'CALL_EVENT' && From === extension) {
          if (CallEvent === 'CHANNEL_ANSWER') {
            return { ...member, onCall: true };
          }
          if (CallEvent === 'CHANNEL_HANGUP') {
            return { ...member, onCall: false };
          }
        }

        return member;
      })
    );
  }, [latestEvent]);





const getAgentStatus = async (stationId: string) => {
  const requestBody = { agent: stationId }; // Use stationId as the agent identifier
  try {
    const response = await axios.post(`https://10.16.7.96:5050/Get-Agent-Status`, requestBody, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.status === 200) {
      const data = response.data;
      console.log('Get Agent Status API Response:', data);
      return data.status; // Assuming the response contains { status: "Online" }
    } else {
      throw new Error('Unexpected response status');
    }
  } catch (error: any) {
    console.error('Get Agent Status API Error:', error);
    toast({ title: 'Error', description: 'Failed to retrieve agent status.', variant: 'destructive' });
    return null;
  }
};



  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available': return 'bg-green-500';
      case 'on break': return 'bg-red-500';
      case 'logged out': return 'bg-orange-500';
      case 'available on demand':
        const hash = user?.firstname?.charCodeAt(0) % 3 || 0;
        return `bg-green-${hash === 0 ? 300 : hash === 1 ? 400 : 500}`;
      default: return 
    }
  };

  const getInitials = () => {
    const firstInitial = user?.firstname ? user.firstname.charAt(0).toUpperCase() : '';
    const lastInitial = user?.lastname ? user.lastname.charAt(0).toUpperCase() : '';
    return `${firstInitial}${lastInitial}` || 'U';
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-50"
    style={{
        left: isSidebarOpen ? '256px' : '78px', 
        width: isSidebarOpen ? 'calc(100% - 256px)' : 'calc(100% - 78px)', 
      }} >
      <div className="flex items-center space-x-4">
      <Button onClick={() => {onToggleSidebar(); }} variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-200">
  <Menu className="w-5 h-5" />
</Button>
      </div>

      <div className="flex items-center space-x-4">
        {onBackToProjects && onNewFlow && onSaveDraft && onDeploy && (
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 text-white px-3 py-1 rounded-md">
        <p className="text-sm font-medium">{flowName}</p>
      </div>
            <Button onClick={onBackToProjects} variant="outline" size="sm" className="text-gray-600 hover:bg-gray-200">
              <FolderOpen className="w-4 h-4 mr-2" /> Back to Projects
            </Button>
            <Button onClick={onNewFlow} variant="outline" size="sm" className="text-gray-600 hover:bg-gray-200">
              <Plus className="w-4 h-4 mr-2" /> New Flow
            </Button>
            <Button onClick={onSaveDraft} className="bg-green-600 hover:bg-green-700 text-white" size="sm">
              <Save className="w-4 h-4 mr-2" /> Save Draft
            </Button>
            <Button onClick={onDeploy} className="bg-blue-600 hover:bg-blue-700 text-white" size="sm">
              <Play className="w-4 h-4 mr-2" /> Deploy
            </Button>
          </div>
        )}

        <div className="flex items-center space-x-4">
          <Avatar className={`w-8 h-8 ${getStatusColor(user?.status)}`}>
            <AvatarFallback className="text-blue font-medium text-sm">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="text-sm font-medium text-gray-900">
              {user?.firstname} {user?.lastname || 'Unknown User'}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              {user?.role && (
                <Badge variant="secondary" className="text-xs capitalize bg-blue-800 text-white">
                  {user.role}
                </Badge>
              )}

              {user?.extension && (
                <Badge variant="secondary" className="text-xs capitalize bg-green-800 text-black">
                  Ext: {user.extension}
                </Badge>
              )}
            {!user?.role?.includes('Admin') && !user?.role?.includes('Supervisor') && agentStatus && (
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(agentStatus)}`}></div>
                  <span className="text-xs text-gray-600 capitalize">{agentStatus}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavBar;