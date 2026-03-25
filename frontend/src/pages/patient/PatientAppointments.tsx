import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../../styles/calendar.css';
import { CalendarDays, Users, X, AlertCircle } from 'lucide-react';

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  availability: string | null;
}

interface PatientProfile {
  id: number;
  name: string;
  email: string;
}

const PatientAppointments = () => {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        doctorId: '',
        slotTime: '',
        reason: '',
        notes: ''
    });
    
    const [suggestedSlots, setSuggestedSlots] = useState<string[]>([]);
    const [conflictMessage, setConflictMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get patient profile
                const profileRes = await api.get('/patients/me');
                setPatientProfile(profileRes.data);

                // Get patient appointments
                const apptRes = await api.get(`/appointments/patient/${profileRes.data.id}`);
                setAppointments(apptRes.data);
                
                // Get available doctors
                const doctorsRes = await api.get('/doctors');
                setDoctors(doctorsRes.data);
            } catch (err) {
                console.error('Failed to load data', err);
                toast.error('Failed to load appointments');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-4">Loading appointments...</div>;

    const handleBookingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!patientProfile) {
            toast.error('Patient profile not loaded');
            return;
        }
        
        setConflictMessage(null);
        setSuggestedSlots([]);
        setBookingLoading(true);
        
        // Client-side validation
        if (!formData.doctorId || !formData.slotTime || !formData.reason) {
            toast.error('Please fill in all required fields');
            setBookingLoading(false);
            return;
        }
        
        console.log('Patient booking form data:', formData);
        
        const requestData = {
            patientId: patientProfile.id,
            doctorId: parseInt(formData.doctorId),
            slotTime: formData.slotTime,
            reason: formData.reason,
            notes: formData.notes
        };
        
        console.log('Patient booking request data:', requestData);
        
        try {
            const response = await api.post('/appointments', requestData);
            console.log('Patient appointment booking response:', response);

            if (response.data.status === null && response.data.suggestedSlots?.length > 0) {
                setSuggestedSlots(response.data.suggestedSlots);
                setConflictMessage("Selected slot is unavailable. Suggestions:");
            } else {
                toast.success('Appointment booked successfully');
                // Refresh appointments
                const apptRes = await api.get(`/appointments/patient/${patientProfile.id}`);
                setAppointments(apptRes.data);
                resetBookingForm();
            }
        } catch (error: any) {
            console.error('Failed to book appointment:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to book appointment';
            toast.error(errorMessage);
        } finally {
            setBookingLoading(false);
        }
    };
    
    const resetBookingForm = () => {
        setFormData({
            doctorId: '',
            slotTime: '',
            reason: '',
            notes: ''
        });
        setShowBookingModal(false);
        setConflictMessage(null);
        setSuggestedSlots([]);
    };
    
    const handleCancel = async (id: number) => {
        if (window.confirm('Are you sure you want to cancel this appointment?')) {
            try {
                await api.put(`/appointments/${id}/cancel`);
                toast.success('Appointment cancelled successfully');
                // Refresh appointments
                if (patientProfile) {
                    const apptRes = await api.get(`/appointments/patient/${patientProfile.id}`);
                    setAppointments(apptRes.data);
                }
            } catch (error: any) {
                console.error('Failed to cancel appointment:', error);
                const errorMessage = error.response?.data?.message || error.message || 'Failed to cancel appointment';
                toast.error(errorMessage);
            }
        }
    };

    return (
        <>
            {/* Booking Modal */}
            {showBookingModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Book New Appointment</h2>
                            <button
                                onClick={resetBookingForm}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleBookingSubmit}>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left Column - Form Fields */}
                                <div className="space-y-4">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <h3 className="font-medium text-blue-800 mb-2">Patient Information</h3>
                                        <div className="text-sm text-blue-700">
                                            <div><strong>Name:</strong> {patientProfile?.name}</div>
                                            <div><strong>Email:</strong> {patientProfile?.email}</div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Users className="inline w-4 h-4 mr-1" />
                                            Select Doctor *
                                        </label>
                                        <select
                                            required
                                            value={formData.doctorId}
                                            onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Choose a doctor...</option>
                                            {doctors.map(doctor => (
                                                <option key={doctor.id} value={doctor.id}>
                                                    Dr. {doctor.name} - {doctor.specialization}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <CalendarDays className="inline w-4 h-4 mr-1" />
                                            Date & Time *
                                        </label>
                                        <input
                                            type="datetime-local"
                                            required
                                            value={formData.slotTime}
                                            onChange={(e) => setFormData({ ...formData, slotTime: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            min={new Date().toISOString().slice(0, 16)}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Reason for Visit *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.reason}
                                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="e.g., General checkup, Follow-up, Consultation"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Additional Notes
                                        </label>
                                        <textarea
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            rows={4}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Any additional information or special requirements..."
                                        />
                                    </div>
                                </div>
                                
                                {/* Right Column - Calendar */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Date Selection</h3>
                                    <Calendar
                                        onChange={(value) => {
                                            if (value) {
                                                const date = value as Date;
                                                const currentTime = new Date().toTimeString().slice(0, 5);
                                                const newDateTime = `${date.toISOString().split('T')[0]}T${currentTime}`;
                                                setFormData({ ...formData, slotTime: newDateTime });
                                            }
                                        }}
                                        value={formData.slotTime ? new Date(formData.slotTime) : new Date()}
                                        className="w-full"
                                    />
                                    
                                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                        <h4 className="font-medium text-blue-800 mb-2">Selected Appointment</h4>
                                        {patientProfile && (
                                            <div className="text-sm text-blue-700 mb-1">
                                                Patient: {patientProfile.name}
                                            </div>
                                        )}
                                        {formData.doctorId && (
                                            <div className="text-sm text-blue-700 mb-1">
                                                Doctor: Dr. {doctors.find(d => d.id.toString() === formData.doctorId)?.name}
                                            </div>
                                        )}
                                        {formData.slotTime && (
                                            <div className="text-sm text-blue-700">
                                                Time: {new Date(formData.slotTime).toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {conflictMessage && (
                                <div className="mt-6">
                                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                                        <div className="flex items-center mb-3">
                                            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                                            <span className="font-medium text-red-800">Slot Conflict</span>
                                        </div>
                                        <p className="text-red-700 mb-3">{conflictMessage}</p>
                                        {suggestedSlots.length > 0 && (
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium text-red-800">Suggested alternative slots:</p>
                                                {suggestedSlots.map((slot, index) => (
                                                    <button
                                                        key={index}
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData({ ...formData, slotTime: slot });
                                                            setConflictMessage(null);
                                                            setSuggestedSlots([]);
                                                        }}
                                                        className="block w-full text-left px-3 py-2 bg-white border border-red-200 rounded hover:bg-red-50 text-sm"
                                                    >
                                                        {new Date(slot).toLocaleString()}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={resetBookingForm}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={bookingLoading}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
                                >
                                    {bookingLoading ? 'Booking...' : 'Book Appointment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            <div className="bg-white shadow rounded-lg p-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">My Appointments</h2>
                <button 
                    onClick={() => setShowBookingModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow text-sm font-medium transition duration-200 flex items-center space-x-2"
                >
                    <span>+</span>
                    <span>Book New</span>
                </button>
            </div>

            {appointments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No appointments found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {appointments.map((appt) => (
                                <tr key={appt.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(appt.dateTime).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        Dr. {appt.doctorName}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 line-clamp-1">
                                        {appt.reason}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${appt.status === 'SCHEDULED' ? 'bg-green-100 text-green-800' :
                                                appt.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {appt.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {appt.status === 'SCHEDULED' && (
                                            <button 
                                                onClick={() => handleCancel(appt.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                        {appt.status === 'CONFIRMED' && (
                                            <button 
                                                onClick={() => handleCancel(appt.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                        {appt.status === 'COMPLETED' && (
                                            <span className="text-gray-500 text-sm">Completed</span>
                                        )}
                                        {appt.status === 'CANCELLED' && (
                                            <span className="text-gray-500 text-sm">Cancelled</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
        </>
    );
};

export default PatientAppointments;
