import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';

interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  appointmentsToday: number;
  appointmentsInPeriod: number;
  totalRevenue: number;
  completedAppointments: number;
  cancelledAppointments: number;
  pendingBills: number;
  paidBills: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8">
        <div className="text-red-500">Failed to load dashboard data</div>
      </div>
    );
  }

  const StatCard = ({ title, value, color, icon }: { title: string; value: string | number; color: string; icon: string }) => (
    <div className={`${color} rounded-lg p-6 text-white`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className="text-4xl opacity-50">{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.name || user?.sub || 'User'}</p>
        </div>
     

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Patients" 
          value={stats.totalPatients.toLocaleString()} 
          color="bg-blue-600" 
          icon="👥" 
        />
        <StatCard 
          title="Total Doctors" 
          value={stats.totalDoctors.toLocaleString()} 
          color="bg-green-600" 
          icon="👨‍⚕️" 
        />
        <StatCard 
          title="Today's Appointments" 
          value={stats.appointmentsToday.toLocaleString()} 
          color="bg-purple-600" 
          icon="📅" 
        />
        <StatCard 
          title="Total Revenue" 
          value={`$${stats.totalRevenue.toLocaleString()}`} 
          color="bg-yellow-600" 
          icon="💰" 
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Completed Appointments" 
          value={stats.completedAppointments.toLocaleString()} 
          color="bg-teal-600" 
          icon="✅" 
        />
        <StatCard 
          title="Cancelled Appointments" 
          value={stats.cancelledAppointments.toLocaleString()} 
          color="bg-red-600" 
          icon="❌" 
        />
        <StatCard 
          title="Pending Bills" 
          value={stats.pendingBills.toLocaleString()} 
          color="bg-orange-600" 
          icon="📄" 
        />
        <StatCard 
          title="Paid Bills" 
          value={stats.paidBills.toLocaleString()} 
          color="bg-indigo-600" 
          icon="💳" 
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg transition duration-200">
            📝 Book Appointment
          </button>
          <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg transition duration-200">
            👤 Add Patient
          </button>
          <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-lg transition duration-200">
            💳 Generate Bill
          </button>
        </div>
      </div>

    </div>
  </div>   
);
};

export default Dashboard;
