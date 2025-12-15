import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Phone,
  Users,
  Activity,
  TrendingUp,
  PhoneCall,
  PhoneOff,
  Clock,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  MessageSquare,
  BarChart3,
  Zap,
  Database,
  Wifi,
  Cpu,
  MemoryStick,
  HardDrive
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useGlobalUsers } from '@/contexts/GlobalUsersContext'; // Import hook

import { useNavigate } from 'react-router-dom';
import InteractiveMetricCard, { DetailItem } from '@/components/dashboard/InteractiveMetricCard';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'success': return 'bg-green-500';
    case 'warning': return 'bg-yellow-500';
    case 'info': return 'bg-blue-500';
    case 'error': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

interface ServerMetrics {
  name: string;
  cpu: number;
  ram: number;
  ramUsed: number;
  ramTotal: number;
  disk: number;
  diskUsed: number;
  diskTotal: number;
}

const AdminDashboard = () => {
  // Consume context
  const { users, loading: usersLoading, error, lastUpdated } = useGlobalUsers();

  const [loading, setLoading] = useState(false);

  // State for metrics
  const [totalUsersDetails, setTotalUsersDetails] = useState<DetailItem[]>([]);
  const [availableAgentsDetails, setAvailableAgentsDetails] = useState<DetailItem[]>([]);
  const [queueCount, setQueueCount] = useState('0');
  const [onCallDetails, setOnCallDetails] = useState<DetailItem[]>([]);

  // FREESWITCH metrics (10.16.7.91)
  const [freeswitchMetrics, setFreeswitchMetrics] = useState<ServerMetrics>({
    name: 'FREESWITCH',
    cpu: 0,
    ram: 0,
    ramUsed: 0,
    ramTotal: 0,
    disk: 0,
    diskUsed: 0,
    diskTotal: 0
  });

  // API Server metrics (10.16.7.96)
  const [apiServerMetrics, setApiServerMetrics] = useState<ServerMetrics>({
    name: 'API Server',
    cpu: 0,
    ram: 0,
    ramUsed: 0,
    ramTotal: 0,
    disk: 0,
    diskUsed: 0,
    diskTotal: 0
  });

  // Database Server metrics (10.16.7.95) - ready when endpoint is live
  const [dbServerMetrics, setDbServerMetrics] = useState<ServerMetrics>({
    name: 'Database Server',
    cpu: 0,
    ram: 0,
    ramUsed: 0,
    ramTotal: 0,
    disk: 0,
    diskUsed: 0,
    diskTotal: 0
  });

  // Fetch FREESWITCH metrics
  useEffect(() => {
    const fetchFreeswitchMetrics = async () => {
      try {
        const response = await fetch('http://10.16.7.91:3000/api/server-metrics');
        if (response.ok) {
          const data = await response.json();
          setFreeswitchMetrics({
            name: 'FREESWITCH',
            cpu: data.cpu || 0,
            ram: data.ram || 0,
            ramUsed: data.ramUsed || 0,
            ramTotal: data.ramTotal || 0,
            disk: data.disk || 0,
            diskUsed: data.diskUsed || 0,
            diskTotal: data.diskTotal || 0
          });
        }
      } catch (err) {
        console.error('Failed to fetch FREESWITCH metrics', err);
      }
    };

    fetchFreeswitchMetrics();
    const interval = setInterval(fetchFreeswitchMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch API Server metrics
  useEffect(() => {
    const fetchApiServerMetrics = async () => {
      try {
        const response = await fetch('http://10.16.7.96:3000/api/server-metrics');
        if (response.ok) {
          const data = await response.json();
          setApiServerMetrics({
            name: 'API Server',
            cpu: data.cpu || 0,
            ram: data.ram || 0,
            ramUsed: data.ramUsed || 0,
            ramTotal: data.ramTotal || 0,
            disk: data.disk || 0,
            diskUsed: data.diskUsed || 0,
            diskTotal: data.diskTotal || 0
          });
        }
      } catch (err) {
        console.error('Failed to fetch API Server metrics', err);
      }
    };

    fetchApiServerMetrics();
    const interval = setInterval(fetchApiServerMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Database Server metrics (active - will show 0s until endpoint is ready)
  useEffect(() => {
    const fetchDbServerMetrics = async () => {
      try {
        const response = await fetch('http://10.16.7.95:3000/api/server-metrics');
        if (response.ok) {
          const data = await response.json();
          setDbServerMetrics({
            name: 'Database Server',
            cpu: data.cpu || 0,
            ram: data.ram || 0,
            ramUsed: data.ramUsed || 0,
            ramTotal: data.ramTotal || 0,
            disk: data.disk || 0,
            diskUsed: data.diskUsed || 0,
            diskTotal: data.diskTotal || 0
          });
        }
      } catch (err) {
        console.error('Failed to fetch Database Server metrics', err);
      }
    };

    fetchDbServerMetrics();
    const interval = setInterval(fetchDbServerMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  // Calculate metrics when users change
  useEffect(() => {
    if (users) {
      // --- Total Users Breakdown ---
      const adminUsers = users.filter(u => u.role && (Array.isArray(u.role) ? u.role.includes('Admin') : u.role === 'Admin'));
      const supervisorUsers = users.filter(u => u.role && (Array.isArray(u.role) ? u.role.includes('Supervisor') : u.role === 'Supervisor'));
      const agentUsers = users.filter(u => u.role && (Array.isArray(u.role) ? u.role.includes('Agent') : u.role === 'Agent'));

      const getQueueBreakdown = (userList: typeof users) => {
        const queueCounts: Record<string, number> = {};
        userList.forEach(u => {
          if (u.queue && u.queue.length > 0) {
            u.queue.forEach(q => {
              queueCounts[q] = (queueCounts[q] || 0) + 1;
            });
          } else {
            queueCounts['No Queue'] = (queueCounts['No Queue'] || 0) + 1;
          }
        });
        return Object.entries(queueCounts)
          .map(([q, count]) => ({ label: q, value: count, color: 'text-muted-foreground' }))
          .sort((a, b) => b.value - a.value);
      };

      setTotalUsersDetails([
        { label: 'Agents', value: agentUsers.length, subItems: getQueueBreakdown(agentUsers) },
        { label: 'Supervisors', value: supervisorUsers.length, subItems: getQueueBreakdown(supervisorUsers) },
        { label: 'Admins', value: adminUsers.length, subItems: getQueueBreakdown(adminUsers) },
      ]);

      // --- Available Agents Breakdown (per Queue) ---
      const allQueues = Array.from(new Set(users.flatMap(u => u.queue || []))).filter(Boolean).sort();

      const availableStats = allQueues.map(q => {
        const queueUsers = users.filter(u => u.queue && u.queue.includes(q));
        const available = queueUsers.filter(u => u.status === 'Available').length;
        const loggedOut = queueUsers.filter(u => u.status === 'Logged Out').length;
        const onBreak = queueUsers.filter(u => u.status && u.status.includes('Break')).length;

        return {
          label: q,
          value: available,
          subItems: [
            { label: 'Available', value: available, color: 'text-green-600' },
            { label: 'Logged Out', value: loggedOut, color: 'text-gray-500' },
            { label: 'On Break', value: onBreak, color: 'text-yellow-600' }
          ]
        };
      });

      setAvailableAgentsDetails(availableStats);

      // --- On-Call Agents Breakdown (per Queue) ---
      const onCallStats = allQueues.map(q => {
        const queueUsers = users.filter(u => u.queue && u.queue.includes(q));
        const inCall = queueUsers.filter(u => u.status === 'On Call' || u.status === 'Talking' || (u.state && u.state === 'In Call')).length;

        return {
          label: q,
          value: inCall
        };
      });

      setOnCallDetails(onCallStats);
    }
  }, [users]);

  useEffect(() => {
    const fetchQueueData = async () => {
      try {
        const queueResponse = await fetch('https://10.16.7.96/api/api/queue');
        if (!queueResponse.ok) {
          console.warn('Queue fetch failed');
          return;
        }
        const queueData = await queueResponse.json();
        setQueueCount(queueData.length.toString());
      } catch (error) {
        // silent
      }
    };
    fetchQueueData();
  }, []);

  // Fetch Realtime Data (Agents & Queues)
  const [realtimeQueueData, setRealtimeQueueData] = useState<any[]>([]);
  const [realtimeAgentData, setRealtimeAgentData] = useState<any[]>([]);

  useEffect(() => {
    const fetchRealtimeData = async () => {
      try {
        const [queueRes, agentRes] = await Promise.all([
          fetch('http://10.16.7.91:5001/realtime_queues'),
          fetch('http://10.16.7.91:5001/realtime_agents')
        ]);

        if (queueRes.ok) {
          const qData = await queueRes.json();
          setRealtimeQueueData(qData || []);
        }
        if (agentRes.ok) {
          const aData = await agentRes.json();
          setRealtimeAgentData(aData || []);
        }
      } catch (error) {
        console.error('Error fetching realtime metrics:', error);
      }
    };

    fetchRealtimeData();
    const interval = setInterval(fetchRealtimeData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch CDR Data (Daily Metrics)
  const [cdrData, setCdrData] = useState<any[]>([]);
  const [cdrLoading, setCdrLoading] = useState(false);

  useEffect(() => {
    const fetchCdrData = async () => {
      setCdrLoading(true);
      try {
        const response = await fetch('http://10.16.7.96:8001/cdr-reports/today?user_time_zone=Asia%2FKolkata');
        if (response.ok) {
          const res = await response.json();
          setCdrData(res.data || []);
        } else {
          console.warn("Failed to fetch CDR data");
        }
      } catch (error) {
        console.error('Error fetching CDR data:', error);
      } finally {
        setCdrLoading(false);
      }
    };

    fetchCdrData();
    const interval = setInterval(fetchCdrData, 60000);
    return () => clearInterval(interval);
  }, []);

  // --- Realtime Calculations ---
  const totalWaiting = realtimeQueueData.reduce((acc, q) => acc + (q.calls_waiting || 0), 0);

  // --- CDR Calculations ---
  const filteredCdr = cdrData;
  const totalCdrCalls = filteredCdr.length;

  const abandonedCdr = filteredCdr.filter(c => c.hangup_cause === 'ORIGINATOR_CANCEL');
  const missedCdr = filteredCdr.filter(c => c.hangup_cause === 'NO_ANSWER');
  const answeredCount = totalCdrCalls - abandonedCdr.length - missedCdr.length;

  const activeQueuesSet = new Set(filteredCdr.map(c => c.queue).filter(Boolean));
  const activeQueuesCount = activeQueuesSet.size.toString();

  const callsByQueue = filteredCdr.reduce((acc: any, c: any) => {
    const q = c.queue || 'Unknown';
    acc[q] = (acc[q] || 0) + 1;
    return acc;
  }, {});

  const metricCards = [
    {
      title: 'Total Users',
      value: users.length.toString(),
      icon: Users,
      trend: 'Registered',
      color: 'from-blue-800 to-blue-900',
      description: 'Click for role breakdown',
      details: totalUsersDetails
    },
    {
      title: 'Available Agents',
      value: users.filter(u => u.status === 'Available').length.toString(),
      icon: UserCheck,
      trend: 'Online Now',
      color: 'from-blue-800 to-blue-900',
      description: 'Click for queue details',
      details: availableAgentsDetails
    },
    {
      title: 'Call Volume Today',
      value: totalCdrCalls.toString(),
      icon: Phone,
      trend: 'Daily Total',
      color: 'from-blue-800 to-blue-900',
      description: 'Answered, Missed, Abandoned',
      details: [
        { label: 'Answered', value: answeredCount },
        { label: 'Missed', value: missedCdr.length },
        { label: 'Abandoned', value: abandonedCdr.length }
      ]
    },
    {
      title: 'Abandoned Calls',
      value: abandonedCdr.length.toString(),
      icon: PhoneOff,
      trend: 'Customer Churn',
      color: 'from-blue-800 to-blue-900',
      description: 'Customer hung up',
      details: []
    },
    {
      title: 'Waiting Customers',
      value: totalWaiting.toString(),
      icon: Clock,
      trend: 'Live Queue',
      color: 'from-blue-800 to-blue-900',
      description: 'Currently in queue',
      details: realtimeQueueData.map(q => ({ label: q.queue_name, value: q.calls_waiting })).sort((a, b) => b.value - a.value)
    },
    {
      title: 'Active Queues',
      value: activeQueuesCount,
      icon: MessageSquare,
      trend: 'Activity Today',
      color: 'from-blue-800 to-blue-900',
      description: 'Queues with traffic today',
      details: Object.entries(callsByQueue).map(([k, v]) => ({ label: k, value: v as number })).sort((a, b) => b.value - a.value)
    },
    {
      title: 'Total Active Calls',
      value: (realtimeAgentData.filter(a => a.status === 'Busy').length + totalWaiting).toString(),
      icon: PhoneCall,
      trend: 'Happening Now',
      color: 'from-blue-800 to-blue-900',
      description: 'Talking + Waiting in Queue',
      details: []
    },
    {
      title: 'Agent Utilization',
      value: (() => {
        const loggedInAgentsCount = users.filter(u => u.role && (Array.isArray(u.role) ? u.role.includes('Agent') : u.role === 'Agent') && u.status !== 'Logged Out').length;
        const busyAgentsCount = realtimeAgentData.filter(a => a.status === 'Busy').length;
        if (loggedInAgentsCount === 0) return '0%';
        return `${Math.round((busyAgentsCount / loggedInAgentsCount) * 100)}%`;
      })(),
      icon: Activity,
      trend: 'Efficiency',
      color: 'from-blue-800 to-blue-900',
      description: 'Agents on call / logged in',
      details: []
    },
  ];

  // Circular Progress Component
  const CircularProgress = ({ percent, label, used, total, icon: Icon, color }: { percent: number; label: string; used?: number; total?: number; icon: any; color: string }) => {
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (percent / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 -rotate-90 transform">
            <circle
              cx="64"
              cy="64"
              r="45"
              stroke="#e5e7eb"
              strokeWidth="14"
              fill="transparent"
            />
            <circle
              cx="64"
              cy="64"
              r="45"
              stroke={color}
              strokeWidth="14"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Icon className="w-8 h-8 text-gray-700 mb-1" />
            <span className="text-2xl font-bold text-gray-900">{percent.toFixed(0)}%</span>
          </div>
        </div>
        <p className="mt-3 text-sm font-medium text-gray-700">{label}</p>
        {used !== undefined && total !== undefined && (
          <p className="text-xs text-gray-500">
            {(used / (1024 ** 3)).toFixed(1)} GB / {(total / (1024 ** 3)).toFixed(1)} GB
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 p-6 mt-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Badge
            variant="secondary"
            className={`${error
              ? 'bg-red-100 text-red-800 border-red-200'
              : lastUpdated
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-gray-100 text-gray-800 border-gray-200'
              } px-3 py-1 flex items-center gap-2`}
          >
            <div className={`w-2 h-2 rounded-full ${error
              ? 'bg-red-500'
              : lastUpdated
                ? 'bg-green-500 animate-pulse'
                : 'bg-gray-500'
              }`} />
            <span className="font-medium">
              {error ? 'Error' : 'Live'}
            </span>
            {lastUpdated && !error && (
              <span className="ml-1 font-mono">
                {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase()}
              </span>
            )}
          </Badge>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <InteractiveMetricCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              trend={stat.trend}
              description={stat.description}
              details={stat.details}
            >
              <Card className="relative overflow-hidden border bg-card bg-gray-50 text-card-foreground hover:bg-accent/5 transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-md hover:-translate-y-1">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-[0.03] group-hover:opacity-[0.07] transition-opacity`} />
                <div className={`absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity`}>
                  <Icon className="w-24 h-24 text-primary" />
                </div>
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg shadow-black/5`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    {stat.trend && (
                      <Badge variant="secondary" className="font-mono text-xs bg-background/50 backdrop-blur-sm border-0">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {stat.trend}
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-foreground">{stat.title}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold tracking-tight">{stat.value}</span>
                    </div>
                    <p className="text-xs text-muted-foreground pt-1 font-medium">{stat.description}</p>
                  </div>
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                      <Activity className="w-4 h-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </InteractiveMetricCard>
          );
        })}
      </div>

      {/* Server Resource Monitoring Sections */}

      {/* FREESWITCH Resources */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <Database className="w-6 h-6 text-blue-600" />
          FREESWITCH Resources
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 justify-items-center">
          <CircularProgress
            percent={freeswitchMetrics.cpu}
            label="CPU Usage"
            icon={Cpu}
            color={freeswitchMetrics.cpu > 80 ? '#ef4444' : freeswitchMetrics.cpu > 50 ? '#f59e0b' : '#10b981'}
          />
          <CircularProgress
            percent={freeswitchMetrics.ram}
            label="RAM Usage"
            used={freeswitchMetrics.ramUsed}
            total={freeswitchMetrics.ramTotal}
            icon={MemoryStick}
            color={freeswitchMetrics.ram > 80 ? '#ef4444' : freeswitchMetrics.ram > 50 ? '#f59e0b' : '#10b981'}
          />
          <CircularProgress
            percent={freeswitchMetrics.disk}
            label="Disk Usage"
            used={freeswitchMetrics.diskUsed}
            total={freeswitchMetrics.diskTotal}
            icon={HardDrive}
            color={freeswitchMetrics.disk > 80 ? '#ef4444' : freeswitchMetrics.disk > 50 ? '#f59e0b' : '#10b981'}
          />
        </div>
      </div>

      {/* API Server Resources */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <Database className="w-6 h-6 text-blue-600" />
          API Server Resources
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 justify-items-center">
          <CircularProgress
            percent={apiServerMetrics.cpu}
            label="CPU Usage"
            icon={Cpu}
            color={apiServerMetrics.cpu > 80 ? '#ef4444' : apiServerMetrics.cpu > 50 ? '#f59e0b' : '#10b981'}
          />
          <CircularProgress
            percent={apiServerMetrics.ram}
            label="RAM Usage"
            used={apiServerMetrics.ramUsed}
            total={apiServerMetrics.ramTotal}
            icon={MemoryStick}
            color={apiServerMetrics.ram > 80 ? '#ef4444' : apiServerMetrics.ram > 50 ? '#f59e0b' : '#10b981'}
          />
          <CircularProgress
            percent={apiServerMetrics.disk}
            label="Disk Usage"
            used={apiServerMetrics.diskUsed}
            total={apiServerMetrics.diskTotal}
            icon={HardDrive}
            color={apiServerMetrics.disk > 80 ? '#ef4444' : apiServerMetrics.disk > 50 ? '#f59e0b' : '#10b981'}
          />
        </div>
      </div>

      {/* Database Server Resources */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <Database className="w-6 h-6 text-blue-600" />
          Database Server Resources
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 justify-items-center">
          <CircularProgress
            percent={dbServerMetrics.cpu}
            label="CPU Usage"
            icon={Cpu}
            color={dbServerMetrics.cpu > 80 ? '#ef4444' : dbServerMetrics.cpu > 50 ? '#f59e0b' : '#10b981'}
          />
          <CircularProgress
            percent={dbServerMetrics.ram}
            label="RAM Usage"
            used={dbServerMetrics.ramUsed}
            total={dbServerMetrics.ramTotal}
            icon={MemoryStick}
            color={dbServerMetrics.ram > 80 ? '#ef4444' : dbServerMetrics.ram > 50 ? '#f59e0b' : '#10b981'}
          />
          <CircularProgress
            percent={dbServerMetrics.disk}
            label="Disk Usage"
            used={dbServerMetrics.diskUsed}
            total={dbServerMetrics.diskTotal}
            icon={HardDrive}
            color={dbServerMetrics.disk > 80 ? '#ef4444' : dbServerMetrics.disk > 50 ? '#f59e0b' : '#10b981'}
          />
        </div>
      </div>

    </div>
  );
};
export default AdminDashboard;