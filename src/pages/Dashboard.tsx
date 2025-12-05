
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminDashboard from './dashboards/AdminDashboard';
import AgentDashboard from './dashboards/AgentDashboard';
import SupervisorDashboard from './dashboards/SupervisorDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'agent':
      return <AgentDashboard />;
    case 'supervisor':
      return <SupervisorDashboard />;
    default:
      return <div>Loading...</div>;
  }
};

export default Dashboard;
