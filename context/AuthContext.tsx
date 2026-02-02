'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fastfoodApi } from '@/api/fastfoodApi';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: any | null;
    loading: boolean;
    isLoggedIn: boolean;
    login: (token: string) => Promise<void>;
    logout: () => void;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchProfile = useCallback(async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const profileData = await fastfoodApi.getProfile();
            if (profileData && profileData.user) {
                setUser(profileData.user);
            } else {
                setUser(null);
                localStorage.removeItem('auth_token');
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            setUser(null);
            // Don't remove token automatically on transient errors, 
            // but 401 should be handled by api interceptor ideally
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const login = async (token: string) => {
        localStorage.setItem('auth_token', token);
        setLoading(true);
        await fetchProfile();
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        setUser(null);
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            isLoggedIn: !!user,
            login,
            logout,
            refreshProfile: fetchProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
