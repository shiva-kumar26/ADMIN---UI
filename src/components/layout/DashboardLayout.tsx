import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider, useSidebar } from '../SidebarContext';
import AdminSidebar from './AdminSidebar';
import TopNavBar from './TopNavBar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  flowName?: string;
  onBackToProjects?: () => void;
  onNewFlow?: () => void;
  onSaveDraft?: () => void;
  onDeploy?: () => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  flowName,
  onBackToProjects,
  onNewFlow,
  onSaveDraft,
  onDeploy,
}) => {
  const { authState } = useAuth();
  const { user } = authState;
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  useEffect(() => {
    console.log('isSidebarOpen updated to:', isSidebarOpen, 'from route:', window.location.pathname);
  }, [isSidebarOpen]);

const renderSidebar = () => {
  console.log('Rendering sidebar for role:', user?.role, 'isOpen:', isSidebarOpen);
  return <AdminSidebar isOpen={isSidebarOpen} />;
};

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      <TopNavBar
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        flowName={flowName}
        onBackToProjects={onBackToProjects}
        onNewFlow={onNewFlow}
        onSaveDraft={onSaveDraft}
        onDeploy={onDeploy}
      />
      <div className="flex flex-1 overflow-hidden">
        {renderSidebar()}
       <main
  className={`flex-1 pt-16 pl-3 pr-3 pb-3 transition-all duration-300 ${
    isSidebarOpen ? 'ml-64' : 'ml-16'
  }`}
>
          {children}
        </main>
      </div>
    </div>
  );
};

// Wrap DashboardLayout with SidebarProvider
const WrappedDashboardLayout: React.FC<DashboardLayoutProps> = (props) => (
  <SidebarProvider>
    <DashboardLayout {...props} />
  </SidebarProvider>
);

export default WrappedDashboardLayout;