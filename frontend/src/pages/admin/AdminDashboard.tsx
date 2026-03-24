import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { RefreshCw, Download, Calendar, DollarSign, Users, FileText, Settings, TrendingUp, Clock, CreditCard } from 'lucide-react';
import { useDashboardStats, useAppointmentStats, useRevenueData } from '../../hooks/useDashboardAPI';
import {
  DepartmentModal,
  DesignationModal,
  DesignationTypeModal,
  ShiftModal,
  LeaveTypeModal,
  HolidayModal
} from '../../components/admin/StaffModals';

const AdminDashboard: React.FC = () => {
  const { } = useAuth();
  const [dateFilter, setDateFilter] = useState<'today' | '7d' | '30d'>('today');
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal states
  const [modalStates, setModalStates] = useState({
    department: false,
    designation: false,
    designationType: false,
    shift: false,
    leaveType: false,
    holiday: false
  });

  // API hooks
  const { data: stats, loading: statsLoading, refetch: refetchStats } = useDashboardStats(dateFilter);
  const { data: appointmentData, refetch: refetchAppointments } = useAppointmentStats(dateFilter);
  const { data: revenueData, refetch: refetchRevenue } = useRevenueData(dateFilter);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchStats(),
        refetchAppointments(),
        refetchRevenue()
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    // Export functionality
    console.log(`Exporting dashboard as ${format}`);
  };

  const openModal = (modalName: keyof typeof modalStates) => {
    setModalStates(prev => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName: keyof typeof modalStates) => {
    setModalStates(prev => ({ ...prev, [modalName]: false }));
  };

  const handleModalSuccess = () => {
    handleRefresh(); // Refresh data after successful modal submission
  };

  const chartData = appointmentData.length > 0 ? appointmentData : [];
  const revenueChartData = revenueData.length > 0 ? revenueData : [];

  const currentStats = stats || {
    todayAppointments: 2,
    monthlyRevenue: 500,
    outstandingPayments: 300,
    totalStaff: 7,
    totalPatients: 45,
    totalDoctors: 5,
    upcomingAppointments: 8
  };

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hospital Dashboard</h1>
          <p className="text-gray-600 mt-1">Complete overview of hospital operations and analytics</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as 'today' | '7d' | '30d')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => handleExport('pdf')}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              <FileText className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{currentStats.todayAppointments}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">${currentStats.monthlyRevenue}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Outstanding Payments</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">${currentStats.outstandingPayments}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Staff</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{currentStats.totalStaff}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Statistics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px' 
                }}
              />
              <Bar dataKey="appointments" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Summary</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px' 
                }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Staff Categories Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Staff Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => openModal('department')}
            className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-blue-900">Add Department</span>
              <div className="p-2 bg-blue-200 rounded">
                <Users className="w-4 h-4 text-blue-700" />
              </div>
            </div>
          </button>

          <button
            onClick={() => openModal('designation')}
            className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-green-900">Add Designation</span>
              <div className="p-2 bg-green-200 rounded">
                <TrendingUp className="w-4 h-4 text-green-700" />
              </div>
            </div>
          </button>

          <button
            onClick={() => openModal('designationType')}
            className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-left"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-purple-900">Add Designation Type</span>
              <div className="p-2 bg-purple-200 rounded">
                <Settings className="w-4 h-4 text-purple-700" />
              </div>
            </div>
          </button>

          <button
            onClick={() => openModal('shift')}
            className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors text-left"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-yellow-900">Add Shift</span>
              <div className="p-2 bg-yellow-200 rounded">
                <Clock className="w-4 h-4 text-yellow-700" />
              </div>
            </div>
          </button>

          <button
            onClick={() => openModal('leaveType')}
            className="p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-left"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-red-900">Add Leave Type</span>
              <div className="p-2 bg-red-200 rounded">
                <Calendar className="w-4 h-4 text-red-700" />
              </div>
            </div>
          </button>

          <button
            onClick={() => openModal('holiday')}
            className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors text-left"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-indigo-900">Add Holiday</span>
              <div className="p-2 bg-indigo-200 rounded">
                <FileText className="w-4 h-4 text-indigo-700" />
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900">Staff Management</h3>
          </div>
          <p className="text-gray-600 mb-4">Manage doctors, receptionists, and admin staff</p>
          <Link
            to="/staff"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Manage Staff
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900">Reports & Analytics</h3>
          </div>
          <p className="text-gray-600 mb-4">View detailed reports and hospital analytics</p>
          <Link
            to="/admin-reports"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            View Reports
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900">Patient Overview</h3>
          </div>
          <p className="text-gray-600 mb-4">View and manage all patient records</p>
          <Link
            to="/patients"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            View Records
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900">Appointment Overview</h3>
          </div>
          <p className="text-gray-600 mb-4">View all appointments and scheduling</p>
          <Link
            to="/appointments"
            className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            View All
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900">Financial Summary</h3>
          </div>
          <p className="text-gray-600 mb-4">Revenue, payments, and billing overview</p>
          <Link
            to="/billing"
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            View Finance
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Settings className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900">System Settings</h3>
          </div>
          <p className="text-gray-600 mb-4">Configure system and hospital settings</p>
          <Link
            to="/settings"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Settings
          </Link>
        </div>
      </div>

      {/* Modals */}
      <DepartmentModal
        isOpen={modalStates.department}
        onClose={() => closeModal('department')}
        onSuccess={handleModalSuccess}
      />
      <DesignationModal
        isOpen={modalStates.designation}
        onClose={() => closeModal('designation')}
        onSuccess={handleModalSuccess}
      />
      <DesignationTypeModal
        isOpen={modalStates.designationType}
        onClose={() => closeModal('designationType')}
        onSuccess={handleModalSuccess}
      />
      <ShiftModal
        isOpen={modalStates.shift}
        onClose={() => closeModal('shift')}
        onSuccess={handleModalSuccess}
      />
      <LeaveTypeModal
        isOpen={modalStates.leaveType}
        onClose={() => closeModal('leaveType')}
        onSuccess={handleModalSuccess}
      />
      <HolidayModal
        isOpen={modalStates.holiday}
        onClose={() => closeModal('holiday')}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default AdminDashboard;
