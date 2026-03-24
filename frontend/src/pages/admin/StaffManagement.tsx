import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Search, Filter, ChevronLeft, ChevronRight, Eye, Edit, Trash2, User, Mail, Calendar, Shield, Phone, MapPin, Briefcase, Clock, DollarSign, X } from 'lucide-react';

// Define role configuration
const ROLES = [
    { key: 'ALL', label: 'All Staff', color: 'bg-gray-600' },
    { key: 'ADMIN', label: 'Admin', color: 'bg-orange-600' },
    { key: 'DOCTOR', label: 'Doctor', color: 'bg-red-600' },
    { key: 'BILLING', label: 'Billing', color: 'bg-blue-600' },
    { key: 'RECEPTIONIST', label: 'Receptionist', color: 'bg-green-600' }
];

interface Staff {
    id: number;
    username: string;
    email: string;
    name: string;
    role: string;
    enabled: boolean;
    createdAt: string;
    lastLogin: string | null;
    phone?: string;
    address?: string;
    department?: string;
    specialization?: string;
    joinDate?: string;
    salary?: number;
    shift?: string;
    qualifications?: string;
    emergencyContact?: string;
}

const StaffManagement = () => {
    const navigate = useNavigate();
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentStaffId, setCurrentStaffId] = useState<number | null>(null);
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
    
    // Tab state for role filtering
    const [activeTab, setActiveTab] = useState('ALL');
    
    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Function to sort and group staff by role with correct colors
    const getSortedStaffByRole = () => {
        const roleOrder = ['DOCTOR', 'RECEPTIONIST', 'BILLING', 'ADMIN'];
        
        return roleOrder.map(role => ({
            role,
            members: staff
                .filter(member => member.role === role)
                .sort((a, b) => a.name.localeCompare(b.name))
        })).filter(group => group.members.length > 0);
    };
    
    // Get role color for headers and badges
    const getRoleColor = (role: string) => {
        switch (role) {
            case 'DOCTOR': return { header: 'bg-red-600', badge: 'bg-red-100 text-red-800', hover: 'hover:bg-red-50' };
            case 'RECEPTIONIST': return { header: 'bg-green-600', badge: 'bg-green-100 text-green-800', hover: 'hover:bg-green-50' };
            case 'BILLING': return { header: 'bg-blue-600', badge: 'bg-blue-100 text-blue-800', hover: 'hover:bg-blue-50' };
            case 'ADMIN': return { header: 'bg-orange-600', badge: 'bg-orange-100 text-orange-800', hover: 'hover:bg-orange-50' };
            default: return { header: 'bg-gray-600', badge: 'bg-gray-100 text-gray-800', hover: 'hover:bg-gray-50' };
        }
    };
    const getFilteredStaff = () => {
        return staff.filter(member => {
            const matchesSearch = searchTerm === '' || 
                member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                member.username.toLowerCase().includes(searchTerm.toLowerCase());
            
            // Use activeTab instead of filterRole
            const matchesRole = activeTab === 'ALL' || member.role === activeTab;
            const matchesDepartment = filterDepartment === 'ALL' || member.department === filterDepartment;
            const matchesStatus = filterStatus === 'ALL' || 
                (filterStatus === 'ACTIVE' && member.enabled) || 
                (filterStatus === 'INACTIVE' && !member.enabled);
            
            return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
        });
    };
    
    // Pagination
    const filteredStaff = getFilteredStaff();
    const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedStaff = filteredStaff.slice(startIndex, startIndex + itemsPerPage);
    
    // Get unique departments for filter
    const getDepartments = () => {
        const depts = [...new Set(staff.map(member => member.department).filter(Boolean))];
        return depts;
    };
    
    // Status toggle handler - Use correct endpoint
    const handleStatusToggle = async (id: number, currentStatus: boolean) => {
        try {
            const response = await api.patch(`/staff/${id}/status`, { enabled: !currentStatus });
            if (response.status === 200) {
                toast.success(`Staff member ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
                fetchStaff();
            } else {
                throw new Error('Update failed');
            }
        } catch (error: any) {
            console.error('Failed to toggle status:', error);
            toast.error(error.response?.data?.message || 'Failed to update staff status');
        }
    };
    
    // Profile modal handlers
    const handleViewProfile = (member: Staff) => {
        setSelectedStaff(member);
        setShowProfileModal(true);
    };
    
    const closeProfileModal = () => {
        setShowProfileModal(false);
        setSelectedStaff(null);
    };

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        name: '',
        role: 'RECEPTIONIST'
    });

    useEffect(() => {
        fetchStaff();
    }, []);

    // Refresh staff list when window gains focus (user navigates back from registration page)
    useEffect(() => {
        const handleFocus = () => {
            fetchStaff();
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, []);

    // Also refresh when component becomes visible
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                fetchStaff();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const response = await api.get('/staff');
            setStaff(response.data);
        } catch (error) {
            console.error('Failed to fetch staff:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing && currentStaffId) {
                await api.put(`/staff/${currentStaffId}`, formData);
            } else {
                await api.post('/staff', formData);
            }
            fetchStaff();
            resetForm();
        } catch (error) {
            console.error('Failed to save staff:', error);
            alert('Failed to save staff member. Please check if username/email already exists.');
        }
    };

    const handleEdit = (member: Staff) => {
        setFormData({
            username: member.username,
            password: '', // Don't show password
            email: member.email,
            name: member.name,
            role: member.role
        });
        setCurrentStaffId(member.id);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this staff member?')) {
            try {
                await api.delete(`/staff/${id}`);
                toast.success('Staff member deleted successfully');
                fetchStaff();
            } catch (error) {
                toast.error('Failed to delete staff member');
                console.error('Failed to delete staff:', error);
            }
        }
    };
    
    const handleDeactivate = async (id: number) => {
        if (window.confirm('Are you sure you want to deactivate this staff member?')) {
            try {
                await api.put(`/staff/${id}/status`, { enabled: false });
                toast.success('Staff member deactivated successfully');
                fetchStaff();
            } catch (error) {
                toast.error('Failed to deactivate staff member');
                console.error('Failed to deactivate staff:', error);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            username: '',
            password: '',
            email: '',
            name: '',
            role: 'RECEPTIONIST'
        });
        setIsEditing(false);
        setCurrentStaffId(null);
        setShowModal(false);
    };

    if (loading) {
        return <div className="p-8 text-center">Loading staff data...</div>;
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Staff Management</h1>
                <div className="flex space-x-3">
                    <button
                        onClick={() => navigate('/register-staff?type=receptionist')}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-200"
                    >
                        + Add Receptionist
                    </button>
                    <button
                        onClick={() => navigate('/register-staff?type=billing')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200"
                    >
                        + Add Billing Staff
                    </button>
                    <button
                        onClick={() => navigate('/register-doctor')}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200"
                    >
                        + Add Doctor
                    </button>
                    <button
                        onClick={() => navigate('/register-staff?type=admin')}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition duration-200"
                    >
                        + Add Admin
                    </button>
                </div>
            </div>

            {/* Role Tabs */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex flex-wrap gap-2 mb-6">
                    {ROLES.map((role) => (
                        <button
                            key={role.key}
                            onClick={() => {
                                setActiveTab(role.key);
                                setCurrentPage(1); // Reset pagination when tab changes
                            }}
                            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                                activeTab === role.key
                                    ? `${role.color} text-white shadow-lg transform scale-105`
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {role.label}
                            {role.key !== 'ALL' && (
                                <span className="ml-2 px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs">
                                    {staff.filter(s => s.role === role.key).length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
                
                {/* Additional Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search staff..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    
                    <select
                        value={filterDepartment}
                        onChange={(e) => setFilterDepartment(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="ALL">All Departments</option>
                        {getDepartments().map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                    
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>
                    
                    <select
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value={5}>5 per page</option>
                        <option value={10}>10 per page</option>
                        <option value={20}>20 per page</option>
                        <option value={50}>50 per page</option>
                    </select>
                </div>
            </div>

            {/* Staff Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Info</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedStaff.map((member) => {
                                const roleColors = getRoleColor(member.role);
                                return (
                                    <tr 
                                        key={member.id} 
                                        className={`cursor-pointer transition-colors ${roleColors.hover}`}
                                        onClick={() => handleViewProfile(member)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                    <User className="h-6 w-6 text-gray-500" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{member.name}</div>
                                                    <div className="text-sm text-gray-500">@{member.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                <div className="flex items-center">
                                                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                                                    {member.email}
                                                </div>
                                                {member.phone && (
                                                    <div className="flex items-center mt-1">
                                                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                                                        {member.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${roleColors.badge}`}>
                                                {member.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {member.department || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleStatusToggle(member.id, member.enabled);
                                                }}
                                                className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none ${
                                                    member.enabled ? 'bg-green-500' : 'bg-gray-200'
                                                }`}
                                            >
                                                <span className={`translate-x-0 inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                                                    member.enabled ? 'translate-x-5' : 'translate-x-0'
                                                }`} />
                                            </button>
                                            <span className="ml-2 text-sm text-gray-600">
                                                {member.enabled ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {member.lastLogin ? new Date(member.lastLogin).toLocaleDateString() : 'Never'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewProfile(member);
                                                }}
                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEdit(member);
                                                }}
                                                className="text-indigo-600 hover:text-indigo-900 mr-3"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    member.enabled ? handleDeactivate(member.id) : handleDelete(member.id);
                                                }}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                
                {paginatedStaff.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        {filteredStaff.length === 0 ? 'No staff found matching your criteria' : 'No staff to display'}
                    </div>
                )}
                
                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                                    <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredStaff.length)}</span> of{' '}
                                    <span className="font-medium">{filteredStaff.length}</span> results
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    
                                    {[...Array(totalPages)].map((_, index) => (
                                        <button
                                            key={index + 1}
                                            onClick={() => setCurrentPage(index + 1)}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                currentPage === index + 1
                                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                            }`}
                                        >
                                            {index + 1}
                                        </button>
                                    ))}
                                    
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">{isEditing ? 'Edit Staff Member' : 'Add New Staff Member'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Username</label>
                                    <input
                                        type="text"
                                        required
                                        disabled={isEditing}
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 disabled:bg-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        {isEditing ? 'Password (leave blank to keep current)' : 'Password'}
                                    </label>
                                    <input
                                        type="password"
                                        required={!isEditing}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Role</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    >
                                        <option value="RECEPTIONIST">Receptionist</option>
                                        <option value="BILLING">Billing</option>
                                        <option value="DOCTOR">Doctor</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                                >
                                    {isEditing ? 'Update Member' : 'Add Member'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Profile Modal */}
            {showProfileModal && selectedStaff && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Staff Profile</h2>
                            <button
                                onClick={closeProfileModal}
                                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Profile Header */}
                            <div className="lg:col-span-1">
                                <div className="text-center">
                                    <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
                                        <User className="h-12 w-12 text-gray-500" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900">{selectedStaff.name}</h3>
                                    <p className="text-gray-500">@{selectedStaff.username}</p>
                                    <div className="mt-4">
                                        <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getRoleColor(selectedStaff.role).badge}`}>
                                            {selectedStaff.role}
                                        </span>
                                    </div>
                                    <div className="mt-4">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                            selectedStaff.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {selectedStaff.enabled ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Profile Details */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Personal Information */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <User className="h-5 w-5 mr-2" />
                                        Personal Information
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Full Name</label>
                                            <p className="text-gray-900">{selectedStaff.name}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Username</label>
                                            <p className="text-gray-900">{selectedStaff.username}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Email</label>
                                            <p className="text-gray-900">{selectedStaff.email}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Phone</label>
                                            <p className="text-gray-900">{selectedStaff.phone || 'Not provided'}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-500">Address</label>
                                            <p className="text-gray-900">{selectedStaff.address || 'Not provided'}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Work Information */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <Briefcase className="h-5 w-5 mr-2" />
                                        Work Information
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Department</label>
                                            <p className="text-gray-900">{selectedStaff.department || 'Not assigned'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Specialization</label>
                                            <p className="text-gray-900">{selectedStaff.specialization || 'Not specified'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Shift</label>
                                            <p className="text-gray-900">{selectedStaff.shift || 'Not assigned'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Join Date</label>
                                            <p className="text-gray-900">
                                                {selectedStaff.joinDate ? new Date(selectedStaff.joinDate).toLocaleDateString() : 'Not recorded'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Salary</label>
                                            <p className="text-gray-900">
                                                {selectedStaff.salary ? `$${selectedStaff.salary.toLocaleString()}/year` : 'Not disclosed'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Emergency Contact</label>
                                            <p className="text-gray-900">{selectedStaff.emergencyContact || 'Not provided'}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* System Information */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <Shield className="h-5 w-5 mr-2" />
                                        System Information
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Account Status</label>
                                            <p className="text-gray-900">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                    selectedStaff.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {selectedStaff.enabled ? 'Active' : 'Inactive'}
                                                </span>
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Last Login</label>
                                            <p className="text-gray-900">
                                                {selectedStaff.lastLogin ? new Date(selectedStaff.lastLogin).toLocaleString() : 'Never'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Account Created</label>
                                            <p className="text-gray-900">
                                                {new Date(selectedStaff.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Staff ID</label>
                                            <p className="text-gray-900">#{selectedStaff.id}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Qualifications */}
                                {selectedStaff.qualifications && (
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Qualifications</h4>
                                        <p className="text-gray-900 whitespace-pre-wrap">{selectedStaff.qualifications}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                            <button
                                onClick={closeProfileModal}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    closeProfileModal();
                                    handleEdit(selectedStaff);
                                }}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            >
                                Edit Profile
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffManagement;
