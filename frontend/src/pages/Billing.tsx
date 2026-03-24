import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Download,
  Calendar,
  User,
  Search,
  Plus,
  Eye,
  Trash2,
  TrendingUp,
  CreditCard,
  Receipt,
  X
} from 'lucide-react';

interface Patient {
  id: number;
  name: string;
  email: string;
  phoneNumber?: string;
}

interface Doctor {
  id: number;
  name: string;
  specialization: string;
}

interface Appointment {
  id: number;
  patient: Patient;
  doctor: Doctor;
  dateTime: string;
  reason: string;
  status: string;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  patientId: number;
  patientName: string;
  appointmentId: number;
  amount: number;
  tax: number;
  totalAmount: number;
  paymentMethod: 'CASH' | 'CARD' | 'UPI' | 'INSURANCE';
  status: 'PENDING' | 'PAID' | 'PARTIAL' | 'OVERDUE' | 'CANCELLED';
  createdAt: string;
  dueDate: string;
  paidAt?: string;
  notes?: string;
  pdfPath?: string;
}

interface BillingStats {
  todayBilling: number;
  pendingCount: number;
  paidAmount: number;
  overdueCount: number;
  totalRevenue: number;
  pendingAmount: number;
  overdueAmount: number;
}

const Billing = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'invoices'>('dashboard');
  const [billingStats, setBillingStats] = useState<BillingStats>({
    todayBilling: 0,
    pendingCount: 0,
    paidAmount: 0,
    overdueCount: 0,
    totalRevenue: 0,
    pendingAmount: 0,
    overdueAmount: 0
  });
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [completedAppointments, setCompletedAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;


  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      
      // Fetch billing stats
      const statsResponse = await api.get('/billing/stats');
      setBillingStats(statsResponse.data || {
        todayBilling: 0,
        pendingCount: 0,
        paidAmount: 0,
        overdueCount: 0,
        totalRevenue: 0,
        pendingAmount: 0,
        overdueAmount: 0
      });

      // Fetch invoices
      const invoicesResponse = await api.get('/invoices');
      setInvoices(invoicesResponse.data || []);

      // Fetch completed appointments for bill generation
      const appointmentsResponse = await api.get('/billing/completed-appointments');
      setCompletedAppointments(appointmentsResponse.data || []);
      
    } catch (error) {
      console.error('Failed to fetch billing data:', error);
      toast.error('Failed to load billing data');
      // Set fallback data to prevent UI crashes
      setBillingStats({
        todayBilling: 0,
        pendingCount: 0,
        paidAmount: 0,
        overdueCount: 0,
        totalRevenue: 0,
        pendingAmount: 0,
        overdueAmount: 0
      });
      setInvoices([]);
      setCompletedAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBills = async () => {
    try {
      const response = await api.post('/billing/generate-from-completed');
      toast.success(`Successfully generated ${response.data.count} bills`);
      fetchBillingData();
    } catch (error) {
      console.error('Failed to generate bills:', error);
      toast.error('Failed to generate bills from completed appointments');
    }
  };

  const handleGenerateIndividualBill = async (appointmentId: number) => {
    try {
      await api.post(`/billing/generate/${appointmentId}`);
      toast.success('Bill generated successfully');
      fetchBillingData();
    } catch (error) {
      console.error('Failed to generate bill:', error);
      toast.error('Failed to generate bill for appointment');
    }
  };

  const handleExportInvoices = async () => {
    try {
      const response = await api.get('/invoices/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoices_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Invoices exported successfully');
    } catch (error) {
      console.error('Failed to export invoices:', error);
      toast.error('Failed to export invoices');
    }
  };

  const handleUpdatePaymentStatus = async (invoiceId: number, status: string) => {
    try {
      await api.put(`/invoices/${invoiceId}/payment-status`, { paymentStatus: status });
      toast.success('Payment status updated successfully');
      fetchBillingData();
    } catch (error) {
      console.error('Failed to update payment status:', error);
      toast.error('Failed to update payment status');
    }
  };

  const handleDeleteInvoice = async (invoiceId: number) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await api.delete(`/invoices/${invoiceId}`);
        toast.success('Invoice deleted successfully');
        fetchBillingData();
      } catch (error) {
        console.error('Failed to delete invoice:', error);
        toast.error('Failed to delete invoice');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PAID': return 'bg-green-100 text-green-800 border-green-200';
      case 'PARTIAL': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'OVERDUE': return 'bg-red-100 text-red-800 border-red-200';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'CARD': return <CreditCard className="w-4 h-4" />;
      case 'CASH': return <DollarSign className="w-4 h-4" />;
      case 'UPI': return <Receipt className="w-4 h-4" />;
      case 'INSURANCE': return <FileText className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' || invoice.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Billing Management</h1>
          <p className="text-gray-600 mt-1">Manage invoices, payments, and billing analytics</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleExportInvoices}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Invoices
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'dashboard'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'invoices'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Invoices
          </button>
        </nav>
      </div>

      {activeTab === 'dashboard' && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Billing</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    ${billingStats.todayBilling.toLocaleString()}
                  </p>
                  <div className="flex items-center mt-2 text-xs text-green-600">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    <span>12% from yesterday</span>
                  </div>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-orange-600 mt-1">
                    {billingStats.pendingCount}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    ${billingStats.pendingAmount.toLocaleString()} pending
                  </p>
                </div>
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Paid</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    ${billingStats.paidAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">This month</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {billingStats.overdueCount}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    ${billingStats.overdueAmount.toLocaleString()} overdue
                  </p>
                </div>
                <div className="bg-red-100 p-3 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Generate Bills Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Generate Bills</h2>
                <p className="text-sm text-gray-600 mt-1">Create invoices from completed appointments</p>
              </div>
              <button
                onClick={handleGenerateBills}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Generate Bills from Completed Appointments
              </button>
            </div>

            {completedAppointments.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No completed appointments</h3>
                <p className="text-gray-600">Completed appointments will appear here for bill generation</p>
              </div>
            ) : (
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
                    {completedAppointments.slice(0, 5).map((appointment) => (
                      <tr key={appointment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                              <User className="w-4 h-4 text-gray-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{appointment.patient?.name || 'N/A'}</div>
                              <div className="text-sm text-gray-500">{appointment.patient?.email || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{appointment.doctor?.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{appointment.doctor?.specialization || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(appointment.dateTime).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">{appointment.reason}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleGenerateIndividualBill(appointment.id)}
                            className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                          >
                            Generate Bill
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {completedAppointments.length > 5 && (
                  <div className="text-center py-3 border-t border-gray-200">
                    <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                      View all {completedAppointments.length} completed appointments
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'invoices' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search invoices by patient, invoice number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="PARTIAL">Partial</option>
                <option value="OVERDUE">Overdue</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(invoice.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{invoice.patientName || 'N/A'}</div>
                          <div className="text-sm text-gray-500">Patient ID: {invoice.patientId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Appointment ID: {invoice.appointmentId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${(invoice.totalAmount || 0).toFixed(2)}</div>
                      {invoice.tax > 0 && (
                        <div className="text-xs text-gray-500">Tax: ${(invoice.tax || 0).toFixed(2)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getPaymentMethodIcon(invoice.paymentMethod)}
                        <span className="ml-2 text-sm text-gray-900">{invoice.paymentMethod}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setShowInvoiceModal(true);
                          }}
                          className="text-purple-600 hover:text-purple-800"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {invoice.status === 'PENDING' && (
                          <select
                            value={invoice.status}
                            onChange={(e) => handleUpdatePaymentStatus(invoice.id, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="PENDING">Pending</option>
                            <option value="PAID">Paid</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>
                        )}
                        <button
                          onClick={() => handleDeleteInvoice(invoice.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredInvoices.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
                <p className="text-gray-600">No invoices match your current filters</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredInvoices.length)} of {filteredInvoices.length} results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Invoice Detail Modal */}
      {showInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Invoice Details</h2>
                <p className="text-sm text-gray-500 mt-1">Invoice #{selectedInvoice.invoiceNumber}</p>
              </div>
              <button
                onClick={() => {
                  setShowInvoiceModal(false);
                  setSelectedInvoice(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Patient Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium text-gray-900">{selectedInvoice.patientName || 'N/A'}</p>
                  <p className="text-sm text-gray-600">Patient ID: {selectedInvoice.patientId}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Appointment Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium text-gray-900">Appointment ID: {selectedInvoice.appointmentId}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Billing Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${(selectedInvoice.amount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium">${(selectedInvoice.tax || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>${(selectedInvoice.totalAmount || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 mt-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Payment Method:</span>
                  <p className="font-medium">{selectedInvoice.paymentMethod}</p>
                </div>
                <div>
                  <span className="text-gray-600">Payment Status:</span>
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(selectedInvoice.status)}`}>
                    {selectedInvoice.status}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Issued Date:</span>
                  <p className="font-medium">{new Date(selectedInvoice.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-gray-600">Due Date:</span>
                  <p className="font-medium">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {selectedInvoice.notes && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Notes</h3>
                <p className="text-gray-600">{selectedInvoice.notes}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowInvoiceModal(false);
                  setSelectedInvoice(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
