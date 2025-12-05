import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, Phone, Clock, CheckCircle2, PlayCircle, 
  ChevronRight, Target, Calendar, LogIn, LogOut,
  MessageSquare, X, AlertCircle, TrendingUp, Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocketEvent } from '@/contexts/WebSocketContext';
import axios from 'axios';


interface Recording {
  id: number;
  call_log_id: string;
  caller_id_number: string;
  destination_number: string;
  agent: string;
  queue_name: string;
  record_filename: string;
}


interface QAScore {
  alert_id: number;
  call_id: string;
  agent_id: string;
  customer_id: string;
  qa_score: number;
  created_at: string;
  message: string;
}


interface TranscriptMessage {
  role: string;
  message: string;
  timestamp?: string;
}


interface LoginLogoutData {
  agent_name: string;
  login_timestamp: string;
  logout_timestamp: string;
  duration: string;
}


interface Agent {
  id: string;
  fullname: string;
  extension: string;
  status: string;
  contact_state?: string;
}


const API_BASE_URL = 'http://10.16.7.96:8001';
const RECORDINGS_API = import.meta.env.VITE_API_BASE_URL;


const SupervisorDashboard = () => {
  const { authState } = useAuth();
  const { teamMembers, setTeamMembers } = useWebSocketEvent();
  const user = authState.user;
  
  const [loading, setLoading] = useState(true);
  const [recentRecordings, setRecentRecordings] = useState<Recording[]>([]);
  const [recentQAScores, setRecentQAScores] = useState<QAScore[]>([]);
  const [loginLogoutData, setLoginLogoutData] = useState<LoginLogoutData[]>([]);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());
  
  const [showAgentsModal, setShowAgentsModal] = useState(false);
  const [showAvailableModal, setShowAvailableModal] = useState(false);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [showBusyModal, setShowBusyModal] = useState(false);
  const [showRecordingsModal, setShowRecordingsModal] = useState(false);
  const [showQAModal, setShowQAModal] = useState(false);
  const [showLoginLogoutModal, setShowLoginLogoutModal] = useState(false);
  
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const [selectedQABreakdown, setSelectedQABreakdown] = useState<any>(null);


  const getAgentStatus = async (stationId: string) => {
    const requestBody = { agent: stationId };
    try {
      const response = await axios.post('https://10.16.7.96:5050/Get-Agent-Status', requestBody, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.status === 200) {
        return response.data.status;
      }
    } catch (error) {
      return null;
    }
  };


  const fetchSupervisorAgents = async (supervisorId: string) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/supervisor/agents`,
        { params: { supervisor_id: supervisorId } }
      );
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("❌ Failed to fetch supervisor agents:", error);
      return [];
    }
  };


  const fetchRecentRecordings = async () => {
    try {
      const response = await fetch(`${RECORDINGS_API}/api/recordings`);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setRecentRecordings(data);
      }
    } catch (error) {
      console.error("❌ Failed to fetch recordings:", error);
      setRecentRecordings([]);
    }
  };


  const fetchRecentQAScores = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/qa/supervisor-scores?supervisor_id=${user?.user_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (Array.isArray(response.data)) {
        const sorted = response.data.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setRecentQAScores(sorted);
      }
    } catch (error) {
      console.error("❌ Failed to fetch QA scores:", error);
      setRecentQAScores([]);
    }
  };


  const fetchLoginLogoutData = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/agents-login-logout/today`,
        { params: { user_time_zone: 'Asia/Kolkata' } }
      );
      
      if (response.data?.data && Array.isArray(response.data.data)) {
        setLoginLogoutData(response.data.data);
      } else {
        setLoginLogoutData([]);
      }
    } catch (error) {
      console.error("❌ Failed to fetch login/logout data:", error);
      setLoginLogoutData([]);
    }
  };


  const fetchTranscript = async (callId: string, qaMessage: string) => {
    setLoadingTranscript(true);
    setSelectedCallId(callId);


    try {
      const breakdown = JSON.parse(qaMessage);
      setSelectedQABreakdown(breakdown);
    } catch (e) {
      setSelectedQABreakdown(null);
    }


    try {
      const response = await axios.get(
        `${API_BASE_URL}/qa/transcript/${callId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );


      if (response.data && response.data.transcript) {
        const transcriptData = response.data.transcript;
        let normalizedTranscript: TranscriptMessage[] = [];
        
        if (Array.isArray(transcriptData)) {
          normalizedTranscript = transcriptData.map((msg: any) => ({
            role: msg.role?.toLowerCase() || 'customer',
            message: msg.text || msg.message || String(msg),
            timestamp: msg.timestamp
          }));
        } else if (typeof transcriptData === 'object' && (transcriptData.Agent || transcriptData.Customer)) {
          if (transcriptData.Agent && Array.isArray(transcriptData.Agent)) {
            transcriptData.Agent.forEach((msg: any) => {
              normalizedTranscript.push({
                role: 'agent',
                message: msg.text || msg.message || String(msg),
                timestamp: msg.timestamp,
              });
            });
          }
          
          if (transcriptData.Customer && Array.isArray(transcriptData.Customer)) {
            transcriptData.Customer.forEach((msg: any) => {
              normalizedTranscript.push({
                role: 'customer',
                message: msg.text || msg.message || String(msg),
                timestamp: msg.timestamp,
              });
            });
          }
          
          normalizedTranscript.sort((a, b) => {
            if (a.timestamp && b.timestamp) {
              return a.timestamp.localeCompare(b.timestamp);
            }
            return 0;
          });
        }
        
        setTranscript(normalizedTranscript);
      } else {
        setTranscript([]);
      }
    } catch (error) {
      console.error(`❌ Failed to fetch transcript:`, error);
      setTranscript([]);
    } finally {
      setLoadingTranscript(false);
    }
  };


  const closeTranscriptModal = () => {
    setSelectedCallId(null);
    setTranscript([]);
    setSelectedQABreakdown(null);
  };


  const initializeDashboard = async () => {
    if (!user || !user.user_id) {
      setLoading(false);
      return;
    }


    setLoading(true);
    const extensions = await fetchSupervisorAgents(user.user_id);


    // ✅ FIX 1: Include contact_state in agent mapping
    if (extensions && extensions.length > 0) {
      const mappedAgents = await Promise.all(
        extensions.map(async (ext: string) => {
          const currentStatus = await getAgentStatus(ext);
          return {
            id: `agent_${ext}`,
            fullname: `Agent ${ext}`,
            extension: ext,
            status: currentStatus || 'Logged Out',
            contact_state: currentStatus?.toLowerCase().includes("queue")
              ? "In a queue call"
              : "Idle"
          };
        })
      );
      setTeamMembers(mappedAgents);
    }


    await Promise.all([
      fetchRecentRecordings(), 
      fetchRecentQAScores(),
      fetchLoginLogoutData()
    ]);
    
    setLastUpdated(new Date().toLocaleTimeString());
    setLoading(false);
  };


  // ✅ NEW FUNCTION: Refresh only agent statuses (CHANGE 1)
  const refreshOnlyStatuses = async () => {
    if (!teamMembers || teamMembers.length === 0) return;

    const updated = await Promise.all(
      teamMembers.map(async (agent) => {
        const status = await getAgentStatus(agent.extension);

        return {
          ...agent,
          status: status || agent.status,
          contact_state: status?.toLowerCase().includes("queue")
            ? "In a queue call"
            : "Idle",
        };
      })
    );

    setTeamMembers(updated);
  };


  useEffect(() => {
    initializeDashboard();
  }, [user?.user_id]);


  // ✅ CHANGE 2: Replace full dashboard refresh with status-only refresh
  useEffect(() => {
    const interval = setInterval(() => {
      refreshOnlyStatuses();
    }, 2000);
    return () => clearInterval(interval);
  }, [teamMembers]);


  const totalAgents = teamMembers?.length || 0;
  const availableAgents = teamMembers?.filter(a => a.status?.toLowerCase() === 'available') || [];
  
  // ✅ FIX 2: Check contact_state for queue calls
  const busyAgents = teamMembers?.filter(
    a =>
      a.status?.toLowerCase() === 'busy' ||
      a.status?.toLowerCase() === 'on call' ||
      a.contact_state?.toLowerCase().includes("queue call")
  ) || [];
  
  const breakAgents = teamMembers?.filter(
    a => a.status?.toLowerCase() === 'on break' || a.status?.toLowerCase() === 'break'
  ) || [];


  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };


  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };


  const Modal = ({ isOpen, onClose, title, icon: Icon, children }: any) => {
    if (!isOpen) return null;
    
    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {Icon && <Icon className="w-6 h-6" />}
                <h2 className="text-xl font-bold">{title}</h2>
              </div>
              <button 
                onClick={onClose}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="p-6 overflow-y-auto max-h-[calc(85vh-100px)]">
            {children}
          </div>
        </div>
      </div>
    );
  };


  if (loading && teamMembers.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg font-semibold text-gray-700">Loading dashboard...</div>
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
              Supervisor Dashboard
            </h1>
            <p className="text-gray-600 mt-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className="bg-blue-100 text-blue-800 px-4 py-2 text-sm font-medium hover:bg-blue-100">
              {user?.user_id || 'Supervisor'}
            </Badge>
            <div className="flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-full">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-800 font-medium text-sm">Live • {lastUpdated}</span>
            </div>
          </div>
        </div>


        {/* KEY METRICS - 4 Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card 
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105"
            onClick={() => setShowAgentsModal(true)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-blue-100 text-sm font-medium mb-2">Your Team</p>
                  <h3 className="text-5xl font-bold">{totalAgents}</h3>
                  <p className="text-xs text-blue-100 mt-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Click for details
                  </p>
                </div>
                <div className="bg-white/20 p-3 rounded-lg">
                  <User className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>


          <Card 
            className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105"
            onClick={() => setShowAvailableModal(true)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-green-100 text-sm font-medium mb-2">Ready</p>
                  <h3 className="text-5xl font-bold">{availableAgents.length}</h3>
                  <p className="text-xs text-green-100 mt-2 flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    Click for details
                  </p>
                </div>
                <div className="bg-white/20 p-3 rounded-lg">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>


          <Card 
            className="bg-gradient-to-br from-orange-500 to-amber-600 text-white border-0 shadow-lg hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105"
            onClick={() => setShowBreakModal(true)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-orange-100 text-sm font-medium mb-2">Away</p>
                  <h3 className="text-5xl font-bold">{breakAgents.length}</h3>
                  <p className="text-xs text-orange-100 mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Click for details
                  </p>
                </div>
                <div className="bg-white/20 p-3 rounded-lg">
                  <Clock className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>


          <Card 
            className="bg-gradient-to-br from-red-500 to-pink-600 text-white border-0 shadow-lg hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105"
            onClick={() => setShowBusyModal(true)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-red-100 text-sm font-medium mb-2">Busy</p>
                  <h3 className="text-5xl font-bold">{busyAgents.length}</h3>
                  <p className="text-xs text-red-100 mt-2 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    Click for details
                  </p>
                </div>
                <div className="bg-white/20 p-3 rounded-lg">
                  <Phone className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>


        {/* CLICKABLE INFO BOXES - NO NUMBERS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recordings Box - Clean without numbers */}
          <Card 
            className="bg-white shadow-lg border border-gray-100 rounded-2xl overflow-hidden hover:shadow-2xl transition-all cursor-pointer transform hover:scale-[1.02]"
            onClick={() => setShowRecordingsModal(true)}
          >
            <CardContent className="p-12 text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <PlayCircle className="w-10 h-10 text-blue-600" />
              </div>
              <p className="text-gray-900 font-semibold text-lg mb-2">Call Recordings</p>
              <p className="text-sm text-gray-500">Click to view recent recordings</p>
            </CardContent>
          </Card>


          {/* QA Scores Box - Clean without numbers */}
          <Card 
            className="bg-white shadow-lg border border-gray-100 rounded-2xl overflow-hidden hover:shadow-2xl transition-all cursor-pointer transform hover:scale-[1.02]"
            onClick={() => setShowQAModal(true)}
          >
            <CardContent className="p-12 text-center">
              <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-10 h-10 text-purple-600" />
              </div>
              <p className="text-gray-900 font-semibold text-lg mb-2">Quality Analysis</p>
              <p className="text-sm text-gray-500">Click to view QA scores</p>
            </CardContent>
          </Card>


          {/* Activity Logs Box - Clean without numbers */}
          <Card 
            className="bg-white shadow-lg border border-gray-100 rounded-2xl overflow-hidden hover:shadow-2xl transition-all cursor-pointer transform hover:scale-[1.02]"
            onClick={() => setShowLoginLogoutModal(true)}
          >
            <CardContent className="p-12 text-center">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Activity className="w-10 h-10 text-gray-700" />
              </div>
              <p className="text-gray-900 font-semibold text-lg mb-2">Agent Activity</p>
              <p className="text-sm text-gray-500">Click to view activity logs</p>
            </CardContent>
          </Card>
        </div>
      </div>


      {/* MODALS */}
      
      <Modal isOpen={showAgentsModal} onClose={() => setShowAgentsModal(false)} title="All Team Members" icon={User}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teamMembers.map((agent, idx) => (
            <div key={idx} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{agent.fullname}</p>
                  <p className="text-sm text-gray-600">Ext: {agent.extension}</p>
                </div>
                {/* ✅ FIX 3: Show "On Call" if in queue, otherwise show status */}
                <Badge className={`${
                  agent.contact_state?.includes("queue") 
                    ? 'bg-red-100 text-red-800'
                    : agent.status === 'Available'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {agent.contact_state?.includes("queue") ? "On Call" : agent.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Modal>


      <Modal isOpen={showAvailableModal} onClose={() => setShowAvailableModal(false)} title="Available Agents" icon={CheckCircle2}>
        <div className="space-y-3">
          {availableAgents.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No agents available</p>
          ) : (
            availableAgents.map((agent, idx) => (
              <div key={idx} className="p-4 border border-green-200 bg-green-50 rounded-lg">
                <p className="font-semibold text-gray-900">{agent.fullname}</p>
                <p className="text-sm text-gray-600">Extension: {agent.extension}</p>
              </div>
            ))
          )}
        </div>
      </Modal>


      <Modal isOpen={showBreakModal} onClose={() => setShowBreakModal(false)} title="Agents On Break" icon={Clock}>
        <div className="space-y-3">
          {breakAgents.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No agents on break</p>
          ) : (
            breakAgents.map((agent, idx) => (
              <div key={idx} className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                <p className="font-semibold text-gray-900">{agent.fullname}</p>
                <p className="text-sm text-gray-600">Extension: {agent.extension}</p>
              </div>
            ))
          )}
        </div>
      </Modal>


      <Modal isOpen={showBusyModal} onClose={() => setShowBusyModal(false)} title="Busy Agents" icon={Phone}>
        <div className="space-y-3">
          {busyAgents.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No agents busy</p>
          ) : (
            busyAgents.map((agent, idx) => (
              <div key={idx} className="p-4 border border-red-200 bg-red-50 rounded-lg">
                <p className="font-semibold text-gray-900">{agent.fullname}</p>
                <p className="text-sm text-gray-600">Extension: {agent.extension}</p>
              </div>
            ))
          )}
        </div>
      </Modal>


      {/* RECORDINGS MODAL - Shows LAST 5 ONLY */}
      <Modal isOpen={showRecordingsModal} onClose={() => setShowRecordingsModal(false)} title="Recent Recordings (Last 5)" icon={PlayCircle}>
        <div className="space-y-4">
          {recentRecordings.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No recordings available</p>
          ) : (
            recentRecordings.slice(0, 5).map((rec, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-800">Agent {rec.agent}</Badge>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium">{rec.destination_number}</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    From: {rec.caller_id_number} • Queue: {rec.queue_name || 'Default'}
                  </div>
                  <audio controls preload="metadata" className="w-full">
                    <source src={`${RECORDINGS_API}/api/recordings/play/${rec.id}`} type="audio/mpeg" />
                  </audio>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>


      {/* QA SCORES MODAL - Shows LAST 5 ONLY */}
      <Modal isOpen={showQAModal} onClose={() => setShowQAModal(false)} title="Recent QA Scores (Last 5)" icon={Target}>
        <div className="space-y-4">
          {recentQAScores.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No QA scores available</p>
          ) : (
            recentQAScores.slice(0, 5).map((qa, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-purple-100 text-purple-800">Agent {qa.agent_id}</Badge>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">Customer: {qa.customer_id || 'N/A'}</span>
                    </div>
                    <div className="text-xs text-gray-600">{formatDate(qa.created_at)}</div>
                  </div>
                  <Badge 
                    className={`${getScoreColor(qa.qa_score)} font-bold text-xl px-6 py-3 border-2 cursor-pointer hover:opacity-80`}
                    onClick={() => {
                      setShowQAModal(false);
                      fetchTranscript(qa.call_id, qa.message);
                    }}
                  >
                    {qa.qa_score}%
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>


      <Modal isOpen={showLoginLogoutModal} onClose={() => setShowLoginLogoutModal(false)} title="Agent Activity Logs" icon={Activity}>
        <div className="overflow-x-auto">
          {loginLogoutData.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No activity logs</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Agent</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Login</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Logout</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loginLogoutData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{item.agent_name}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge className="bg-green-100 text-green-800">{item.login_timestamp}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge className="bg-red-100 text-red-800">{item.logout_timestamp}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-blue-600">{item.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Modal>


      {/* Transcript Modal */}
      {selectedCallId && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeTranscriptModal}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Call Transcript & QA Analysis</h2>
                  <p className="text-sm text-purple-100 mt-1">Call ID: {selectedCallId}</p>
                </div>
                <button 
                  onClick={closeTranscriptModal}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-3 h-[calc(90vh-100px)]">
              <div className="col-span-2 p-6 overflow-y-auto border-r border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Conversation</h3>
                {loadingTranscript ? (
                  <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading transcript...</p>
                  </div>
                ) : transcript.length === 0 ? (
                  <div className="text-center py-16 text-gray-500">
                    <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-semibold">No transcript available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transcript.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.role === 'agent' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-3 ${
                            msg.role === 'agent'
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          <div className="text-xs font-semibold mb-1 opacity-75">
                            {msg.role === 'agent' ? 'Agent' : 'Customer'}
                          </div>
                          <div className="text-sm">{msg.message}</div>
                          {msg.timestamp && (
                            <div className="text-xs mt-1 opacity-70">{msg.timestamp}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>


              <div className="p-6 overflow-y-auto bg-gray-50">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">QA Score Breakdown</h3>
                {selectedQABreakdown ? (
                  <div className="space-y-4">
                    {selectedQABreakdown.agent_performance !== undefined && (
                      <div className="p-4 bg-white rounded-lg border border-gray-200">
                        <p className="text-xs font-semibold text-gray-600 mb-1">Agent Performance</p>
                        <p className="text-2xl font-bold text-blue-600">{selectedQABreakdown.agent_performance}</p>
                      </div>
                    )}
                    {selectedQABreakdown.customer_experience !== undefined && (
                      <div className="p-4 bg-white rounded-lg border border-gray-200">
                        <p className="text-xs font-semibold text-gray-600 mb-1">Customer Experience</p>
                        <p className="text-2xl font-bold text-green-600">{selectedQABreakdown.customer_experience}</p>
                      </div>
                    )}
                    {selectedQABreakdown.call_efficiency !== undefined && (
                      <div className="p-4 bg-white rounded-lg border border-gray-200">
                        <p className="text-xs font-semibold text-gray-600 mb-1">Call Efficiency</p>
                        <p className="text-2xl font-bold text-orange-600">{selectedQABreakdown.call_efficiency}</p>
                      </div>
                    )}
                    {selectedQABreakdown.components && (
                      <div className="mt-4">
                        <p className="text-sm font-semibold text-gray-900 mb-3">Components</p>
                        <div className="space-y-2">
                          {Object.entries(selectedQABreakdown.components).map(([key, value]) => (
                            <div key={key} className="flex justify-between p-2 bg-white rounded border border-gray-200">
                              <span className="text-xs text-gray-700 capitalize">{key.replace(/_/g, ' ')}</span>
                              <span className="text-xs font-semibold text-gray-900">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No score breakdown</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default SupervisorDashboard;