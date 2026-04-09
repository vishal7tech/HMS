import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  Search,
  Plus,
  Eye,
  Trash2,
  Download,
  CreditCard,
  IndianRupee,
  Receipt,
  FileText,
  User,
  Calendar
} from 'lucide-react';

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
  status: 'PENDING' | 'PAID' | 'PARTIAL' | 'REFUNDED';
  createdAt: string;
  dueDate: string;
  paidAt?: string;
  notes?: string;
  pdfPath?: string;
}

interface Appointment {
  id: number;
  patient: { id: number; name: string; email: string };
  doctor: { id: number; name: string; specialization: string };
  dateTime: string;
  reason: string;
  status: string;
}

const BillingInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [completedAppointments, setCompletedAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('ALL');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const paymentMethods = ['CASH', 'CARD', 'UPI', 'INSURANCE'];

  useEffect(() => {
    fetchInvoicesData();
  }, []);

  const fetchInvoicesData = async () => {
    try {
      setLoading(true);

      // Fetch invoices
      const invoicesResponse = await api.get('/invoices');
      setInvoices(invoicesResponse.data || []);

      // Fetch completed appointments for bill generation
      const appointmentsResponse = await api.get('/billing/completed-appointments');
      setCompletedAppointments(appointmentsResponse.data || []);

    } catch (error) {
      console.error('Failed to fetch invoices data:', error);
      toast.error('Failed to load invoices data');
      setCompletedAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBill = async (appointmentId: number) => {
    try {
      await api.post(`/invoices/generate/${appointmentId}`);
      toast.success('Bill generated successfully');
      fetchInvoicesData();
      setShowGenerateModal(false);
    } catch (error) {
      console.error('Failed to generate bill:', error);
      toast.error('Failed to generate bill for appointment');
    }
  };

  const handleExportInvoices = async () => {
    toast.success('Export planned for next release');
  };

  const handleDownloadPdf = async (invoiceId: number, invoiceNum: string) => {
    try {
      console.log('Attempting to download PDF for invoice:', invoiceId, invoiceNum);
      
      // Add more detailed error handling
      const response = await api.get(`/invoices/${invoiceId}/pdf`, { 
        responseType: 'blob',
        timeout: 30000 // 30 second timeout
      });
      
      console.log('PDF download response:', response.status, response.headers);
      
      // Check if we got a valid response
      if (response.status === 200 && response.data) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        
        // Determine file extension based on content type
        let fileName = invoiceNum + '.pdf';
        const contentType = response.headers['content-type'];
        
        if (contentType && contentType.includes('text/plain')) {
          fileName = invoiceNum + '.txt';
        } else if (contentType && contentType.includes('text/html')) {
          fileName = invoiceNum + '.html';
        }
        
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        toast.success(`${fileName} downloaded successfully`);
      } else {
        throw new Error(`Invalid response: ${response.status}`);
      }
    } catch (error: any) {
      console.error('Failed to download PDF:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to download PDF';
      
      if (error.response) {
        if (error.response.status === 403) {
          errorMessage = 'Access denied. Please check your permissions.';
        } else if (error.response.status === 404) {
          errorMessage = 'Invoice not found or PDF not generated yet.';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = `Server error (${error.response.status})`;
        }
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Download timed out. Please try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    }
  };

  const handleDeleteInvoice = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await api.delete(`/invoices/${id}`);
        toast.success('Invoice deleted successfully');
        fetchInvoicesData();
      } catch (error) {
        console.error('Failed to delete invoice:', error);
        toast.error('Failed to delete invoice');
      }
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      console.log('Updating invoice status:', { id, newStatus });
      const response = await api.put(`/invoices/${id}/payment-status`, { paymentStatus: newStatus });
      console.log('Status update response:', response.data);
      toast.success('Invoice status updated');
      fetchInvoicesData();
    } catch (error: any) {
      console.error('Failed to update status:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update status';
      toast.error(errorMessage);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PAID': return 'bg-green-100 text-green-800 border-green-200';
      case 'PARTIAL': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'REFUNDED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'CARD': return <CreditCard className="w-4 h-4" />;
      case 'CASH': return <IndianRupee className="w-4 h-4" />;
      case 'UPI': return <Receipt className="w-4 h-4" />;
      case 'INSURANCE': return <FileText className="w-4 h-4" />;
      default: return <IndianRupee className="w-4 h-4" />;
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch =
      invoice.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' || invoice.status === filterStatus;
    const matchesPaymentMethod = filterPaymentMethod === 'ALL' || invoice.paymentMethod === filterPaymentMethod;

    return matchesSearch && matchesStatus && matchesPaymentMethod;
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
          <h1 className="text-3xl font-bold text-gray-800">Invoice Management</h1>
          <p className="text-gray-600 mt-1">Create, manage, and track all invoices</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Generate Invoice
          </button>
          <button
            onClick={handleExportInvoices}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
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
            <option value="REFUNDED">Refunded</option>
          </select>
          <select
            value={filterPaymentMethod}
            onChange={(e) => setFilterPaymentMethod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="ALL">All Payment Methods</option>
            {paymentMethods.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
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
                        <div className="text-sm text-gray-500">ID: {invoice.patientId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">₹{(invoice.totalAmount || 0).toFixed(2)}</div>
                    {invoice.tax > 0 && (
                      <div className="text-xs text-gray-500">Tax: ₹{(invoice.tax || 0).toFixed(2)}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getPaymentMethodIcon(invoice.paymentMethod)}
                      <span className="ml-2 text-sm text-gray-900">{invoice.paymentMethod}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={invoice.status}
                      onChange={(e) => handleUpdateStatus(invoice.id, e.target.value)}
                      className={`text-xs font-semibold rounded-full border px-2 py-1 outline-none ${getStatusColor(invoice.status)}`}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PAID">PAID</option>
                      <option value="PARTIAL">PARTIAL</option>
                      <option value="REFUNDED">REFUNDED</option>
                    </select>
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

      {/* Generate Invoice Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Generate Invoice</h2>
                <p className="text-sm text-gray-500 mt-1">Create invoice from completed appointment</p>
              </div>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Trash2 className="w-6 h-6" />
              </button>
            </div>

            {completedAppointments.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No completed appointments</h3>
                <p className="text-gray-600">Completed appointments will appear here for invoice generation</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {completedAppointments.map((appointment) => (
                      <tr key={appointment.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{appointment.patient?.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{appointment.patient?.email || 'N/A'}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{appointment.doctor?.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{appointment.doctor?.specialization || 'N/A'}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(appointment.dateTime).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleGenerateBill(appointment.id)}
                            className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                          >
                            Generate Invoice
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
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
                <Trash2 className="w-6 h-6" />
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
                  <span className="font-medium">₹{(selectedInvoice.amount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium">₹{(selectedInvoice.tax || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>₹{(selectedInvoice.totalAmount || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

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
              <button 
                onClick={() => handleDownloadPdf(selectedInvoice.id, selectedInvoice.invoiceNumber)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingInvoices;
