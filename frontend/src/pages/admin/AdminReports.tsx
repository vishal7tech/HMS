import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

interface KPIData {
    revenue: number;
    patients: number;
    doctors: number;
    staff: number;
}

interface ChartData {
    name: string;
    revenue?: number;
    appointments: number;
    completed: number;
    cancelled: number;
}

interface TrendData {
    name: string;
    appointments: number;
    completed: number;
    cancelled: number;
}

interface StaffPerformance {
    name: string;
    appointments: number;
    satisfaction: number;
    punctuality: number;
}

const AdminReports: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [kpiData] = useState<KPIData>({
        revenue: 399,
        patients: 3,
        doctors: 8,
        staff: 12
    });
    const [revenueData, setRevenueData] = useState<ChartData[]>([
        { name: 'Jan', revenue: 12000, appointments: 45, completed: 40, cancelled: 5 },
        { name: 'Feb', revenue: 15000, appointments: 52, completed: 48, cancelled: 4 },
        { name: 'Mar', revenue: 13500, appointments: 48, completed: 43, cancelled: 5 },
        { name: 'Apr', revenue: 18000, appointments: 58, completed: 55, cancelled: 3 },
        { name: 'May', revenue: 16000, appointments: 51, completed: 47, cancelled: 4 },
        { name: 'Jun', revenue: 22000, appointments: 65, completed: 62, cancelled: 3 }
    ]);
    const [appointmentStatusData, setAppointmentStatusData] = useState<any[]>([
        { name: 'Completed', value: 62, color: '#10B981' },
        { name: 'Scheduled', value: 25, color: '#3B82F6' },
        { name: 'Cancelled', value: 8, color: '#EF4444' },
        { name: 'No-Show', value: 5, color: '#F59E0B' }
    ]);
    const [appointmentTrendsData, setAppointmentTrendsData] = useState<TrendData[]>([
        { name: 'Week 1', appointments: 12, completed: 10, cancelled: 2 },
        { name: 'Week 2', appointments: 15, completed: 14, cancelled: 1 },
        { name: 'Week 3', appointments: 18, completed: 16, cancelled: 2 },
        { name: 'Week 4', appointments: 20, completed: 18, cancelled: 2 }
    ]);
    const [staffPerformanceData, setStaffPerformanceData] = useState<StaffPerformance[]>([
        { name: 'Dr. Smith', appointments: 45, satisfaction: 4.8, punctuality: 95 },
        { name: 'Dr. Johnson', appointments: 38, satisfaction: 4.6, punctuality: 88 },
        { name: 'Dr. Williams', appointments: 42, satisfaction: 4.9, punctuality: 92 },
        { name: 'Dr. Brown', appointments: 35, satisfaction: 4.5, punctuality: 85 },
        { name: 'Dr. Davis', appointments: 40, satisfaction: 4.7, punctuality: 90 }
    ]);
    const [showStaffModal, setShowStaffModal] = useState(false);
    const [dateRange, setDateRange] = useState({
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0]
    });
    const [department, setDepartment] = useState('ALL');

    // Mock data generation for demonstration
    const generateMockData = () => {
        const revenue: ChartData[] = [
            { name: 'Jan', revenue: 12000, appointments: 45, completed: 40, cancelled: 5 },
            { name: 'Feb', revenue: 15000, appointments: 52, completed: 48, cancelled: 4 },
            { name: 'Mar', revenue: 13500, appointments: 48, completed: 43, cancelled: 5 },
            { name: 'Apr', revenue: 18000, appointments: 58, completed: 55, cancelled: 3 },
            { name: 'May', revenue: 16000, appointments: 51, completed: 47, cancelled: 4 },
            { name: 'Jun', revenue: 22000, appointments: 65, completed: 62, cancelled: 3 }
        ];

        const appointmentStatus = [
            { name: 'Completed', value: 62, color: '#10B981' },
            { name: 'Scheduled', value: 25, color: '#3B82F6' },
            { name: 'Cancelled', value: 8, color: '#EF4444' },
            { name: 'No-Show', value: 5, color: '#F59E0B' }
        ];

        const appointmentTrends: TrendData[] = [
            { name: 'Week 1', appointments: 12, completed: 10, cancelled: 2 },
            { name: 'Week 2', appointments: 15, completed: 14, cancelled: 1 },
            { name: 'Week 3', appointments: 18, completed: 16, cancelled: 2 },
            { name: 'Week 4', appointments: 20, completed: 18, cancelled: 2 }
        ];

        const staffPerformance = [
            { name: 'Dr. Smith', appointments: 45, satisfaction: 4.8, punctuality: 95 },
            { name: 'Dr. Johnson', appointments: 38, satisfaction: 4.6, punctuality: 88 },
            { name: 'Dr. Williams', appointments: 42, satisfaction: 4.9, punctuality: 92 },
            { name: 'Dr. Brown', appointments: 35, satisfaction: 4.5, punctuality: 85 },
            { name: 'Dr. Davis', appointments: 40, satisfaction: 4.7, punctuality: 90 }
        ];

        setRevenueData(revenue);
        setAppointmentStatusData(appointmentStatus);
        setAppointmentTrendsData(appointmentTrends);
        setStaffPerformanceData(staffPerformance);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            // Since backend API endpoints don't exist yet, use mock data directly
            // This prevents 403 errors and ensures the component works
            console.log('AdminReports: Using mock data since backend API endpoints are not implemented');
            generateMockData();
            
        } catch (err) {
            console.error('Failed to load report data', err);
            toast.error('Failed to load report data');
            // Fallback to mock data if API fails
            generateMockData();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [dateRange, department]);

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        fetchData();
    };

    const handleExport = (format: 'pdf' | 'excel') => {
        toast.success(`Exporting report as ${format.toUpperCase()}...`);
        
        // Create export data
        const exportData = {
            kpi: kpiData,
            revenue: revenueData,
            appointmentStatus: appointmentStatusData,
            trends: appointmentTrendsData,
            staffPerformance: staffPerformanceData,
            dateRange,
            department,
            exportDate: new Date().toISOString()
        };

        if (format === 'excel') {
            // Implement Excel export logic
            console.log('Exporting to Excel:', exportData);
        } else {
            // Implement PDF export logic
            console.log('Exporting to PDF:', exportData);
        }
    };

    const handleChartClick = (data: any) => {
        if (data && data.activePayload) {
            const clickedData = data.activePayload[0].payload;
            console.log('Chart clicked:', clickedData);
            toast.success(`Drilling down into ${clickedData.name || 'selected data'}`);
            // Implement drill-down logic based on chart type
            // Could open a modal with detailed data or navigate to a detailed page
        }
    };

    const handleKPIClick = (kpiType: string) => {
        console.log('KPI clicked:', kpiType);
        toast.success(`Opening detailed ${kpiType} report...`);
        // Implement KPI drill-down logic
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Hospital Analytics & Reports</h2>
                        <p className="text-gray-500">Comprehensive view of hospital performance and metrics</p>
                    </div>

                    <div className="flex flex-wrap items-end gap-3">
                        <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-3">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-600 uppercase">From</label>
                                <input
                                    type="date"
                                    value={dateRange.from}
                                    onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-600 uppercase">To</label>
                                <input
                                    type="date"
                                    value={dateRange.to}
                                    onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-600 uppercase">Department</label>
                                <select
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="ALL">All Departments</option>
                                    <option value="CARDIO">Cardiology</option>
                                    <option value="NEURO">Neurology</option>
                                    <option value="ORTHO">Orthopedics</option>
                                    <option value="GENERAL">General</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                Apply Filters
                            </button>
                        </form>
                        
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleExport('pdf')}
                                className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-sm"
                            >
                                Export PDF
                            </button>
                            <button
                                onClick={() => handleExport('excel')}
                                className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm"
                            >
                                Export Excel
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div onClick={() => handleKPIClick('Revenue')}>
                    <KPICard
                        title="Revenue"
                        value={`$${kpiData.revenue}`}
                        subtitle="Monthly revenue"
                        color="green"
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    />
                </div>
                <div onClick={() => handleKPIClick('Patients')}>
                    <KPICard
                        title="Patients"
                        value={kpiData.patients}
                        subtitle="Total patients"
                        color="blue"
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                    />
                </div>
                <div onClick={() => handleKPIClick('Doctors')}>
                    <KPICard
                        title="Doctors"
                        value={kpiData.doctors}
                        subtitle="Active doctors"
                        color="purple"
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                    />
                </div>
                <div onClick={() => handleKPIClick('Staff')}>
                    <KPICard
                        title="Staff"
                        value={kpiData.staff}
                        subtitle="Total staff"
                        color="yellow"
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                    />
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Performance Line Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Revenue Performance</h3>
                        <button className="text-sm text-blue-600 hover:text-blue-800">View Details</button>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueData} onClick={handleChartClick}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#FFF', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                                />
                                <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Appointment Status Pie Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Appointment Status</h3>
                        <button className="text-sm text-blue-600 hover:text-blue-800">View Details</button>
                    </div>
                    <div className="h-[300px] flex items-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={appointmentStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    onClick={handleChartClick}
                                >
                                    {appointmentStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#FFF', borderRadius: '8px', border: '1px solid #E5E7EB' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                        {appointmentStatusData.map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                <span className="text-xs text-gray-600">{item.name}: {item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Appointment Trends Area Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Appointment Trends</h3>
                        <button className="text-sm text-blue-600 hover:text-blue-800">View Details</button>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={appointmentTrendsData} onClick={handleChartClick}>
                                <defs>
                                    <linearGradient id="colorApp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#FFF', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                                />
                                <Area type="monotone" dataKey="appointments" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorApp)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Staff Performance Bar Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Staff Performance</h3>
                        <button 
                            onClick={() => setShowStaffModal(true)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                            Staff Performance Detailed
                        </button>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={staffPerformanceData} onClick={handleChartClick}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: '#F3F4F6' }}
                                    contentStyle={{ backgroundColor: '#FFF', borderRadius: '8px', border: '1px solid #E5E7EB' }}
                                />
                                <Bar dataKey="appointments" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Staff Performance Detailed Modal */}
            {showStaffModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Staff Performance Detailed</h2>
                            <button
                                onClick={() => setShowStaffModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Appointments</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Satisfaction Score</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Punctuality</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {staffPerformanceData.map((staff, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{staff.name}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">General</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{staff.appointments}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{staff.satisfaction}/5.0</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{staff.punctuality}%</td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    staff.punctuality >= 90 ? 'bg-green-100 text-green-800' : 
                                                    staff.punctuality >= 80 ? 'bg-yellow-100 text-yellow-800' : 
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {staff.punctuality >= 90 ? 'Excellent' : staff.punctuality >= 80 ? 'Good' : 'Needs Improvement'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={() => handleExport('excel')}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                            >
                                Export to Excel
                            </button>
                            <button
                                onClick={() => setShowStaffModal(false)}
                                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const KPICard = ({ title, value, subtitle, color, icon }: any) => {
    const colors: any = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        purple: "bg-purple-50 text-purple-600",
        yellow: "bg-yellow-50 text-yellow-600"
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md cursor-pointer">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${colors[color]}`}>
                    {icon}
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
            </div>
            <div>
                <p className="text-sm font-medium text-gray-900">{title}</p>
                <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            </div>
        </div>
    );
};

export default AdminReports;
