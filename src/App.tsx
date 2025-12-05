// App.tsx (updated)
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import LoginPage from './components/LoginPage';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import UserDetails from './pages/UserDetails';
import MyAgents from './pages/MyAgents';
import Queues from './pages/Queues';
import ChatTemplates from './pages/ChatTemplates';
import EmailTemplates from './pages/EmailTemplates';
import IVRFlow from './pages/IVRFlow';
import DashboardLayout from './components/layout/DashboardLayout';
import NotFound from "./pages/NotFound";
import UserCreation from './pages/UserCreation';
import QueueDetails from './pages/QueueDetails';
import QueueCreation from './pages/QueueCreation';
import AgentDashboard from "./pages/dashboards/AgentDashboard";
import DialplanManagement from "./pages/DialplanManagement";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import DialplanEditPage from "./components/dialplan/DialplanEditPage";
import DialplanForm from "./components/dialplan/DialplanForm";
import DialplanAddPage from "./components/dialplan/DialplanAddPage";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import DialplanViewPage from "./components/dialplan/DialplanViewPage";
import SupervisorDashboard from "./pages/dashboards/SupervisorDashboard";
import HistoricalMetricsMain from "./pages/HistoricalMetrics/HistoricalMetricsMain";
import RealtimeMetricsCards from "./pages/RealTimeReports/RealtimeMetricsCards";
import RealTimeAgentMetrics from "./pages/RealTimeReports/RealTimeAgentMetrics";
import RealTimeQueuesMetrics from "./pages/RealTimeReports/RealTimeQueuesMetrics";
import HistoricalAgents from "./pages/HistoricalMetrics/Agent/HistoricalAgents";
import HistoricalQueues from "./pages/HistoricalMetrics/Queues/HistoricalQueues";
import AgentLoginLogout from "./pages/HistoricalMetrics/LoginLogout/AgentLoginLogout";
import CdrReports from "./pages/HistoricalMetrics/CDR/CdrReports";
import { MetricsCountsProvider } from "./pages/HistoricalMetrics/MetricsCountsContext";
import { RealtimeMetricsProvider } from "./pages/RealTimeReports/RealtimeMetricsContext";
import IVRFlowDesignerWithProvider from "./pages/IVRFlowDesignerWithProvider";
import KnowledgeBase from './pages/KnowledgeBase';
import RecordingsPage from './pages/HistoricalMetrics/Recordings/recordingspage';
import QualityAnalyzerPage from './pages/HistoricalMetrics/QualityAnalyzer/QualityAnalyzerPage';

// In your routes:
<Route path="/quality-analyzer" element={<QualityAnalyzerPage />} />


const queryClient = new QueryClient();

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: string[];
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { authState, loading } = useAuth();
  console.log('auth state app.tsx', authState)

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!authState.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && authState.user && !allowedRoles.includes(authState.user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { authState } = useAuth();
  return (
    <Routes>
      <Route
        path="/"
        element={
          authState.isAuthenticated
            ? authState.user.role === 'Admin'
              ? <Navigate to="/dashboard" replace />
              : authState.user.role === 'Supervisor'
              ? <Navigate to="/supervisor-dashboard" replace />
              : authState.user.role === 'Agent'
              ? <Navigate to="/home" replace />
              : <Navigate to="/dashboard" replace />
            : <LoginPage />
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <DashboardLayout>
              <AdminDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user-management"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <DashboardLayout>
              <UserManagement /> 
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user-details/:id"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <DashboardLayout>
              <UserDetails />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/home"
        element={
          <ProtectedRoute allowedRoles={['Agent']}>
            <DashboardLayout>
              <AgentDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/supervisor-dashboard"
        element={
          <ProtectedRoute allowedRoles={['Supervisor']}>
            <DashboardLayout>
              <SupervisorDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-agents"
        element={
          <ProtectedRoute allowedRoles={['Supervisor']}>
            <DashboardLayout>
              <MyAgents />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/historical-reports"
        element={
          <ProtectedRoute allowedRoles={['Supervisor']}>
            <DashboardLayout>
              <HistoricalMetricsMain />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/realtime-reports"
        element={
          <ProtectedRoute allowedRoles={['Supervisor']}>
            <DashboardLayout>
              <RealtimeMetricsCards />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/realtime-agents"
        element={
          <ProtectedRoute allowedRoles={['Supervisor']}>
            <DashboardLayout>
              <RealTimeAgentMetrics />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/realtime-queues"
        element={
          <ProtectedRoute allowedRoles={['Supervisor']}>
            <DashboardLayout>
              <RealTimeQueuesMetrics />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/historical-agents"
        element={
          <DashboardLayout>
            <HistoricalAgents />
          </DashboardLayout>
        }
      />
      <Route
        path="/historical-queues"
        element={
          <DashboardLayout>
            <HistoricalQueues />
          </DashboardLayout>
        }
      />
      <Route
        path="/agent-login-logout"
        element={
          <DashboardLayout>
            <AgentLoginLogout />
          </DashboardLayout>
        }
      />
      <Route
        path="/cdr-reports"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <CdrReports />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/recordings"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <RecordingsPage />
            </DashboardLayout>
          </ProtectedRoute>
       }
      />
      <Route
  path="/quality-analyzer"
  element={
    <ProtectedRoute allowedRoles={['Supervisor', 'Admin']}>
      <DashboardLayout>
        <QualityAnalyzerPage />
      </DashboardLayout>
    </ProtectedRoute>
  }
/>
      <Route
        path="/queues"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <DashboardLayout>
              <Queues />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat-templates"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <DashboardLayout>
              <ChatTemplates />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/email-templates"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <DashboardLayout>
              <EmailTemplates />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dialplan"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <DashboardLayout>
              <DialplanManagement />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dialplan-creating"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <DashboardLayout>
              <DialplanAddPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dialplan/:id"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <DashboardLayout>
              <DialplanEditPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dialplan/:id/view"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <DashboardLayout>
              <DialplanViewPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ivr-flow"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <DashboardLayout>
              <IVRFlowDesignerWithProvider />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Supervisor']}>
            <DashboardLayout>
              <Settings />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Supervisor']}>
            <DashboardLayout>
              <Notifications />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user-creation"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <DashboardLayout>
              <UserCreation />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/queue-creation"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <DashboardLayout>
              <QueueCreation />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/queue-details/:id"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <DashboardLayout>
              <QueueDetails />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
  path="/knowledge-base"
  element={
    <ProtectedRoute>
      <DashboardLayout>
        <KnowledgeBase />
      </DashboardLayout>
    </ProtectedRoute>
  }
/>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <MetricsCountsProvider>
          <RealtimeMetricsProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </RealtimeMetricsProvider>
        </MetricsCountsProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;




