// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children?: ReactNode;
  requiredRoles?: string[];
}

export default function ProtectedRoute({ children, requiredRoles = [] }: ProtectedRouteProps) {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check role-based access if roles are specified
    if (requiredRoles.length > 0) {
        const userRole = user?.role?.replace('ROLE_', '') || 'USER';
        const hasRequiredRole = requiredRoles.includes(userRole);
        
        if (!hasRequiredRole) {
            // Redirect to appropriate dashboard based on user role
            const userRole = user?.role?.replace('ROLE_', '') || 'USER';
            switch (userRole) {
                case 'BILLING':
                    return <Navigate to="/billing/dashboard" replace />;
                case 'ADMIN':
                    return <Navigate to="/admin-dashboard" replace />;
                case 'DOCTOR':
                    return <Navigate to="/doctor-dashboard" replace />;
                case 'RECEPTIONIST':
                    return <Navigate to="/dashboard" replace />;
                case 'PATIENT':
                    return <Navigate to="/patient-dashboard" replace />;
                default:
                    return <Navigate to="/login" replace />;
            }
        }
    }

    return children ? <>{children}</> : <Outlet />;
}
