import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Mic, ChevronRight } from "lucide-react";

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
  Server,
  Clock,
  Inbox,
  PhoneCall,
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen }) => {
  const { logout, authState } = useAuth();
  const user = authState.user;
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for collapsible sections
  const [isChatAdminOpen, setIsChatAdminOpen] = React.useState(false);
  const [isEmailAdminOpen, setIsEmailAdminOpen] = React.useState(false);
  const [isVoiceAdminOpen, setIsVoiceAdminOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  let menuItems: { path: string; icon: any; label: string }[] = [];

  if (user?.role === 'Admin') {
    menuItems = [
      { path: '/dashboard', icon: Home, label: 'Dashboard' },
      { path: '/user-management', icon: User, label: 'User Management' },
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
      { path: '/notifications', icon: Bell, label: 'Alerts' },
    ];
  } else if (user?.role === 'Agent') {
    menuItems = [
      { path: '/dashboard', icon: Home, label: 'Home' },
    ];
  }

  return (
    <aside
      className={`fixed left-0 top-0 h-screen ${isOpen ? 'w-64' : 'w-16'
        } bg-white border-r border-gray-200 z-40 transition-all duration-300 flex flex-col`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200 px-4">
        <img
          src="./Zeniusitservices.png"
          alt="logo"
          className={`${isOpen ? 'h-10' : 'h-8'} w-auto object-contain transition-all duration-300`}
        />
      </div>

      {/* Scrollable Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">

        {/* ================= ADMIN MENU ================= */}
        {user?.role === 'Admin' && (
          <div className="space-y-0.5">

            {/* BASIC MENU ITEMS */}
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard'}
                className={({ isActive }) => {
                  let active = isActive;

                  if (item.path === '/user-management') {
                    active =
                      location.pathname === '/user-management' ||
                      location.pathname.startsWith('/user-details') ||
                      location.pathname === '/user-creation';
                  }

                  return `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                    } ${!isOpen && 'justify-center'}`;
                }}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span>{item.label}</span>}
              </NavLink>
            ))}

            {/* ================= CHAT ADMINISTRATION (COLLAPSIBLE) ================= */}
            <div className="mt-1">
              <button
                onClick={() => setIsChatAdminOpen(!isChatAdminOpen)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-gray-700 hover:bg-gray-50 ${!isOpen && 'justify-center'
                  }`}
              >
                <MessageSquare className="w-5 h-5 flex-shrink-0" />
                {isOpen && (
                  <>
                    <span className="flex-1 text-left">Chat Administration</span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${isChatAdminOpen ? 'rotate-90' : ''}`} />
                  </>
                )}
              </button>

              {isChatAdminOpen && isOpen && (
                <div className="mt-1 ml-8 space-y-0.5">
                  <NavLink
                    to="/chat-templates"
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${isActive
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`
                    }
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Chat Templates</span>
                  </NavLink>
                </div>
              )}
            </div>

            {/* ================= EMAIL ADMINISTRATION (COLLAPSIBLE) ================= */}
            <div className="mt-1">
              <button
                onClick={() => setIsEmailAdminOpen(!isEmailAdminOpen)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-gray-700 hover:bg-gray-50 ${!isOpen && 'justify-center'
                  }`}
              >
                <Mail className="w-5 h-5 flex-shrink-0" />
                {isOpen && (
                  <>
                    <span className="flex-1 text-left">Email Administration</span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${isEmailAdminOpen ? 'rotate-90' : ''}`} />
                  </>
                )}
              </button>

              {isEmailAdminOpen && isOpen && (
                <div className="mt-1 ml-8 space-y-0.5">
                  <NavLink
                    to="/email-templates"
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${isActive
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`
                    }
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email Templates</span>
                  </NavLink>

                  <NavLink
                    to="/email-servers"
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${isActive
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`
                    }
                  >
                    <Server className="w-4 h-4" />
                    <span>Email Servers</span>
                  </NavLink>

                  <NavLink
                    to="/email-queues"
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${isActive
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`
                    }
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email Queues</span>
                  </NavLink>

                  <NavLink
                    to="/queue-settings"
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${isActive
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`
                    }
                  >
                    <Clock className="w-4 h-4" />
                    <span>Queue Settings</span>
                  </NavLink>

                  <NavLink
                    to="/server-inbox"
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${isActive
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`
                    }
                  >
                    <Inbox className="w-4 h-4" />
                    <span>Server Inbox</span>
                  </NavLink>
                </div>
              )}
            </div>

            {/* ================= VOICE ADMINISTRATION (COLLAPSIBLE) ================= */}
            <div className="mt-1">
              <button
                onClick={() => setIsVoiceAdminOpen(!isVoiceAdminOpen)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-gray-700 hover:bg-gray-50 ${!isOpen && 'justify-center'
                  }`}
              >
                <PhoneCall className="w-5 h-5 flex-shrink-0" />
                {isOpen && (
                  <>
                    <span className="flex-1 text-left">Voice Administration</span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${isVoiceAdminOpen ? 'rotate-90' : ''}`} />
                  </>
                )}
              </button>

              {isVoiceAdminOpen && isOpen && (
                <div className="mt-1 ml-8 space-y-0.5">
                  <NavLink
                    to="/dialplan"
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${isActive
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`
                    }
                  >
                    <Phone className="w-4 h-4" />
                    <span>Dialplan</span>
                  </NavLink>

                  <NavLink
                    to="/ivr-flow"
                    className={({ isActive }) => {
                      const active = location.pathname.startsWith('/ivr-flow');
                      return `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${active
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`;
                    }}
                  >
                    <GitBranch className="w-4 h-4" />
                    <span>IVR Flow</span>
                  </NavLink>

                  <NavLink
                    to="/queues"
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${isActive
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`
                    }
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Call Queues</span>
                  </NavLink>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ================= SUPERVISOR MENU ================= */}
        {user?.role === 'Supervisor' && (
          <div className="space-y-0.5">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                  } ${!isOpen && 'justify-center'}`
                }
              >
                <item.icon className="w-5 h-5" />
                {isOpen && <span>{item.label}</span>}
              </NavLink>
            ))}
          </div>
        )}

        {/* ================= AGENT MENU ================= */}
        {user?.role === 'Agent' && (
          <div className="space-y-0.5">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                  } ${!isOpen && 'justify-center'}`
                }
              >
                <item.icon className="w-5 h-5" />
                {isOpen && <span>{item.label}</span>}
              </NavLink>
            ))}
          </div>
        )}

      </nav>


      {/* Footer */}
      <div className="border-t border-gray-200 p-2">
        {(user?.role === 'Admin' || user?.role === 'Supervisor') && (
          <div className="space-y-0.5">
            <NavLink
              to="/notifications"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
                } ${!isOpen && 'justify-center'}`
              }
            >
              <Bell className="w-5 h-5" />
              {isOpen && <span>Notifications</span>}
            </NavLink>

            {user?.role === 'Admin' && (
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                  } ${!isOpen && 'justify-center'}`
                }
              >
                <Settings className="w-5 h-5" />
                {isOpen && <span>Settings</span>}
              </NavLink>
            )}
          </div>
        )}

        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-gray-700 hover:bg-red-50 hover:text-red-600 mt-1 ${!isOpen && 'justify-center'
            }`}
        >
          <LogOutIcon className="w-5 h-5" />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;