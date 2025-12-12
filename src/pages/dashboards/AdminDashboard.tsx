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
  Wifi
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

const AdminDashboard = () => {
  // Consume context
  const { users, loading: usersLoading, error, lastUpdated } = useGlobalUsers();

  const [loading, setLoading] = useState(false);

  // State for metrics
  const [totalUsersDetails, setTotalUsersDetails] = useState<DetailItem[]>([]);
  const [availableAgentsDetails, setAvailableAgentsDetails] = useState<DetailItem[]>([]);
  const [queueCount, setQueueCount] = useState('0');
  const [onCallDetails, setOnCallDetails] = useState<DetailItem[]>([]);

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
      // Get unique queues
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

      // Filter to show only queues with activity or just top ones, or all. All is safer for completeness.
      setAvailableAgentsDetails(availableStats);


      // --- On-Call Agents Breakdown (per Queue) ---
      // Assuming 'On Call' status or check other indicators. 
      // If exact status unknown, we check for 'Talking' or 'On Call'.
      const onCallStats = allQueues.map(q => {
        const queueUsers = users.filter(u => u.queue && u.queue.includes(q));
        const inCall = queueUsers.filter(u => u.status === 'On Call' || u.status === 'Talking' || (u.state && u.state === 'In Call')).length; // Adjust based on actual API values

        return {
          label: q,
          value: inCall
        };
      });

      // Only show queues with active calls to reduce clutter? Or all.
      // Let's filter to show only if > 0 to be cleaner, or all.
      setOnCallDetails(onCallStats);
    }
  }, [users]);

  useEffect(() => {
    const fetchQueueData = async () => {
      try {
        const queueResponse = await fetch('https://10.16.7.96/api/api/queue');
        if (!queueResponse.ok) {
          // Silent fail or minimal log
          console.warn('Queue fetch failed');
          return;
        }
        const queueData = await queueResponse.json();
        setQueueCount(queueData.length.toString());
      } catch (error) {
        // console.error(error);
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
    const interval = setInterval(fetchRealtimeData, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  // Fetch CDR Data (Daily Metrics)
  const [cdrData, setCdrData] = useState<any[]>([]);
  const [cdrLoading, setCdrLoading] = useState(false);

  useEffect(() => {
    const fetchCdrData = async () => {
      setCdrLoading(true);
      try {
        // Using Asia/Kolkata timezone as requested
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
    // Refresh CDR data less frequently or on demand? Let's keep it once on mount for now as it 'Today' snapshot, or poll slower.
    const interval = setInterval(fetchCdrData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  // --- Realtime Calculations (for Live Cards) ---
  const totalWaiting = realtimeQueueData.reduce((acc, q) => acc + (q.calls_waiting || 0), 0);

  // --- CDR Calculations (for Daily/Historical Cards) ---
  const filteredCdr = cdrData; // Can filter more if needed
  const totalCdrCalls = filteredCdr.length;

  // Breakdown based on hangup_cause
  // Abandoned: 'ORIGINATOR_CANCEL' (Customer hung up before answer)
  // Missed: 'NO_ANSWER' (Agent didn't answer)
  // Answered: Everything else (Total - Abandoned - Missed)
  const abandonedCdr = filteredCdr.filter(c => c.hangup_cause === 'ORIGINATOR_CANCEL');
  const missedCdr = filteredCdr.filter(c => c.hangup_cause === 'NO_ANSWER');
  // For answered, we can either subtract or filter 'NORMAL_CLEARING' etc. 
  // Let's use subtraction to ensure 100% breakdown coverage + consistency with Total.
  const answeredCount = totalCdrCalls - abandonedCdr.length - missedCdr.length;

  // Active Queues (Unique queues in today's CDR)
  const activeQueuesSet = new Set(filteredCdr.map(c => c.queue).filter(Boolean));
  const activeQueuesCount = activeQueuesSet.size.toString();
  const activeQueuesList = Array.from(activeQueuesSet).map(q => ({ label: q as string, value: 0 })); // Value 0 just for list listing? Or count calls per queue.
  // Group calls by queue for breakdowns
  const callsByQueue = filteredCdr.reduce((acc: any, c: any) => {
    const q = c.queue || 'Unknown';
    acc[q] = (acc[q] || 0) + 1;
    return acc;
  }, {});
  const answeredByQueue = filteredCdr.reduce((acc: any, c: any) => {
    if (c.hangup_cause !== 'ORIGINATOR_CANCEL' && c.hangup_cause !== 'NO_ANSWER') {
      const q = c.queue || 'Unknown';
      acc[q] = (acc[q] || 0) + 1;
    }
    return acc;
  }, {});
  const missedByQueue = missedCdr.reduce((acc: any, c: any) => {
    const q = c.queue || 'Unknown';
    acc[q] = (acc[q] || 0) + 1;
    return acc;
  }, {});
  const abandonedByQueue = abandonedCdr.reduce((acc: any, c: any) => {
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
        { label: 'Answered', value: answeredCount, subItems: Object.entries(answeredByQueue).map(([k, v]) => ({ label: k, value: v as number })).sort((a, b) => b.value - a.value) },
        { label: 'Missed', value: missedCdr.length, subItems: Object.entries(missedByQueue).map(([k, v]) => ({ label: k, value: v as number })).sort((a, b) => b.value - a.value) },
        { label: 'Abandoned', value: abandonedCdr.length, subItems: Object.entries(abandonedByQueue).map(([k, v]) => ({ label: k, value: v as number })).sort((a, b) => b.value - a.value) }
      ]
    },
    {
      title: 'Abandoned Calls',
      value: abandonedCdr.length.toString(),
      icon: PhoneOff,
      trend: 'Customer Churn',
      color: 'from-blue-800 to-blue-900',
      description: 'Customer hung up',
      details: Object.entries(abandonedByQueue).map(([k, v]) => ({ label: k, value: v as number })).sort((a, b) => b.value - a.value)
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
      details: [
        { label: 'Talking', value: realtimeAgentData.filter(a => a.status === 'Busy').length, subItems: realtimeAgentData.filter(a => a.status === 'Busy').map(a => ({ label: a.agent_name, value: 1 })) },
        { label: 'Waiting', value: totalWaiting, subItems: realtimeQueueData.filter(q => q.calls_waiting > 0).map(q => ({ label: q.queue_name, value: q.calls_waiting })) }
      ]
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
      details: [
        { label: 'Logged In Agents', value: users.filter(u => u.role && (Array.isArray(u.role) ? u.role.includes('Agent') : u.role === 'Agent') && u.status !== 'Logged Out').length },
        { label: 'Busy Agents', value: realtimeAgentData.filter(a => a.status === 'Busy').length }
      ]
    },
  ];

  return (
    <div className="space-y-8 p-6 mt-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          {/* <p className="text-muted-foreground mt-1">Monitor your system performance and activity</p> */}
        </div>
        <div className="flex items-center space-x-4">
          <Badge
            variant="secondary"
            className={`${error
              ? 'bg-red-100 text-red-800 border-red-200'
              : lastUpdated
                ? 'bg-blue-50 text-blue-700 border-blue-200' // Matches the light blue style in image
                : 'bg-gray-100 text-gray-800 border-gray-200'
              } px-3 py-1 flex items-center gap-2`}
          >
            <div className={`w-2 h-2 rounded-full ${error
              ? 'bg-red-500'
              : lastUpdated
                ? 'bg-green-500 animate-pulse' // Green dot for live
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
          {/* <Badge variant="outline" className="text-blue-600 border-blue-200">
            Last updated: 2 min ago
          </Badge> */}
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
                {/* Background differentiation */}
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


      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-600" />
                System Metrics
              </CardTitle>
              <Badge variant="outline" className="text-xs">Live</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {systemMetrics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{metric.label}</span>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${
                    metric.status === 'good' ? 'text-green-600' : 
                    metric.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {metric.value}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${
                    metric.status === 'good' ? 'bg-green-500' : 
                    metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

   
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center">
              <Users className="w-5 h-5 mr-2 text-green-600" />
              Agent Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {agentPerformance.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{item.value}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>

   
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center">
                <Zap className="w-5 h-5 mr-2 text-purple-600" />
                Live Activity
              </CardTitle>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-muted-foreground">Live</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {liveActivities.slice(0, 3).map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(activity.status)}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-600" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {liveActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(activity.status)}`} />
                    <p className="text-sm font-medium">{activity.message}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <Database className="w-5 h-5 mr-2 text-green-600" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemStatus.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium">{item.service}</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${item.color}`}>{item.status}</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                </div>
              ))}
              
 
              <div className="space-y-3 pt-4 border-t">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>CPU Usage</span>
                    <span className="text-muted-foreground">30%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: '30%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Memory Usage</span>
                    <span className="text-muted-foreground">69%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full transition-all duration-300" style={{ width: '69%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Storage Usage</span>
                    <span className="text-muted-foreground">45%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{ width: '45%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}
    </div>
  );
};
export default AdminDashboard;
