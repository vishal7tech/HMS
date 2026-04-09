import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface PatientProfile {
    id: number;
    userId: number;
    username: string;
    name: string;
    email: string;
    contactNumber: string;
    address: string;
    emergencyContact: string;
    bloodGroup: string;
    allergies: string;
    dateOfBirth: string;
    gender: string;
    medicalHistory: string;
    enabled: boolean;
}

const PatientProfile = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<PatientProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<PatientProfile>>({});

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/patients/me');
            setProfile(response.data);
            if (response.data) {
                setFormData(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            toast.error('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;

        // Validate contact number format
        const contactRegex = /^\+?[1-9]\d{1,14}$/;
        if (formData.contactNumber && !contactRegex.test(formData.contactNumber)) {
            toast.error('Contact number must start with + followed by country code and number (e.g., +1234567890)');
            return;
        }

        // Ensure email is included
        if (!formData.email) {
            formData.email = profile.email;
        }

        setSaving(true);
        try {
            const response = await api.put(`/patients/${profile.id}`, formData);
            setProfile(response.data);
            setFormData(response.data);
            setIsEditing(false);
            toast.success('Profile updated successfully');
        } catch (error: any) {
            console.error('Failed to update profile:', error);
            if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                const errorMessages = Object.values(errors).flat().join(', ');
                toast.error(`Validation error: ${errorMessages}`);
            } else {
                toast.error('Failed to update profile');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (profile) {
            setFormData(profile);
        }
        setIsEditing(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600">Failed to load profile data</p>
                    <button
                        onClick={() => navigate('/patient-dashboard')}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <button
                                onClick={() => navigate('/patient-dashboard')}
                                className="mr-4 text-gray-600 hover:text-gray-900"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <h1 className="text-2xl font-bold text-blue-600">Profile Management</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Edit Profile
                                </button>
                            ) : (
                                <div className="space-x-2">
                                    <button
                                        onClick={handleCancel}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                        disabled={saving}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                        disabled={saving}
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                        {/* Profile Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
                            <div className="flex items-center">
                                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                                    <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div className="ml-6 text-white">
                                    <h2 className="text-2xl font-bold">{profile.name}</h2>
                                    <p className="text-blue-100">{profile.email}</p>
                                    <p className="text-blue-100">Patient ID: #{profile.id}</p>
                                </div>
                            </div>
                        </div>

                        {/* Profile Form */}
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Personal Information */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name || ''}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email || ''}
                                                onChange={handleInputChange}
                                                disabled={true} // Email should not be editable
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                            <input
                                                type="date"
                                                name="dateOfBirth"
                                                value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Gender</label>
                                            <select
                                                name="gender"
                                                value={formData.gender || ''}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="MALE">Male</option>
                                                <option value="FEMALE">Female</option>
                                                <option value="OTHER">Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Contact Information */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Contact Information</h3>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                                            <input
                                                type="tel"
                                                name="contactNumber"
                                                value={formData.contactNumber || ''}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                placeholder="+1234567890"
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Format: +country code + number (e.g., +1234567890)</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Emergency Contact</label>
                                            <input
                                                type="tel"
                                                name="emergencyContact"
                                                value={formData.emergencyContact || ''}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Address</label>
                                            <textarea
                                                name="address"
                                                value={formData.address || ''}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                rows={3}
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Medical Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Medical Information</h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                                            <select
                                                name="bloodGroup"
                                                value={formData.bloodGroup || ''}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                                            >
                                                <option value="">Select Blood Group</option>
                                                <option value="A+">A+</option>
                                                <option value="A-">A-</option>
                                                <option value="B+">B+</option>
                                                <option value="B-">B-</option>
                                                <option value="AB+">AB+</option>
                                                <option value="AB-">AB-</option>
                                                <option value="O+">O+</option>
                                                <option value="O-">O-</option>
                                            </select>
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Allergies</label>
                                            <input
                                                type="text"
                                                name="allergies"
                                                value={formData.allergies || ''}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                placeholder="e.g., Penicillin, Peanuts, etc."
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Medical History</label>
                                        <textarea
                                            name="medicalHistory"
                                            value={formData.medicalHistory || ''}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            rows={4}
                                            placeholder="Describe any chronic conditions, past surgeries, or relevant medical history..."
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PatientProfile;
