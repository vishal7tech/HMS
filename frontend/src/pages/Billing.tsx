import { useState, useEffect } from 'react';
import api from '../services/api';

interface Patient {
  id: number;
  name: string;
  email: string;
}

interface Appointment {
  id: number;
  patient: Patient;
  doctor: {
    name: string;
    specialization: string;
  };
  dateTime: string;
  reason: string;
}

interface Billing {
  id: number;
  patient: Patient;
  appointment: Appointment;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  issuedAt: string;
}

const Billing = () => {
  const [billings, setBillings] = useState<Billing[]>([]);
  const [pendingBills, setPendingBills] = useState<Billing[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  const [formData, setFormData] = useState({
    appointmentId: '',
    amount: '',
    paymentMethod: 'CASH'
  });

  const paymentMethods = ['CASH', 'CARD', 'UPI', 'INSURANCE'];
  const paymentStatuses = ['PENDING', 'PAID', 'CANCELLED'];

  useEffect(() => {
    fetchBillings();
    fetchPendingBills();
    fetchCompletedAppointments();
  }, []);

  const fetchBillings = async () => {
    try {
      const response = await api.get('/billings');
      setBillings(response.data);
    } catch (error) {
      console.error('Failed to fetch billings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingBills = async () => {
    try {
      const response = await api.get('/billings/pending');
      setPendingBills(response.data);
    } catch (error) {
      console.error('Failed to fetch pending bills:', error);
    }
  };

  const fetchCompletedAppointments = async () => {
    try {
      const response = await api.get('/appointments/completed');
      setAppointments(response.data);
    } catch (error) {
      console.error('Failed to fetch completed appointments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/billings', formData);
      fetchBillings();
      fetchPendingBills();
      resetForm();
    } catch (error) {
      console.error('Failed to create bill:', error);
    }
  };

  const handleGenerateBill = async (appointmentId: number) => {
    try {
      await api.post(`/billings/appointment/${appointmentId}`);
      fetchBillings();
      fetchPendingBills();
    } catch (error) {
      console.error('Failed to generate bill:', error);
    }
  };

  const handleUpdatePaymentStatus = async (billingId: number, status: string) => {
    try {
      await api.put(`/billings/${billingId}/payment-status`, { paymentStatus: status });
      fetchBillings();
      fetchPendingBills();
    } catch (error) {
      console.error('Failed to update payment status:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      try {
        await api.delete(`/billings/${id}`);
        fetchBillings();
        fetchPendingBills();
      } catch (error) {
        console.error('Failed to delete bill:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      appointmentId: '',
      amount: '',
      paymentMethod: 'CASH'
    });
    setShowModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredBillings = billings.filter(billing => {
    const matchesSearch = 
      billing.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      billing.patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      billing.appointment.doctor.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'ALL' || billing.paymentStatus === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading billing data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Billing Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition duration-200"
        >
          + Create Bill
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Bills</p>
              <p className="text-2xl font-bold text-gray-800">{billings.length}</p>
            </div>
            <div className="text-3xl">📄</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending Bills</p>
              <p className="text-2xl font-bold text-orange-600">{pendingBills.length}</p>
            </div>
            <div className="text-3xl">⏳</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                ${billings
                  .filter(b => b.paymentStatus === 'PAID')
                  .reduce((sum, b) => sum + b.amount, 0)
                  .toLocaleString()}
              </p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search bills by patient, doctor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issued At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBillings.map((billing) => (
                <tr key={billing.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{billing.patient.name}</div>
                    <div className="text-sm text-gray-500">{billing.patient.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{billing.appointment.doctor.name}</div>
                    <div className="text-sm text-gray-500">{billing.appointment.doctor.specialization}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">${billing.amount.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      {billing.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(billing.paymentStatus)}`}>
                      {billing.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(billing.issuedAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {billing.paymentStatus === 'PENDING' && (
                      <select
                        value={billing.paymentStatus}
                        onChange={(e) => handleUpdatePaymentStatus(billing.id, e.target.value)}
                        className="mr-3 px-2 py-1 border border-gray-300 rounded text-xs"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="PAID">Paid</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    )}
                    <button
                      onClick={() => handleDelete(billing.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredBillings.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No bills found
          </div>
        )}
      </div>

      {/* Completed Appointments for Bill Generation */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Generate Bills from Completed Appointments</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments
                .filter(apt => !billings.some(bill => bill.appointment.id === apt.id))
                .map((appointment) => (
                <tr key={appointment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{appointment.patient.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{appointment.doctor.name}</div>
                    <div className="text-sm text-gray-500">{appointment.doctor.specialization}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(appointment.dateTime).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">{appointment.reason}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleGenerateBill(appointment.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                    >
                      Generate Bill
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {appointments.filter(apt => !billings.some(bill => bill.appointment.id === apt.id)).length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No completed appointments without bills
            </div>
          )}
        </div>
      </div>

      {/* Create Bill Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Bill</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Appointment *</label>
                <select
                  required
                  value={formData.appointmentId}
                  onChange={(e) => setFormData({ ...formData, appointmentId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select Appointment</option>
                  {appointments
                    .filter(apt => !billings.some(bill => bill.appointment.id === apt.id))
                    .map(appointment => (
                    <option key={appointment.id} value={appointment.id}>
                      {appointment.patient.name} - Dr. {appointment.doctor.name} ({new Date(appointment.dateTime).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="0.00"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                <select
                  required
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  Create Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
