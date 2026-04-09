import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  Search,
  Plus,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  CreditCard,
  DollarSign,
  Receipt,
  Calendar,
  User,
  Download,
  Trash2
} from 'lucide-react';

interface Payment {
  id: number;
  invoiceNumber: string;
  patientId: number;
  patientName: string;
  amount: number;
  paymentMethod: 'CASH' | 'CARD' | 'UPI' | 'INSURANCE';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  transactionId?: string;
  createdAt: string;
  completedAt?: string;
  notes?: string;
}

interface PaymentStats {
  todayPayments: number;
  pendingPayments: number;
  completedPayments: number;
  failedPayments: number;
  totalAmount: number;
  pendingAmount: number;
  completedAmount: number;
  refundedAmount: number;
}

const BillingPayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentStats, setPaymentStats] = useState<PaymentStats>({
    todayPayments: 0,
    pendingPayments: 0,
    completedPayments: 0,
    failedPayments: 0,
    totalAmount: 0,
    pendingAmount: 0,
    completedAmount: 0,
    refundedAmount: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('ALL');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const paymentMethods = ['CASH', 'CARD', 'UPI', 'INSURANCE'];

  useEffect(() => {
    fetchPaymentsData();
  }, []);

  const fetchPaymentsData = async () => {
    try {
      setLoading(true);

      // Fetch payments
      const paymentsResponse = await api.get('/payments');
      const data = paymentsResponse.data || [];
      setPayments(data.map((p: any) => ({
        ...p,
        amount: p.amountPaid, // map to amount
      })));

      // Fetch payment stats
      const statsResponse = await api.get('/billing/payment-stats');
      setPaymentStats(statsResponse.data || {
        todayPayments: 0,
        pendingPayments: 0,
        completedPayments: 0,
        failedPayments: 0,
        totalAmount: 0,
        pendingAmount: 0,
        completedAmount: 0,
        refundedAmount: 0
      });

    } catch (error) {
      console.error('Failed to fetch payments data:', error);
      toast.error('Failed to load payments data');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async (paymentId: number) => {
    try {
      await api.post(`/payments`, { invoiceId: paymentId }); // mock trigger
      toast.success('Payment processed successfully');
      fetchPaymentsData();
    } catch (error) {
      console.error('Failed to process payment:', error);
      toast.error('Failed to process payment');
    }
  };

  const handleRefundPayment = async (paymentId: number) => {
    if (window.confirm('Are you sure you want to refund this payment?')) {
      try {
        await api.put(`/billing/payments/${paymentId}/refund`);
        toast.success('Payment refunded successfully');
        fetchPaymentsData();
      } catch (error) {
        console.error('Failed to refund payment:', error);
        toast.error('Failed to refund payment');
      }
    }
  };

  const handleDeletePayment = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this payment record?')) {
      try {
        await api.delete(`/payments/${id}`);
        toast.success('Payment record deleted');
        fetchPaymentsData();
      } catch (error) {
        console.error('Failed to delete payment:', error);
        toast.error('Failed to delete payment');
      }
    }
  };

  const handleUpdatePaymentStatus = async (id: number, newStatus: string) => {
    try {
      await api.put(`/payments/${id}/status`, { status: newStatus });
      toast.success('Payment status updated');
      fetchPaymentsData();
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleExportPayments = async () => {
    try {
      const response = await api.get('/billing/payments/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payments_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Payments exported successfully');
    } catch (error) {
      console.error('Failed to export payments:', error);
      toast.error('Failed to export payments');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'FAILED': return 'bg-red-100 text-red-800 border-red-200';
      case 'REFUNDED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      case 'FAILED': return <AlertTriangle className="w-4 h-4" />;
      case 'REFUNDED': return <DollarSign className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'CARD': return <CreditCard className="w-4 h-4" />;
      case 'CASH': return <DollarSign className="w-4 h-4" />;
      case 'UPI': return <Receipt className="w-4 h-4" />;
      case 'INSURANCE': return <Receipt className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch =
      payment.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' || payment.status === filterStatus;
    const matchesPaymentMethod = filterPaymentMethod === 'ALL' || payment.paymentMethod === filterPaymentMethod;

    return matchesSearch && matchesStatus && matchesPaymentMethod;
  });

  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

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
          <h1 className="text-3xl font-bold text-gray-800">Payment Management</h1>
          <p className="text-gray-600 mt-1">Track and manage all payment transactions</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAddPaymentModal(true)}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Record Payment
          </button>
          <button
            onClick={handleExportPayments}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Payments</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {paymentStats.todayPayments}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                ₹{paymentStats.totalAmount.toLocaleString()} total
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {paymentStats.pendingPayments}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                ₹{paymentStats.pendingAmount.toLocaleString()} pending
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
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {paymentStats.completedPayments}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                ₹{paymentStats.completedAmount.toLocaleString()} received
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Failed/Refunded</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {paymentStats.failedPayments}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                ₹{paymentStats.refundedAmount.toLocaleString()} refunded
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
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
                placeholder="Search payments by patient, invoice, transaction ID..."
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
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
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

      {/* Payments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {payment.transactionId || `TXN-${String(payment.id).padStart(3, '0')}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{payment.invoiceNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{payment.patientName || 'N/A'}</div>
                        <div className="text-sm text-gray-500">ID: {payment.patientId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">₹{(payment.amount || 0).toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getPaymentMethodIcon(payment.paymentMethod)}
                      <span className="ml-2 text-sm text-gray-900">{payment.paymentMethod}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(payment.status)}
                      <select
                        value={payment.status}
                        onChange={(e) => handleUpdatePaymentStatus(payment.id, e.target.value)}
                        className={`ml-2 px-2 py-1 text-xs leading-5 font-semibold rounded-full border outline-none ${getStatusColor(payment.status)}`}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="FAILED">FAILED</option>
                        <option value="REFUNDED">REFUNDED</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {payment.completedAt
                        ? new Date(payment.completedAt).toLocaleDateString()
                        : new Date(payment.createdAt).toLocaleDateString()
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedPayment(payment);
                          setShowPaymentModal(true);
                        }}
                        className="text-purple-600 hover:text-purple-800"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {payment.status === 'PENDING' && (
                        <button
                          onClick={() => handleProcessPayment(payment.id)}
                          className="text-green-600 hover:text-green-800 text-xs px-2 py-1 border border-green-300 rounded"
                        >
                          Process
                        </button>
                      )}
                      {payment.status === 'COMPLETED' && (
                        <button
                          onClick={() => handleRefundPayment(payment.id)}
                          className="text-orange-600 hover:text-orange-800 text-xs px-2 py-1 border border-orange-300 rounded"
                        >
                          Refund
                        </button>
                      )}
                      <button
                        onClick={() => handleDeletePayment(payment.id)}
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
          {filteredPayments.length === 0 && (
            <div className="text-center py-12">
              <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
              <p className="text-gray-600">No payments match your current filters</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredPayments.length)} of {filteredPayments.length} results
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

      {/* Payment Detail Modal */}
      {showPaymentModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Payment Details</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Transaction ID: {selectedPayment.transactionId || `TXN-${String(selectedPayment.id).padStart(3, '0')}`}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedPayment(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <AlertTriangle className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Payment Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">₹{(selectedPayment.amount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium">{selectedPayment.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(selectedPayment.status)}`}>
                      {selectedPayment.status}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Patient Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium text-gray-900">{selectedPayment.patientName || 'N/A'}</p>
                  <p className="text-sm text-gray-600">Patient ID: {selectedPayment.patientId}</p>
                  <p className="text-sm text-gray-600">Invoice: {selectedPayment.invoiceNumber}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Transaction Timeline</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Payment Initiated</p>
                    <p className="text-xs text-gray-500">
                      {new Date(selectedPayment.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                {selectedPayment.completedAt && (
                  <div className="flex items-center">
                    <div className="bg-green-100 p-2 rounded-full mr-3">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Payment Completed</p>
                      <p className="text-xs text-gray-500">
                        {new Date(selectedPayment.completedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {selectedPayment.notes && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Notes</h3>
                <p className="text-gray-600">{selectedPayment.notes}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedPayment(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Download Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Payment Modal */}
      {showAddPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Record Payment</h2>
                <p className="text-sm text-gray-500 mt-1">Add a new payment transaction</p>
              </div>
              <button
                onClick={() => setShowAddPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <AlertTriangle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Number</label>
                <input
                  type="text"
                  placeholder="Enter invoice number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  placeholder="Optional notes"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddPaymentModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingPayments;
