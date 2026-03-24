// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
    sub: string; // username
    role: string;
    doctorId?: number;
    exp?: number; // JWT expiry timestamp
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: (token: string) => void;
    logout: () => void;
    hasRole: (role: string) => boolean;
    isPatient: () => boolean;
    isDoctor: () => boolean;
    isReceptionist: () => boolean;
    isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded: User = jwtDecode(token);
                // Check token expiry
                const now = Date.now() / 1000;
                if (decoded.exp && decoded.exp < now) {
                    localStorage.removeItem('token');
                } else {
                    setUser(decoded);
                }
            } catch {
                localStorage.removeItem('token');
            }
        }
    }, []);

    const login = (token: string) => {
        localStorage.setItem('token', token);
        const decoded: User = jwtDecode(token);
        setUser(decoded);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const hasRole = (role: string): boolean => {
        const userRole = user?.role?.replace('ROLE_', '') || 'USER';
        return userRole === role;
    };

    const isPatient = (): boolean => hasRole('PATIENT');
    const isDoctor = (): boolean => hasRole('DOCTOR');
    const isReceptionist = (): boolean => hasRole('RECEPTIONIST');
    const isAdmin = (): boolean => hasRole('ADMIN');

    const value = {
        isAuthenticated: !!user,
        user,
        login,
        logout,
        hasRole,
        isPatient,
        isDoctor,
        isReceptionist,
        isAdmin,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
