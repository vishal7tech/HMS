import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { CalendarDays, Users, X, Clock } from 'lucide-react';

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  availability: string | null;
}

interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  patientEmail?: string;
  doctorId: number;
  doctorName: string;
  doctorSpecialization?: string;
  slotTime: string;
  endTime: string;
  status: 'CONFIRMED' | 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'SCHEDULED' | 'NO_SHOW';
  reason: string;
  notes: string;
}

interface AvailabilitySlot {
  id: number;
  doctorId: number;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

const PatientAppointments = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        doctorId: '',
        selectedDate: new Date().toISOString().split('T')[0],
        slotTime: '',
        reason: '',
        notes: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const apptRes = await api.get('/appointments/patient/me');
                setAppointments(apptRes.data);
                
                const doctorsRes = await api.get('/doctors');
                setDoctors(doctorsRes.data);
                
                setError(null);
            } catch (err: any) {
                console.error('Failed to load data', err);
                setError(`Failed to load data: ${err.response?.data?.message || err.message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const fetchAvailableSlots = async (doctorId: string, date: string) => {
        if (!doctorId || !date) {
            setAvailableSlots([]);
            return;
        }
        
        setSlotsLoading(true);
        try {
            const res = await api.get(`/availability/doctor/${doctorId}?date=${date}`);
            setAvailableSlots(res.data);
        } catch (err) {
            console.error('Failed to load available slots', err);
            setAvailableSlots([]);
            toast.error('Failed to load available slots');
        } finally {
            setSlotsLoading(false);
        }
    };

    useEffect(() => {
        if (showModal) {
            fetchAvailableSlots(formData.doctorId, formData.selectedDate);
        }
    }, [formData.doctorId, formData.selectedDate, showModal]);

    const handleDoctorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newDoctorId = e.target.value;
        setFormData({
            ...formData,
            doctorId: newDoctorId,
            slotTime: ''
        });
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value;
        setFormData({
            ...formData,
            selectedDate: newDate,
            slotTime: ''
        });
    };

    const handleSlotClick = (slot: AvailabilitySlot) => {
        const dateTime = `${formData.selectedDate}T${slot.startTime}`;
        setFormData({ ...formData, slotTime: dateTime });
    };

    const formatTime = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const handleBookAppointment = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.doctorId || !formData.slotTime || !formData.reason) {
            toast.error('Please fill in all required fields');
            return;
        }
        
        try {
            const requestData = {
                doctorId: parseInt(formData.doctorId),
                slotTime: formData.slotTime,
                reason: formData.reason,
                notes: formData.notes
            };
            
            await api.post('/appointments', requestData);
            toast.success('Appointment booked successfully');
            
            const apptRes = await api.get('/appointments/patient/me');
            setAppointments(apptRes.data);
            
            resetForm();
        } catch (error: any) {
            console.error('Failed to book appointment:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to book appointment';
            toast.error(errorMessage);
        }
    };

    const handleCancelAppointment = async (id: number) => {
        if (window.confirm('Are you sure you want to cancel this appointment?')) {
            try {
                await api.put(`/appointments/${id}/cancel`);
                toast.success('Appointment cancelled successfully');
                
                const apptRes = await api.get('/appointments/patient/me');
                setAppointments(apptRes.data);
            } catch (error: any) {
                console.error('Failed to cancel appointment:', error);
                const errorMessage = error.response?.data?.message || error.message || 'Failed to cancel appointment';
                toast.error(errorMessage);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            doctorId: '',
            selectedDate: new Date().toISOString().split('T')[0],
            slotTime: '',
            reason: '',
            notes: ''
        });
        setShowModal(false);
        setAvailableSlots([]);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return 'bg-green-100 text-green-800 border-green-200';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'COMPLETED': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
            case 'SCHEDULED': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'NO_SHOW': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (loading) {
        return <div className="p-4">Loading appointments...</div>;
    }

    if (error) {
        return (
            <div className="p-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h2 className="text-red-800 text-lg font-semibold mb-2">Error Loading Data</h2>
                    <p className="text-red-600">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">My Appointments</h2>
                <button 
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow text-sm font-medium flex items-center space-x-2"
                >
                    <span>+</span>
                    <span>Book New</span>
                </button>
            </div>

            {appointments.length === 0 ? (
                <div className="bg-white shadow rounded-lg p-6 text-center">
                    <p className="text-gray-500 py-8">No appointments found.</p>
                    <button 
                        onClick={() => setShowModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow text-sm font-medium"
                    >
                        Book Your First Appointment
                    </button>
                </div>
            ) : (
                <div className="bg-white shadow rounded-lg overflow-hidden">
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
                                    <tr key={appt.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(appt.slotTime).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="font-medium">Dr. {appt.doctorName}</div>
                                            {appt.doctorSpecialization && (
                                                <div className="text-xs text-gray-500">{appt.doctorSpecialization}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                            {appt.reason}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appt.status)}`}>
                                                {appt.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {(appt.status === 'SCHEDULED' || appt.status === 'CONFIRMED' || appt.status === 'PENDING') && (
                                                <button 
                                                    onClick={() => handleCancelAppointment(appt.id)}
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
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Book New Appointment</h2>
                            <button
                                onClick={resetForm}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleBookAppointment}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Users className="inline w-4 h-4 mr-1" />
                                        Select Doctor *
                                    </label>
                                    <select
                                        required
                                        value={formData.doctorId}
                                        onChange={handleDoctorChange}
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

                                {formData.doctorId && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <CalendarDays className="inline w-4 h-4 mr-1" />
                                            Select Date *
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.selectedDate}
                                            onChange={handleDateChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                )}

                                {formData.doctorId && formData.selectedDate && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Clock className="inline w-4 h-4 mr-1" />
                                            Available Slots
                                        </label>
                                        {slotsLoading ? (
                                            <div className="flex items-center justify-center py-4">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                                <span className="ml-2 text-gray-600">Loading slots...</span>
                                            </div>
                                        ) : availableSlots.length > 0 ? (
                                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                                {availableSlots.map((slot) => {
                                                    const dateTime = `${formData.selectedDate}T${slot.startTime}`;
                                                    const isSelected = formData.slotTime === dateTime;
                                                    return (
                                                        <button
                                                            key={slot.id}
                                                            type="button"
                                                            onClick={() => handleSlotClick(slot)}
                                                            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                                                                isSelected
                                                                    ? 'bg-blue-600 text-white shadow-md'
                                                                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                                                            }`}
                                                        >
                                                            {formatTime(slot.startTime)}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                                                No available slots for this date
                                            </div>
                                        )}
                                    </div>
                                )}
                                
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

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!formData.slotTime}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Book Appointment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientAppointments;
