import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

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
  const [chartData, setChartData] = useState<any[]>([]);
  const [liveAvailability, setLiveAvailability] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const role = user?.role?.replace('ROLE_', '') || 'USER';

  useEffect(() => {
    fetchData();

    // WebSocket logic for Receptionist
    let stompClient: Client | null = null;
    if (role === 'RECEPTIONIST' || role === 'ADMIN') {
      const socket = new SockJS('http://localhost:8080/ws/availability');
      stompClient = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        onConnect: () => {
          console.log('Connected to WS');
          stompClient?.subscribe('/topic/availability', (message) => {
            if (message.body) {
              const updatedSlot = JSON.parse(message.body);
              // Simple toast or live state update
              setLiveAvailability(prev => {
                const existing = prev.findIndex(s => s.id === updatedSlot.id);
                if (existing > -1) {
                  const newArr = [...prev];
                  newArr[existing] = updatedSlot;
                  return newArr;
                }
                return [updatedSlot, ...prev].slice(0, 10); // Keep last 10 live updates
              });
            }
          });
        },
      });
      stompClient.activate();
    }

    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    };
  }, [role]);

  const fetchData = async () => {
    try {
      const [statsRes, chartRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/chart-data?startDate=2024-01-01&endDate=2026-12-31')
      ]);
      setStats(statsRes.data);
      setChartData(chartRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 h-64 flex items-center justify-center text-lg">Loading dashboard...</div>;
  if (!stats) return <div className="p-8 text-red-500">Failed to load dashboard data</div>;

  const StatCard = ({ title, value, color, icon }: any) => (
    <div className={`${color} rounded-lg p-6 text-white shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex flex-col">
        <p className="text-white/90 text-sm font-semibold tracking-wider uppercase mb-1">{title}</p>
        <div className="flex justify-between items-center">
          <p className="text-3xl font-extrabold">{value}</p>
          <span className="text-4xl opacity-50 block">{icon}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Welcome to your Portal!</h1>
        <p className="text-gray-600 mt-2">Here is your customized {role.toLowerCase()} overview.</p>
      </div>

      {/* Role-Specific Layouts */}

      {/* ADMIN VIEW */}
      {role === 'ADMIN' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total Patients" value={stats.totalPatients.toLocaleString()} color="bg-blue-600" icon="👥" />
            <StatCard title="Total Doctors" value={stats.totalDoctors.toLocaleString()} color="bg-green-600" icon="👨‍⚕️" />
            <StatCard title="Today's Appointments" value={stats.appointmentsToday.toLocaleString()} color="bg-purple-600" icon="📅" />
            <StatCard title="Total Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} color="bg-yellow-600" icon="💰" />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Revenue Over Time (Recharts)</h2>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#eab308" activeDot={{ r: 8 }} name="Revenue ($)" />
                  <Line type="monotone" dataKey="appointments" stroke="#9333ea" name="Appointments" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* RECEPTIONIST VIEW */}
      {(role === 'RECEPTIONIST' || role === 'ADMIN') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-md h-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Quick Actions</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button className="bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 font-semibold py-4 rounded-lg flex flex-col items-center justify-center transition-colors">
                  <span className="text-3xl mb-2">📅</span>
                  Book Appointment
                </button>
                <button className="bg-green-50 border border-green-200 hover:bg-green-100 text-green-700 font-semibold py-4 rounded-lg flex flex-col items-center justify-center transition-colors">
                  <span className="text-3xl mb-2">💳</span>
                  Generate Invoice
                </button>
                <button className="bg-purple-50 border border-purple-200 hover:bg-purple-100 text-purple-700 font-semibold py-4 rounded-lg flex flex-col items-center justify-center transition-colors">
                  <span className="text-3xl mb-2">👥</span>
                  Register Patient
                </button>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center">
                  <p className="text-gray-500 text-sm font-medium mb-1">Today's Appts</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.appointmentsToday}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 border border-gray-200 bg-white rounded-lg shadow-md p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              Live Doctor Updates
            </h2>
            <div className="space-y-4">
              {liveAvailability.length === 0 ? (
                <p className="text-sm text-gray-500 italic">Listening for real-time WebSocket updates from doctors...</p>
              ) : (
                liveAvailability.map((slot, index) => (
                  <div key={index} className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded shadow-sm text-sm">
                    Slot at <span className="font-bold">{new Date(slot.startTime).toLocaleTimeString()}</span> was newly marked
                    <span className={`ml-1 font-bold ${slot.isAvailable ? 'text-green-600' : 'text-red-500'}`}>
                      {slot.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
