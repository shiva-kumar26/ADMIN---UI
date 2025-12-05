import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';


interface TopNavBarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: any;
}


const TopNavBar: React.FC<TopNavBarProps> = ({
  onToggleSidebar,
  isSidebarOpen,
}) => {
  const { authState, logout } = useAuth();
  const { toast } = useToast();
  const user = authState.user;
  const navigate = useNavigate();
  const [agentStatus, setAgentStatus] = useState<string | null>(user?.status || null);
  
  // ✅ Initialize from sessionStorage OR URL parameter
  const [supervisorMode, setSupervisorMode] = useState(() => {
    // Check URL parameter first
    const params = new URLSearchParams(window.location.search);
    const urlMode = params.get('mode');
    console.log('🔍 URL mode parameter:', urlMode);
    
    if (urlMode === 'agent') {
      console.log('📍 Agent mode from URL');
      return false;
    }
    if (urlMode === 'supervisor') {
      console.log('📍 Supervisor mode from URL');
      return true;
    }
    
    // Fall back to sessionStorage
    const stored = sessionStorage.getItem('supervisorMode');
    console.log('🔍 SessionStorage mode:', stored);
    return stored ? JSON.parse(stored) : false;
  });
  
  const [isToggling, setIsToggling] = useState(false);


  // ✅ Sync mode on mount
  useEffect(() => {
    console.log('🔄 Component mounted - syncing supervisorMode');
    setIsToggling(false);
    
    // Log current state
    console.log('📊 Current supervisorMode:', supervisorMode);
    console.log('📊 Current URL:', window.location.href);
  }, []);


  // ✅ Persist supervisorMode
  useEffect(() => {
    sessionStorage.setItem('supervisorMode', JSON.stringify(supervisorMode));
    console.log('📍 Mode persisted to sessionStorage:', supervisorMode);
  }, [supervisorMode]);


  useEffect(() => {
    const fetchAgentStatus = async () => {
      if (user?.extension) {
        const status = await getAgentStatus(user.extension);
        if (status) {
          setAgentStatus(status);
        }
      }
    };


    fetchAgentStatus();
  }, [user]);


  // ==================== TOGGLE HANDLER ====================
  const handleToggle = async () => {
    if (isToggling) {
      console.warn('⚠️ Already toggling');
      return;
    }
    
    try {
      setIsToggling(true);
      console.log('🔄 Toggle clicked, current mode:', supervisorMode);
      
      if (supervisorMode) {
        // ✅ Switch to Agent Mode
        console.log('🔵 Switching to Agent Mode...');
        
        sessionStorage.removeItem('supervisorData');
        sessionStorage.removeItem('supervisorMode');
        setSupervisorMode(false);
        
        console.log('🔗 Redirecting to Agent UI with mode=agent param');
        
        setTimeout(() => {
          window.location.href = 'https://10.16.7.202:8879/';
        }, 300);
        
      } else {
        // ✅ Switch to Supervisor Mode
        console.log('🔴 Switching to Supervisor Mode...');
        
        const supervisorData = {
          supervisor_id: user?.id,
          supervisor_name: user?.firstname,
          supervisor_role: user?.role,
          supervisor_extension: user?.extension,
          switched_at: new Date().toISOString(),
        };
        
        sessionStorage.setItem('supervisorData', JSON.stringify(supervisorData));
        sessionStorage.setItem('supervisorMode', JSON.stringify(true));
        setSupervisorMode(true);
        
        console.log('💾 Supervisor data saved');
        
        setTimeout(() => {
          navigate('/supervisor-dashboard?mode=supervisor');
          console.log('✅ Navigated to Supervisor');
        }, 300);
      }
    } catch (error) {
      console.error('❌ Error:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to switch modes.', 
        variant: 'destructive' 
      });
      setIsToggling(false);
    }
  };
  // =========================================================


  const getAgentStatus = async (stationId: string) => {
    const requestBody = { agent: stationId };
    try {
      const response = await axios.post(`https://10.16.7.96:5050/Get-Agent-Status`, requestBody, {
        headers: { 'Content-Type': 'application/json' },
      });


      if (response.status === 200) {
        const data = response.data;
        console.log('Get Agent Status API Response:', data);
        return data.status;
      } else {
        throw new Error('Unexpected response status');
      }
    } catch (error: any) {
      console.error('Get Agent Status API Error:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to retrieve agent status.', 
        variant: 'destructive' 
      });
      return null;
    }
  };


  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available': return 'bg-green-500';
      case 'on break': return 'bg-red-500';
      case 'logged out': return 'bg-orange-500';
      default: return 'bg-gray-500'
    }
  };


  const getInitials = () => {
    const firstInitial = user?.firstname ? user.firstname.charAt(0).toUpperCase() : '';
    const lastInitial = user?.lastname ? user.lastname.charAt(0).toUpperCase() : '';
    return `${firstInitial}${lastInitial}` || 'U';
  };


  return (
    <header 
      className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-50"
      style={{
        left: isSidebarOpen ? '256px' : '78px', 
        width: isSidebarOpen ? 'calc(100% - 256px)' : 'calc(100% - 78px)', 
      }}
    >
      <div className="flex items-center space-x-4">
        <Button 
          onClick={() => onToggleSidebar()} 
          variant="ghost" 
          size="sm" 
          className="text-gray-600 hover:bg-gray-200"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>


      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-4">
          {/* TOGGLE BUTTON - ONLY FOR SUPERVISOR ROLE */}
          {user?.role?.toLowerCase() === 'supervisor' && (
            <button
              onClick={handleToggle}
              disabled={isToggling}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 cursor-pointer ${
                supervisorMode
                  ? 'bg-green-500 hover:bg-green-600 focus:ring-green-500'
                  : 'bg-purple-500 hover:bg-purple-600 focus:ring-purple-500'
              }`}
              title={supervisorMode ? 'Switch to Agent Mode' : 'Switch to Supervisor Mode'}
            >
              <span
                className="inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300 ease-in-out"
                style={{
                  transform: supervisorMode ? 'translateX(0.25rem)' : 'translateX(1.5rem)',
                }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold pointer-events-none">
                <span className={`transition-all duration-300 ${
                  supervisorMode 
                    ? 'text-green-600 ml-1' 
                    : 'text-purple-600 mr-1'
                }`}>
                  {isToggling ? '...' : (supervisorMode ? 'SUP' : 'AGT')}
                </span>
              </span>
            </button>
          )}


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
                <Badge variant="secondary" className="text-xs capitalize bg-purple-800 text-white">
                  {user.role}
                </Badge>
              )}


              {user?.extension && (
                <Badge variant="secondary" className="text-xs capitalize bg-green-800 text-black">
                  Ext: {user.extension}
                </Badge>
              )}


              {agentStatus && (
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