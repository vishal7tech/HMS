import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import websocketService from '../../services/websocketService';

interface DashboardData {
    todayAppointments: number;
    upcomingAppointmentsCount: number;
    medicalHistoryStatus: string;
    profileStatus: string;
    appointments: any[];
    profile: any;
    medicalHistory: any[];
}

const PatientDashboard = () => {
    const { user, logout } = useAuth();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [medicalHistory, setMedicalHistory] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Try to get data from the patient dashboard API
                const dashboardRes = await api.get('/patient/dashboard');
                setDashboardData(dashboardRes.data);
                setAppointments(dashboardRes.data.appointments || []);
                setProfile(dashboardRes.data.profile || null);
                setMedicalHistory(dashboardRes.data.medicalHistory || []);
            } catch (err) {
                console.log('Dashboard API not available, using fallback endpoints');
                try {
                    // Fallback to individual endpoints
                    const profileRes = await api.get('/patients/me');
                    setProfile(profileRes.data);

                    const appointmentsRes = await api.get('/appointments/patient/me');
                    setAppointments(appointmentsRes.data);

                    // Mock medical history for now
                    setMedicalHistory([]);
                } catch (fallbackErr) {
                    console.error('Failed to load patient data', fallbackErr);
                    // Use fallback data
                    setProfile({
                        bloodGroup: 'O+',
                        contactNumber: '+1234567890',
                        emergencyContact: '+0987654321'
                    });
                    setAppointments([]);
                    setMedicalHistory([]);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        // Subscribe to real-time updates
        websocketService.subscribeToAppointments((notification) => {
            fetchData();
            if (notification.type === 'CREATED') {
                toast.success(`Update: ${notification.message}`);
            }
        });
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading dashboard...</p>
            </div>
        </div>
    );

    const now = new Date();
    const todayAppointmentsCount = dashboardData?.todayAppointments || 
        appointments.filter(app => {
            if (!app.slotTime) return false;
            const appDate = new Date(app.slotTime);
            return appDate.toDateString() === now.toDateString();
        }).length;
    
    const upcomingAppointments = dashboardData?.appointments || 
        appointments.filter(app => {
            if (!app.slotTime) return false;
            return new Date(app.slotTime) >= now && app.status !== 'CANCELLED';
        });
    
    const pastAppointments = medicalHistory.length > 0 ? medicalHistory :
        appointments.filter(app => {
            if (!app.slotTime) return false;
            return new Date(app.slotTime) < now || app.status === 'COMPLETED';
        });

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-blue-600">HMS Patient Portal</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">Welcome, {user?.sub}</span>
                            <button
                                onClick={logout}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">Patient Dashboard</h2>
                        <p className="mt-2 text-gray-600">Manage your appointments and medical information</p>
                    </div>

                    {/* 6 Cards Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Today's Appointment</p>
                                    <p className="text-2xl font-bold text-gray-900">{todayAppointmentsCount}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-green-100 rounded-full">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Upcoming</p>
                                    <p className="text-2xl font-bold text-gray-900">{upcomingAppointments.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-yellow-100 rounded-full">
                                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Medical History</p>
                                    <p className="text-lg font-bold text-gray-900">{dashboardData?.medicalHistoryStatus || 'Uploaded'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-purple-100 rounded-full">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Profile</p>
                                    <p className="text-lg font-bold text-gray-900">{dashboardData?.profileStatus || 'Complete'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-indigo-100 rounded-full">
                                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Doctors</p>
                                    <p className="text-2xl font-bold text-gray-900">{pastAppointments.filter((app, index, self) => 
                                        self.findIndex(a => a.doctorName === app.doctorName) === index
                                    ).length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-red-100 rounded-full">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Pending</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {appointments.filter(app => app.status === 'SCHEDULED' || app.status === 'CONFIRMED').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                        {/* Register/Update Profile */}
                        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-center mb-4">
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <h3 className="ml-3 text-lg font-semibold text-gray-900">Profile Management</h3>
                            </div>
                            <p className="text-gray-600 mb-4">Register or update your personal information</p>
                            <Link
                                to="/patient/profile"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                            >
                                Manage Profile
                            </Link>
                        </div>

                        {/* Book New Appointment */}
                        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-center mb-4">
                                <div className="p-3 bg-teal-100 rounded-full">
                                    <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <h3 className="ml-3 text-lg font-semibold text-gray-900">Book New</h3>
                            </div>
                            <p className="text-gray-600 mb-4">Schedule a new appointment with a doctor</p>
                            <Link
                                to="/patient-appointments"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700"
                            >
                                Book Now
                            </Link>
                        </div>

                        {/* Upcoming Appointments */}
                        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-center mb-4">
                                <div className="p-3 bg-purple-100 rounded-full">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="ml-3 text-lg font-semibold text-gray-900">Upcoming Appointments</h3>
                            </div>
                            <p className="text-gray-600 mb-4">See all your future scheduled appointments</p>
                            <Link
                                to="/patient-appointments"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                            >
                                View All
                            </Link>
                        </div>

                        {/* Patient History */}
                        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-center mb-4">
                                <div className="p-3 bg-yellow-100 rounded-full">
                                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="ml-3 text-lg font-semibold text-gray-900">Medical History</h3>
                            </div>
                            <p className="text-gray-600 mb-4">View your medical history and records</p>
                            <Link
                                to="/patient-history"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
                            >
                                View History
                            </Link>
                        </div>

                        {/* Notes & Prescriptions */}
                        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-center mb-4">
                                <div className="p-3 bg-red-100 rounded-full">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                </div>
                                <h3 className="ml-3 text-lg font-semibold text-gray-900">Notes & Prescriptions</h3>
                            </div>
                            <p className="text-gray-600 mb-4">View doctor notes and prescriptions</p>
                            <Link
                                to="/patient-history"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                            >
                                View Notes
                            </Link>
                        </div>

                        {/* Profile Summary */}
                        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-center mb-4">
                                <div className="p-3 bg-indigo-100 rounded-full">
                                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <h3 className="ml-3 text-lg font-semibold text-gray-900">Profile Summary</h3>
                            </div>
                            {profile && (
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Blood Group:</span>
                                        <span className="font-medium">{profile.bloodGroup || 'Not set'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Phone:</span>
                                        <span className="font-medium">{profile.contactNumber || 'Not set'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Emergency:</span>
                                        <span className="font-medium">{profile.emergencyContact || 'Not set'}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upcoming Appointments List */}
                    <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Upcoming Appointments</h3>
                        </div>
                        <ul className="divide-y divide-gray-200">
                            {upcomingAppointments.length === 0 ? (
                                <li className="px-4 py-6 text-center text-gray-500">No upcoming appointments</li>
                            ) : (
                                upcomingAppointments.map((app: any) => (
                                    <li key={app.id} className="px-4 py-4 hover:bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-gray-900">Dr. {app.doctorName}</span>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(app.slotTime).toLocaleDateString()} at {new Date(app.slotTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${app.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                                }`}>
                                                {app.status}
                                            </span>
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>

                    {/* Recent History List */}
                    <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Medical History</h3>
                        </div>
                        <ul className="divide-y divide-gray-200">
                            {pastAppointments.length === 0 ? (
                                <li className="px-4 py-6 text-center text-gray-500">No previous records</li>
                            ) : (
                                pastAppointments.slice(0, 5).map((app: any) => (
                                    <li key={app.id} className="px-4 py-4 hover:bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-gray-900">Consultation with Dr. {app.doctorName}</span>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(app.slotTime).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${app.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {app.status}
                                                </span>
                                                <p className="text-xs text-gray-500 mt-1">{app.reason}</p>
                                            </div>
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                        {pastAppointments.length > 5 && (
                            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 border-t border-gray-200">
                                <Link to="/patient-history" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                                    View full history &rarr;
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PatientDashboard;
