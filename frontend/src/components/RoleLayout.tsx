import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

const RoleLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getUserRole = () => {
        return user?.role?.replace('ROLE_', '') || 'USER';
    };

    const userRole = getUserRole();

    const menuItems = [
        // Common dashboard for all roles
        { path: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['RECEPTIONIST'] },
        { path: '/admin-dashboard', label: 'Dashboard', icon: '📊', roles: ['ADMIN'] },
        { path: '/doctor-dashboard', label: 'Dashboard', icon: '📊', roles: ['DOCTOR'] },
        { path: '/patient-dashboard', label: 'Dashboard', icon: '📊', roles: ['PATIENT'] },

        // Admin specific
        { path: '/admin-reports', label: 'Reports', icon: '📈', roles: ['ADMIN'] },
        { path: '/audit-logs', label: 'Audit Logs', icon: '🔍', roles: ['ADMIN'] },
        { path: '/staff', label: 'Manage Staff', icon: '👩‍💻', roles: ['ADMIN'] },
        { path: '/settings', label: 'Settings', icon: '⚙️', roles: ['ADMIN'] },

        // Receptionist / Admin
        { path: '/patients', label: 'Patients', icon: '👥', roles: ['ADMIN'] },
        { path: '/doctors', label: 'Doctors', icon: '👨‍⚕️', roles: ['ADMIN'] },
        { path: '/billing', label: 'Billing/Invoices', icon: '💰', roles: ['ADMIN'] },
        
        // Receptionist specific (different paths to avoid conflicts)
        { path: '/receptionist-patients', label: 'Patients', icon: '👥', roles: ['RECEPTIONIST'] },
        { path: '/receptionist-doctors', label: 'Doctors', icon: '👨‍⚕️', roles: ['RECEPTIONIST'] },
        { path: '/receptionist-billing', label: 'Billing/Invoices', icon: '💰', roles: ['RECEPTIONIST'] },

        // Billing specific
        { path: '/billing/dashboard', label: 'Dashboard', icon: '📊', roles: ['BILLING'] },
        { path: '/billing/invoices', label: 'Invoices', icon: '📄', roles: ['BILLING'] },
        { path: '/billing/payments', label: 'Payments', icon: '💳', roles: ['BILLING'] },
        { path: '/billing/reports', label: 'Reports', icon: '📈', roles: ['BILLING'] },

        // Doctor / Receptionist / Admin
        { path: '/appointments', label: 'Appointments', icon: '📅', roles: ['ADMIN'] },
        { path: '/receptionist-appointments', label: 'Appointments', icon: '📅', roles: ['RECEPTIONIST'] },

        // Doctor specific
        { path: '/doctor-appointments', label: 'My Appointments', icon: '📆', roles: ['DOCTOR'] },
        { path: '/doctor-availability', label: 'My Availability', icon: '⏰', roles: ['DOCTOR'] },
        { path: '/doctor-patients', label: 'My Patients', icon: '🏥', roles: ['DOCTOR'] },

        // Patient specific
        { path: '/patient-appointments', label: 'My Appointments', icon: '📆', roles: ['PATIENT'] },
        { path: '/patient-history', label: 'Medical History', icon: '📝', roles: ['PATIENT'] }
    ];

    const filteredMenuItems = menuItems.filter(item =>
        item.roles.includes(userRole) || item.roles.includes('ALL')
    );

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 bg-blue-900 w-64 text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0 z-50' : '-translate-x-full z-0'}`}>
                <div className="flex items-center justify-center h-20 bg-blue-950 shadow-md">
                    <h1 className="text-2xl font-bold tracking-wider">HMS Portal</h1>
                </div>
                <div className="flex flex-col mt-4">
                    <ul className="space-y-2 px-4">
                        {filteredMenuItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive(item.path)
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'text-blue-100 hover:bg-blue-800'
                                        }`}
                                >
                                    <span className="mr-3 text-lg">{item.icon}</span>
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Topbar */}
                <header className="flex justify-between items-center bg-white h-20 px-6 shadow border-b border-gray-200">
                    <div className="flex items-center">
                        <button
                            className="text-gray-500 focus:outline-none md:hidden mr-4"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                            </svg>
                        </button>
                        <h2 className="text-xl font-semibold text-gray-800 hidden sm:block">
                            {menuItems.find(item => item.path === location.pathname)?.label || 'Portal'}
                        </h2>
                    </div>
                    <div className="flex items-center space-x-4">
                        <ThemeToggle />
                        <div className="hidden sm:flex flex-col text-right">
                            <span className="text-sm font-bold text-gray-900">
                                {user?.sub || 'User'}
                            </span>
                            <span className="text-xs font-semibold px-2 rounded-full bg-blue-100 text-blue-800 inline-block w-max ml-auto mt-1 border border-blue-200">
                                {userRole}
                            </span>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shadow-sm">
                            {(user?.sub || 'U').charAt(0).toUpperCase()}
                        </div>
                        <button
                            onClick={handleLogout}
                            className="ml-4 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default RoleLayout;
