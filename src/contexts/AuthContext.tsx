// src/contexts/AuthContext.tsx - UPDATED FOR ADMIN APP
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios from 'axios';
import { AuthState, User } from '../types/auth';
import { KBAuthSession } from '@/config';  // <-- IMPORT ADDED

const AuthContext = createContext<{
  authState: AuthState;
  login: (user: User) => void;
  logout: () => void;
  loading: boolean;
  updateUserStatus: (newStatus: string) => void;
  refreshAgents: () => Promise<void>;
}>({
  authState: { user: null, isAuthenticated: false },
  login: () => {},
  logout: () => {},
  updateUserStatus: () => {},
  refreshAgents: async () => {},
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });
  const [loading, setLoading] = useState(true);

  console.log("authState", authState);

  // Fetch agents data for supervisor
  const fetchAgentsForSupervisor = async (userId: string) => {
    try {
      console.log("Fetching agents for supervisor:", userId);
      
      const response = await axios.get(`https://10.16.7.96:5050/api/users`, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status === 200 && response.data) {
        console.log("All users from API:", response.data);
        
        const agents = response.data.filter(
          (user: any) => 
            user.supervisor_reference === userId &&
            (user.role === 'Agent' || user.role === 'agent')
        );
        
        console.log("Filtered agents for supervisor:", agents);
        return agents;
      }
      
      return [];
    } catch (error) {
      console.error("Error fetching agents:", error);
      
      // Fallback to stored WebSocket extensions
      const wsExtensions = sessionStorage.getItem('supervisor_extensions');
      if (wsExtensions) {
        console.log("Using fallback: WebSocket extensions");
        const extensions = JSON.parse(wsExtensions);
        
        return extensions.map((ext: string) => ({
          user_id: `agent_${ext}`,
          firstname: 'Agent',
          lastname: ext,
          fullname: `Agent ${ext}`,
          extension: ext,
          status: 'unknown',
          supervisor_reference: userId,
          role: 'Agent'
        }));
      }
      
      return [];
    }
  };

  // Store user data in BOTH sessionStorage AND cookie
  const saveUserData = (user: User) => {
    // Save to sessionStorage
    sessionStorage.setItem("loginDetails", JSON.stringify(user));
    
    // Save to cookie for Knowledge Base API
    const cookieData = JSON.stringify({
      user_id: user.user_id,
      username: user.user_id,
      email: (user as any).email,
      role: user.role,
      extension: user.extension,
    });
    
    document.cookie = `user-data=${encodeURIComponent(cookieData)}; path=/; max-age=86400; Secure; SameSite=Lax`;
    console.log("User data saved to cookie for KB API");
  };

  // Load auth state from sessionStorage on mount
  useEffect(() => {
    const loadAuthState = async () => {
      const stored = sessionStorage.getItem("loginDetails");
      if (stored) {
        const user = JSON.parse(stored);
        
        // If supervisor and no agents, fetch them
        if (user.role === 'Supervisor' && (!user.agents || user.agents.length === 0)) {
          console.log("Supervisor detected without agents, fetching...");
          const agents = await fetchAgentsForSupervisor(user.user_id);
          user.agents = agents;
          saveUserData(user);
        } else {
          saveUserData(user); // Ensure cookie is set
        }
        
        setAuthState({
          user,
          isAuthenticated: true,
        });
      }
      setLoading(false);
    };

    loadAuthState();
  }, []);

  const login = async (user: User) => {
    console.log("Login called with user:", user);
    
    // Fetch agents if supervisor
    if (user.role === 'Supervisor') {
      console.log("User is supervisor, fetching agents...");
      const agents = await fetchAgentsForSupervisor(user.user_id);
      user.agents = agents;
      console.log("Agents fetched and attached:", agents);
    }
    
    setAuthState({
      user,
      isAuthenticated: true,
    });
    
    saveUserData(user);

    // ==================== SYNC KB SESSION ====================
    KBAuthSession.syncFromMainAuth();
    console.log("KB Session synced on login");
    // ==================================================
  };

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
    });
    sessionStorage.removeItem("loginDetails");
    sessionStorage.removeItem("supervisor_extensions");
    
    // Clear cookie
    document.cookie = "user-data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; SameSite=Lax";
    console.log("User data cleared from cookie");

    // ==================== CLEAR KB SESSION ====================
    KBAuthSession.clear();
    console.log("KB Session cleared on logout");
    // ==================================================
  };

  const updateUserStatus = (newStatus: string) => {
    if (authState.user) {
      const updatedUser = { ...authState.user, status: newStatus };
      setAuthState((prev) => ({
        ...prev,
        user: updatedUser,
      }));
      saveUserData(updatedUser);
    }
  };

  // Manual refresh function for agents
  const refreshAgents = async () => {
    if (authState.user && authState.user.role === 'Supervisor') {
      console.log("Manually refreshing agents...");
      const agents = await fetchAgentsForSupervisor(authState.user.user_id);
      
      const updatedUser = { ...authState.user, agents };
      setAuthState((prev) => ({
        ...prev,
        user: updatedUser,
      }));
      saveUserData(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout, loading, updateUserStatus, refreshAgents }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);