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
  HardDrive,
  Server
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

      {/* System Infrastructure */}
      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
        <Server className="w-6 h-6 text-blue-600" />
        System Infrastructure
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ServerMetricCard metrics={freeswitchMetrics} icon={Activity} />
        <ServerMetricCard metrics={apiServerMetrics} icon={Zap} />
        <ServerMetricCard metrics={dbServerMetrics} icon={Database} />
      </div>

    </div>
  );
};
export default AdminDashboard;

// Internal Component for Server Metrics
const ServerMetricCard = ({ metrics, icon: Icon }: { metrics: ServerMetrics; icon: any }) => {
  return (
    <Card className="shadow-sm hover:shadow-md transition-all duration-200 border-gray-100">
      <CardHeader className="pb-3 border-b border-gray-50 bg-gray-50/30">
        <CardTitle className="text-base font-semibold text-gray-800 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-blue-600" />
            {metrics.name}
          </span>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5 space-y-5">
        {/* CPU */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-gray-500 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" /> CPU
            </span>
            <span className={metrics.cpu > 80 ? "text-red-600" : "text-gray-700"}>{metrics.cpu.toFixed(1)}%</span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${metrics.cpu > 80 ? "bg-red-500" : metrics.cpu > 50 ? "bg-yellow-500" : "bg-blue-500"}`}
              style={{ width: `${metrics.cpu}%` }}
            />
          </div>
        </div>

        {/* RAM */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-gray-500 flex items-center gap-1.5">
              <MemoryStick className="w-3.5 h-3.5" /> RAM
            </span>
            <span className={metrics.ram > 80 ? "text-red-600" : "text-gray-700"}>
              {metrics.ram.toFixed(1)}% <span className="text-gray-400 font-normal">({(metrics.ramUsed / (1024 ** 3)).toFixed(1)}GB)</span>
            </span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${metrics.ram > 80 ? "bg-red-500" : metrics.ram > 50 ? "bg-yellow-500" : "bg-purple-500"}`}
              style={{ width: `${metrics.ram}%` }}
            />
          </div>
        </div>

        {/* Disk */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-gray-500 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5" /> Disk
            </span>
            <span className={metrics.disk > 80 ? "text-red-600" : "text-gray-700"}>
              {metrics.disk.toFixed(1)}% <span className="text-gray-400 font-normal">({(metrics.diskUsed / (1024 ** 3)).toFixed(1)}GB)</span>
            </span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${metrics.disk > 80 ? "bg-red-500" : metrics.disk > 50 ? "bg-yellow-500" : "bg-emerald-500"}`}
              style={{ width: `${metrics.disk}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};