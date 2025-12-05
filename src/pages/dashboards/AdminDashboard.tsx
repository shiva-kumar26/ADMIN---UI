


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
 const AdminDashboard = () => {
  const [loading, setLoading] =useState(false)
const [mainStats, setMainStats] = useState([
    { 
      title: 'Total Users', 
      value: '0', 
      icon: Users, 
      trend: 'N/A', 
      color: 'from-blue-500 to-blue-600',
      description: 'Registered users'
    },
    { 
      title: 'Available Agents', 
      value: '0', 
      icon: UserCheck, 
      trend: 'N/A', 
      color: 'from-green-500 to-green-600',
      description: 'Available now'
    },
    { 
      title: 'Queue Count', 
      value: '0', 
      icon: MessageSquare, 
      trend: '0%', 
      color: 'from-orange-500 to-orange-600',
      description: 'Active queues'
    },
    { 
      title: 'Templates', 
      value: '42', 
      icon: CheckCircle, 
      trend: '+5%', 
      color: 'from-red-500 to-red-600',
      description: '5 updated today'
    },
  ]);
useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch users
        const userResponse = await fetch('https://10.16.7.96/api/directory_search/');
        if (!userResponse.ok) {
          throw new Error(`User API error! Status: ${userResponse.status}`);
        }
        const userData = await userResponse.json();
        const totalUsers = userData.length;
        const availableAgents = userData.filter((user: { status: string }) => user.status === 'Available').length;

        // Fetch queues
        const queueResponse = await fetch('https://10.16.7.96/api/api/queue');
        if (!queueResponse.ok) {
          throw new Error(`Queue API error! Status: ${queueResponse.status}`);
        }
        const queueData = await queueResponse.json();
        const queueCount = queueData.length;

        // Update mainStats with fetched data
        setMainStats((prevStats) => [
          { 
            ...prevStats[0], 
            value: totalUsers.toString(), 
            trend: prevStats[0].trend 
          },
          { 
            ...prevStats[1], 
            value: availableAgents.toString(), 
            trend: prevStats[1].trend 
          },
          { 
            ...prevStats[2], 
            value: queueCount.toString(), 
            trend: prevStats[2].trend 
          },
          ...prevStats.slice(3), // Keep Templates stat unchanged
        ]);
      } catch (error: any) {
        console.error('Fetch error:', error);
        toast({
          title: 'Error',
          description: `Failed to fetch data: ${error.message}`,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  

  const systemMetrics = [
    { label: 'CPU Usage', value: '30%', status: 'good' },
    { label: 'Memory', value: '69%', status: 'warning' },
    { label: 'Network', value: 'Online', status: 'good' }
  ];

  const agentPerformance = [
    { label: 'On Break', value: '0', icon: Clock },
    { label: 'Avg Handle Time', value: '208s', icon: BarChart3 },
    { label: 'Longest Idle', value: 'Agent 4', icon: Users }
  ];

  const liveActivities = [
    { message: 'Call answered by Agent 3', status: 'success', time: '2 min ago' },
    { message: 'New call in Support queue', status: 'info', time: '5 min ago' },
    { message: 'Agent 7 went on break', status: 'warning', time: '8 min ago' },
    { message: 'Queue timeout resolved', status: 'success', time: '12 min ago' }
  ];

  const systemStatus = [
    { service: 'Server Status', status: 'Online', color: 'text-green-600' },
    { service: 'Database', status: 'Connected', color: 'text-green-600' },
    { service: 'Queue Processing', status: 'Active', color: 'text-green-600' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'info': return 'bg-blue-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-8 p-6 mt-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          {/* <p className="text-muted-foreground mt-1">Monitor your system performance and activity</p> */}
        </div>
        {/* <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
            <Wifi className="w-3 h-3 mr-1" />
            System Online
          </Badge>
          <Badge variant="outline" className="text-blue-600 border-blue-200">
            Last updated: 2 min ago
          </Badge>
        </div> */}
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="relative overflow-hidden border-0 shadow-lg">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-90`} />
              <CardContent className="relative p-6 text-white">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-white/80 text-sm font-medium">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <p className="text-white/70 text-xs">{stat.description}</p>
                  </div>
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-xs text-white/80">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {stat.trend} from last period
                </div>
              </CardContent>
            </Card>
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
