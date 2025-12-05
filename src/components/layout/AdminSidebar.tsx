import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Mic } from "lucide-react";
import {
  User,
  Bell,
  Settings,
  Home,
  Calendar,
  MessageSquare,
  Mail,
  Phone,
  GitBranch,
  Database,
  Activity,
  BarChart2,
  LogOut as LogOutIcon,
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen }) => {
  const { logout, authState } = useAuth();
  const user = authState.user;
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  let menuItems: { path: string; icon: any; label: string }[] = [];

  if (user?.role === 'Admin') {
    menuItems = [
      { path: '/dashboard', icon: Home, label: 'Dashboard' },
      { path: '/user-management', icon: User, label: 'User Management' },
      { path: '/queues', icon: Calendar, label: 'Queues' },
      { path: '/chat-templates', icon: MessageSquare, label: 'Chat Templates' },
      { path: '/email-templates', icon: Mail, label: 'Email Templates' },
      { path: '/dialplan', icon: Phone, label: 'Dialplan' },
      { path: '/ivr-flow', icon: GitBranch, label: 'IVR Flow' },
      { path: '/knowledge-base', icon: Database, label: 'Knowledge Base' },
    ];
  } else if (user?.role === 'Supervisor') {
    menuItems = [
      { path: '/supervisor-dashboard', icon: Home, label: 'Home' },
      { path: '/my-agents', icon: User, label: 'My Agents' },
      { path: '/realtime-reports', icon: Activity, label: 'Realtime Reports' },
      { path: '/historical-reports', icon: BarChart2, label: 'Historical Reports' },
      { path: '/recordings', icon: Mic, label: 'Recordings' },
        { path: '/quality-analyzer', icon: BarChart2, label: 'Quality Analyzer' }, 
    ];
  } else if (user?.role === 'Agent') {
    menuItems = [
      { path: '/dashboard', icon: Home, label: 'Home' },
    ];
  }

  return (
    <aside
      className={`fixed left-0 top-0 h-screen ${
        isOpen ? 'w-64' : 'w-20'
      } bg-white border-r border-gray-200 z-40 transition-all duration-300 flex flex-col`}
    >
      {/* Logo */}
      <div className="flex items-center justify-center py-3 px-2">
        <img
          src="./Zeniusitservices.png"
          alt="logo"
          className="w-20 h-30 object-contain"
        />
      </div>

      {/* Scrollable Menu */}
      <nav className="flex-1 overflow-y-auto px-2">
        {/* Admin Menu */}
        {user?.role === 'Admin' && (
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/dashboard'}
                  className={({ isActive }) => {
                    let active = isActive;
                    if (item.path === '/user-management') {
                      active =
                        location.pathname === '/user-management' ||
                        location.pathname.startsWith('/user-details') ||
                        location.pathname === '/user-creation';
                    } else if (item.path === '/ivr-flow') {
                      active = location.pathname.startsWith('/ivr-flow');
                    }
                    return `flex items-center ${
                      isOpen ? 'space-x-3 px-4' : 'justify-center px-2'
                    } py-3 rounded-lg transition-all duration-200 group ${
                      active
                        ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                    }`;
                  }}
                  title={!isOpen ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0 text-current" />
                  {isOpen && <span className="font-medium">{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        )}

        {/* Supervisor Menu */}
        {user?.role === 'Supervisor' && (
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center ${
                      isOpen ? 'space-x-3 px-4' : 'justify-center px-2'
                    } py-3 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                    }`
                  }
                  title={!isOpen ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0 text-current" />
                  {isOpen && <span className="font-medium">{item.label}</span>}
                </NavLink>
              </li>
            ))}

            {/* Notifications for Supervisor */}
            <li>
              <NavLink
                to="/notifications"
                className={({ isActive }) =>
                  `flex items-center ${
                    isOpen ? 'space-x-3 px-4' : 'justify-center px-2'
                  } py-3 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                  }`
                }
                title={!isOpen ? 'Notifications' : undefined}
              >
                <Bell className="w-5 h-5 flex-shrink-0 text-current" />
                {isOpen && <span className="font-medium">Notifications</span>}
              </NavLink>
            </li>
          </ul>
        )}

        {/* Agent Menu */}
        {user?.role === 'Agent' && (
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center ${
                      isOpen ? 'space-x-3 px-4' : 'justify-center px-2'
                    } py-3 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                    }`
                  }
                  title={!isOpen ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0 text-current" />
                  {isOpen && <span className="font-medium">{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </nav>

      {/* Footer: Always at Bottom */}
      <div className="border-t border-gray-200 p-3 mt-auto">
        <div className="space-y-1">
          {/* Admin Extra Links */}
          {user?.role === 'Admin' && (
            <>
              <NavLink
                to="/notifications"
                className={({ isActive }) =>
                  `flex items-center ${
                    isOpen ? 'space-x-3 px-4' : 'justify-center px-2'
                  } py-3 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                  }`
                }
                title={!isOpen ? 'Notifications' : undefined}
              >
                <Bell className="w-5 h-5 flex-shrink-0 text-current" />
                {isOpen && <span className="font-medium">Notifications</span>}
              </NavLink>

              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `flex items-center ${
                    isOpen ? 'space-x-3 px-4' : 'justify-center px-2'
                  } py-3 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                  }`
                }
                title={!isOpen ? 'Settings' : undefined}
              >
                <Settings className="w-5 h-5 flex-shrink-0 text-current" />
                {isOpen && <span className="font-medium">Settings</span>}
              </NavLink>
            </>
          )}

          {/* LOGOUT: Always Visible, Red on Hover */}
          <div
            onClick={handleLogout}
            className={`flex items-center cursor-pointer ${
              isOpen ? 'space-x-3 px-4' : 'justify-center px-2'
            } py-3 rounded-lg transition-all duration-200 group
              text-gray-600 hover:bg-red-50 hover:text-red-600
              border border-transparent hover:border-red-200`}
            title="Logout"
          >
            <LogOutIcon className="w-5 h-5 flex-shrink-0 text-current group-hover:text-red-600" />
            {isOpen && <span className="font-medium group-hover:text-red-600">Logout</span>}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;