import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getUserRole = () => {
    const roles = user?.roles || [user?.role] || [];
    return roles[0]?.replace('ROLE_', '') || 'USER';
  };

  const userRole = getUserRole();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['ADMIN', 'RECEPTIONIST', 'DOCTOR', 'PATIENT'] },
    { path: '/patients', label: 'Patients', icon: '👥', roles: ['ADMIN', 'RECEPTIONIST'] },
    { path: '/doctors', label: 'Doctors', icon: '👨‍⚕️', roles: ['ADMIN', 'RECEPTIONIST'] },
    { path: '/appointments', label: 'Appointments', icon: '📅', roles: ['ADMIN', 'RECEPTIONIST', 'DOCTOR'] },
    { path: '/billing', label: 'Billing', icon: '💳', roles: ['ADMIN', 'RECEPTIONIST'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(userRole) || item.roles.includes('ALL')
  );

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-800">HMS</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {filteredMenuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive(item.path)
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Welcome,</span>
              <span className="text-sm font-medium text-gray-900">
                {user?.name || user?.sub || 'User'}
              </span>
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                {userRole}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
