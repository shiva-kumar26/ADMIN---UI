import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Phone, Clock, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import your custom context hook that provides real-time metrics state
import { useRealtimeMetrics } from './RealtimeMetricsContext';

const RealtimeMetricsCards = () => {
  const navigate = useNavigate();

  // Get real-time metrics from context (replace with your actual context or props)
  const { agentMetrics, queueMetrics } = useRealtimeMetrics();

  // Prepare cards data dynamically using real metrics
  const cards = [
    {
      title: 'Real-Time Agent Metrics',
      value: agentMetrics.totalAgents,
      icon: <Users className="h-6 w-6 text-blue-600" />,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-900',
      subtitle: 'Active agents monitoring',
      path: '/realtime-agents'
    },
    {
      title: 'Real-Time Queue Metrics',
      value: queueMetrics.callsWaiting,
      icon: <Clock className="h-6 w-6 text-blue-600" />,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-900',
      subtitle: 'Queue performance tracking',
      path: '/realtime-queues'
    }
  ];

  const formatSecondsToHHMMSS = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (num: number) => num.toString().padStart(2, '0');

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const handleCardClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="h-[(100vh-64px)] overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-3 py-4">
        {/* Header Section */}
        <div className="mb-8">
          <div
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
            style={{ marginTop: '2rem' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Real-Time Metrics Dashboard
                </h1>
                <p className="text-gray-600 text-lg">Live call center performance monitoring</p>
              </div>
              <div className="flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-full">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-800 font-medium">Live Data</span>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {cards.map((card, index) => (
            <Card
              key={index}
              // className={`${card.bgColor} border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer`}
              className={`${card.bgColor} border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] cursor-pointer overflow-hidden`}
              onClick={() => handleCardClick(card.path)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className={`text-sm font-medium ${card.textColor}`}>{card.title}</CardTitle>
                <div className="p-2 bg-white rounded-lg shadow-sm">{card.icon}</div>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${card.textColor} mb-1`}>{card.value}</div>
                <p className={`text-xs ${card.textColor} opacity-70`}>{card.subtitle}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Status Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Agent Status */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Agent Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Available</span>
                  <span className="text-green-600 font-bold">{agentMetrics.availableAgents}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">On Call</span>
                  <span className="text-blue-600 font-bold">{agentMetrics.onCallAgents}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Break/Away</span>
                  <span className="text-yellow-600 font-bold">{agentMetrics.breakAwayAgents}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Queue Performance */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <Phone className="h-5 w-5 mr-2 text-purple-600" />
                Queue Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Service Level (60s)</span>
                  <span className="text-green-600 font-bold">{queueMetrics.serviceLevel60}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Abandoned Rate</span>
                  {/* You might want to calculate or add abandoned rate in your queueMetrics */}
                  <span className="text-red-600 font-bold">--%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Call Wait Time</span>
                  <span className="text-orange-600 font-bold">{queueMetrics.callWaitTime}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agent Performance */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-orange-600" />
                Agent Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Avg Handle Time</span>
                  <span className="text-blue-600 font-bold">{agentMetrics.avgHandleTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Call Handled Time</span>
                  <span className="text-green-600 font-bold">
                    {formatSecondsToHHMMSS(agentMetrics.callHandledTime)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Calls Handled</span>
                  <span className="text-purple-600 font-bold">{agentMetrics.callsHandled}</span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default RealtimeMetricsCards;
