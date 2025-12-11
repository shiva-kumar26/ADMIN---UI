import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DirectoryUser } from '@/types/api';
import { ApiService } from '@/services/api';
import { useAuth } from './AuthContext';

interface GlobalUsersContextType {
    users: DirectoryUser[];
    loading: boolean;
    error: string | null;
    lastUpdated: Date | null;
    refreshUsers: () => Promise<void>;
}

const GlobalUsersContext = createContext<GlobalUsersContextType | undefined>(undefined);

export const GlobalUsersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { authState } = useAuth();
    const [users, setUsers] = useState<DirectoryUser[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchUsers = useCallback(async (isPolling = false) => {
        if (!authState.isAuthenticated) return;

        // Only set loading to true for the initial fetch, not polling
        if (!isPolling && users.length === 0) {
            setLoading(true);
        }

        try {
            // Using ApiService.getUsers() which fetches from https://10.16.7.96/api/directory_search/
            const data = await ApiService.getUsers();
            setUsers(data);
            setLastUpdated(new Date());
            setError(null);
        } catch (err: any) {
            console.error('Failed to fetch users:', err);
            // Only set error if we don't have existing data to show
            if (users.length === 0) {
                setError(err.message || 'Failed to fetch users');
            }
        } finally {
            if (!isPolling) {
                setLoading(false);
            }
        }
    }, [authState.isAuthenticated]); // Add authState dependency

    const refreshUsers = async () => {
        if (authState.isAuthenticated) {
            await fetchUsers(true);
        }
    };

    useEffect(() => {
        if (!authState.isAuthenticated) return;

        // Initial fetch
        fetchUsers();

        // Polling interval (5 seconds)
        const intervalId = setInterval(() => {
            fetchUsers(true);
        }, 5000);

        return () => clearInterval(intervalId);
    }, [fetchUsers, authState.isAuthenticated]);

    return (
        <GlobalUsersContext.Provider value={{ users, loading, error, lastUpdated, refreshUsers }}>
            {children}
        </GlobalUsersContext.Provider>
    );
};

export const useGlobalUsers = () => {
    const context = useContext(GlobalUsersContext);
    if (context === undefined) {
        throw new Error('useGlobalUsers must be used within a GlobalUsersProvider');
    }
    return context;
};
