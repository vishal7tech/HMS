import React, { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

interface Patient {
    id: number;
    name: string;
    lastVisit?: string;
    nextAppointment?: string;
    status: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    bloodType?: string;
    address?: string;
    emergencyContact?: string;
    insuranceProvider?: string;
    medicalHistory?: string;
}

interface PatientAppointment {
    id: number;
    patientId: number;
    patientName: string;
    slotTime: string;
    reason: string;
    status: string;
    notes?: string;
}

const DoctorPatients: React.FC = () => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [notes, setNotes] = useState('');
    const [patientHistory, setPatientHistory] = useState<PatientAppointment[]>([]);
    const [savingNote, setSavingNote] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const profileRes = await api.get('/doctors/me');

                // Fetch doctor's appointments to get patient list
                const apptRes = await api.get(`/appointments/doctor/${profileRes.data.id}`);
                const filteredAppointments = apptRes.data.filter((a: any) => a.status !== 'CANCELLED');
                setAppointments(filteredAppointments);

                // Create patient list from appointment data (no additional API calls needed)
                const patientsMap = new Map<number, Patient>();
                
                filteredAppointments.forEach((apt: any) => {
                    if (!patientsMap.has(apt.patientId)) {
                        patientsMap.set(apt.patientId, {
                            id: apt.patientId,
                            name: apt.patientName,
                            status: 'ACTIVE', // Default status since we don't have this info
                            email: '',
                            phone: '',
                            dateOfBirth: '',
                            gender: ''
                        });
                    }
                });
                
                // Enhance patient data with appointment information
                const enhancedPatients = Array.from(patientsMap.values()).map((patient) => {
                    const patientAppointments = filteredAppointments.filter((a: any) => a.patientId === patient.id);
                    const sortedAppointments = patientAppointments.sort((a: any, b: any) => 
                        new Date(b.slotTime).getTime() - new Date(a.slotTime).getTime()
                    );
                    
                    const lastVisit = sortedAppointments[0]?.slotTime;
                    const nextAppointment = patientAppointments
                        .filter((a: any) => a.status === 'SCHEDULED' || a.status === 'CONFIRMED')
                        .sort((a: any, b: any) => new Date(a.slotTime).getTime() - new Date(b.slotTime).getTime())[0]?.slotTime;

                    return {
                        ...patient,
                        lastVisit,
                        nextAppointment
                    };
                });

                setPatients(enhancedPatients);
            } catch (err) {
                console.error('Failed to load patients', err);
                toast.error('Failed to load patients');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Filter patients based on search and status
    const filteredPatients = useMemo(() => {
        return patients.filter(patient => {
            const matchesSearch = searchTerm === '' || 
                patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (patient.phone && patient.phone.includes(searchTerm));
            
            const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });
    }, [patients, searchTerm, statusFilter]);

    const handleViewHistory = async (patient: Patient) => {
        try {
            const patientAppointments = appointments.filter(apt => apt.patientId === patient.id);
            setPatientHistory(patientAppointments);
            setSelectedPatient(patient);
            setShowHistoryModal(true);
        } catch (err) {
            console.error('Failed to load patient history', err);
            toast.error('Failed to load patient history');
        }
    };

    const handleWriteNotes = (patient: Patient) => {
        setSelectedPatient(patient);
        setNotes('');
        setShowNotesModal(true);
    };

    const handleSaveNotes = async () => {
        if (!selectedPatient || !notes.trim()) {
            toast.error('Please enter some notes');
            return;
        }
        
        setSavingNote(true);
        try {
            // Here you would integrate with your backend API
            // For now, we'll simulate saving the note
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            toast.success(`Notes saved for ${selectedPatient.name}`);
            setShowNotesModal(false);
            setNotes('');
        } catch (err) {
            console.error('Failed to save notes', err);
            toast.error('Failed to save notes');
        } finally {
            setSavingNote(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };


    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">My Patients</h1>
                    <p className="text-gray-600 mt-2">Manage and view your assigned patients</p>
                </div>

                {/* Search and Filter */}
                <div className="mb-8 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by name, email, or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <svg
                                className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="sm:w-48">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>
                </div>

                {/* Patient Cards */}
                {filteredPatients.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <p className="text-gray-500 text-lg">
                            {searchTerm || statusFilter !== 'all' ? 'No patients found matching your criteria' : 'No patients assigned yet'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredPatients.map((patient) => (
                            <div
                                key={patient.id}
                                onClick={() => handleViewHistory(patient)}
                                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-blue-300 group"
                            >
                                {/* Patient Photo and Name */}
                                <div className="flex items-center mb-4">
                                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
                                        {patient.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                                            {patient.name}
                                        </h3>
                                        <p className="text-sm text-gray-500">ID: PAT-{patient.id}</p>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                                            patient.status === 'ACTIVE' 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {patient.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Patient Information */}
                                <div className="space-y-3 mb-4">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        {patient.email || 'Email not available'}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        {patient.phone || 'Phone not available'}
                                    </div>
                                    
                                    {/* Last Visit */}
                                    {patient.lastVisit && (
                                        <div className="flex items-center text-sm text-gray-600">
                                            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="font-medium">Last Visit:</span>
                                            <span className="ml-1">{formatDate(patient.lastVisit)}</span>
                                        </div>
                                    )}
                                    
                                    {/* Next Appointment */}
                                    {patient.nextAppointment && (
                                        <div className="flex items-center text-sm text-green-600">
                                            <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span className="font-medium">Next:</span>
                                            <span className="ml-1">{formatDate(patient.nextAppointment)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Add Note Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleWriteNotes(patient);
                                    }}
                                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center justify-center group-hover:bg-blue-700"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Add Note
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Patient History Modal */}
            {showHistoryModal && selectedPatient && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">Patient Medical History</h3>
                                    <p className="text-gray-600 mt-1">{selectedPatient.name} - ID: PAT-{selectedPatient.id}</p>
                                </div>
                                <button
                                    onClick={() => setShowHistoryModal(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            {/* Patient Basic Information */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-semibold text-gray-900 mb-3">Patient Information</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><span className="font-medium">Email:</span> {selectedPatient.email || 'Not specified'}</div>
                                    <div><span className="font-medium">Phone:</span> {selectedPatient.phone || 'Not specified'}</div>
                                    <div><span className="font-medium">Date of Birth:</span> {selectedPatient.dateOfBirth ? formatDate(selectedPatient.dateOfBirth) : 'Not specified'}</div>
                                    <div><span className="font-medium">Gender:</span> {selectedPatient.gender || 'Not specified'}</div>
                                    <div><span className="font-medium">Blood Type:</span> {selectedPatient.bloodType || 'Not specified'}</div>
                                    <div><span className="font-medium">Emergency Contact:</span> {selectedPatient.emergencyContact || 'Not specified'}</div>
                                </div>
                                {selectedPatient.medicalHistory && (
                                    <div className="mt-3">
                                        <span className="font-medium text-sm">Medical History:</span>
                                        <p className="text-sm text-gray-600 mt-1">{selectedPatient.medicalHistory}</p>
                                    </div>
                                )}
                            </div>

                            {/* Appointment History */}
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-4">Appointment History</h4>
                                {patientHistory.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No previous appointments found.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {patientHistory.map((apt) => (
                                            <div key={apt.id} className="border-l-4 border-blue-500 bg-white p-4 rounded-lg shadow-sm">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <p className="font-semibold text-gray-900">
                                                                {formatDate(apt.slotTime)}
                                                            </p>
                                                            <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                                                                apt.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                                apt.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                                                                apt.status === 'CONFIRMED' ? 'bg-purple-100 text-purple-800' :
                                                                'bg-gray-100 text-gray-800'
                                                            }`}>
                                                                {apt.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mb-2">
                                                            <span className="font-medium">Time:</span> {new Date(apt.slotTime).toLocaleTimeString()}
                                                        </p>
                                                        <p className="text-sm text-gray-800">
                                                            <span className="font-medium">Reason for Visit:</span> {apt.reason}
                                                        </p>
                                                        {apt.notes && (
                                                            <p className="text-sm text-gray-600 mt-2">
                                                                <span className="font-medium">Notes:</span> {apt.notes}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200">
                            <button
                                onClick={() => setShowHistoryModal(false)}
                                className="w-full sm:w-auto px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Note Modal */}
            {showNotesModal && selectedPatient && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900">Add Medical Note</h3>
                            <p className="text-gray-600 mt-1">{selectedPatient.name} - ID: PAT-{selectedPatient.id}</p>
                        </div>
                        
                        <div className="p-6">
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-4 h-32 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter your medical notes here..."
                                disabled={savingNote}
                            />
                        </div>

                        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                            <button
                                onClick={() => setShowNotesModal(false)}
                                disabled={savingNote}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveNotes}
                                disabled={savingNote || !notes.trim()}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                {savingNote && (
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                {savingNote ? 'Saving...' : 'Save Note'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorPatients;
