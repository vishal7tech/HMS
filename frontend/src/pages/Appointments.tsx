import { useState, useEffect } from 'react';
import api from '../services/api';
import websocketService from '../services/websocketService';
import toast from 'react-hot-toast';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../styles/calendar.css';
import { CalendarDays, Clock, Users, Search, X, Check, AlertCircle } from 'lucide-react';

interface Patient {
  id: number;
  name: string;
  email: string;
}

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
  suggestedSlots?: string[];
}

const Appointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterDoctor, setFilterDoctor] = useState('ALL');
  const [filterPatient, setFilterPatient] = useState('ALL');
  const [filterDate, setFilterDate] = useState('');

  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    slotTime: '',
    reason: '',
    notes: ''
  });

  const [rescheduleData, setRescheduleData] = useState({
    appointmentId: 0,
    newDateTime: ''
  });

  const [suggestedSlots, setSuggestedSlots] = useState<string[]>([]);
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      await Promise.all([
        fetchAppointments(),
        fetchPatients(),
        fetchDoctors()
      ]);
      setLoading(false);
    };

    loadAllData();

    // Subscribe to real-time updates
    websocketService.subscribeToAppointments((notification) => {
      fetchAppointments();
      if (notification.type === 'CREATED') {
        toast.success(`New appointment: ${notification.message}`);
      }
    });

    websocketService.subscribeToAvailability(() => {
      fetchDoctors(); // Refresh doctor list if availability changes
    });
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments');
      setAppointments(response.data);
      setError(null);
    } catch (error: any) {
      console.error('Failed to fetch appointments:', error);
      setError(`Failed to fetch appointments: ${error.response?.data?.message || error.message}`);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients');
      setPatients(response.data);
    } catch (error: any) {
      console.error('Failed to fetch patients:', error);
      setError(`Failed to fetch patients: ${error.response?.data?.message || error.message}`);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/doctors');
      // Include all doctors for now, or filter by availability if needed
      setDoctors(response.data);
    } catch (error: any) {
      console.error('Failed to fetch doctors:', error);
      setError(`Failed to fetch doctors: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflictMessage(null);
    setSuggestedSlots([]);
    
    // Client-side validation
    if (!formData.patientId || !formData.doctorId || !formData.slotTime || !formData.reason) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Log the form data for debugging
    console.log('Form data being submitted:', formData);
    
    const requestData = {
      patientId: parseInt(formData.patientId),
      doctorId: parseInt(formData.doctorId),
      slotTime: formData.slotTime,
      reason: formData.reason,
      notes: formData.notes
    };
    
    // Validate parsed IDs
    if (isNaN(requestData.patientId) || isNaN(requestData.doctorId)) {
      toast.error('Invalid patient or doctor selection');
      return;
    }
    
    console.log('Request data being sent:', requestData);
    
    try {
      const response = await api.post('/appointments', requestData);
      console.log('Appointment booking response:', response);

      if (response.data.status === null && response.data.suggestedSlots?.length > 0) {
        setSuggestedSlots(response.data.suggestedSlots);
        setConflictMessage("Selected slot is unavailable. Suggestions:");
      } else {
        toast.success('Appointment booked successfully');
        fetchAppointments();
        resetForm();
      }
    } catch (error: any) {
      console.error('Failed to book appointment:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      
      // Handle validation errors specifically
      if (error.response?.status === 400 && error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        Object.keys(validationErrors).forEach(field => {
          console.error(`Validation error for ${field}: ${validationErrors[field]}`);
        });
        toast.error(`Validation error: ${Object.values(validationErrors).join(', ')}`);
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to book appointment';
        toast.error(errorMessage);
      }
    }
  };

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflictMessage(null);
    setSuggestedSlots([]);
    try {
      console.log('Attempting to reschedule appointment:', rescheduleData);
      const response = await api.put(`/appointments/${rescheduleData.appointmentId}/reschedule?slotTime=${encodeURIComponent(rescheduleData.newDateTime)}`);
      console.log('Reschedule appointment response:', response);
      
      if (response.data.status === null && response.data.suggestedSlots?.length > 0) {
        setSuggestedSlots(response.data.suggestedSlots);
        setConflictMessage("Selected slot is unavailable. Suggestions:");
      } else {
        toast.success('Appointment rescheduled successfully');
        fetchAppointments();
        setShowRescheduleModal(false);
        setRescheduleData({ appointmentId: 0, newDateTime: '' });
      }
    } catch (error: any) {
      console.error('Failed to reschedule appointment:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to reschedule appointment';
      toast.error(errorMessage);
    }
  };

  const handleCancel = async (id: number) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        console.log('Attempting to cancel appointment with ID:', id);
        const response = await api.put(`/appointments/${id}/cancel`);
        console.log('Cancel appointment response:', response);
        toast.success('Appointment cancelled successfully');
        fetchAppointments();
      } catch (error: any) {
        console.error('Failed to cancel appointment:', error);
        console.error('Error response:', error.response);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to cancel appointment';
        toast.error(errorMessage);
      }
    }
  };

  const handleComplete = async (id: number) => {
    if (window.confirm('Mark this appointment as completed?')) {
      try {
        console.log('Attempting to complete appointment with ID:', id);
        const response = await api.put(`/appointments/${id}/complete`);
        console.log('Complete appointment response:', response);
        toast.success('Appointment marked as completed');
        fetchAppointments();
      } catch (error: any) {
        console.error('Failed to complete appointment:', error);
        console.error('Error response:', error.response);
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

  const resetForm = () => {
    setFormData({
      patientId: '',
      doctorId: '',
      slotTime: '',
      reason: '',
      notes: ''
    });
    setShowModal(false);
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
      appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.reason.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' || appointment.status === filterStatus;
    const matchesDoctor = filterDoctor === 'ALL' || appointment.doctorId.toString() === filterDoctor;
    const matchesPatient = filterPatient === 'ALL' || appointment.patientId.toString() === filterPatient;
    const matchesDate = !filterDate || 
      new Date(appointment.slotTime).toDateString() === new Date(filterDate).toDateString();

    return matchesSearch && matchesStatus && matchesDoctor && matchesPatient && matchesDate;
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
      // Show appointments for selected date
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
              fetchAppointments();
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
        <h1 className="text-3xl font-bold text-gray-800">Appointment Management</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setViewMode(viewMode === 'table' ? 'calendar' : 'table')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center space-x-2"
          >
            {viewMode === 'table' ? <CalendarDays className="w-4 h-4" /> : <Users className="w-4 h-4" />}
            <span>{viewMode === 'table' ? 'Calendar View' : 'Table View'}</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center space-x-2"
          >
            <span>+</span>
            <span>Add Appointment</span>
          </button>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search appointments by patient, doctor, or reason..."
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
            
            <select
              value={filterDoctor}
              onChange={(e) => setFilterDoctor(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="ALL">All Doctors</option>
              {doctors.map(doctor => (
                <option key={doctor.id} value={doctor.id}>
                  Dr. {doctor.name}
                </option>
              ))}
            </select>
            
            <select
              value={filterPatient}
              onChange={(e) => setFilterPatient(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="ALL">All Patients</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
            
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            
            {(filterStatus !== 'ALL' || filterDoctor !== 'ALL' || filterPatient !== 'ALL' || filterDate) && (
              <button
                onClick={() => {
                  setFilterStatus('ALL');
                  setFilterDoctor('ALL');
                  setFilterPatient('ALL');
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
        /* Appointments Table */
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
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
                      <div className="text-sm font-medium text-gray-900">{appointment.patientName}</div>
                      {appointment.patientEmail && (
                        <div className="text-xs text-gray-500">{appointment.patientEmail}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">Dr. {appointment.doctorName}</div>
                      {appointment.doctorSpecialization && (
                        <div className="text-xs text-gray-500">{appointment.doctorSpecialization}</div>
                      )}
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
                      {(appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED' || appointment.status === 'PENDING') && (
                        <>
                          <button
                            onClick={() => openRescheduleModal(appointment)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => handleComplete(appointment.id)}
                            className="text-green-600 hover:text-green-900 mr-3"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => handleCancel(appointment.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {appointment.status === 'COMPLETED' && (
                        <span className="text-gray-500 text-sm">No actions available</span>
                      )}
                      {appointment.status === 'CANCELLED' && (
                        <span className="text-gray-500 text-sm">No actions available</span>
                      )}
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
        /* Calendar View */
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Appointment Calendar</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setCalendarView('month')}
                className={`px-3 py-1 rounded ${calendarView === 'month' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Month
              </button>
              <button
                onClick={() => setCalendarView('week')}
                className={`px-3 py-1 rounded ${calendarView === 'week' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Week
              </button>
              <button
                onClick={() => setCalendarView('day')}
                className={`px-3 py-1 rounded ${calendarView === 'day' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Day
              </button>
            </div>
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
                      <div className="text-xs text-gray-600 mb-1">
                        Dr. {appointment.doctorName}
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

      {/* Enhanced Book Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Book New Appointment</h2>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Patient and Doctor Selection */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Users className="inline w-4 h-4 mr-1" />
                      Select Patient *
                    </label>
                    <select
                      required
                      value={formData.patientId}
                      onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Choose a patient...</option>
                      {patients.map(patient => (
                        <option key={patient.id} value={patient.id}>
                          {patient.name} - {patient.email}
                        </option>
                      ))}
                    </select>
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    {formData.patientId && (
                      <div className="text-sm text-blue-700 mb-1">
                        Patient: {patients.find(p => p.id.toString() === formData.patientId)?.name}
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
                <div className="mt-6 animate-pulse-subtle">
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm">
                    <div className="flex items-center mb-3">
                      <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                      <p className="text-sm font-bold text-red-800 uppercase tracking-wide">Slot Conflict Detected</p>
                    </div>
                    <p className="text-red-700 text-sm mb-4">The selected time is already booked. Please choose one of these available alternatives:</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {suggestedSlots.map((slot, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setFormData({ ...formData, slotTime: slot.slice(0, 16) })}
                          className="flex items-center justify-between px-4 py-3 bg-white border border-red-200 rounded-lg text-sm font-semibold text-gray-800 hover:bg-red-50 hover:border-red-300 hover:scale-[1.02] transition-all shadow-sm group"
                        >
                          <span>{new Date(slot).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                          <Check className="w-4 h-4 text-red-400 group-hover:text-red-600 transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200 flex items-center space-x-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Book Appointment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enhanced Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Reschedule Appointment</h2>
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleReschedule}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Form */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-800 mb-2">Current Appointment</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Patient: {appointments.find(a => a.id === rescheduleData.appointmentId)?.patientName}</div>
                      <div>Doctor: Dr. {appointments.find(a => a.id === rescheduleData.appointmentId)?.doctorName}</div>
                      <div>Current Time: {appointments.find(a => a.id === rescheduleData.appointmentId)?.slotTime ? 
                        new Date(appointments.find(a => a.id === rescheduleData.appointmentId)!.slotTime).toLocaleString() : ''}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <CalendarDays className="inline w-4 h-4 mr-1" />
                      New Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={rescheduleData.newDateTime}
                      onChange={(e) => setRescheduleData({ ...rescheduleData, newDateTime: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min={new Date().toISOString().slice(0, 16)}
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
                        setRescheduleData({ ...rescheduleData, newDateTime });
                      }
                    }}
                    value={rescheduleData.newDateTime ? new Date(rescheduleData.newDateTime) : new Date()}
                    className="w-full"
                  />
                  
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">New Appointment Time</h4>
                    {rescheduleData.newDateTime && (
                      <div className="text-sm text-blue-700">
                        {new Date(rescheduleData.newDateTime).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {conflictMessage && (
                <div className="mt-6 animate-pulse-subtle">
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm">
                    <div className="flex items-center mb-3">
                      <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                      <p className="text-sm font-bold text-red-800 uppercase tracking-wide">Slot Conflict Detected</p>
                    </div>
                    <p className="text-red-700 text-sm mb-4">The selected time is already booked. Available alternatives:</p>

                    <div className="flex flex-col gap-2">
                      {suggestedSlots.map((slot, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setRescheduleData({ ...rescheduleData, newDateTime: slot.slice(0, 16) })}
                          className="flex items-center justify-between px-4 py-2 bg-white border border-red-200 rounded-lg text-sm font-semibold text-gray-800 hover:bg-red-50 hover:border-red-300 transition-all shadow-sm group"
                        >
                          <span>{new Date(slot).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                          <Check className="w-4 h-4 text-red-400 group-hover:text-red-600 transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 flex items-center space-x-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Reschedule Appointment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
