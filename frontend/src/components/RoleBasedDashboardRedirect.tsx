// src/components/RoleBasedDashboardRedirect.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RoleBasedDashboardRedirect = () => {
    const { user } = useAuth();
    
    const getRoleBasedRedirect = () => {
        const userRole = user?.role?.replace('ROLE_', '') || 'USER';
        
        switch (userRole) {
            case 'ADMIN':
                return '/admin-dashboard';
            case 'DOCTOR':
                return '/doctor-dashboard';
            case 'RECEPTIONIST':
                return '/dashboard';
            case 'PATIENT':
                return '/patient-dashboard';
            case 'BILLING':
                return '/billing/dashboard';
            default:
                return '/login';
        }
    };

    return <Navigate to={getRoleBasedRedirect()} replace />;
};

export default RoleBasedDashboardRedirect;
