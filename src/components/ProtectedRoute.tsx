// components/ProtectedRoute.tsx
import { useAuth } from '@/contexts/AuthContext';
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { syncAuth, getAuthData } from '@/config'; // ← Critical import

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('Admin' | 'Agent' | 'Supervisor')[];
  allowInKB?: boolean; // ← NEW: Special flag for KB
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles,
  allowInKB = false 
}) => {
  const { authState, loading } = useAuth();
  const location = useLocation();

  // FORCE SYNC AUTH ON EVERY PROTECTED ROUTE
  useEffect(() => {
    syncAuth();
  }, []);

  // RECHECK AUTH FROM CONFIG (MORE RELIABLE THAN CONTEXT DURING RACE)
  const fallbackAuth = getAuthData();
  const isAuthenticated = authState.isAuthenticated || !!fallbackAuth;
  const userRole = authState.user?.role || fallbackAuth?.role;

  const currentPath = location.pathname;
  const isInKnowledgeBase = currentPath.includes('/knowledge-base') || currentPath.includes('/kb');

  // SHOW LOADING
  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', fontSize: '1.2rem' }}>
        Loading...
      </div>
    );
  }

  // BLOCK REDIRECT IF WE'RE IN KNOWLEDGE BASE (AND allowInKB IS TRUE)
  if (allowInKB && isInKnowledgeBase) {
    console.log("ProtectedRoute: Inside Knowledge Base → allowing access even if auth delayed");
    return <>{children}</>;
  }

  // NOT AUTHENTICATED
  if (!isAuthenticated) {
    console.warn("ProtectedRoute: Not authenticated → redirecting to /");
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // ROLE NOT ALLOWED
  if (allowedRoles && userRole && !allowedRoles.includes(userRole as any)) {
    console.warn(`ProtectedRoute: Role ${userRole} not allowed → redirecting to /dashboard`);
    return <Navigate to="/dashboard" replace />;
  }

  // ALL GOOD
  return <>{children}</>;
};

export default ProtectedRoute;