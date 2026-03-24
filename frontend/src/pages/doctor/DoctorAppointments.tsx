import { useState, useEffect } from 'react';
import api from '../../services/api';
import websocketService from '../../services/websocketService';
import toast from 'react-hot-toast';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../../styles/calendar.css';
import { CalendarDays, Clock, Users, Search, X, Check, AlertCircle, User, FileText, Play } from 'lucide-react';

interface Patient {
  id: number;
  name: string;
  email: string;
  phone?: string;
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
  suggestedSlots?: string[];
}

interface PrescriptionData {
  appointmentId: number;
  patientId: number;
  diagnosis: string;
  medication: string;
  dosage: string;
  instructions: string;
  followUpDate: string;
}

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterDate, setFilterDate] = useState('');

  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showPatientProfileModal, setShowPatientProfileModal] = useState(false);

  const [rescheduleData, setRescheduleData] = useState({
    appointmentId: 0,
    newDateTime: ''
  });

  const [prescriptionData, setPrescriptionData] = useState<PrescriptionData>({
    appointmentId: 0,
    patientId: 0,
    diagnosis: '',
    medication: '',
    dosage: '',
    instructions: '',
    followUpDate: ''
  });

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [suggestedSlots, setSuggestedSlots] = useState<string[]>([]);
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchDoctorAppointments();

    // Subscribe to real-time updates
    websocketService.subscribeToAppointments((notification) => {
      fetchDoctorAppointments();
      if (notification.type === 'CREATED') {
        toast.success(`New appointment: ${notification.message}`);
      }
    });
  }, []);

  const fetchDoctorAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/appointments/doctor/me');
      setAppointments(response.data);
      setError(null);
    } catch (error: any) {
      console.error('Failed to fetch doctor appointments:', error);
      setError(`Failed to fetch appointments: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientDetails = async (patientId: number) => {
    try {
      const response = await api.get(`/patients/${patientId}`);
      setSelectedPatient(response.data);
    } catch (error: any) {
      console.error('Failed to fetch patient details:', error);
      toast.error('Failed to fetch patient details');
    }
  };

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflictMessage(null);
    setSuggestedSlots([]);
    try {
      console.log('Attempting to reschedule appointment:', rescheduleData);
      const response = await api.put(`/appointments/${rescheduleData.appointmentId}/reschedule?slotTime=${encodeURIComponent(rescheduleData.newDateTime)}`);
      
      if (response.data.status === null && response.data.suggestedSlots?.length > 0) {
        setSuggestedSlots(response.data.suggestedSlots);
        setConflictMessage("Selected slot is unavailable. Suggestions:");
      } else {
        toast.success('Appointment rescheduled successfully');
        fetchDoctorAppointments();
        setShowRescheduleModal(false);
        setRescheduleData({ appointmentId: 0, newDateTime: '' });
      }
    } catch (error: any) {
      console.error('Failed to reschedule appointment:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to reschedule appointment';
      toast.error(errorMessage);
    }
  };

  const handleCancel = async (id: number) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        console.log('Attempting to cancel appointment with ID:', id);
        await api.put(`/appointments/${id}/cancel`);
        toast.success('Appointment cancelled successfully');
        fetchDoctorAppointments();
      } catch (error: any) {
        console.error('Failed to cancel appointment:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to cancel appointment';
        toast.error(errorMessage);
      }
    }
  };

  const handleComplete = async (id: number) => {
    if (window.confirm('Mark this appointment as completed?')) {
      try {
        console.log('Attempting to complete appointment with ID:', id);
        await api.put(`/appointments/${id}/complete`);
        toast.success('Appointment marked as completed');
        fetchDoctorAppointments();
      } catch (error: any) {
        console.error('Failed to complete appointment:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to complete appointment';
        toast.error(errorMessage);
      }
    }
  };

  const openRescheduleModal = (appointment: Appointment) => {
    setRescheduleData({
      appointmentId: appointment.id,
      newDateTime: appointment.slotTime
    });
    setShowRescheduleModal(true);
  };

  const openPrescriptionModal = (appointment: Appointment) => {
    setPrescriptionData({
      appointmentId: appointment.id,
      patientId: appointment.patientId,
      diagnosis: '',
      medication: '',
      dosage: '',
      instructions: '',
      followUpDate: ''
    });
    setShowPrescriptionModal(true);
  };

  const openPatientProfile = async (patientId: number) => {
    await fetchPatientDetails(patientId);
    setShowPatientProfileModal(true);
  };

  const handlePrescriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/prescriptions', prescriptionData);
      toast.success('Prescription created successfully');
      setShowPrescriptionModal(false);
      setPrescriptionData({
        appointmentId: 0,
        patientId: 0,
        diagnosis: '',
        medication: '',
        dosage: '',
        instructions: '',
        followUpDate: ''
      });
    } catch (error: any) {
      console.error('Failed to create prescription:', error);
      toast.error(error.response?.data?.message || 'Failed to create prescription');
    }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return <Check className="w-4 h-4" />;
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'COMPLETED': return <Check className="w-4 h-4" />;
      case 'CANCELLED': return <X className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch =
      appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.patientEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.reason.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' || appointment.status === filterStatus;
    const matchesDate = !filterDate || 
      new Date(appointment.slotTime).toDateString() === new Date(filterDate).toDateString();

    return matchesSearch && matchesStatus && matchesDate;
  });

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => 
      new Date(apt.slotTime).toDateString() === date.toDateString()
    );
  };

  const handleCalendarDateClick = (date: Date) => {
    setSelectedDate(date);
    const dayAppointments = getAppointmentsForDate(date);
    if (dayAppointments.length > 0) {
      setFilterDate(date.toISOString().split('T')[0]);
      setViewMode('table');
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading appointments...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-red-800 text-lg font-semibold mb-2">Error Loading Appointments</h2>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              fetchDoctorAppointments();
            }}
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
        <h1 className="text-3xl font-bold text-gray-800">My Appointments</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setViewMode(viewMode === 'table' ? 'calendar' : 'table')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center space-x-2"
          >
            {viewMode === 'table' ? <CalendarDays className="w-4 h-4" /> : <Users className="w-4 h-4" />}
            <span>{viewMode === 'table' ? 'Calendar View' : 'Table View'}</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search appointments by patient name or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="ALL">All Status</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="NO_SHOW">No Show</option>
            </select>
            
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            
            {(filterStatus !== 'ALL' || filterDate) && (
              <button
                onClick={() => {
                  setFilterStatus('ALL');
                  setFilterDate('');
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content Area - Table or Calendar View */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{appointment.patientName}</div>
                          {appointment.patientEmail && (
                            <div className="text-xs text-gray-500">{appointment.patientEmail}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(appointment.slotTime).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">{appointment.reason}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                        {getStatusIcon(appointment.status)}
                        <span className="ml-1">{appointment.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {(appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED' || appointment.status === 'PENDING') && (
                          <>
                            <button
                              onClick={() => openPrescriptionModal(appointment)}
                              className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition duration-200"
                            >
                              <Play className="w-3 h-3 mr-1" />
                              Start Consultation
                            </button>
                            <button
                              onClick={() => openRescheduleModal(appointment)}
                              className="text-blue-600 hover:text-blue-900 text-xs"
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() => handleCancel(appointment.id)}
                              className="text-red-600 hover:text-red-900 text-xs"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleComplete(appointment.id)}
                              className="text-green-600 hover:text-green-900 text-xs"
                            >
                              Complete
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => openPatientProfile(appointment.patientId)}
                          className="text-purple-600 hover:text-purple-900 text-xs"
                        >
                          View Profile
                        </button>
                        {appointment.status === 'COMPLETED' && (
                          <span className="text-gray-500 text-xs">Completed</span>
                        )}
                        {appointment.status === 'CANCELLED' && (
                          <span className="text-gray-500 text-xs">Cancelled</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredAppointments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No appointments found
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Appointment Calendar</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Calendar
                onChange={(value) => setSelectedDate(value as Date)}
                value={selectedDate}
                onClickDay={handleCalendarDateClick}
                tileContent={({ date, view }) => {
                  if (view === 'month') {
                    const dayAppointments = getAppointmentsForDate(date);
                    if (dayAppointments.length > 0) {
                      return (
                        <div className="flex justify-center mt-1">
                          <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                        </div>
                      );
                    }
                  }
                  return null;
                }}
                className="w-full"
              />
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">
                Appointments for {selectedDate.toLocaleDateString()}
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {getAppointmentsForDate(selectedDate).length > 0 ? (
                  getAppointmentsForDate(selectedDate).map((appointment) => (
                    <div key={appointment.id} className="bg-white p-3 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-sm">{appointment.patientName}</div>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mb-2">
                        {new Date(appointment.slotTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-xs text-gray-700 truncate">
                        {appointment.reason}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No appointments scheduled for this date
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Reschedule Appointment</h2>
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleReschedule}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={rescheduleData.newDateTime}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, newDateTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              {conflictMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm mb-2">{conflictMessage}</p>
                  <div className="space-y-1">
                    {suggestedSlots.map((slot, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setRescheduleData({ ...rescheduleData, newDateTime: slot.slice(0, 16) })}
                        className="w-full text-left px-3 py-2 bg-white border border-red-200 rounded text-sm hover:bg-red-50"
                      >
                        {new Date(slot).toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Prescription Modal */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Start Consultation - Prescription</h2>
              <button
                onClick={() => setShowPrescriptionModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handlePrescriptionSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="inline w-4 h-4 mr-1" />
                    Diagnosis *
                  </label>
                  <textarea
                    required
                    value={prescriptionData.diagnosis}
                    onChange={(e) => setPrescriptionData({ ...prescriptionData, diagnosis: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter diagnosis details..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medication *
                  </label>
                  <input
                    type="text"
                    required
                    value={prescriptionData.medication}
                    onChange={(e) => setPrescriptionData({ ...prescriptionData, medication: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Paracetamol"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dosage *
                  </label>
                  <input
                    type="text"
                    required
                    value={prescriptionData.dosage}
                    onChange={(e) => setPrescriptionData({ ...prescriptionData, dosage: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., 500mg twice daily"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instructions
                  </label>
                  <textarea
                    value={prescriptionData.instructions}
                    onChange={(e) => setPrescriptionData({ ...prescriptionData, instructions: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Special instructions for the patient..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={prescriptionData.followUpDate}
                    onChange={(e) => setPrescriptionData({ ...prescriptionData, followUpDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowPrescriptionModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
                >
                  Create Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Patient Profile Modal */}
      {showPatientProfileModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Patient Profile</h2>
              <button
                onClick={() => setShowPatientProfileModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex items-center mb-6">
              <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{selectedPatient.name}</h3>
                <p className="text-sm text-gray-500">Patient ID: {selectedPatient.id}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">{selectedPatient.email}</p>
              </div>
              {selectedPatient.phone && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-gray-900">{selectedPatient.phone}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowPatientProfileModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
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

export default DoctorAppointments;
